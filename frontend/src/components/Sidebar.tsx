import { motion } from 'framer-motion';
import {
  LayoutDashboard, LineChart, MessageSquare, BookOpen,
  Wallet, Building2, User, Trophy, Flame
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { NavSection } from '../types';

const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'simulator', label: 'Simulator', icon: <LineChart size={20} /> },
  { id: 'chat', label: 'AI Coach', icon: <MessageSquare size={20} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={20} /> },
  { id: 'loans', label: 'Loans', icon: <Building2 size={20} /> },
  { id: 'learn', label: 'Learn', icon: <BookOpen size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
];

export default function Sidebar() {
  const { activeSection, setActiveSection, gamification, user } = useStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass flex flex-col z-50 max-lg:hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Finity<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">Financial Coach</p>
      </div>

      {/* XP Bar */}
      <div className="px-5 py-4 border-b border-white/5 bg-[#0f172a]">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
          <span className="flex items-center gap-1.5 text-white">
            <Trophy size={14} className="text-indigo-400" /> Level {gamification.level}
          </span>
          <span className="text-indigo-400 font-bold">{gamification.total_xp} XP</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${gamification.progress_to_next}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeSection === item.id
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
          >
            {item.icon}
            {item.label}
          </motion.button>
        ))}
      </nav>

      {/* User */}
      <div className="p-5 border-t border-white/5 bg-[#0f172a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate tracking-wide">
              {user?.full_name || 'GUEST USER'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'guest@finity.app'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
