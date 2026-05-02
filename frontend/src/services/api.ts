const API_BASE = '/api/v1';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  health: () => request<{ status: string }>('/health'),

  // Chat
  chat: (message: string, history: { role: string; content: string }[], userContext?: Record<string, unknown>) =>
    request<{ reply: string; suggested_questions: string[] }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: history, user_context: userContext }),
    }),

  // Risk Profile
  getRiskQuestions: () => request<{ questions: any[] }>('/risk/questions'),
  assessRisk: (answers: { question_id: number; answer_value: number }[]) =>
    request<any>('/risk/assess', { method: 'POST', body: JSON.stringify({ answers }) }),

  // Simulator
  simulate: (params: {
    initial_amount: number; monthly_contribution: number;
    duration_years: number; risk_level: string; num_simulations?: number;
  }) => request<any>('/simulate', { method: 'POST', body: JSON.stringify(params) }),

  // Goal Planner
  planGoal: (params: {
    goal_name: string; target_amount: number; current_savings: number;
    timeline_years: number; risk_tolerance: string;
  }) => request<any>('/goals/plan', { method: 'POST', body: JSON.stringify(params) }),

  // Education
  getLessons: () => request<{ lessons: any[]; modules: string[] }>('/education/lessons'),
  getLesson: (id: string) => request<any>(`/education/lessons/${id}`),

  // Gamification
  getBadges: () => request<{ badges: any[] }>('/gamification/badges'),
};
