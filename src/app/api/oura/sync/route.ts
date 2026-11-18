import { NextResponse } from 'next/server';
import { fetchOuraWorkouts } from '@/lib/oura';
import { getRedis, REDIS_KEYS } from '@/lib/redis';
import { WorkoutLog } from '@/types/workout';
import { INITIAL_LOGS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Fetch workouts from Oura Cloud API
    const ouraWorkouts = await fetchOuraWorkouts(14);

    // 2. Load existing logs from Redis (or fallback to initial logs)
    let currentLogs: WorkoutLog[] = INITIAL_LOGS;
    let client = null;

    try {
      client = getRedis();
      if (client) {
        if (client.status === 'wait') {
          await client.connect();
        }
        const raw = await client.get(REDIS_KEYS.logs);
        if (raw) {
          currentLogs = JSON.parse(raw);
        }
      }
    } catch (redisErr) {
      console.warn('Redis read failed during Oura sync, using fallback logs:', redisErr);
      client = null;
    }

    // 3. Deduplicate and merge: Don't add if already exists by id, or date + same modality
    const existingIds = new Set(currentLogs.map((l) => l.id));
    const newLogs: WorkoutLog[] = [];

    for (const w of ouraWorkouts) {
      if (!existingIds.has(w.id)) {
        const alreadyLoggedSameModality = currentLogs.some(
          (l) => l.date === w.date && l.modality === w.modality && !l.id.startsWith('oura-')
        );
        if (!alreadyLoggedSameModality) {
          newLogs.push(w);
          existingIds.add(w.id);
        }
      }
    }

    const mergedLogs = [...newLogs, ...currentLogs];

    // 4. Try saving merged logs back to Redis (non-blocking / safe)
    if (client && newLogs.length > 0) {
      try {
        await client.set(REDIS_KEYS.logs, JSON.stringify(mergedLogs));
      } catch (redisWriteErr) {
        console.warn('Redis write failed during Oura sync:', redisWriteErr);
      }
    }

    // Always return success with the synced logs so frontend can update localStorage!
    return NextResponse.json({
      success: true,
      syncedCount: newLogs.length,
      logs: mergedLogs,
    });
  } catch (error: any) {
    console.error('API POST /api/oura/sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync Oura workouts' },
      { status: 500 }
    );
  }
}
