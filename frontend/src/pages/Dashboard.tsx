import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Shield, Wallet, ArrowUpRight,
  Sparkles, Trophy, Lightbulb, Target, PiggyBank,
  LineChart as LineChartIcon, Building2, Bot, Flame, Zap,
  ChevronRight, Activity
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

/* ── Animation presets ── */
const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, delay },
});

/* ── Mini sparkline component ── */
function MiniSparkline({ data, color, height = 32 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <polygon fill={`url(#spark-${color})`} points={`0,${height} ${points} 100,${height}`} />
    </svg>
  );
}

/* ── Radial progress ring ── */
function ProgressRing({ value, size = 60, strokeWidth = 5, color = '#6c63ff' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className="radial-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
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
      <span className="gauge-value text-sm">{Math.round(value)}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */

export default function Dashboard() {
  const { setActiveSection, gamification, riskProfile, expenses, monthlyIncome, user } = useStore();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const netWorth = Math.max(0, savings * 12);
  const firstName = user?.full_name?.split(' ')[0] || 'Investor';

  /* ── Live market data ── */
  const [marketTickers, setMarketTickers] = useState<any[]>([]);
  useEffect(() => {
    api.getStocks().then((data) => {
      if (data?.length) setMarketTickers(data.slice(0, 8));
    }).catch(() => {
      // Fallback mock tickers
      setMarketTickers([
        { symbol: 'NIFTY 50', name: 'NSE Index', price: 24850, change: 156, change_percent: 0.63 },
        { symbol: 'SENSEX', name: 'BSE Index', price: 81720, change: 412, change_percent: 0.51 },
        { symbol: 'BTC', name: 'Bitcoin', price: 68420, change: 1240, change_percent: 1.84 },
        { symbol: 'ETH', name: 'Ethereum', price: 3850, change: -45, change_percent: -1.15 },
        { symbol: 'RELIANCE', name: 'Reliance Ind.', price: 2945, change: 32, change_percent: 1.10 },
        { symbol: 'TCS', name: 'TCS Ltd', price: 3780, change: -18, change_percent: -0.47 },
      ]);
    });
  }, []);

  /* ── Wealth projection chart data ── */
  const projectionData = useMemo(() => {
    const monthlyReturn = 0.11 / 12;
    const data = [];
    let portfolio = savings > 0 ? savings * 6 : 50000;
    for (let m = 0; m <= 12; m++) {
      data.push({
        month: ['Now', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan+'][m],
        value: Math.round(portfolio),
        invested: Math.round(savings > 0 ? savings * (m + 6) : 50000 + 5000 * m),
      });
      portfolio = portfolio * (1 + monthlyReturn) + (savings > 0 ? savings : 5000);
    }
    return data;
  }, [savings]);

  /* ── Financial health score ── */
  const healthScore = useMemo(() => {
    let score = 50;
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 8;
    if (riskProfile) score += 10;
    if (gamification.completed_lessons.length > 0) score += 10;
    if (gamification.level >= 3) score += 10;
    if (expenses.length > 0) score += 5;
    return Math.min(score, 100);
  }, [savingsRate, riskProfile, gamification, expenses]);

  const formatCurrency = (val: number) =>
    `₹${val >= 10000000 ? (val / 10000000).toFixed(1) + ' Cr' : val >= 100000 ? (val / 100000).toFixed(1) + 'L' : val.toLocaleString('en-IN')}`;

  /* ── Quick action tiles ── */
  const quickActions = [
    { label: 'Simulate Investment', icon: <LineChartIcon size={18} />, section: 'simulator' as const, desc: 'Monte Carlo projections', gradient: 'from-finity-600 to-finity-700' },
    { label: 'Ask AI Coach', icon: <Bot size={18} />, section: 'chat' as const, desc: 'Financial guidance', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Check Loan Score', icon: <Building2 size={18} />, section: 'loans' as const, desc: 'AI eligibility check', gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Plan a Goal', icon: <Target size={18} />, section: 'profile' as const, desc: 'Wealth milestone', gradient: 'from-emerald-500 to-green-600' },
  ];

  return (
    <div className="space-y-8 pb-8">

      {/* ═══════════════════════════════════════════
          A. HERO FINANCIAL OVERVIEW
          ═══════════════════════════════════════════ */}
      <motion.section {...fadeUp()} className="relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="hero-glow -top-48 -left-32 opacity-60" />
        <div className="hero-glow-secondary top-0 right-0 opacity-40" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left: Greeting & Summary */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="ai-orb-sm">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">AI Financial Summary</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-surface-900 tracking-tight leading-[1.15]">
                Welcome back, <span className="gradient-text">{firstName}</span>
              </h1>
              <p className="text-surface-500 mt-3 text-base font-medium max-w-xl leading-relaxed">
                {savings > 0
                  ? <>You've saved <span className="text-surface-900 font-bold">{formatCurrency(Math.max(0, savings))}</span> this month. Your financial health score is <span className="text-finity-600 font-bold">{healthScore}/100</span>.</>
                  : <>Set up your monthly income in Budget to unlock personalized insights and AI-powered recommendations.</>
                }
              </p>
            </div>

            {/* Hero Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Est. Net Worth', value: formatCurrency(netWorth), icon: <Wallet size={16} />, color: 'text-finity-600', bg: 'bg-finity-50' },
                { label: 'Monthly Savings', value: formatCurrency(Math.max(0, savings)), icon: <PiggyBank size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Growth Rate', value: `+${savingsRate > 0 ? savingsRate.toFixed(0) : '12'}%`, icon: <TrendingUp size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Health Score', value: `${healthScore}/100`, icon: <Activity size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  {...scaleIn(0.1 + i * 0.05)}
                  className="glass-card p-4 space-y-2.5 group cursor-default"
                >
                  <div className={`w-8 h-8 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">{metric.label}</p>
                    <p className="text-lg font-extrabold text-surface-900 tracking-tight mt-0.5">{metric.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Health Score Ring + Risk + Level */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-2 glass-card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={healthScore} size={72} strokeWidth={6} color={healthScore >= 70 ? '#10b981' : healthScore >= 40 ? '#f59e0b' : '#f43f5e'} />
              <div>
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Financial Health</p>
                <p className="text-xl font-extrabold text-surface-900 tracking-tight">
                  {healthScore >= 70 ? 'Strong' : healthScore >= 40 ? 'Building' : 'Getting Started'}
                </p>
                <p className="text-xs text-surface-500 font-medium mt-0.5">
                  {healthScore >= 70 ? 'Your finances are on track' : 'Complete tasks to improve'}
                </p>
              </div>
            </div>

            <div className="h-px bg-surface-100" />

            {/* Risk Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Risk Profile</p>
                  <p className="text-sm font-bold text-surface-900">{riskProfile?.risk_category || 'Not Assessed'}</p>
                </div>
              </div>
              {!riskProfile && (
                <button
                  onClick={() => setActiveSection('profile')}
                  className="text-xs font-bold text-finity-600 hover:text-finity-700 flex items-center gap-1 cursor-pointer"
                >
                  Assess <ChevronRight size={12} />
                </button>
              )}
            </div>

            {/* XP Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Trophy size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">Level</p>
                  <p className="text-sm font-bold text-surface-900">Lv. {gamification.level} · {gamification.total_xp} XP</p>
                </div>
              </div>
              <div className="w-20 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full primary-gradient rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progress_to_next}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Streak */}
            {gamification.current_streak > 0 && (
              <div className="flex items-center gap-3 px-3 py-2 bg-orange-50 rounded-xl border border-orange-100">
                <Flame size={16} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{gamification.current_streak} day streak!</span>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          B. LIVE MARKET INTELLIGENCE BAR
          ═══════════════════════════════════════════ */}
      {marketTickers.length > 0 && (
        <motion.section {...fadeUp(0.15)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Live Market</span>
            </div>
            <button
              onClick={() => setActiveSection('market')}
              className="text-xs font-bold text-finity-600 hover:text-finity-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {marketTickers.map((ticker, i) => {
              const isPositive = ticker.change >= 0;
              return (
                <motion.div
                  key={ticker.symbol}
                  {...scaleIn(0.05 * i)}
                  onClick={() => setActiveSection('market')}
                  className="flex-shrink-0 glass-card px-4 py-3 cursor-pointer group min-w-[160px] hover:border-finity-200 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-surface-900 tracking-tight">{ticker.symbol.replace('.NS', '').replace('-USD', '')}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse-soft`} />
                  </div>
                  <p className="text-sm font-extrabold text-surface-900 tracking-tight">
                    {typeof ticker.price === 'number' ? (ticker.price > 100000 ? `₹${(ticker.price / 1000).toFixed(0)}K` : `₹${ticker.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`) : ticker.price}
                  </p>
                  <div className={`flex items-center gap-1 text-[11px] font-bold mt-1 ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span>{isPositive ? '+' : ''}{typeof ticker.change_percent === 'number' ? ticker.change_percent.toFixed(2) : ticker.change_percent}%</span>
                  </div>
                  <div className="mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <MiniSparkline
                      data={isPositive ? [30, 35, 28, 40, 38, 50, 55] : [55, 50, 52, 40, 38, 35, 30]}
                      color={isPositive ? '#10b981' : '#f43f5e'}
                      height={20}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════
          C + D + E. MAIN GRID: Chart + AI Insights + Actions
          ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── E. Wealth Projection Chart ── */}
        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 glass-card p-6 md:p-8 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-surface-900 tracking-tight">Wealth Projection</h2>
              <p className="text-xs text-surface-400 font-medium mt-0.5">12-month estimated growth path</p>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-50 p-1 rounded-lg border border-surface-100">
              {['6M', '1Y', '5Y'].map((label) => (
                <button key={label} className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${label === '1Y' ? 'bg-white text-finity-600 shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full chart-glow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={8} fontWeight={600} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 100000 ? (v / 100000).toFixed(0) + 'L' : (v / 1000).toFixed(0) + 'K'}`} fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                    border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '12px',
                    fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', padding: '10px 14px',
                  }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, undefined]}
                  labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="invested" stroke="#cbd5e1" strokeWidth={2} fill="url(#investedGradient)" strokeDasharray="6 4" name="Invested" />
                <Area type="monotone" dataKey="value" stroke="#6c63ff" strokeWidth={3} fill="url(#projGradient)" name="Projected" dot={false} activeDot={{ r: 5, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Right Column: AI Insights + Quick Actions ── */}
        <div className="flex flex-col gap-6">

          {/* ── D. AI Insights Engine ── */}
          <motion.div {...fadeUp(0.25)} className="glass-card p-6 relative overflow-hidden group">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-finity-500/10 rounded-full blur-3xl group-hover:bg-finity-500/15 transition-colors duration-700" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="ai-orb-sm">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-surface-900 tracking-tight">Daily Insight</h3>
                  <p className="text-[10px] text-surface-400 font-bold uppercase tracking-wider">Powered by Finity AI</p>
                </div>
              </div>

              <p className="text-surface-600 text-sm leading-relaxed font-medium">
                {savingsRate >= 20
                  ? `Great discipline! You're saving ${savingsRate.toFixed(0)}% — above the recommended 20%. Consider allocating the surplus into diversified equity SIPs for long-term wealth building.`
                  : savings > 0
                  ? `Your savings rate is ${savingsRate.toFixed(0)}%. Aim for 20% to build financial resilience. Small consistent increases compound dramatically over time.`
                  : `Start by setting your monthly income in Budget. Tracking is the first step to building wealth. Even ₹500/month in a SIP can grow substantially.`
                }
              </p>

              <button
                onClick={() => setActiveSection('chat')}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-finity-50 hover:bg-finity-100 text-finity-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-finity-100"
              >
                <Zap size={13} /> Ask Finity AI
              </button>
            </div>
          </motion.div>

          {/* ── Daily Tip ── */}
          <motion.div {...fadeUp(0.3)} className="glass-card p-5 bg-gradient-to-br from-finity-600 to-finity-700 border-none relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-white/80" />
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Pro Tip</span>
              </div>
              <p className="text-white/90 text-sm font-semibold leading-relaxed">
                "Consistency beats intensity. A ₹5,000/month SIP for 20 years at 12% grows to ₹49.9L — from just ₹12L invested."
              </p>
              <button
                onClick={() => setActiveSection('learn')}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Start Learning <ArrowUpRight size={12} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          F. QUICK ACTION HUB
          ═══════════════════════════════════════════ */}
      <motion.section {...fadeUp(0.3)}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-finity-500" />
          <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Quick Actions</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              {...scaleIn(0.05 * i)}
              onClick={() => setActiveSection(action.section)}
              className="glass-card p-4 text-left group cursor-pointer hover:shadow-lg hover:shadow-finity-500/5 transition-all"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                {action.icon}
              </div>
              <p className="text-sm font-bold text-surface-900 tracking-tight">{action.label}</p>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Financial Health Grid (C.) ── */}
      {monthlyIncome > 0 && (
        <motion.section {...fadeUp(0.35)}>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-finity-500" />
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Financial Metrics</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Budget Health', value: savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Needs Work', metric: `${savingsRate.toFixed(0)}%`, ring: Math.min(savingsRate * 2.5, 100), color: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#f43f5e' },
              { label: 'Expense Control', value: `${expenses.length} entries`, metric: formatCurrency(totalExpenses), ring: Math.min((totalExpenses / (monthlyIncome || 1)) * 100, 100), color: '#6c63ff' },
              { label: 'Goal Progress', value: riskProfile ? 'Active' : 'Set a goal', metric: riskProfile ? `${riskProfile.risk_score}pts` : '—', ring: riskProfile ? riskProfile.risk_score : 0, color: '#7c4dff' },
              { label: 'Learning', value: `${gamification.completed_lessons.length}/7`, metric: `${gamification.total_xp} XP`, ring: (gamification.completed_lessons.length / 7) * 100, color: '#f59e0b' },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                {...scaleIn(0.05 * i)}
                className="glass-card p-4 flex items-center gap-3 group cursor-default"
              >
                <ProgressRing value={card.ring} size={48} strokeWidth={4} color={card.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-sm font-extrabold text-surface-900 tracking-tight truncate">{card.value}</p>
                  <p className="text-[11px] text-surface-500 font-semibold">{card.metric}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
