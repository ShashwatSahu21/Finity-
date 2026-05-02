import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Wallet, TrendingDown, PiggyBank, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';

const CATEGORIES = [
  { value: 'needs', label: 'Needs', color: '#6366f1', icon: '🏠' },
  { value: 'wants', label: 'Wants', color: '#f43f5e', icon: '🎮' },
  { value: 'savings', label: 'Savings', color: '#10b981', icon: '💰' },
];

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
    { name: 'Needs (50%)', ideal: monthlyIncome * 0.5, actual: byCategory[0].total, fill: '#6366f1' },
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
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Budget Planner</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium tracking-tight">Master the 50/30/20 rule and track your wealth</p>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="px-6 py-3 primary-gradient text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} /> Add Expense
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income Card */}
        <div className="glass-light p-8 md:p-10 lg:col-span-1 flex flex-col justify-center">
          <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 block">Monthly Income</label>
          <div className="relative group">
            <IndianRupee size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
            <input type="number" value={monthlyIncome || ''} onChange={(e) => setMonthlyIncome(+e.target.value)} placeholder="0"
              className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-2xl font-bold text-slate-900 outline-none focus:border-indigo-200 focus:bg-white transition-all shadow-inner" />
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium italic">Adjust your income to calculate budget limits</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Expenses', value: totalExpenses, icon: <TrendingDown size={20} />, color: 'bg-rose-50 text-rose-600', shadow: 'shadow-rose-100' },
            { label: 'Net Savings', value: Math.max(0, savings), icon: <PiggyBank size={20} />, color: 'bg-emerald-50 text-emerald-600', shadow: 'shadow-emerald-100' },
            { label: 'Savings Rate', value: savingsRate, icon: <Target size={20} />, color: savingsRate >= 20 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600', shadow: 'shadow-indigo-100', isCurrency: false },
            { label: 'Budget Level', value: expenses.length, icon: <TrendingDown size={20} />, color: 'bg-slate-50 text-slate-600', shadow: 'shadow-slate-100', isCurrency: false, suffix: ' entries' },
          ].map((s) => (
            <div key={s.label} className="glass-light p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${s.color} shadow-sm`}>{s.icon}</div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {s.isCurrency === false ? `${s.value.toFixed(1)}${s.suffix || '%'}` : formatCurrency(s.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Form Overlay */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-light p-8 border-indigo-100 bg-indigo-50/10">
            <h3 className="text-xl font-bold text-slate-900 mb-6">New Expense Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Description</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rent, Grocery"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Amount</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-10 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400 transition-all shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Category</label>
                <div className="flex gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      className={`flex-1 py-4 rounded-2xl text-sm font-bold transition-all cursor-pointer border ${
                        category === c.value ? 'bg-white border-indigo-400 text-indigo-600 shadow-md ring-2 ring-indigo-50' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                      }`}>
                      {c.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleAdd} className="px-8 py-3 primary-gradient text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
                Confirm Entry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Charts */}
      {monthlyIncome > 0 && expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-light p-8 flex flex-col min-h-[350px]">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Budget Allocation</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory.filter((c) => c.total > 0)} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={100} innerRadius={70} paddingAngle={8} stroke="none">
                    {byCategory.map((c) => <Cell key={c.value} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                    formatter={(v: any) => formatCurrency(v)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-light p-8 flex flex-col min-h-[350px]">
            <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Actual vs 50/30/20 Rule</h3>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idealBudget} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} fontWeight={600} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} fontWeight={600} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#0f172a', fontWeight: 'bold' }}
                    formatter={(v: any) => formatCurrency(v)} />
                  <Bar dataKey="ideal" fill="#f1f5f9" radius={[6, 6, 0, 0]} name="Rule Target" />
                  <Bar dataKey="actual" radius={[6, 6, 0, 0]} name="My Spending">
                    {idealBudget.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expense Ledger */}
      {expenses.length > 0 && (
        <div className="glass-light overflow-hidden p-2">
          <div className="p-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Expense Ledger</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
            {[...expenses].reverse().map((e) => {
              const cat = CATEGORIES.find((c) => c.value === e.category);
              return (
                <div key={e.id} className="flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-5">
                    <span className="text-2xl p-3 bg-white rounded-2xl shadow-sm border border-slate-100">{cat?.icon}</span>
                    <div>
                      <p className="text-base font-bold text-slate-900">{e.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{e.date} · {cat?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-extrabold text-slate-900">{formatCurrency(e.amount)}</span>
                    <button onClick={() => removeExpense(e.id)} className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer hover:bg-rose-50 rounded-xl">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
