// API response types
export interface SimulationResult {
  best_case: number;
  worst_case: number;
  expected: number;
  median: number;
  percentile_25: number;
  percentile_75: number;
  monthly_data: MonthlyDataPoint[];
  probability_of_loss: number;
  annualized_return: number;
}

export interface MonthlyDataPoint {
  month: number;
  year: number;
  expected: number;
  best_case: number;
  worst_case: number;
  median: number;
  p25: number;
  p75: number;
  invested: number;
}

export interface RiskAssessmentResult {
  risk_score: number;
  risk_category: 'Conservative' | 'Moderate' | 'Aggressive';
  breakdown: Record<string, number>;
  recommendations: string[];
}

export interface RiskQuestion {
  id: number;
  question: string;
  options: { value: number; label: string }[];
  weight: number;
  category: string;
}

export interface GoalPlanResult {
  goal_name: string;
  target_amount: number;
  monthly_savings_required: number;
  total_contributions: number;
  expected_returns: number;
  projected_final_amount: number;
  feasibility: 'Easy' | 'Moderate' | 'Challenging' | 'Very Challenging';
  tips: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface LoanEligibilityResult {
  probability: number;
  eligible: boolean;
  eligibility: string;
  confidence: string;
  message: string;
  model: string;
  tips: string[];
  factors?: Record<string, any>;
  max_loan_amount?: number;
  max_emi_affordable?: number;
}

export interface Lesson {
  id: string;
  module: string;
  title: string;
  order: number;
  duration_min: number;
  xp_reward: number;
  content?: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  earned?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  risk_score?: number;
  risk_category?: string;
}

export interface GamificationState {
  total_xp: number;
  level: number;
  progress_to_next: number;
  current_streak: number;
  badges_earned: string[];
  completed_lessons: string[];
}

export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
export type NavSection = 'dashboard' | 'simulator' | 'chat' | 'budget' | 'loans' | 'learn' | 'profile';
