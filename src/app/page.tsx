'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { WeeklyPlanner } from '@/components/WeeklyPlanner';
import { DailyTracker } from '@/components/DailyTracker';
import { DecisionVault } from '@/components/DecisionVault';
import { VolumeSummary } from '@/components/VolumeSummary';
import { DaySchedule, DecisionRule, WorkoutLog, DayOfWeek } from '@/types/workout';
import {
  getStoredSchedule,
  saveStoredSchedule,
  getStoredRules,
  saveStoredRules,
  getStoredLogs,
  saveStoredLogs,
  exportBackupData,
  importBackupData,
} from '@/lib/storage';
import { INITIAL_SCHEDULE, INITIAL_RULES, INITIAL_LOGS } from '@/data/initialData';

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'planner' | 'tracker' | 'rules' | 'volume'>('planner');
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [rules, setRules] = useState<DecisionRule[]>(INITIAL_RULES);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [selectedDayForLog, setSelectedDayForLog] = useState<DayOfWeek>('Saturday');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  // Hydrate from localStorage
  useEffect(() => {
    setSchedule(getStoredSchedule());
    setRules(getStoredRules());
    setLogs(getStoredLogs());

    // Auto-detect current day of week
    const currentDayIndex = new Date().getDay();
    setSelectedDayForLog(DAYS_OF_WEEK[currentDayIndex]);
  }, []);

  const handleUpdateDay = (updatedDay: DaySchedule) => {
    const updated = schedule.map((d) => (d.dayOfWeek === updatedDay.dayOfWeek ? updatedDay : d));
    setSchedule(updated);
    saveStoredSchedule(updated);
  };

  const handleSelectDayForLog = (day: DayOfWeek) => {
    setSelectedDayForLog(day);
    setActiveTab('tracker');
  };

  const handleSaveLog = (newLog: WorkoutLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveStoredLogs(updated);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('Delete this workout log?')) {
      const updated = logs.filter((l) => l.id !== id);
      setLogs(updated);
      saveStoredLogs(updated);
    }
  };

  const handleAddRule = (newRule: DecisionRule) => {
    const updated = [newRule, ...rules];
    setRules(updated);
    saveStoredRules(updated);
  };

  const handleUpdateRuleStatus = (id: string, status: DecisionRule['status']) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, status } : r));
    setRules(updated);
    saveStoredRules(updated);
  };

  const handleExport = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ace-workout-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (importBackupData(importJson)) {
      setSchedule(getStoredSchedule());
      setRules(getStoredRules());
      setLogs(getStoredLogs());
      setImportModalOpen(false);
      setImportJson('');
      alert('Data restored successfully!');
    } else {
      alert('Invalid JSON format. Please verify and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExport={handleExport}
        onImport={() => setImportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'planner' && (
          <WeeklyPlanner
            schedule={schedule}
            onSelectDayForLog={handleSelectDayForLog}
            onUpdateDay={handleUpdateDay}
          />
        )}

        {activeTab === 'tracker' && (
          <DailyTracker
            logs={logs}
            schedule={schedule}
            selectedDay={selectedDayForLog}
            onSaveLog={handleSaveLog}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'rules' && (
          <DecisionVault
            rules={rules}
            onAddRule={handleAddRule}
            onUpdateRuleStatus={handleUpdateRuleStatus}
          />
        )}

        {activeTab === 'volume' && (
          <VolumeSummary
            schedule={schedule}
            logs={logs}
          />
        )}
      </main>

      {/* Restore / Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Restore Backup Data</h3>
            <p className="text-xs text-slate-400">
              Paste your exported JSON backup text below to restore your schedule, logged workouts, and decision rules.
            </p>
            <textarea
              rows={8}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl"
              >
                Restore Now
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>Peter Scully Fitness Planner · Powered by Ace · Built for Volleyball, Resistance &amp; VO2 Max</p>
      </footer>
    </div>
  );
}
