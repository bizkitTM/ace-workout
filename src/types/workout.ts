export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type Modality = 'Volleyball' | 'Resistance (Upper)' | 'Resistance (Lower)' | 'VO2 Max / Cardio' | 'Running' | 'Active Recovery';

export type LegImpact = 'Explosive Plyometrics' | 'Heavy Resistance' | 'None (Upper Focus)' | 'Cardio Base' | 'Rest / Recovery';

export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  shortName: string;
  primaryFocus: string;
  modality: Modality;
  legImpact: LegImpact;
  isVolleyballDay: boolean;
  isLegDayAllowed: boolean;
  legRuleNote: string;
  whyItWorks: string;
  targetExercises?: string[];
  durationMinutes: number;
  intensity: 'High' | 'Medium' | 'Low' | 'Rest';
}

export interface DecisionRule {
  id: string;
  title: string;
  category: 'Legs & Recovery' | 'Volleyball Constraint' | 'Cardio & VO2 Max' | 'Upper Body Split' | 'Oura Readiness' | 'Nutrition & Supplements';
  dateAdded: string;
  constraint: string;
  rationale: string;
  compromiseOrRule: string;
  status: 'Active Rule' | 'Under Review' | 'Experiment';
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

export interface CardioLog {
  type: string;
  durationMinutes: number;
  distanceMiles?: number;
  avgHr?: number;
  maxHr?: number;
  intervalsCompleted?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: DayOfWeek;
  title: string;
  modality: Modality;
  completed: boolean;
  durationMinutes: number;
  legFatigueRating: 1 | 2 | 3 | 4 | 5; // 1 = Fresh, 5 = Heavy/Sore
  rpe: number; // 1-10
  exercises?: ExerciseLog[];
  cardio?: CardioLog;
  notes: string;
  ouraReadinessScore?: number;
}
