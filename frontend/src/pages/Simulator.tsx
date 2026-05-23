import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, TrendingDown, BarChart3, Info, Shield, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { SimulationResult, RiskLevel } from '../types';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

export default function Simulator() {
  const { addXp, riskProfile } = useStore();
  const [amount, setAmount] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [risk, setRisk] = useState<RiskLevel>((riskProfile?.risk_category?.toLowerCase() as RiskLevel) || 'moderate');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.simulate({ initial_amount: amount, monthly_contribution: monthly, duration_years: years, risk_level: risk });
      setResult(data);
      addXp(20);
    } catch {
      const r = risk === 'conservative' ? 0.07 : risk === 'moderate' ? 0.11 : 0.15;
      const mr = r / 12;
      const n = years * 12;
      const fv = amount * Math.pow(1 + mr, n) + monthly * ((Math.pow(1 + mr, n) - 1) / mr);
      const worstMul = risk === 'conservative' ? 0.85 : risk === 'moderate' ? 0.65 : 0.45;
      const bestMul = risk === 'conservative' ? 1.15 : risk === 'moderate' ? 1.4 : 1.7;

      const monthlyData = [];
      for (let m = 0; m <= n; m += Math.max(1, Math.floor(n / 30))) {
        const v = amount * Math.pow(1 + mr, m) + monthly * ((Math.pow(1 + mr, m) - 1) / mr);
        monthlyData.push({
          month: m, year: +(m / 12).toFixed(1), expected: +v.toFixed(0),
          best_case: +(v * bestMul).toFixed(0), worst_case: +(v * worstMul).toFixed(0),
          invested: +(amount + monthly * m).toFixed(0), median: +v.toFixed(0),
          p25: +(v * 0.88).toFixed(0), p75: +(v * 1.12).toFixed(0),
        });
      }
      setResult({
        expected: +fv.toFixed(0), best_case: +(fv * bestMul).toFixed(0),
        worst_case: +(fv * worstMul).toFixed(0), median: +fv.toFixed(0),
        percentile_25: +(fv * 0.88).toFixed(0), percentile_75: +(fv * 1.12).toFixed(0),
        monthly_data: monthlyData, probability_of_loss: risk === 'aggressive' ? 12 : risk === 'moderate' ? 5 : 1,
        annualized_return: +(r * 100).toFixed(1),
      });
    }
    setLoading(false);
  };

  const formatCurrency = (val: number) =>
    `₹${val >= 10000000 ? (val / 10000000).toFixed(2) + ' Cr' : val >= 100000 ? (val / 100000).toFixed(2) + ' L' : val.toLocaleString('en-IN')}`;

  const riskMeta = {
    conservative: { label: 'Conservative', desc: 'Bonds & FD heavy · ~7% returns', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    moderate: { label: 'Balanced', desc: 'Equity + Debt mix · ~11% returns', color: 'text-finity-600', bg: 'bg-finity-50', border: 'border-finity-200' },
    aggressive: { label: 'Aggressive', desc: 'Equity heavy · ~15% returns', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  };

  const totalInvested = amount + monthly * years * 12;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div {...fadeUp()}>
        <div className="flex items-center gap-2 mb-2">
          <div className="ai-orb-sm"><BarChart3 size={14} className="text-white" /></div>
          <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">Monte Carlo Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
          Investment <span className="gradient-text">Simulator</span>
        </h1>
        <p className="text-surface-500 mt-2 text-base font-medium">
          Model your financial future with 1,000 probabilistic simulations
        </p>
      </motion.div>

      {/* Input Panel */}
      <motion.div {...fadeUp(0.1)} className="glass-card p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Controls */}
          <div className="space-y-7">
            {/* Initial Investment */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Initial Investment</label>
                <span className="text-base font-extrabold text-finity-600 tracking-tight">{formatCurrency(amount)}</span>
              </div>
              <input type="range" min={10000} max={10000000} step={10000} value={amount} onChange={(e) => setAmount(+e.target.value)}
                className="w-full h-1.5 bg-finity-100 rounded-lg cursor-pointer" />
              <div className="flex justify-between mt-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                <span>₹10K</span><span>₹1 Cr</span>
              </div>
            </div>

            {/* Monthly SIP */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Monthly SIP</label>
                <span className="text-base font-extrabold text-finity-600 tracking-tight">{formatCurrency(monthly)}</span>
              </div>
              <input type="range" min={0} max={100000} step={500} value={monthly} onChange={(e) => setMonthly(+e.target.value)}
                className="w-full h-1.5 bg-finity-100 rounded-lg cursor-pointer" />
              <div className="flex justify-between mt-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                <span>₹0</span><span>₹1 Lakh</span>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="space-y-7">
            {/* Duration */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Duration</label>
                <span className="text-base font-extrabold text-finity-600 tracking-tight">{years} Years</span>
              </div>
              <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(+e.target.value)}
                className="w-full h-1.5 bg-finity-100 rounded-lg cursor-pointer" />
              <div className="flex justify-between mt-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                <span>1 Year</span><span>40 Years</span>
              </div>
            </div>

            {/* Risk Strategy */}
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Risk Strategy</label>
              <div className="grid grid-cols-3 gap-2">
                {(['conservative', 'moderate', 'aggressive'] as RiskLevel[]).map((r) => {
                  const meta = riskMeta[r];
                  return (
                    <button key={r} onClick={() => setRisk(r)}
                      className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer border-2 ${
                        risk === r
                          ? `${meta.bg} ${meta.border} ${meta.color} shadow-sm`
                          : 'bg-white border-surface-100 text-surface-400 hover:border-surface-200'
                      }`}>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider">{meta.label}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-surface-400 font-medium mt-2 text-center">{riskMeta[risk].desc}</p>
            </div>
          </div>
        </div>

        {/* Run Button */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <motion.button
            onClick={runSimulation} disabled={loading}
            className="w-full md:w-auto px-14 py-4 btn-primary text-base flex items-center justify-center gap-3 rounded-2xl disabled:opacity-50"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={18} fill="currentColor" />}
            {loading ? 'Simulating 1,000 paths...' : 'Run Simulation'}
          </motion.button>
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={10} /> Powered by probabilistic modeling
          </p>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
          >
            {/* Outcome Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Expected Value', value: result.expected, color: 'finity', icon: <TrendingUp size={18} /> },
                { label: 'Best Case (95th)', value: result.best_case, color: 'emerald', icon: <TrendingUp size={18} /> },
                { label: 'Worst Case (5th)', value: result.worst_case, color: 'rose', icon: <TrendingDown size={18} /> },
              ].map((card) => (
                <div key={card.label} className={`glass-card p-6 text-center space-y-2 border-${card.color}-100/50`}>
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 text-${card.color}-600 mx-auto flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <p className={`text-[11px] font-bold text-${card.color}-600 uppercase tracking-widest`}>{card.label}</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">{formatCurrency(card.value)}</h2>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="glass-card p-6 md:p-10 chart-glow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-extrabold text-surface-900 tracking-tight">Projected Growth Path</h3>
                  <p className="text-xs text-surface-400 font-medium mt-0.5">Simulated over {years} years with {risk} strategy</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-surface-400">
                  <Shield size={12} className="text-finity-500" />
                  <span>{result.probability_of_loss}% loss probability</span>
                </div>
              </div>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.monthly_data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="worstGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}y`} fontWeight={600} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 100000 ? (v / 100000).toFixed(0) + 'L' : (v / 1000).toFixed(0) + 'K'}`} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '12px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                      formatter={(v: any) => formatCurrency(v)} labelFormatter={(l) => `Year ${l}`}
                    />
                    <Area type="monotone" dataKey="best_case" stroke="#10b981" strokeWidth={2} fill="url(#bestGrad)" name="Best Case" dot={false} />
                    <Area type="monotone" dataKey="expected" stroke="#6c63ff" strokeWidth={3} fill="url(#expGrad)" name="Expected" dot={false} activeDot={{ r: 5, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
                    <Area type="monotone" dataKey="worst_case" stroke="#f43f5e" strokeWidth={2} fill="url(#worstGrad)" name="Worst Case" dot={false} />
                    <Area type="monotone" dataKey="invested" stroke="#cbd5e1" strokeWidth={1.5} fill="none" strokeDasharray="6 4" name="Invested" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary */}
              <div className="mt-8 p-5 bg-surface-50 rounded-2xl border border-surface-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-surface-900">
                    Projected: <span className="text-finity-600">{formatCurrency(result.expected)}</span> in {years} years
                  </h4>
                  <p className="text-xs text-surface-500 font-medium">
                    Total invested: {formatCurrency(totalInvested)} · Annualized: {result.annualized_return}% · Loss probability: {result.probability_of_loss}%
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 bg-white px-3 py-1.5 rounded-lg border border-surface-100">
                  <Info size={10} /> Educational estimate only
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
