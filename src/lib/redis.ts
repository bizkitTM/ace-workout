import Redis from 'ioredis';
import { DaySchedule, DecisionRule, WorkoutLog } from '../types/workout';
import { INITIAL_SCHEDULE, INITIAL_RULES, INITIAL_LOGS } from '../data/initialData';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url || url.trim() === '') {
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2500,
      commandTimeout: 2500,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null, // Don't loop retries on dead host
    });

    // Suppress unhandled error crashes
    redis.on('error', (err) => {
      console.warn('Redis connection issue (app continuing in local mode):', err.message);
    });

    return redis;
  } catch (err) {
    console.warn('Failed to initialize Redis client:', err);
    return null;
  }
}

export const REDIS_KEYS = {
  schedule: 'workout:schedule',
  rules: 'workout:rules',
  logs: 'workout:logs',
};

export async function fetchWorkoutDataFromRedis(): Promise<{
  schedule: DaySchedule[];
  rules: DecisionRule[];
  logs: WorkoutLog[];
  redisConnected: boolean;
}> {
  const client = getRedis();
  if (!client) {
    return {
      schedule: INITIAL_SCHEDULE,
      rules: INITIAL_RULES,
      logs: INITIAL_LOGS,
      redisConnected: false,
    };
  }

  try {
    if (client.status === 'wait') {
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connect timeout')), 2500)),
      ]);
    }

    const [rawSchedule, rawRules, rawLogs] = await Promise.all([
      client.get(REDIS_KEYS.schedule).catch(() => null),
      client.get(REDIS_KEYS.rules).catch(() => null),
      client.get(REDIS_KEYS.logs).catch(() => null),
    ]);

    const schedule: DaySchedule[] = rawSchedule ? JSON.parse(rawSchedule) : INITIAL_SCHEDULE;
    const rules: DecisionRule[] = rawRules ? JSON.parse(rawRules) : INITIAL_RULES;
    const logs: WorkoutLog[] = rawLogs ? JSON.parse(rawLogs) : INITIAL_LOGS;

    return {
      schedule,
      rules,
      logs,
      redisConnected: true,
    };
  } catch (err) {
    console.warn('Redis unavailable, using local initial data:', err);
    return {
      schedule: INITIAL_SCHEDULE,
      rules: INITIAL_RULES,
      logs: INITIAL_LOGS,
      redisConnected: false,
    };
  }
}

export async function saveLogToRedis(log: WorkoutLog): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    const rawLogs = await client.get(REDIS_KEYS.logs).catch(() => null);
    const logs: WorkoutLog[] = rawLogs ? JSON.parse(rawLogs) : INITIAL_LOGS;
    
    const updated = [log, ...logs.filter((l) => l.id !== log.id)];
    await client.set(REDIS_KEYS.logs, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn('Failed to save log to Redis:', err);
    return false;
  }
}

export async function deleteLogFromRedis(id: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    const rawLogs = await client.get(REDIS_KEYS.logs).catch(() => null);
    if (!rawLogs) return true;

    const logs: WorkoutLog[] = JSON.parse(rawLogs);
    const updated = logs.filter((l) => l.id !== id);
    await client.set(REDIS_KEYS.logs, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn('Failed to delete log from Redis:', err);
    return false;
  }
}

export async function saveScheduleToRedis(schedule: DaySchedule[]): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    await client.set(REDIS_KEYS.schedule, JSON.stringify(schedule));
    return true;
  } catch (err) {
    console.warn('Failed to save schedule to Redis:', err);
    return false;
  }
}

export async function saveRulesToRedis(rules: DecisionRule[]): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
    await client.set(REDIS_KEYS.rules, JSON.stringify(rules));
    return true;
  } catch (err) {
    console.warn('Failed to save rules to Redis:', err);
    return false;
  }
}
