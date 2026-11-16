'use client';

import React from 'react';
import { DaySchedule, WorkoutLog } from '../types/workout';
import { BarChart3, Activity, Flame, Dumbbell, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface VolumeSummaryProps {
  schedule: DaySchedule[];
  logs: WorkoutLog[];
}

export const VolumeSummary: React.FC<VolumeSummaryProps> = ({ schedule, logs }) => {
  const vbDays = schedule.filter((s) => s.modality === 'Volleyball').length;
  const upperDays = schedule.filter((s) => s.modality === 'Resistance (Upper)').length;
  const lowerDays = schedule.filter((s) => s.modality === 'Resistance (Lower)').length;
  const cardioDays = schedule.filter((s) => s.modality.includes('Cardio') || s.modality === 'Running').length;
  const totalPlannedMinutes = schedule.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Past 7 days logs
  const completedLogs = logs.filter((l) => l.completed);
  const totalLoggedMinutes = completedLogs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const avgFatigue = logs.length > 0
    ? (logs.reduce((sum, l) => sum + l.legFatigueRating, 0) / logs.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Volleyball
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{vbDays}x / wk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">~360 mins plyo &amp; jumps</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Upper Lift
            </span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{upperDays}x / wk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Mon Pull + Wed Push</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Leg Anchor
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{lowerDays}x / wk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Saturday dedicated</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-fuchsia-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">
              VO2 Max
            </span>
            <HeartPulse className="w-4 h-4 text-fuchsia-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">{cardioDays}x / wk</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Friday Norwegian 4x4</p>
        </div>
      </div>

      {/* Deep-Dive Analysis Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Weekly Muscle &amp; Systemic Fatigue Balance</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-medium">Lower Body / Tendon Strain (VB + Legs)</span>
                <span className="text-amber-400 font-bold">57% Total Load</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: '57%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                4 days of lower engagement (3 VB plyo + 1 Saturday strength). Completely safe because each volleyball day has recovery buffers.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-medium">Upper Body Hypertrophy (Push/Pull)</span>
                <span className="text-cyan-400 font-bold">28% Total Load</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '28%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Balanced between Monday pulling (lats/biceps) and Wednesday pushing (chest/shoulders).
              </p>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-medium">Cardiovascular / VO2 Engine</span>
                <span className="text-fuchsia-400 font-bold">15% Total Load</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: '15%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Friday dedicated 4x4 interval session on the treadmill to maintain high VO2 Max without knee impact.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Weekly Planning Recommendations</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-emerald-400 block mb-0.5">Saturday Morning Lifting Strategy:</strong>
              Lift on Saturday morning rather than Saturday night. This expands your rest window to a full 24–28 hours before Sunday volleyball match play.
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-cyan-400 block mb-0.5">Creatine Daily Saturation:</strong>
              Take 5g micronized creatine monohydrate daily in your morning hot coffee or breakfast. Keeps muscle phosphocreatine topped off for Tuesday/Thursday/Sunday match endurance.
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-amber-400 block mb-0.5">Average Logged Leg Fatigue: {avgFatigue}/5</strong>
              Track this score after Sunday volleyball. If average fatigue consistently hits 4+, slightly reduce Saturday squat volume from 4 sets to 3 sets.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
