import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NavSection, UserProfile, GamificationState, RiskAssessmentResult, ChatMessage } from '../types';

interface AppStore {
  // Navigation
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;

  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Risk Profile
  riskProfile: RiskAssessmentResult | null;
  setRiskProfile: (profile: RiskAssessmentResult | null) => void;

  // Chat
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Gamification
  gamification: GamificationState;
  addXp: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  earnBadge: (badgeId: string) => void;
  incrementStreak: () => void;

  // Budget
  expenses: { id: string; name: string; amount: number; category: string; date: string }[];
  addExpense: (expense: { name: string; amount: number; category: string; date: string }) => void;
  removeExpense: (id: string) => void;
  monthlyIncome: number;
  setMonthlyIncome: (income: number) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // Navigation
      activeSection: 'dashboard',
      setActiveSection: (section) => set({ activeSection: section }),

      // User
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,

      // Theme
      darkMode: true,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Risk Profile
      riskProfile: null,
      setRiskProfile: (profile) => set({ riskProfile: profile }),

      // Chat
      chatHistory: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, { ...message, timestamp: Date.now() }],
        })),
      clearChat: () => set({ chatHistory: [] }),

      // Gamification
      gamification: {
        total_xp: 0,
        level: 0,
        progress_to_next: 0,
        current_streak: 0,
        badges_earned: [],
        completed_lessons: [],
      },
      addXp: (amount) =>
        set((state) => {
          const newXp = state.gamification.total_xp + amount;
          const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6500];
          let level = 0;
          for (let i = 0; i < thresholds.length; i++) {
            if (newXp >= thresholds[i]) level = i;
          }
          const current = thresholds[level] || 0;
          const next = thresholds[level + 1] || current + 1500;
          const progress = ((newXp - current) / (next - current)) * 100;
          return {
            gamification: {
              ...state.gamification,
              total_xp: newXp,
              level,
              progress_to_next: Math.min(progress, 100),
            },
          };
        }),
      completeLesson: (lessonId) =>
        set((state) => {
          if (state.gamification.completed_lessons.includes(lessonId)) return state;
          return {
            gamification: {
              ...state.gamification,
              completed_lessons: [...state.gamification.completed_lessons, lessonId],
            },
          };
        }),
      earnBadge: (badgeId) =>
        set((state) => {
          if (state.gamification.badges_earned.includes(badgeId)) return state;
          return {
            gamification: {
              ...state.gamification,
              badges_earned: [...state.gamification.badges_earned, badgeId],
            },
          };
        }),
      incrementStreak: () =>
        set((state) => ({
          gamification: {
            ...state.gamification,
            current_streak: state.gamification.current_streak + 1,
          },
        })),

      // Budget
      expenses: [],
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: crypto.randomUUID() }],
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      monthlyIncome: 0,
      setMonthlyIncome: (income) => set({ monthlyIncome: income }),
    }),
    {
      name: 'finity-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        darkMode: state.darkMode,
        riskProfile: state.riskProfile,
        gamification: state.gamification,
        expenses: state.expenses,
        monthlyIncome: state.monthlyIncome,
        chatHistory: state.chatHistory.slice(-20), // Keep last 20 messages
      }),
    }
  )
);
