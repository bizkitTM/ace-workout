'use client';

import React, { useState } from 'react';
import { DecisionRule } from '../types/workout';
import { BookOpen, Plus, ShieldCheck, Tag, Filter, Check, AlertCircle, Sparkles } from 'lucide-react';

interface DecisionVaultProps {
  rules: DecisionRule[];
  onAddRule: (rule: DecisionRule) => void;
  onUpdateRuleStatus: (id: string, status: DecisionRule['status']) => void;
}

export const DecisionVault: React.FC<DecisionVaultProps> = ({
  rules,
  onAddRule,
  onUpdateRuleStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // New rule form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DecisionRule['category']>('Legs & Recovery');
  const [constraint, setConstraint] = useState('');
  const [rationale, setRationale] = useState('');
  const [compromiseOrRule, setCompromiseOrRule] = useState('');

  const categories = ['All', 'Legs & Recovery', 'Volleyball Constraint', 'Upper Body Split', 'Cardio & VO2 Max', 'Oura Readiness', 'Nutrition & Supplements'];

  const filteredRules = selectedCategory === 'All'
    ? rules
    : rules.filter((r) => r.category === selectedCategory);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !compromiseOrRule.trim()) return;

    const newRule: DecisionRule = {
      id: `rule-${Date.now()}`,
      title,
      category,
      dateAdded: new Date().toISOString().split('T')[0],
      constraint,
      rationale,
      compromiseOrRule,
      status: 'Active Rule',
    };

    onAddRule(newRule);
    setTitle('');
    setConstraint('');
    setRationale('');
    setCompromiseOrRule('');
    setIsAdding(false);
  };

  const getStatusBadge = (status: DecisionRule['status']) => {
    switch (status) {
      case 'Active Rule':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Experiment':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Training Decisions &amp; Logic Vault</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              The &ldquo;Why&rdquo; Log
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            A permanent record of your training constraints, physiological reasoning, and hard-won compromises. Track why workouts are slotted the way they are so you don&apos;t have to re-solve the puzzle.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="self-start md:self-auto px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add New Decision'}</span>
        </button>
      </div>

      {/* New Rule Modal/Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Document a New Training Decision / Constraint</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Decision Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Saturday Legs vs. Sunday Jump Recovery"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Legs & Recovery">Legs &amp; Recovery</option>
                <option value="Volleyball Constraint">Volleyball Constraint</option>
                <option value="Upper Body Split">Upper Body Split</option>
                <option value="Cardio & VO2 Max">Cardio &amp; VO2 Max</option>
                <option value="Oura Readiness">Oura Readiness</option>
                <option value="Nutrition & Supplements">Nutrition &amp; Supplements</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              The Real-World Constraint / Conflict
            </label>
            <input
              type="text"
              required
              value={constraint}
              onChange={(e) => setConstraint(e.target.value)}
              placeholder="What schedule conflict, fatigue barrier, or injury risk created this problem?"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                The Physiology / Rationale
              </label>
              <textarea
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Why does the body react this way? (e.g. 200+ eccentric jump landings)"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                The Concrete Rule / Compromise
              </label>
              <textarea
                rows={2}
                required
                value={compromiseOrRule}
                onChange={(e) => setCompromiseOrRule(e.target.value)}
                placeholder="What is our exact operational rule going forward?"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md"
            >
              Save Decision Rule
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === cat
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Decision Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {rule.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      rule.status
                    )}`}
                  >
                    {rule.status}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">
                {rule.title}
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    The Constraint:
                  </span>
                  <p className="leading-relaxed">{rule.constraint}</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    Physiological Rationale:
                  </span>
                  <p className="leading-relaxed">{rule.rationale}</p>
                </div>

                <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    The Operating Rule:
                  </span>
                  <p className="text-emerald-200/90 leading-relaxed font-medium">
                    {rule.compromiseOrRule}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Logged: {rule.dateAdded}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onUpdateRuleStatus(
                      rule.id,
                      rule.status === 'Active Rule' ? 'Under Review' : 'Active Rule'
                    )
                  }
                  className="hover:text-slate-300 underline"
                >
                  Toggle Status
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
