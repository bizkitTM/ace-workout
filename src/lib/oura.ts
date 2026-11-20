import { WorkoutLog, Modality, DayOfWeek } from '../types/workout';

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface OuraWorkoutRaw {
  id: string;
  activity: string;
  calories: number;
  day: string; // YYYY-MM-DD
  distance: number | null;
  start_datetime: string;
  end_datetime: string;
  intensity: string;
  label: string | null;
  source: string;
}

interface OuraReadinessRaw {
  day: string;
  score: number;
}

export async function fetchOuraWorkouts(daysBack: number = 14): Promise<WorkoutLog[]> {
  const token = process.env.OURA_TOKEN;
  if (!token) {
    throw new Error('OURA_TOKEN environment variable is not set');
  }

  const endDate = new Date().toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - daysBack);
  const startDate = startDateObj.toISOString().split('T')[0];

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch workouts and readiness in parallel
  const [workoutsRes, readinessRes] = await Promise.all([
    fetch(
      `https://api.ouraring.com/v2/usercollection/workout?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    ),
    fetch(
      `https://api.ouraring.com/v2/usercollection/daily_readiness?start_date=${startDate}&end_date=${endDate}`,
      { headers }
    ),
  ]);

  if (!workoutsRes.ok) {
    throw new Error(`Oura workouts API error: ${workoutsRes.status} ${workoutsRes.statusText}`);
  }

  const workoutsData = await workoutsRes.json();
  const rawWorkouts: OuraWorkoutRaw[] = workoutsData.data || [];

  const readinessMap: Record<string, number> = {};
  if (readinessRes.ok) {
    const readinessData = await readinessRes.json();
    const rawReadiness: OuraReadinessRaw[] = readinessData.data || [];
    rawReadiness.forEach((r) => {
      readinessMap[r.day] = r.score;
    });
  }

  // Eastern Time formatter for Peter (America/New_York)
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
  });

  // Filter out housework and low-intensity passive chores
  const filteredWorkouts = rawWorkouts.filter((w) => {
    const act = (w.activity || '').toLowerCase();
    const lbl = (w.label || '').toLowerCase();
    if (act.includes('housework') || lbl.includes('housework')) return false;
    return true;
  });

  return filteredWorkouts.map((w) => {
    const start = new Date(w.start_datetime);
    const end = new Date(w.end_datetime);
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
    
    // Calculate Day of Week in Eastern Time
    const dayOfWeek = dayOfWeekFormatter.format(start) as DayOfWeek;

    let modality: Modality = 'Active Recovery';
    let title = `${w.activity.charAt(0).toUpperCase() + w.activity.slice(1)} Session`;
    let legFatigueRating: 1 | 2 | 3 | 4 | 5 = 2;
    let rpe = 6;

    const actLower = w.activity.toLowerCase();
    if (actLower.includes('volleyball')) {
      modality = 'Volleyball';
      title = `${dayOfWeek} Volleyball Match Session`;
      legFatigueRating = 4;
      rpe = 8;
    } else if (actLower.includes('strength') || actLower.includes('weight')) {
      modality = 'Resistance (Upper)';
      title = `${dayOfWeek} Resistance Strength Session`;
      legFatigueRating = 2;
      rpe = 7;
    } else if (actLower.includes('run') || actLower.includes('jog')) {
      modality = 'Running';
      title = `${dayOfWeek} Running Workout`;
      legFatigueRating = 3;
      rpe = 7;
    } else if (actLower.includes('hiit') || actLower.includes('interval') || actLower.includes('cycling') || actLower.includes('row')) {
      modality = 'VO2 Max / Cardio';
      title = `${dayOfWeek} VO2 Max / Cardio Session`;
      legFatigueRating = 3;
      rpe = 8;
    } else if (actLower.includes('walk') || actLower.includes('yardwork')) {
      modality = 'Active Recovery';
      title = `${w.label || w.activity} (Active Movement)`;
      legFatigueRating = 1;
      rpe = 4;
    }

    const burnedCalories = Math.round(w.calories);
    const readinessScore = readinessMap[w.day];

    const formattedStart = timeFormatter.format(start);
    const formattedEnd = timeFormatter.format(end);

    return {
      id: `oura-${w.id}`,
      date: w.day,
      dayOfWeek,
      title,
      modality,
      completed: true,
      durationMinutes,
      legFatigueRating,
      rpe,
      notes: `Imported from Oura Ring · ${burnedCalories} kcal burned · Intensity: ${w.intensity} · Time: ${formattedStart} - ${formattedEnd}`,
      ouraReadinessScore: readinessScore,
    };
  });
}
