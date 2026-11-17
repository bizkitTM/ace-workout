import { NextResponse } from 'next/server';
import {
  fetchWorkoutDataFromRedis,
  saveLogToRedis,
  deleteLogFromRedis,
  saveScheduleToRedis,
  saveRulesToRedis,
} from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchWorkoutDataFromRedis();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET /api/workout error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'saveLog': {
        const success = await saveLogToRedis(data);
        return NextResponse.json({ success });
      }
      case 'deleteLog': {
        const success = await deleteLogFromRedis(data.id);
        return NextResponse.json({ success });
      }
      case 'saveSchedule': {
        const success = await saveScheduleToRedis(data);
        return NextResponse.json({ success });
      }
      case 'saveRules': {
        const success = await saveRulesToRedis(data);
        return NextResponse.json({ success });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API POST /api/workout error:', error);
    return NextResponse.json(
      { error: 'Failed to process workout request' },
      { status: 500 }
    );
  }
}
