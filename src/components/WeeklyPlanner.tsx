'use client';

import React, { useState } from 'react';
import { DaySchedule, DayOfWeek } from '../types/workout';
import { ShieldAlert, ShieldCheck, Flame, Clock, Dumbbell, ChevronDown, ChevronUp, Plus, CheckCircle2 } from 'lucide-react';

interface WeeklyPlannerProps {
  schedule: DaySchedule[];
  onSelectDayForLog: (day: DayOfWeek) => void;
  onUpdateDay: (updatedDay: DaySchedule) => void;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  schedule,
  onSelectDayForLog,
  onUpdateDay,
}) => {
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>('Saturday');
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  const toggleExpand = (day: DayOfWeek) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getModalityBadgeColor = (modality: string) => {
    switch (modality) {
      case 'Volleyball':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Resistance (Upper)':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Resistance (Lower)':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'VO2 Max / Cardio':
      case 'Running':
        return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLegImpactBadge = (impact: string, isAllowed: boolean, isVb: boolean) => {
    if (isVb) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Flame className="w-3 h-3 text-amber-400" />
          Plyometric Overload (Match Day)
        </span>
      );
    }
    if (isAllowed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Golden Window: Heavy Legs Allowed 🏆
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
        <ShieldAlert className="w-3 h-3 text-rose-400" />
        No Heavy Legs (VB Adjacency Guard)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner / Strategic Context */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Weekly Strategy &amp; Constraint Solver</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                7-Day Matrix
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Volleyball on <strong className="text-amber-400">Tue / Thu / Sun</strong> delivers 200+ explosive jumps weekly. To prevent tendon strain and DOMS during matches, heavy leg compound lifting is isolated strictly to <strong className="text-emerald-400">Saturday</strong>.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto text-xs text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-white font-bold">3x</span> Volleyball
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">2x</span> Upper Lift
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">1x</span> Leg Anchor
            </div>
            <span>•</span>
            <div>
              <span className="text-white font-bold">1x</span> VO2 Max
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Schedule Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        {schedule.map((item) => {
          const isExpanded = expandedDay === item.dayOfWeek;
          const isSaturday = item.dayOfWeek === 'Saturday';

          return (
            <div
              key={item.dayOfWeek}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                item.isVolleyballDay
                  ? 'bg-slate-900/90 border-amber-500/30 shadow-md shadow-amber-500/5'
                  : isSaturday
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => toggleExpand(item.dayOfWeek)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 shadow-inner ${
                      item.isVolleyballDay
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isSaturday
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{item.shortName}</span>
                    <span className="text-[10px] font-normal opacity-70">Day</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {item.primaryFocus}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getModalityBadgeColor(
                          item.modality
                        )}`}
                      >
                        {item.modality}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {getLegImpactBadge(
                        item.legImpact,
                        item.isLegDayAllowed,
                        item.isVolleyballDay
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDayForLog(item.dayOfWeek);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Log Workout</span>
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        Leg Recovery &amp; Scheduling Rule
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {item.legRuleNote}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Why This Sequencing Works
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {item.whyItWorks}
                      </p>
                    </div>
                  </div>

                  {item.targetExercises && item.targetExercises.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                        Recommended Workout Blueprint
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
                        {item.targetExercises.map((ex, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-700/40"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
