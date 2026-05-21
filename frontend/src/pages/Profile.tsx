import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Flame, Sparkles, Award, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { GoalPlanResult, RiskQuestion } from '../types';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

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

/* ── Radial Progress Ring ── */
function ProgressRing({ value, size = 60, strokeWidth = 5, color = '#6c63ff' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
        />
      </svg>
      <span className="absolute text-base font-extrabold tracking-tight" style={{ color }}>{Math.round(value)}</span>
    </div>
  );
}

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
    <div className="space-y-8 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <motion.div {...fadeUp()}>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          Financial <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-surface-500 mt-1 text-base font-medium">Your risk assessment, goals, and achievements</p>
      </motion.div>

      {/* Profile Hero Card */}
      <motion.div {...fadeUp(0.1)} className="glass-card p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-finity-500/5 rounded-full blur-3xl group-hover:bg-finity-500/8 transition-colors duration-1000" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-3xl primary-gradient flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl shadow-finity-500/25 ring-4 ring-white">
            {user?.full_name?.charAt(0) || '👤'}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">{user?.full_name || 'Guest User'}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 mt-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 text-xs font-bold">
                <Trophy size={13} /> Level {gamification.level}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-finity-50 text-finity-600 rounded-lg border border-finity-100 text-xs font-bold">
                <Star size={13} /> {gamification.total_xp} XP
              </span>
              {gamification.current_streak > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 text-xs font-bold">
                  <Flame size={13} /> {gamification.current_streak} Days
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-surface-400">
            <span>Progress to Level {gamification.level + 1}</span>
            <span className="text-finity-600">{gamification.progress_to_next.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full primary-gradient rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${gamification.progress_to_next}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tab Pills */}
      <motion.div {...fadeUp(0.15)} className="flex gap-1 bg-surface-100/60 p-1 rounded-xl w-max border border-surface-200/60">
        {(['risk', 'goals', 'badges'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === t ? 'text-finity-600' : 'text-surface-400 hover:text-surface-700'
            }`}>
            {tab === t && (
              <motion.div layoutId="profile-tab" className="absolute inset-0 bg-white rounded-lg shadow-sm ring-1 ring-surface-200/80"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
            )}
            <span className="relative z-10">
              {t === 'risk' ? 'Risk Strategy' : t === 'goals' ? 'Goal Planner' : 'Achievements'}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }}>

          {/* ── Risk Assessment ── */}
          {tab === 'risk' && (
            <div className="glass-card p-6 md:p-10">
              {riskProfile ? (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ProgressRing value={riskProfile.risk_score} size={100} strokeWidth={8}
                      color={riskProfile.risk_score > 66 ? '#f43f5e' : riskProfile.risk_score > 33 ? '#f59e0b' : '#10b981'} />
                    <div className="text-center md:text-left space-y-2">
                      <h3 className="text-2xl font-extrabold text-surface-900 tracking-tight">{riskProfile.risk_category} Appetite</h3>
                      <p className="text-surface-500 text-sm font-medium max-w-md">
                        Your score suggests you prefer {riskProfile.risk_category.toLowerCase()} growth strategies. This profile guides investment recommendations.
                      </p>
                    </div>
                  </div>

                  {/* Risk spectrum */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-surface-400">
                      <span>Conservative</span><span>Balanced</span><span>Aggressive</span>
                    </div>
                    <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
                      <motion.div className="h-full primary-gradient rounded-full" initial={{ width: 0 }} animate={{ width: `${riskProfile.risk_score}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }} />
                    </div>
                  </div>

                  {riskProfile.recommendations?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 border-t border-surface-100">
                      {riskProfile.recommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
                          <div className="p-1.5 bg-finity-50 text-finity-600 rounded-lg"><Target size={14} /></div>
                          <p className="text-xs font-semibold text-surface-600 leading-relaxed">{r}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <button onClick={() => { setRiskProfile(null); setStep(0); setAnswers({}); }}
                      className="px-6 py-2.5 bg-white border border-surface-200 text-surface-500 rounded-xl text-xs font-bold hover:border-finity-300 hover:text-finity-600 transition-all cursor-pointer">
                      Redo Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-extrabold text-surface-900 tracking-tight">Risk Assessment</h3>
                    <span className="text-[10px] font-bold text-surface-400 bg-surface-50 px-3 py-1 rounded-full uppercase tracking-widest border border-surface-100">
                      Q{step + 1}/{RISK_QUESTIONS.length}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-surface-100 rounded-full mb-8 overflow-hidden">
                    <motion.div className="h-full primary-gradient rounded-full" animate={{ width: `${((step + 1) / RISK_QUESTIONS.length) * 100}%` }} />
                  </div>

                  <p className="text-lg font-bold text-surface-900 mb-6 leading-snug">{RISK_QUESTIONS[step].question}</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {RISK_QUESTIONS[step].options.map((opt) => (
                      <button key={opt.value} onClick={() => setAnswers({ ...answers, [RISK_QUESTIONS[step].id]: opt.value })}
                        className={`w-full text-left px-5 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer border-2 ${
                          answers[RISK_QUESTIONS[step].id] === opt.value
                            ? 'bg-finity-50 border-finity-400 text-finity-700 shadow-sm ring-2 ring-finity-50'
                            : 'bg-white border-surface-100 text-surface-500 hover:border-surface-200 hover:bg-surface-50'
                        }`}>{opt.label}</button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-10">
                    <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                      className="flex items-center gap-1.5 px-5 py-2.5 font-bold text-surface-400 disabled:opacity-30 cursor-pointer text-sm">
                      <ChevronLeft size={14} /> Back
                    </button>
                    {step < RISK_QUESTIONS.length - 1 ? (
                      <button onClick={() => setStep(step + 1)} disabled={!answers[RISK_QUESTIONS[step].id]}
                        className="px-8 py-2.5 btn-primary text-sm rounded-xl disabled:opacity-30">
                        Next
                      </button>
                    ) : (
                      <button onClick={submitRiskAssessment} disabled={Object.keys(answers).length < RISK_QUESTIONS.length}
                        className="px-10 py-2.5 btn-primary text-sm rounded-xl disabled:opacity-30 flex items-center gap-2">
                        <Sparkles size={14} /> Calculate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Goal Planner ── */}
          {tab === 'goals' && (
            <div className="glass-card p-6 md:p-10 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="ai-orb-sm"><Target size={14} className="text-white" /></div>
                <h3 className="text-lg font-extrabold text-surface-900 tracking-tight">Financial Objective</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: 'goal_name', label: 'Goal Name', placeholder: 'e.g., Retire Early, Buy Property', type: 'text' },
                  { key: 'target_amount', label: 'Target Amount (₹)', type: 'number' },
                  { key: 'current_savings', label: 'Current Savings (₹)', type: 'number' },
                  { key: 'timeline_years', label: 'Timeline (Years)', type: 'number' },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{f.label}</label>
                    <input type={f.type} value={(goalForm as any)[f.key]} placeholder={f.placeholder || ''}
                      onChange={(e) => setGoalForm({ ...goalForm, [f.key]: f.type === 'number' ? +e.target.value : e.target.value })}
                      className="input-premium w-full" />
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <motion.button onClick={submitGoal} disabled={!goalForm.goal_name}
                  className="px-12 py-3.5 btn-primary text-sm rounded-xl disabled:opacity-40 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Sparkles size={15} /> Generate Strategy
                </motion.button>
              </div>

              {goalResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-finity-50 to-finity-100/50 border border-finity-200/50 space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xl font-extrabold text-surface-900 tracking-tight">{goalResult.goal_name}</h4>
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Monthly Commitment</p>
                    </div>
                    <div className="text-2xl font-extrabold text-finity-600 tracking-tight">{formatCurrency(goalResult.monthly_savings_required)}/mo</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: 'Total Investment', value: formatCurrency(goalResult.total_contributions) },
                      { label: 'Expected Returns', value: `+${formatCurrency(goalResult.expected_returns)}`, color: 'text-emerald-600' },
                      { label: 'Feasibility', value: goalResult.feasibility, color: goalResult.feasibility === 'Easy' ? 'text-emerald-600' : goalResult.feasibility === 'Moderate' ? 'text-amber-600' : 'text-rose-600' },
                    ].map((c) => (
                      <div key={c.label} className="p-4 bg-white/80 rounded-xl border border-surface-100 space-y-1">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{c.label}</p>
                        <p className={`text-base font-extrabold ${c.color || 'text-surface-900'} tracking-tight`}>{c.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {goalResult.tips.map((t, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-2 bg-white/70 rounded-lg border border-surface-100 text-xs font-semibold text-surface-600">
                        <Target size={11} className="text-finity-500" /> {t}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* ── Achievements ── */}
          {tab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Award size={14} className="text-finity-500" />
                <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">
                  {gamification.badges_earned.length}/{BADGES.length} Unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {BADGES.map((badge) => {
                  const earned = gamification.badges_earned.includes(badge.id);
                  return (
                    <motion.div key={badge.id} whileHover={{ y: -4 }}
                      className={`glass-card p-6 text-center flex flex-col items-center gap-3 transition-all ${
                        earned ? 'border-amber-200/50' : 'opacity-35 grayscale'
                      }`}>
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform ${
                        earned ? 'bg-amber-50 shadow-lg shadow-amber-100/50' : 'bg-surface-100'
                      }`}>{badge.icon}</div>
                      <div>
                        <p className="text-sm font-extrabold text-surface-900 tracking-tight">{badge.name}</p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mt-0.5">{badge.description}</p>
                      </div>
                      {earned ? (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                          Earned ✓
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-surface-50 text-surface-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-surface-100">
                          Locked
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
