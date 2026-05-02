# 💰 Finity — Premium AI Financial Companion

Finity is a production-grade, premium fintech application designed to help students and young earners in India master their finances. Built with a minimalist, high-fidelity design inspired by Notion and Stripe, Finity combines AI-driven guidance, complex financial simulations, and smart budgeting into a single, unified platform.

![Finity Dashboard Preview](https://via.placeholder.com/1200x600/6366F1/FFFFFF?text=Finity+Premium+Fintech+UI)

## ✨ Core Features

### 🤖 AI Financial Coach
- **Conversational Guidance**: Interact with an AI assistant that explains complex financial concepts (SIP, 50/30/20, Tax regimes) in simple terms.
- **Context-Aware**: Tailors responses based on your risk profile and investment history.
- **Indic Support**: Designed for the Indian market with multi-lingual capabilities.

### 📊 Advanced Investment Simulator
- **Wealth Projection**: Simulate portfolio growth over 30+ years using customizable risk strategies.
- **Probabilistic Modeling**: Visualize best-case, worst-case, and expected outcomes using Monte Carlo-inspired visualizations.
- **Interactive Controls**: Fine-tune monthly contributions, duration, and risk appetite with real-time chart updates.

### 🏦 Smart Budget Tracker
- **50/30/20 Rule Analysis**: Automatically categorizes your spending into Needs, Wants, and Savings.
- **Visual Analytics**: Interactive pie charts and bar graphs to compare your actual spending against ideal financial rules.
- **Expense Ledger**: A clean, high-fidelity transaction history with quick-entry capabilities.

### 🏗️ Loan Eligibility AI
- **Credit Assessment**: Powered by a Random Forest ML model (Loan Genie) to predict loan approval probabilities.
- **Detailed Breakdown**: Get insights into confidence levels, model heuristics, and actionable tips to improve your eligibility.

### 🎓 Learning Academy
- **Bite-sized Lessons**: Gamified financial literacy modules with progress tracking.
- **Knowledge Checkpoints**: Interactive quizzes to verify mastery of financial concepts.
- **XP & Levels**: Earn XP and level up as you complete lessons and manage your finances.

## 🎨 Design Philosophy
Finity follows a **Clean, White, Premium** aesthetic:
- **Glassmorphism**: Soft background blurs and translucent surfaces.
- **Typography**: High-fidelity Inter Tight and Satoshi-inspired spacing.
- **Color System**: A curated palette of Indigo (#6366F1) and Purple (#8B5CF6) accents against ultra-clean white surfaces.
- **Micro-interactions**: Smooth Framer Motion transitions and interactive state changes.

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite + TypeScript)
- **Tailwind CSS** (Custom Design Tokens)
- **Framer Motion** (Animations)
- **Recharts** (Data Visualization)
- **Zustand** (State Management)
- **Lucide React** (Iconography)

### Backend
- **FastAPI** (Python)
- **Machine Learning**: Scikit-learn (Random Forest)
- **Data Pipeline**: yfinance, GitHub Actions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📂 Project Structure
- `frontend/`: React application and design system.
- `backend/`: FastAPI server and ML models.
- `scripts/`: Data collection and automated market-data pipelines.
- `datasets/`: Curated financial data for model training.

---
*Created by [Shashwat Sahu](https://github.com/ShashwatSahu21) with ❤️ for financial freedom.*
