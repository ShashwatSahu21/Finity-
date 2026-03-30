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

---
*Created with ❤️ for intelligence in finance.*
