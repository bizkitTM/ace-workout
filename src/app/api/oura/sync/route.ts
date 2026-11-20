import { NextResponse } from 'next/server';
import { fetchOuraWorkouts } from '@/lib/oura';
import { getRedis, REDIS_KEYS } from '@/lib/redis';
import { WorkoutLog } from '@/types/workout';
import { INITIAL_LOGS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

function getWorkoutSortTime(log: WorkoutLog): number {
  if (log.startDatetime) {
    return new Date(log.startDatetime).getTime();
  }
  const m = (log.notes || '').match(/Time:\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }
  return 0;
}

export async function POST() {
  try {
    // 1. Fetch workouts from Oura Cloud API (already filters out housework & formats in Eastern Time)
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

    // 3. Clean up: Remove any existing housework entries and any existing Oura-imported entries
    // so they get cleanly replaced by the corrected Eastern Time versions!
    const cleanManualLogs = currentLogs.filter((l) => {
      const titleLower = (l.title || '').toLowerCase();
      const notesLower = (l.notes || '').toLowerCase();
      if (titleLower.includes('housework') || notesLower.includes('housework')) {
        return false;
      }
      if (l.id.startsWith('oura-')) {
        return false;
      }
      return true;
    });

    // 4. Merge new correctly formatted Oura workouts with clean manual logs
    const finalOuraLogs = ouraWorkouts.filter((ow) => {
      const alreadyHasManual = cleanManualLogs.some(
        (ml) => ml.date === ow.date && ml.modality === ow.modality
      );
      return !alreadyHasManual;
    });

    const mergedLogs = [...finalOuraLogs, ...cleanManualLogs];

    // Sort: Latest date first. Within the same day, latest time FIRST!
    mergedLogs.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date > b.date ? -1 : 1;
      }
      const timeA = getWorkoutSortTime(a);
      const timeB = getWorkoutSortTime(b);
      if (timeA !== timeB) {
        return timeB - timeA; // Latest time on that day comes first!
      }
      return (b.id || '').localeCompare(a.id || '');
    });

    // 5. Save back to Redis
    if (client) {
      try {
        await client.set(REDIS_KEYS.logs, JSON.stringify(mergedLogs));
      } catch (redisWriteErr) {
        console.warn('Redis write failed during Oura sync:', redisWriteErr);
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: finalOuraLogs.length,
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
