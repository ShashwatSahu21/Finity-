import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Wallet, TrendingDown, PiggyBank, IndianRupee, Target, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';

const CATEGORIES = [
  { value: 'needs', label: 'Needs', color: '#6c63ff', icon: '🏠', desc: 'Essentials' },
  { value: 'wants', label: 'Wants', color: '#f43f5e', icon: '🎮', desc: 'Lifestyle' },
  { value: 'savings', label: 'Savings', color: '#10b981', icon: '💰', desc: 'Investments' },
];

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d },
});

export default function Budget() {
  const { expenses, addExpense, removeExpense, monthlyIncome, setMonthlyIncome, addXp } = useStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('needs');
  const [showForm, setShowForm] = useState(false);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savings = monthlyIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  const byCategory = CATEGORIES.map((c) => ({
    ...c, total: expenses.filter((e) => e.category === c.value).reduce((s, e) => s + e.amount, 0),
  }));

  const idealBudget = [
    { name: 'Needs (50%)', ideal: monthlyIncome * 0.5, actual: byCategory[0].total, fill: '#6c63ff' },
    { name: 'Wants (30%)', ideal: monthlyIncome * 0.3, actual: byCategory[1].total, fill: '#f43f5e' },
    { name: 'Savings (20%)', ideal: monthlyIncome * 0.2, actual: Math.max(0, savings), fill: '#10b981' },
  ];

  const handleAdd = () => {
    if (!name || !amount || +amount <= 0) return;
    addExpense({ name, amount: +amount, category, date: new Date().toISOString().split('T')[0] });
    setName(''); setAmount(''); setShowForm(false);
    addXp(10);
  };

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <motion.div {...fadeUp()} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="ai-orb-sm"><Wallet size={14} className="text-white" /></div>
            <span className="text-xs font-bold text-finity-600 uppercase tracking-widest">50/30/20 Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-900 tracking-tight">
            Budget <span className="gradient-text">Planner</span>
          </h1>
          <p className="text-surface-500 mt-1 text-base font-medium">Master your money with intelligent expense tracking</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 btn-primary text-sm flex items-center gap-2 rounded-xl"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        >
          <Plus size={16} /> Add Expense
        </motion.button>
      </motion.div>

      {/* Income + Stats */}
      <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="glass-card p-6 flex flex-col justify-center">
          <label className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-3">Monthly Income</label>
          <div className="relative group focus-ring-finity rounded-xl">
            <IndianRupee size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-finity-500 transition-colors" />
            <input type="number" value={monthlyIncome || ''} onChange={(e) => setMonthlyIncome(+e.target.value)} placeholder="0"
              className="w-full pl-10 pr-4 py-4 bg-surface-50 border-1.5 border-surface-200 rounded-xl text-xl font-extrabold text-surface-900 outline-none focus:border-finity-400 focus:bg-white transition-all" />
          </div>
          <p className="text-[10px] text-surface-400 mt-2 font-medium">Set your income to calculate budget limits</p>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: <TrendingDown size={16} />, color: 'text-rose-500', bg: 'bg-rose-50' },
            { label: 'Net Savings', value: formatCurrency(Math.max(0, savings)), icon: <PiggyBank size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: <Target size={16} />, color: savingsRate >= 20 ? 'text-finity-500' : 'text-amber-500', bg: savingsRate >= 20 ? 'bg-finity-50' : 'bg-amber-50' },
            { label: 'Entries', value: `${expenses.length}`, icon: <Wallet size={16} />, color: 'text-surface-500', bg: 'bg-surface-50' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>{s.icon}</div>
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-extrabold text-surface-900 tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Expense Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 border-finity-100">
              <h3 className="text-sm font-extrabold text-surface-900 mb-5 uppercase tracking-wider">New Expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Description</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rent, Grocery"
                    className="input-premium w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                      className="input-premium w-full pl-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Category</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((c) => (
                      <button key={c.value} onClick={() => setCategory(c.value)}
                        className={`flex-1 py-3 rounded-xl text-center text-lg transition-all cursor-pointer border ${
                          category === c.value
                            ? 'bg-white border-finity-300 shadow-md ring-2 ring-finity-50'
                            : 'bg-surface-50 border-surface-100 hover:border-surface-200'
                        }`}>{c.icon}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 text-surface-400 font-bold text-sm hover:text-surface-600 transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleAdd} className="px-8 py-2.5 btn-primary text-sm rounded-xl">Confirm</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      {monthlyIncome > 0 && expenses.length > 0 && (
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="glass-card p-6 flex flex-col min-h-[350px]">
            <h3 className="text-sm font-extrabold text-surface-900 mb-6 uppercase tracking-wider">Budget Allocation</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory.filter((c) => c.total > 0)} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={100} innerRadius={70} paddingAngle={6} stroke="none">
                    {byCategory.map((c) => <Cell key={c.value} fill={c.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '12px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="glass-card p-6 flex flex-col min-h-[350px]">
            <h3 className="text-sm font-extrabold text-surface-900 mb-6 uppercase tracking-wider">Actual vs 50/30/20 Rule</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idealBudget} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} fontWeight={600} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} fontWeight={600} />
                  <Tooltip
                    cursor={{ fill: 'rgba(108, 99, 255, 0.03)' }}
                    contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #e2e8f0', borderRadius: '14px', fontWeight: 700, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                    formatter={(v: any) => formatCurrency(v)}
                  />
                  <Bar dataKey="ideal" fill="#eef2ff" radius={[6, 6, 0, 0]} name="Target" />
                  <Bar dataKey="actual" radius={[6, 6, 0, 0]} name="Actual">
                    {idealBudget.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Expense Ledger */}
      {expenses.length > 0 && (
        <motion.div {...fadeUp(0.25)} className="glass-card overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-surface-900 uppercase tracking-wider">Expense Ledger</h3>
            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{expenses.length} entries</span>
          </div>
          <div className="divide-y divide-surface-100 max-h-[360px] overflow-y-auto scrollbar-none">
            {[...expenses].reverse().map((e) => {
              const cat = CATEGORIES.find((c) => c.value === e.category);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-surface-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl p-2.5 bg-surface-50 rounded-xl border border-surface-100 group-hover:scale-105 transition-transform">{cat?.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-surface-900">{e.name}</p>
                      <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{e.date} · {cat?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-surface-900">{formatCurrency(e.amount)}</span>
                    <button onClick={() => removeExpense(e.id)} className="p-2 text-surface-300 hover:text-rose-500 transition-colors cursor-pointer hover:bg-rose-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
