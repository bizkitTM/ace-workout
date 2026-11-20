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
  const [activeTab, setActiveTab] = useState<'planner' | 'tracker' | 'rules' | 'volume'>('tracker');
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [rules, setRules] = useState<DecisionRule[]>(INITIAL_RULES);
  const [logs, setLogs] = useState<WorkoutLog[]>(INITIAL_LOGS);
  const [selectedDayForLog, setSelectedDayForLog] = useState<DayOfWeek>('Saturday');
  const [redisConnected, setRedisConnected] = useState<boolean>(false);
  const [isSyncingOura, setIsSyncingOura] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');

  // 1. Initial hydration from localStorage (with housework filter cleanup)
  useEffect(() => {
    setSchedule(getStoredSchedule());
    setRules(getStoredRules());
    
    // Purge any housework entries from local storage
    const rawLogs = getStoredLogs();
    const cleanInitialLogs = rawLogs.filter((l) => {
      const t = (l.title || '').toLowerCase();
      const n = (l.notes || '').toLowerCase();
      return !t.includes('housework') && !n.includes('housework');
    });
    setLogs(cleanInitialLogs);
    saveStoredLogs(cleanInitialLogs);

    const currentDayIndex = new Date().getDay();
    setSelectedDayForLog(DAYS_OF_WEEK[currentDayIndex]);

    // 2. Fetch latest data from Redis API (only syncs/overwrites if Redis is ACTUALLY connected)
    const syncFromRedis = async () => {
      try {
        const res = await fetch('/api/workout');
        if (res.ok) {
          const data = await res.json();
          setRedisConnected(Boolean(data.redisConnected));

          // CRITICAL FIX: If in Local Mode (Redis not connected), NEVER overwrite user's localStorage with initial defaults!
          if (data.redisConnected) {
            if (data.schedule && data.schedule.length > 0) {
              setSchedule(data.schedule);
              saveStoredSchedule(data.schedule);
            }
            if (data.rules && data.rules.length > 0) {
              setRules(data.rules);
              saveStoredRules(data.rules);
            }
            if (data.logs && data.logs.length > 0) {
              const cleanRedisLogs = data.logs.filter((l: WorkoutLog) => {
                const t = (l.title || '').toLowerCase();
                const n = (l.notes || '').toLowerCase();
                return !t.includes('housework') && !n.includes('housework');
              });
              // Merge with local logs by ID so nothing is ever lost
              const localMap = new Map(cleanInitialLogs.map((l) => [l.id, l]));
              cleanRedisLogs.forEach((l: WorkoutLog) => localMap.set(l.id, l));
              const merged = Array.from(localMap.values());
              setLogs(merged);
              saveStoredLogs(merged);
            }
          } else {
            // In Local Mode, merge any default initial logs that might be missing, but NEVER wipe existing local logs!
            if (data.logs && data.logs.length > 0) {
              const localMap = new Map(cleanInitialLogs.map((l) => [l.id, l]));
              data.logs.forEach((l: WorkoutLog) => {
                if (!localMap.has(l.id)) {
                  localMap.set(l.id, l);
                }
              });
              const merged = Array.from(localMap.values());
              setLogs(merged);
              saveStoredLogs(merged);
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync with Redis, running in local mode:', err);
        setRedisConnected(false);
      }
    };

    syncFromRedis();
  }, []);

  const handleUpdateDay = async (updatedDay: DaySchedule) => {
    const updated = schedule.map((d) => (d.dayOfWeek === updatedDay.dayOfWeek ? updatedDay : d));
    setSchedule(updated);
    saveStoredSchedule(updated);

    try {
      await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveSchedule', data: updated }),
      });
    } catch (e) {
      console.warn('Failed to save schedule to Redis API:', e);
    }
  };

  const handleSelectDayForLog = (day: DayOfWeek) => {
    setSelectedDayForLog(day);
    setActiveTab('tracker');
  };

  const handleSaveLog = async (newLog: WorkoutLog) => {
    const updated = [newLog, ...logs.filter((l) => l.id !== newLog.id)];
    setLogs(updated);
    saveStoredLogs(updated);

    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveLog', data: newLog }),
      });
      if (res.ok) {
        setRedisConnected(true);
      }
    } catch (e) {
      console.warn('Failed to save log to Redis API:', e);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm('Delete this workout log?')) {
      const updated = logs.filter((l) => l.id !== id);
      setLogs(updated);
      saveStoredLogs(updated);

      try {
        await fetch('/api/workout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteLog', data: { id } }),
        });
      } catch (e) {
        console.warn('Failed to delete log from Redis API:', e);
      }
    }
  };

  const handleSyncOura = async () => {
    setIsSyncingOura(true);
    try {
      const existingIds = logs.map((l) => l.id);
      const res = await fetch('/api/oura/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          const cleanLogs = data.logs.filter((l: WorkoutLog) => {
            const t = (l.title || '').toLowerCase();
            const n = (l.notes || '').toLowerCase();
            return !t.includes('housework') && !n.includes('housework');
          });
          setLogs(cleanLogs);
          saveStoredLogs(cleanLogs);
        }
        
        // Report the ACTUAL number of newly imported workouts!
        if (data.newCount > 0) {
          alert(`Successfully imported ${data.newCount} new workout(s) from Oura!`);
        } else {
          alert(`All workouts are up to date! 0 new workouts to import (${data.totalOuraCount || 0} already in your history).`);
        }
      } else {
        const err = await res.json();
        alert(`Oura sync error: ${err.error || 'Check OURA_TOKEN setting'}`);
      }
    } catch (e) {
      console.error('Failed to sync Oura:', e);
      alert('Network error while syncing with Oura API.');
    } finally {
      setIsSyncingOura(false);
    }
  };

  const handleAddRule = async (newRule: DecisionRule) => {
    const updated = [newRule, ...rules];
    setRules(updated);
    saveStoredRules(updated);

    try {
      await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveRules', data: updated }),
      });
    } catch (e) {
      console.warn('Failed to save rules to Redis API:', e);
    }
  };

  const handleUpdateRuleStatus = async (id: string, status: DecisionRule['status']) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, status } : r));
    setRules(updated);
    saveStoredRules(updated);

    try {
      await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'saveRules', data: updated }),
      });
    } catch (e) {
      console.warn('Failed to update rule in Redis API:', e);
    }
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
        onSyncOura={handleSyncOura}
        isSyncingOura={isSyncingOura}
        redisConnected={redisConnected}
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
