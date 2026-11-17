import Redis from 'ioredis';
import { DaySchedule, DecisionRule, WorkoutLog } from '../types/workout';
import { INITIAL_SCHEDULE, INITIAL_RULES, INITIAL_LOGS } from '../data/initialData';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    return redis;
  } catch (err) {
    console.error('Failed to initialize Redis client:', err);
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
      await client.connect();
    }

    const [rawSchedule, rawRules, rawLogs] = await Promise.all([
      client.get(REDIS_KEYS.schedule),
      client.get(REDIS_KEYS.rules),
      client.get(REDIS_KEYS.logs),
    ]);

    const schedule: DaySchedule[] = rawSchedule ? JSON.parse(rawSchedule) : INITIAL_SCHEDULE;
    const rules: DecisionRule[] = rawRules ? JSON.parse(rawRules) : INITIAL_RULES;
    const logs: WorkoutLog[] = rawLogs ? JSON.parse(rawLogs) : INITIAL_LOGS;

    // Seed Redis if keys were empty
    if (!rawSchedule) await client.set(REDIS_KEYS.schedule, JSON.stringify(INITIAL_SCHEDULE));
    if (!rawRules) await client.set(REDIS_KEYS.rules, JSON.stringify(INITIAL_RULES));
    if (!rawLogs) await client.set(REDIS_KEYS.logs, JSON.stringify(INITIAL_LOGS));

    return {
      schedule,
      rules,
      logs,
      redisConnected: true,
    };
  } catch (err) {
    console.error('Error fetching workout data from Redis:', err);
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
    const rawLogs = await client.get(REDIS_KEYS.logs);
    const logs: WorkoutLog[] = rawLogs ? JSON.parse(rawLogs) : INITIAL_LOGS;
    
    // Prepend new log
    const updated = [log, ...logs.filter((l) => l.id !== log.id)];
    await client.set(REDIS_KEYS.logs, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to save log to Redis:', err);
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
    const rawLogs = await client.get(REDIS_KEYS.logs);
    if (!rawLogs) return true;

    const logs: WorkoutLog[] = JSON.parse(rawLogs);
    const updated = logs.filter((l) => l.id !== id);
    await client.set(REDIS_KEYS.logs, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete log from Redis:', err);
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
    console.error('Failed to save schedule to Redis:', err);
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
    console.error('Failed to save rules to Redis:', err);
    return false;
  }
}
