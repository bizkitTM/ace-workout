'use client';

import React from 'react';
import { Calendar, CheckCircle2, BookOpen, BarChart3, Dumbbell, Download, Upload, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: 'planner' | 'tracker' | 'rules' | 'volume';
  setActiveTab: (tab: 'planner' | 'tracker' | 'rules' | 'volume') => void;
  onExport: () => void;
  onImport: () => void;
  onSyncOura: () => void;
  isSyncingOura: boolean;
  redisConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExport,
  onImport,
  onSyncOura,
  isSyncingOura,
  redisConnected,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Left-Aligned: Title & Oura Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Peter&apos;s Workout Planner
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ace-workout
                  </span>
                  {redisConnected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Redis Synced
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      Local Mode
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Optimized for 3x Volleyball · Saturday Leg Anchor · VO2 Max &amp; Resistance
                </p>
              </div>
            </div>

            {/* Left-Aligned: Sync Oura Button right by the title/status */}
            <div className="sm:border-l sm:border-slate-800 sm:pl-4 sm:ml-2">
              <button
                onClick={onSyncOura}
                disabled={isSyncingOura}
                title="Sync Workouts & Readiness from Oura Ring"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/15 disabled:opacity-50 cursor-pointer w-fit"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOura ? 'animate-spin' : ''}`} />
                <span>{isSyncingOura ? 'Syncing Oura...' : 'Sync Oura'}</span>
              </button>
            </div>
          </div>

          {/* Right-Aligned: Data Backup & Restore */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">
              Data:
            </span>
            <button
              onClick={onExport}
              title="Download JSON Backup of your workouts and rules"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Backup</span>
            </button>
            <button
              onClick={onImport}
              title="Upload / Restore JSON Backup"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Restore</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/60 pt-2 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Daily Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'planner'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Decision Rules Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('volume')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'volume'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Volume &amp; Fatigue</span>
          </button>
        </div>
      </div>
    </header>
  );
};
