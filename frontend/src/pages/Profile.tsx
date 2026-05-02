import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { GoalPlanResult, RiskQuestion } from '../types';

const RISK_QUESTIONS: RiskQuestion[] = [
  { id: 1, question: 'What is your primary investment goal?', options: [{ value: 1, label: 'Preserve capital' }, { value: 2, label: 'Steady income, minimal risk' }, { value: 3, label: 'Balanced growth & income' }, { value: 4, label: 'Long-term growth' }, { value: 5, label: 'Maximum growth, high risk OK' }], weight: 1.5, category: 'goals' },
  { id: 2, question: 'How long before you need this money?', options: [{ value: 1, label: 'Less than 1 year' }, { value: 2, label: '1–3 years' }, { value: 3, label: '3–5 years' }, { value: 4, label: '5–10 years' }, { value: 5, label: 'More than 10 years' }], weight: 1.3, category: 'horizon' },
  { id: 3, question: 'If investments dropped 20%, you would?', options: [{ value: 1, label: 'Sell everything' }, { value: 2, label: 'Sell some' }, { value: 3, label: 'Hold and wait' }, { value: 4, label: 'Buy a little more' }, { value: 5, label: 'Buy much more' }], weight: 2.0, category: 'behavior' },
  { id: 4, question: '% of income you can invest?', options: [{ value: 1, label: 'Less than 5%' }, { value: 2, label: '5–10%' }, { value: 3, label: '10–20%' }, { value: 4, label: '20–30%' }, { value: 5, label: 'More than 30%' }], weight: 1.0, category: 'capacity' },
  { id: 5, question: 'Investment experience level?', options: [{ value: 1, label: 'None – beginner' }, { value: 2, label: 'Basic – savings/FD' }, { value: 3, label: 'Intermediate – mutual funds' }, { value: 4, label: 'Advanced – stocks' }, { value: 5, label: 'Expert – derivatives' }], weight: 1.2, category: 'experience' },
];

const BADGES = [
  { id: 'first_steps', name: 'First Steps', icon: '🎓', description: 'Complete first lesson' },
  { id: 'risk_aware', name: 'Risk Aware', icon: '🎯', description: 'Complete risk assessment' },
  { id: 'goal_setter', name: 'Goal Setter', icon: '🏆', description: 'Create a financial goal' },
  { id: 'simulator_pro', name: 'Simulator Pro', icon: '📊', description: 'Run 5 simulations' },
  { id: 'budget_beginner', name: 'Budget Beginner', icon: '💰', description: 'Track 10 expenses' },
  { id: 'week_warrior', name: 'Week Warrior', icon: '🔥', description: '7-day streak' },
  { id: 'scholar', name: 'Scholar', icon: '📚', description: 'Complete all lessons' },
  { id: 'level_5', name: 'Rising Star', icon: '🌟', description: 'Reach level 5' },
  { id: 'level_10', name: 'Finance Guru', icon: '👑', description: 'Reach level 10' },
];

export default function Profile() {
  const { riskProfile, setRiskProfile, gamification, addXp, earnBadge, user } = useStore();
  const [tab, setTab] = useState<'risk' | 'goals' | 'badges'>('risk');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [goalForm, setGoalForm] = useState({ goal_name: '', target_amount: 1000000, current_savings: 0, timeline_years: 5, risk_tolerance: 'moderate' });
  const [goalResult, setGoalResult] = useState<GoalPlanResult | null>(null);

  const submitRiskAssessment = async () => {
    const answerList = Object.entries(answers).map(([id, val]) => ({ question_id: +id, answer_value: val }));
    try {
      const data = await api.assessRisk(answerList);
      setRiskProfile(data);
    } catch {
      // Offline calculation
      let total = 0, max = 0;
      for (const q of RISK_QUESTIONS) {
        const val = answers[q.id] || 3;
        total += val * q.weight;
        max += 5 * q.weight;
      }
      const score = Math.round((total / max) * 100);
      const category = score <= 33 ? 'Conservative' : score <= 66 ? 'Moderate' : 'Aggressive';
      setRiskProfile({ risk_score: score, risk_category: category as any, breakdown: {}, recommendations: ['Start with SIPs for gradual exposure', 'Build emergency fund first'] });
    }
    addXp(40);
    earnBadge('risk_aware');
  };

  const submitGoal = async () => {
    try {
      const data = await api.planGoal(goalForm);
      setGoalResult(data);
    } catch {
      const r = goalForm.risk_tolerance === 'conservative' ? 0.07 : goalForm.risk_tolerance === 'moderate' ? 0.11 : 0.15;
      const mr = r / 12;
      const n = goalForm.timeline_years * 12;
      const fv = goalForm.current_savings * Math.pow(1 + mr, n);
      const remaining = Math.max(0, goalForm.target_amount - fv);
      const monthly = remaining > 0 ? remaining * mr / (Math.pow(1 + mr, n) - 1) : 0;
      setGoalResult({
        goal_name: goalForm.goal_name, target_amount: goalForm.target_amount,
        monthly_savings_required: Math.round(monthly), total_contributions: Math.round(monthly * n + goalForm.current_savings),
        expected_returns: Math.round(goalForm.target_amount - monthly * n - goalForm.current_savings),
        projected_final_amount: goalForm.target_amount,
        feasibility: monthly / 50000 < 0.1 ? 'Easy' : monthly / 50000 < 0.25 ? 'Moderate' : 'Challenging',
        tips: ['Set up automatic SIPs', 'Review every 6 months'],
      });
    }
    addXp(25);
    earnBadge('goal_setter');
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Financial Profile</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium tracking-tight">Manage your risk, goals, and track your achievements</p>
      </div>

      {/* Gamification Card */}
      <div className="glass-light p-8 md:p-12 shadow-xl shadow-slate-200/50 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="w-24 h-24 rounded-[2.5rem] primary-gradient flex items-center justify-center text-4xl font-extrabold text-white shadow-2xl shadow-indigo-200 ring-8 ring-white">
            {user?.full_name?.charAt(0) || '👤'}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.full_name || 'Guest User'}</h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 font-bold shadow-sm">
                <Trophy size={20} /> Level {gamification.level}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-bold shadow-sm">
                <Star size={20} /> {gamification.total_xp} XP
              </div>
              {gamification.current_streak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 font-bold shadow-sm">
                  <Flame size={20} /> {gamification.current_streak} Day Streak
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between font-bold text-xs uppercase tracking-widest text-slate-400 px-1">
            <span>Progress to Level {gamification.level + 1}</span>
            <span className="text-indigo-600">{gamification.progress_to_next.toFixed(0)}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
            <motion.div className="h-full primary-gradient rounded-full shadow-lg"
              initial={{ width: 0 }} animate={{ width: `${gamification.progress_to_next}%` }} transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl w-max border border-slate-200">
        {(['risk', 'goals', 'badges'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              tab === t ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}>
            {t === 'risk' ? 'Risk Strategy' : t === 'goals' ? 'Goal Planner' : 'Achievements'}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            
            {/* Risk Assessment Tab */}
            {tab === 'risk' && (
              <div className="glass-light p-8 md:p-12">
                {riskProfile ? (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                      <div className="w-40 h-40 rounded-[3rem] bg-indigo-50 flex items-center justify-center border-4 border-white shadow-xl">
                        <span className="text-5xl font-extrabold text-indigo-600 tracking-tighter">{riskProfile.risk_score}</span>
                      </div>
                      <div className="text-center md:text-left space-y-2">
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{riskProfile.risk_category} Appetite</h3>
                        <p className="text-slate-500 text-lg font-medium">Your score suggests you prefer {riskProfile.risk_category.toLowerCase()} growth strategies.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between font-bold text-xs uppercase tracking-widest text-slate-400">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Aggressive</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                        <div className="h-full primary-gradient rounded-full shadow-lg" style={{ width: `${riskProfile.risk_score}%` }} />
                      </div>
                    </div>
                    {riskProfile.recommendations?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                        {riskProfile.recommendations.map((r, i) => (
                          <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Target size={18} /></div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-center">
                      <button onClick={() => { setRiskProfile(null); setStep(0); setAnswers({}); }}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all cursor-pointer shadow-sm">
                        Redo Assessment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto py-4">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Risk Assessment</h3>
                      <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Question {step + 1}/{RISK_QUESTIONS.length}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full mb-10 overflow-hidden">
                      <motion.div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((step + 1) / RISK_QUESTIONS.length) * 100}%` }} />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-8 leading-tight">{RISK_QUESTIONS[step].question}</p>
                    <div className="grid grid-cols-1 gap-4">
                      {RISK_QUESTIONS[step].options.map((opt) => (
                        <button key={opt.value} onClick={() => setAnswers({ ...answers, [RISK_QUESTIONS[step].id]: opt.value })}
                          className={`w-full text-left px-6 py-5 rounded-2xl text-base font-bold transition-all cursor-pointer border-2 ${
                            answers[RISK_QUESTIONS[step].id] === opt.value
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md ring-4 ring-indigo-50'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'
                          }`}>{opt.label}</button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-12">
                      <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                        className="px-6 py-3 font-bold text-slate-400 disabled:opacity-30 cursor-pointer">← Back</button>
                      {step < RISK_QUESTIONS.length - 1 ? (
                        <button onClick={() => setStep(step + 1)} disabled={!answers[RISK_QUESTIONS[step].id]}
                          className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-30 cursor-pointer">Next Question</button>
                      ) : (
                        <button onClick={submitRiskAssessment} disabled={Object.keys(answers).length < RISK_QUESTIONS.length}
                          className="px-12 py-3 primary-gradient text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 disabled:opacity-30 cursor-pointer">
                          Calculate Results
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Goal Planner Tab */}
            {tab === 'goals' && (
              <div className="glass-light p-8 md:p-12 space-y-10">
                <div className="space-y-8">
                  <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
                    <Target size={28} className="text-indigo-600" /> New Financial Objective
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">Goal Designation</label>
                      <input type="text" value={goalForm.goal_name} onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })} placeholder="e.g., Retire Early, Buy Property"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">Target Capital (₹)</label>
                      <input type="number" value={goalForm.target_amount} onChange={(e) => setGoalForm({ ...goalForm, target_amount: +e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">Initial Capital (₹)</label>
                      <input type="number" value={goalForm.current_savings} onChange={(e) => setGoalForm({ ...goalForm, current_savings: +e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase px-1">Timeline Strategy (Years)</label>
                      <input type="number" min={1} max={40} value={goalForm.timeline_years} onChange={(e) => setGoalForm({ ...goalForm, timeline_years: +e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner" />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <motion.button onClick={submitGoal} disabled={!goalForm.goal_name}
                      className="px-12 py-4 primary-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 disabled:opacity-40 cursor-pointer"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Generate Strategy
                    </motion.button>
                  </div>
                </div>

                {goalResult && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-12 rounded-[2.5rem] bg-indigo-50 border-2 border-indigo-100 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{goalResult.goal_name} Strategy</h4>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Recommended Monthly Commitment</p>
                      </div>
                      <div className="text-4xl font-extrabold text-indigo-600 tracking-tighter">
                        {formatCurrency(goalResult.monthly_savings_required)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Commitment</p>
                        <p className="text-xl font-extrabold text-slate-900">{formatCurrency(goalResult.total_contributions)}</p>
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Returns</p>
                        <p className="text-xl font-extrabold text-emerald-600">+{formatCurrency(goalResult.expected_returns)}</p>
                      </div>
                      <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Feasibility</p>
                        <p className={`text-xl font-extrabold ${goalResult.feasibility === 'Easy' ? 'text-emerald-600' : goalResult.feasibility === 'Moderate' ? 'text-amber-600' : 'text-rose-600'}`}>{goalResult.feasibility}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {goalResult.tips.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 px-5 py-3 bg-white/60 rounded-2xl border border-slate-200 text-sm font-bold text-slate-700">
                          <Target size={16} className="text-indigo-500" /> {t}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {tab === 'badges' && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {BADGES.map((badge) => {
                  const earned = gamification.badges_earned.includes(badge.id);
                  return (
                    <motion.div key={badge.id} whileHover={{ y: -6 }}
                      className={`glass-light p-8 text-center flex flex-col items-center gap-4 transition-all ${earned ? 'border-amber-200 bg-white' : 'opacity-40 grayscale'}`}>
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl transition-transform ${earned ? 'bg-amber-50 group-hover:rotate-12' : 'bg-slate-100'}`}>
                        {badge.icon}
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-slate-900 tracking-tight">{badge.name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">{badge.description}</p>
                      </div>
                      {earned ? (
                        <span className="px-4 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Verified Badge</span>
                      ) : (
                        <span className="px-4 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Locked</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
