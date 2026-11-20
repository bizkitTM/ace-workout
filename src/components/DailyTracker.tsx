'use client';

import React, { useState } from 'react';
import { WorkoutLog, DaySchedule, Modality, DayOfWeek } from '../types/workout';
import { Zap, CheckCircle2, Plus, Trash2, Calendar, Dumbbell, Activity, Heart, Sparkles, MessageSquare } from 'lucide-react';

interface DailyTrackerProps {
  logs: WorkoutLog[];
  schedule: DaySchedule[];
  selectedDay: DayOfWeek;
  onSaveLog: (log: WorkoutLog) => void;
  onDeleteLog: (id: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  logs,
  schedule,
  selectedDay,
  onSaveLog,
  onDeleteLog,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);

  const matchedSchedule = schedule.find((s) => s.dayOfWeek === selectedDay) || schedule[0];

  const [title, setTitle] = useState(matchedSchedule.primaryFocus);
  const [modality, setModality] = useState<Modality>(matchedSchedule.modality);
  const [durationMinutes, setDurationMinutes] = useState(matchedSchedule.durationMinutes);
  const [completed, setCompleted] = useState(true);
  const [legFatigue, setLegFatigue] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [rpe, setRpe] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [ouraReadiness, setOuraReadiness] = useState<string>('75');

  // Exercise entries for resistance days
  const [exercises, setExercises] = useState<Array<{ id: string; name: string; sets: number; reps: string; weight: string }>>([
    { id: '1', name: matchedSchedule.targetExercises?.[0] || 'Primary Movement', sets: 3, reps: '10', weight: '' },
  ]);

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: 3, reps: '10', weight: '' },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleExerciseChange = (id: string, field: string, value: any) => {
    setExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  
  const loadJumpTrainingTemplate = () => {
    setTitle('Plyometric Jump Training');
    setModality('Volleyball');
    setDurationMinutes(25);
    setLegFatigue(4);
    setRpe(8);
    setExercises([
      { id: '1', name: 'Jump Rope Warmup', sets: 1, reps: '100 reps', weight: 'Bodyweight' },
      { id: '2', name: 'Depth Jumps (Box drop & rebound jump)', sets: 3, reps: '6 reps', weight: 'Bodyweight' },
      { id: '3', name: 'Standing Broad Jumps', sets: 3, reps: '5 reps', weight: 'Max distance' },
      { id: '4', name: 'Volleyball Approach Jumps', sets: 1, reps: '5 reps', weight: 'Full approach' }
    ]);
    setNotes('Pre-volleyball plyometric jump training session. Focused on reactive ground contact time, explosive vertical takeoff, and spike approach mechanics. 100 jump rope reps warmup prior to workout.');
  };

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WorkoutLog = {
      id: `log-${Date.now()}`,
      date,
      dayOfWeek: selectedDay,
      title: title || matchedSchedule.primaryFocus,
      modality,
      completed,
      durationMinutes: Number(durationMinutes),
      legFatigueRating: legFatigue,
      rpe: Number(rpe),
      notes,
      ouraReadinessScore: ouraReadiness ? Number(ouraReadiness) : undefined,
      exercises: exercises.filter((ex) => ex.name.trim() !== ''),
    };

    onSaveLog(newLog);
    setNotes('');
    alert('Workout logged successfully!');
  };

  const getFatigueLabel = (score: number) => {
    switch (score) {
      case 1:
        return '1 - Fresh as a daisy';
      case 2:
        return '2 - Light fatigue';
      case 3:
        return '3 - Moderate / Normal';
      case 4:
        return '4 - Heavy / Stiff';
      case 5:
        return '5 - Sore / Needs Recovery';
      default:
        return `${score}`;
    }
  };

  // Helper to sort workouts: Latest date first, and within the same day, LATEST time first!
  const getLogSortTime = (log: WorkoutLog): number => {
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
  };

  const sortedLogs = [...logs].sort((a, b) => {
    // 1. Date descending (latest date first)
    if (a.date !== b.date) {
      return a.date > b.date ? -1 : 1;
    }
    // 2. Within the same day: latest time FIRST!
    const timeA = getLogSortTime(a);
    const timeB = getLogSortTime(b);
    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Logging Form */}
      <div className="lg:col-span-7 space-y-6">
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Log Today&apos;s Training</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scheduled for {selectedDay}: <span className="text-emerald-400 font-semibold">{matchedSchedule.primaryFocus}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={loadJumpTrainingTemplate}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                title="Auto-fill the 100 Jump Rope + Plyo Box & Broad Jump workout"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Load: Jump Training</span>
              </button>
              <div className="flex items-center gap-1.5 ml-1">
                <span className="text-xs text-slate-400">Completed?</span>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Session Focus / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={matchedSchedule.primaryFocus}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Modality
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as Modality)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Volleyball">Volleyball Match</option>
                <option value="Resistance (Upper)">Resistance (Upper)</option>
                <option value="Resistance (Lower)">Resistance (Lower)</option>
                <option value="VO2 Max / Cardio">VO2 Max / Cardio</option>
                <option value="Running">Running</option>
                <option value="Active Recovery">Active Recovery</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Oura Readiness
              </label>
              <input
                type="number"
                value={ouraReadiness}
                onChange={(e) => setOuraReadiness(e.target.value)}
                placeholder="e.g. 74"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Leg Fatigue & RPE Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Leg Fatigue / Knee Feel
                </label>
                <span className="text-xs text-amber-400 font-bold">
                  {getFatigueLabel(legFatigue)}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={legFatigue}
                onChange={(e) => setLegFatigue(Number(e.target.value) as any)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 (Fresh)</span>
                <span>3 (Moderate)</span>
                <span>5 (Heavy/Sore)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Effort (RPE 1-10)
                </label>
                <span className="text-xs text-emerald-400 font-bold">
                  RPE {rpe}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 (Easy)</span>
                <span>5 (Moderate)</span>
                <span>10 (Max Effort)</span>
              </div>
            </div>
          </div>

          {/* Exercise Details if Resistance */}
          {(modality.includes('Resistance') || modality === 'Volleyball') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                  Key Exercises / Drills Completed
                </h4>
                <button
                  type="button"
                  onClick={addExercise}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Exercise</span>
                </button>
              </div>

              <div className="space-y-2">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50"
                  >
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(ex.id, 'name', e.target.value)}
                      placeholder="Exercise name"
                      className="col-span-5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(ex.id, 'sets', Number(e.target.value))}
                      placeholder="Sets"
                      className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-center"
                    />
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(ex.id, 'reps', e.target.value)}
                      placeholder="Reps"
                      className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-center"
                    />
                    <input
                      type="text"
                      value={ex.weight}
                      onChange={(e) => handleExerciseChange(ex.id, 'weight', e.target.value)}
                      placeholder="Weight"
                      className="col-span-2 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(ex.id)}
                      className="col-span-1 text-slate-400 hover:text-rose-400 p-1 flex justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes & Decisions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Notes, Observations &amp; Adjustments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the knees feel? Any fatigue carryover? Did Saturday legs impact Sunday volleyball?"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            Save Workout Log
          </button>
        </form>
      </div>

      {/* Recent Log History */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Recent Training History</span>
          </h3>
          <span className="text-xs text-slate-400">{sortedLogs.length} logged</span>
        </div>

        <div className="space-y-3">
          {sortedLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {log.date} ({log.dayOfWeek.slice(0, 3)})
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      {log.durationMinutes} min
                    </span>
                    {log.ouraReadinessScore && (
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Oura: {log.ouraReadinessScore}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{log.title}</h4>
                </div>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Delete log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {log.exercises && log.exercises.length > 0 && (
                <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  {log.exercises.map((ex, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-300">• {ex.name}</span>
                      <span className="text-slate-500">
                        {ex.sets}x{ex.reps} {ex.weight ? `@ ${ex.weight}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {log.notes && (
                <p className="text-xs text-slate-300 italic border-l-2 border-emerald-500/40 pl-2">
                  &ldquo;{log.notes}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Leg Fatigue: <strong className="text-amber-400">{log.legFatigueRating}/5</strong></span>
                <span>Effort: <strong className="text-emerald-400">RPE {log.rpe}/10</strong></span>
              </div>
            </div>
          ))}

          {sortedLogs.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-sm">
              No workouts logged yet. Use the form on the left to record your first workout!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
