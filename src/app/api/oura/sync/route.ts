import { NextResponse } from 'next/server';
import { fetchOuraWorkouts } from '@/lib/oura';
import { getRedis, REDIS_KEYS } from '@/lib/redis';
import { WorkoutLog } from '@/types/workout';
import { INITIAL_LOGS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 1. Fetch workouts from Oura
    const ouraWorkouts = await fetchOuraWorkouts(14);

    // 2. Load existing logs from Redis (or initial fallback)
    const client = getRedis();
    let currentLogs: WorkoutLog[] = INITIAL_LOGS;

    if (client) {
      if (client.status === 'wait') {
        await client.connect();
      }
      const raw = await client.get(REDIS_KEYS.logs);
      if (raw) {
        currentLogs = JSON.parse(raw);
      }
    }

    // 3. Deduplicate and merge: Don't add if already exists by id, or date + same modality
    const existingIds = new Set(currentLogs.map((l) => l.id));
    const newLogs: WorkoutLog[] = [];

    for (const w of ouraWorkouts) {
      if (!existingIds.has(w.id)) {
        // Also check if user manually logged a session on the same date with the same modality
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

    // 4. Save merged logs back to Redis
    if (client && newLogs.length > 0) {
      await client.set(REDIS_KEYS.logs, JSON.stringify(mergedLogs));
    }

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
