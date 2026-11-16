import { DaySchedule, DecisionRule, WorkoutLog } from '../types/workout';
import { INITIAL_SCHEDULE, INITIAL_RULES, INITIAL_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  SCHEDULE: 'ace_workout_schedule_v1',
  RULES: 'ace_workout_rules_v1',
  LOGS: 'ace_workout_logs_v1',
};

export function getStoredSchedule(): DaySchedule[] {
  if (typeof window === 'undefined') return INITIAL_SCHEDULE;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return item ? JSON.parse(item) : INITIAL_SCHEDULE;
  } catch (e) {
    console.error('Failed to load schedule from localStorage', e);
    return INITIAL_SCHEDULE;
  }
}

export function saveStoredSchedule(schedule: DaySchedule[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (e) {
    console.error('Failed to save schedule to localStorage', e);
  }
}

export function getStoredRules(): DecisionRule[] {
  if (typeof window === 'undefined') return INITIAL_RULES;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.RULES);
    return item ? JSON.parse(item) : INITIAL_RULES;
  } catch (e) {
    console.error('Failed to load rules from localStorage', e);
    return INITIAL_RULES;
  }
}

export function saveStoredRules(rules: DecisionRule[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save rules to localStorage', e);
  }
}

export function getStoredLogs(): WorkoutLog[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LOGS);
    return item ? JSON.parse(item) : INITIAL_LOGS;
  } catch (e) {
    console.error('Failed to load logs from localStorage', e);
    return INITIAL_LOGS;
  }
}

export function saveStoredLogs(logs: WorkoutLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs to localStorage', e);
  }
}

export function exportBackupData(): string {
  const data = {
    schedule: getStoredSchedule(),
    rules: getStoredRules(),
    logs: getStoredLogs(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.schedule && Array.isArray(data.schedule)) {
      saveStoredSchedule(data.schedule);
    }
    if (data.rules && Array.isArray(data.rules)) {
      saveStoredRules(data.rules);
    }
    if (data.logs && Array.isArray(data.logs)) {
      saveStoredLogs(data.logs);
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup data', e);
    return false;
  }
}
