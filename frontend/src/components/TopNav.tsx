import { motion } from 'framer-motion';
import {
  LayoutDashboard, LineChart, MessageSquare, BookOpen,
  Wallet, Building2, User, Trophy, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { NavSection } from '../types';

const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'simulator', label: 'Simulator', icon: <LineChart size={18} /> },
  { id: 'chat', label: 'AI Coach', icon: <MessageSquare size={18} /> },
  { id: 'budget', label: 'Budget', icon: <Wallet size={18} /> },
  { id: 'loans', label: 'Loans', icon: <Building2 size={18} /> },
  { id: 'learn', label: 'Learn', icon: <BookOpen size={18} /> },
];

export default function TopNav() {
  const { activeSection, setActiveSection, gamification, user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={() => setActiveSection('dashboard')}>
                Finity<span className="text-indigo-600">.</span>
              </h1>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center px-8">
              <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: User Profile & XP */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl primary-gradient text-white shadow-lg shadow-indigo-200 text-xs font-bold uppercase tracking-widest">
                <Trophy size={14} className="text-white/80" />
                <span>{gamification.total_xp} XP</span>
              </div>
              <button 
                onClick={() => setActiveSection('profile')}
                className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-sm font-extrabold text-slate-700 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                {user?.full_name?.charAt(0) || 'U'}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-500 hover:text-slate-900 focus:outline-none cursor-pointer p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden pt-16">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all cursor-pointer ${
                  activeSection === item.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="h-px bg-slate-200 my-4" />
            <button
              onClick={() => {
                setActiveSection('profile');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <User size={20} />
              Profile ({user?.full_name || 'Guest'})
            </button>
          </div>
        </div>
      )}
    </>
  );
}
