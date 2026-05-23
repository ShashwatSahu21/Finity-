import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, LineChart, MessageSquare,
  Wallet, Building2, User, Trophy, Menu, X, TrendingUp, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { NavSection } from '../types';

const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
  { id: 'market', label: 'Markets', icon: <TrendingUp size={17} /> },
  { id: 'simulator', label: 'Simulator', icon: <LineChart size={17} /> },
  { id: 'chat', label: 'AI Coach', icon: <MessageSquare size={17} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={17} /> },
  { id: 'loans', label: 'Loans', icon: <Building2 size={17} /> },
];

export default function TopNav() {
  const { activeSection, setActiveSection, gamification, user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Navigation ── */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-[1800px] xl:max-w-[94%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-md shadow-finity-600/20">
                <Sparkles size={15} className="text-white" />
              </div>
              <h1
                className="text-lg font-extrabold tracking-tight text-surface-900 cursor-pointer select-none"
                onClick={() => setActiveSection('dashboard')}
              >
                Finity<span className="text-finity-600">.</span>
              </h1>
            </div>

            {/* Center Nav Pills */}
            <div className="hidden xl:flex flex-1 justify-center px-6">
              <div className="relative flex gap-3 xl:gap-5 bg-surface-100/90 p-2 rounded-2xl border border-surface-200/80">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`relative flex items-center gap-2 px-4 xl:px-6 py-2.5 rounded-xl text-[13px] xl:text-[14.5px] font-bold transition-all duration-300 cursor-pointer ${
                      activeSection === item.id
                        ? 'text-finity-600'
                        : 'text-surface-500 hover:text-surface-900'
                    }`}
                  >
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-surface-200/50"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: XP + Profile */}
            <div className="hidden xl:flex items-center gap-3">
              <motion.div
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-finity-100/60 border border-finity-200/50 text-finity-600 text-xs font-bold tracking-wide cursor-default"
                whileHover={{ scale: 1.03 }}
              >
                <Trophy size={13} className="text-finity-500" />
                <span>{gamification.total_xp} XP</span>
                <span className="text-finity-400">·</span>
                <span>Lv.{gamification.level}</span>
              </motion.div>

              <motion.button
                onClick={() => setActiveSection('profile')}
                className="w-9 h-9 rounded-xl bg-white border border-surface-200 flex items-center justify-center text-sm font-bold text-surface-600 hover:border-finity-300 hover:text-finity-600 transition-all cursor-pointer shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </motion.button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-surface-500 hover:text-surface-900 p-2 rounded-xl transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 xl:hidden"
          >
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl pt-20 px-5 pb-8">
              <div className="space-y-1.5">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[15px] font-semibold transition-all cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-finity-50 text-finity-600 shadow-sm'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </motion.button>
                ))}

                <div className="h-px bg-surface-100 my-3" />

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.04 }}
                  onClick={() => { setActiveSection('profile'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[15px] font-semibold text-surface-600 hover:bg-surface-50 cursor-pointer"
                >
                  <User size={18} />
                  Profile ({user?.full_name || 'Guest'})
                </motion.button>
              </div>

              {/* Mobile XP Banner */}
              <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-finity-50 rounded-2xl border border-finity-100">
                <div className="flex items-center gap-2 text-finity-600 font-bold text-sm">
                  <Trophy size={16} />
                  {gamification.total_xp} XP · Level {gamification.level}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
