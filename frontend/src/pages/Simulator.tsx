import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, TrendingUp, TrendingDown, BarChart3, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import type { SimulationResult, RiskLevel } from '../types';

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
    } catch (e: any) {
      // Offline fallback with simple compound interest
      const r = risk === 'conservative' ? 0.07 : risk === 'moderate' ? 0.11 : 0.15;
      const mr = r / 12;
      const n = years * 12;
      const fv = amount * Math.pow(1 + mr, n) + monthly * ((Math.pow(1 + mr, n) - 1) / mr);
      const worstMul = risk === 'conservative' ? 0.85 : risk === 'moderate' ? 0.65 : 0.45;
      const bestMul = risk === 'conservative' ? 1.15 : risk === 'moderate' ? 1.4 : 1.7;

      const monthlyData = [];
      for (let m = 0; m <= n; m += Math.max(1, Math.floor(n / 30))) {
        const v = amount * Math.pow(1 + mr, m) + monthly * ((Math.pow(1 + mr, m) - 1) / m);
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

  const formatCurrency = (val: number) => `₹${val >= 10000000 ? (val / 10000000).toFixed(2) + ' Cr' : val >= 100000 ? (val / 100000).toFixed(2) + ' L' : val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Investment Simulator</h1>
        <p className="text-slate-500 text-lg font-medium">Model your financial future with Monte Carlo simulations</p>
      </div>

      {/* Input Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-light p-8 md:p-12 shadow-xl shadow-slate-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Initial Investment</label>
                <span className="text-lg font-extrabold text-indigo-600">{formatCurrency(amount)}</span>
              </div>
              <input type="range" min={10000} max={10000000} step={10000} value={amount} onChange={(e) => setAmount(+e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                <span>₹10K</span>
                <span>₹1Cr+</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Monthly SIP</label>
                <span className="text-lg font-extrabold text-indigo-600">{formatCurrency(monthly)}</span>
              </div>
              <input type="range" min={0} max={100000} step={500} value={monthly} onChange={(e) => setMonthly(+e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                <span>₹0</span>
                <span>₹1L</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Duration</label>
                <span className="text-lg font-extrabold text-indigo-600">{years} Years</span>
              </div>
              <input type="range" min={1} max={40} value={years} onChange={(e) => setYears(+e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              <div className="flex justify-between mt-2 text-xs font-bold text-slate-400">
                <span>1 Year</span>
                <span>40 Years</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Risk Strategy</label>
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                {(['conservative', 'moderate', 'aggressive'] as RiskLevel[]).map((r) => (
                  <button key={r} onClick={() => setRisk(r)}
                    className={`flex-1 py-3 px-2 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                      risk === r ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.button onClick={runSimulation} disabled={loading}
            className="w-full md:w-auto px-12 py-4 primary-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={20} fill="currentColor" />}
            {loading ? 'Processing...' : 'Run Simulation'}
          </motion.button>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Powered by probabilistic modeling</p>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-light p-8 text-center space-y-2 border-indigo-100 bg-indigo-50/30">
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Expected Value</p>
                <h2 className="text-4xl font-extrabold text-slate-900">{formatCurrency(result.expected)}</h2>
              </div>
              <div className="glass-light p-8 text-center space-y-2 border-emerald-100 bg-emerald-50/30">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Best Case</p>
                <h2 className="text-4xl font-extrabold text-slate-900">{formatCurrency(result.best_case)}</h2>
              </div>
              <div className="glass-light p-8 text-center space-y-2 border-rose-100 bg-rose-50/30">
                <p className="text-sm font-bold text-rose-600 uppercase tracking-widest">Worst Case</p>
                <h2 className="text-4xl font-extrabold text-slate-900">{formatCurrency(result.worst_case)}</h2>
              </div>
            </div>

            <div className="glass-light p-8 md:p-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-10 tracking-tight">Projected Growth Path</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.monthly_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}y`} fontWeight={600} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 100000 ? (v / 100000).toFixed(0) + 'L' : (v / 1000).toFixed(0) + 'K'}`} fontWeight={600} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      formatter={(v: any) => formatCurrency(v)} labelFormatter={(l) => `Year ${l}`} />
                    <Legend iconType="circle" verticalAlign="top" height={36}/>
                    <Line type="monotone" dataKey="best_case" stroke="#10b981" strokeWidth={3} dot={false} name="Best Case" />
                    <Line type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={4} dot={false} name="Expected" />
                    <Line type="monotone" dataKey="worst_case" stroke="#f43f5e" strokeWidth={3} dot={false} name="Worst Case" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-slate-900">
                    You may reach <span className="text-indigo-600">{formatCurrency(result.expected)}</span> in {years} years.
                  </h4>
                  <p className="text-slate-500 font-medium">Modelled using annualized returns of {result.annualized_return}%</p>
                </div>
                <button 
                  onClick={() => window.alert("Future AI Integration: Coach explaining this simulation")}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Sparkles size={18} className="text-indigo-600" /> Analyze Strategy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
