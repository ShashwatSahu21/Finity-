import { motion } from 'framer-motion';
import { 
  TrendingUp, Shield, Wallet, ArrowUpRight, 
  Sparkles, Trophy, Lightbulb, Target 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const mockPortfolioData = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 13500 },
  { month: 'Mar', value: 13000 },
  { month: 'Apr', value: 15800 },
  { month: 'May', value: 17200 },
  { month: 'Jun', value: 21000 },
];

export default function Dashboard() {
  const { setActiveSection, gamification, riskProfile, expenses, monthlyIncome, user } = useStore();

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savings = monthlyIncome - totalExpenses;

  const quickActions = [
    { label: 'Simulate Investment', icon: <TrendingUp size={18} />, section: 'simulator' as const },
    { label: 'Set Goal', icon: <Target size={18} />, section: 'profile' as const },
    { label: 'AI Coach', icon: <Sparkles size={18} />, section: 'chat' as const },
  ];

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <motion.div 
        {...fadeUp} 
        className="relative py-4"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back, <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'Shashwat'}</span> <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
              Your financial health is looking solid today. You've saved <span className="text-slate-900 font-bold">{formatCurrency(Math.max(0, savings))}</span> this month.
            </p>
          </div>
          <button 
            onClick={() => setActiveSection('budget')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer w-max"
          >
            <Wallet size={18} /> Add Expense
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Savings */}
        <div className="glass-light p-6 group cursor-default">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 transition-colors">
              <Wallet size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Yearly Savings</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(Math.max(0, savings * 12))}</h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">Estimated based on monthly SIP</p>
        </div>

        {/* Monthly Growth */}
        <div className="glass-light p-6 group cursor-default">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 transition-colors">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Growth</span>
          </div>
          <div className="flex items-end gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">+12.5%</h2>
            <span className="text-sm text-emerald-600 font-bold mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">+2.1%</span>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="glass-light p-6 group cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 transition-colors">
                <Shield size={20} />
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Risk</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{riskProfile?.risk_category || 'Not Assessed'}</h2>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full primary-gradient rounded-full" style={{ width: `${riskProfile?.risk_score || 0}%` }} />
          </div>
        </div>

        {/* XP Level */}
        <div className="glass-light p-6 group cursor-default">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 transition-colors">
              <Trophy size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Level</span>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lv.{gamification.level}</h2>
            <span className="text-sm text-purple-600 font-bold mb-1">{gamification.total_xp} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Main Layout Grid */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2 glass-light p-6 md:p-10 flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Wealth Projection</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">Estimated portfolio growth over the next 6 months</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold">
              Target: {formatCurrency(21000)}
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPortfolioData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} fontWeight={500} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} fontWeight={500} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ fill: '#ffffff', stroke: '#6366f1', strokeWidth: 3, r: 6 }} 
                  activeDot={{ r: 9, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="flex flex-col gap-8">
          
          {/* Daily Tip Card */}
          <div className="glass-light p-8 relative overflow-hidden group bg-indigo-600 border-none shadow-indigo-200">
            <div className="absolute right-[-20%] top-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2.5 rounded-xl bg-white/20 text-white shadow-inner">
                <Lightbulb size={20} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Daily Insight</h3>
            </div>
            <p className="text-indigo-50 relative z-10 leading-relaxed font-semibold text-lg">
              "Consistency is the key to building wealth. Small, regular investments often outperform large, sporadic ones."
            </p>
            <button onClick={() => setActiveSection('learn')} className="mt-8 text-sm font-bold text-white flex items-center gap-2 hover:translate-x-1 transition-transform relative z-10 w-max cursor-pointer bg-white/20 px-4 py-2 rounded-xl">
              Start Learning <ArrowUpRight size={18} />
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-light p-8 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Quick Actions</h3>
            <div className="flex-1 flex flex-col gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setActiveSection(action.section)}
                  className="group flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                      {action.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {action.label}
                    </span>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
