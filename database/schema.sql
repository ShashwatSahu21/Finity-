-- =====================================================
-- Finity – AI Financial Companion
-- Database Schema for Supabase (PostgreSQL)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Profile ───────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_category TEXT CHECK (risk_category IN ('Conservative', 'Moderate', 'Aggressive')),
    risk_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Gamification ────────────────────────────────────
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    badges_earned TEXT[] DEFAULT '{}',
    completed_lessons TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Financial Goals ─────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_savings NUMERIC(15, 2) DEFAULT 0,
    monthly_savings NUMERIC(15, 2),
    timeline_years INTEGER,
    risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    feasibility TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Expenses ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    category TEXT CHECK (category IN ('needs', 'wants', 'savings')),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Income ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    source TEXT,
    month DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chat History ────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Simulation History ──────────────────────────────
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    initial_amount NUMERIC(15, 2),
    monthly_contribution NUMERIC(12, 2),
    duration_years INTEGER,
    risk_level TEXT,
    expected_return NUMERIC(15, 2),
    best_case NUMERIC(15, 2),
    worst_case NUMERIC(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX idx_chat_user ON chat_messages(user_id, created_at);
CREATE INDEX idx_goals_user ON financial_goals(user_id, status);
CREATE INDEX idx_simulations_user ON simulations(user_id, created_at);

-- ─── Row Level Security ──────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own gamification" ON gamification FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON financial_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own income" ON income FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat" ON chat_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own simulations" ON simulations FOR ALL USING (auth.uid() = user_id);
