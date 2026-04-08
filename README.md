# Finity- Financial Advisor Dataset & Automation

## 📈 Overview
Finity- is an automated financial data collection repository designed to build a high-quality, daily-updated training dataset for an AI Financial Advisor.

## 🚀 Features
- **Daily Updates**: Automatically fetches stock rates, indices (NIFTY 50, SENSEX, Apple, etc.), and news daily at 8:30 AM IST (before market open).
- **Automated Data Pipeline**: Powered by GitHub Actions and `yfinance`.
- **Clean Training Data**: Data is stored in `datasets/` as structured JSON and a growing `master_dataset.csv`.
- **Streak Maintenance**: Commits 10 times daily to maintain GitHub activity and ensure the dataset remains fresh.

## 📁 Repository Structure
- `.github/workflows/`: Contains the daily automation script.
- `scripts/collector.py`: The Python engine for fetching data.
- `datasets/`: The primary location for training data.
- `streak.txt`: A simple file to track daily streak activity.

## 🛠️ Technical Roadmap

### Phase 1: Data Ingestion (Current)
- [x] Basic `yfinance` integration.
- [x] Daily automated collection via GitHub Actions.
- [x] Master dataset CSV accumulation.

### Phase 2: Signal Processing (Next)
- [ ] Technical indicator computation (RSI, MACD, EMA).
- [ ] News sentiment analysis integration using NLP.
- [ ] Correlation matrix generation between global and local indices.

### Phase 3: AI Advisor (Future)
- [ ] Fine-tuning LLM on curated financial snapshots.
- [ ] Interactive dashboard for personal portfolio advice.
- [ ] Predictive signal generation.

---
*Created with ❤️ for intelligence in finance.*
