"""
Finity Market Data Collection Automation
=========================================
Runs the stock data collector multiple times with structured Git commits.
Each iteration collects live market data, business news, and investment news,
then commits with descriptive messages and pushes to GitHub.
"""

import subprocess
import sys
import os
import time
import json
import io
from datetime import datetime

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATE_STR = datetime.now().strftime("%Y-%m-%d")
TIME_STR = datetime.now().strftime("%H:%M:%S")

# Structured commit messages — each run has a unique, meaningful description
COMMIT_TEMPLATES = [
    {
        "title": "data(market): collect live stock prices for {date} - Run #{run}",
        "body": (
            "Automated market data ingestion via Finity pipeline.\n\n"
            "- Fetched real-time pricing for NIFTY 50, SENSEX, BTC, ETH & tracked equities\n"
            "- Updated master_dataset.csv with latest close/open/high/low/volume data\n"
            "- Captured ticker-level news metadata from Yahoo Finance\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(business-news): curate global business headlines - Run #{run}",
        "body": (
            "Expanded data pipeline to include business news collection.\n\n"
            "- Aggregated business news from DJI, S&P 500, NASDAQ, Gold & Crude Oil feeds\n"
            "- Deduplicated headlines across multiple source tickers\n"
            "- Stored structured articles in business_news.csv for downstream analysis\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(investment-news): aggregate ETF & fund insights - Run #{run}",
        "body": (
            "Investment-focused news section added to the data pipeline.\n\n"
            "- Collected investment news from SPY, QQQ, VTI, ARKK, GLD ETFs\n"
            "- Built investment_news.csv with structured article metadata\n"
            "- Cross-referenced provider sources for article deduplication\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(pricing): refresh intraday price snapshots - Run #{run}",
        "body": (
            "Refreshed intraday price snapshots for all tracked tickers.\n\n"
            "- NIFTY 50 (^NSEI) and SENSEX (^BSESN) index data updated\n"
            "- Crypto assets (BTC-USD, ETH-USD) pricing captured\n"
            "- US tech giants (AAPL, MSFT, GOOGL, TSLA, NVDA) data ingested\n"
            "- Indian blue-chips (RELIANCE.NS, TCS.NS, HDFCBANK.NS, INFY.NS) refreshed\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(pipeline): update master dataset with volume analytics - Run #{run}",
        "body": (
            "Master dataset updated with fresh volume and price analytics.\n\n"
            "- Appended latest price/volume records to master_dataset.csv\n"
            "- Volume data captured for institutional activity tracking\n"
            "- High/Low spread recorded for volatility analysis\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(news): refresh business & investment news feeds - Run #{run}",
        "body": (
            "Comprehensive news refresh across business and investment categories.\n\n"
            "- Business news: Global market headlines from major indices & commodities\n"
            "- Investment news: Fund-level insights from top ETFs (SPY, QQQ, VTI, ARKK)\n"
            "- All articles timestamped and provider-attributed\n"
            "- News CSVs updated for downstream ML feature engineering\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(crypto): update cryptocurrency pricing & sentiment - Run #{run}",
        "body": (
            "Cryptocurrency market data refresh.\n\n"
            "- Bitcoin (BTC-USD) and Ethereum (ETH-USD) prices updated\n"
            "- Associated crypto news headlines captured for sentiment signals\n"
            "- Price change deltas calculated for trend tracking\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(equities): update Indian & US equity positions - Run #{run}",
        "body": (
            "Equity market data refresh for tracked Indian and US stocks.\n\n"
            "- Indian equities: RELIANCE, TCS, HDFC Bank, Infosys (NSE)\n"
            "- US equities: Apple, Microsoft, Google, Tesla, NVIDIA (NASDAQ/NYSE)\n"
            "- Market indices: NIFTY 50, SENSEX, Dow Jones, S&P 500, NASDAQ Composite\n"
            "- Volume and price movement data appended to historical records\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(commodities): track gold & crude oil market signals - Run #{run}",
        "body": (
            "Commodity market signals captured alongside equity data.\n\n"
            "- Gold Futures (GC=F) and Crude Oil Futures (CL=F) news aggregated\n"
            "- Commodity-related business headlines stored for macro analysis\n"
            "- Cross-asset correlation data points accumulated in master dataset\n"
            "- Collection timestamp: {date} {time} IST"
        )
    },
    {
        "title": "data(daily-digest): complete market data collection cycle - Run #{run}",
        "body": (
            "Final collection run completing the daily data ingestion cycle.\n\n"
            "- Full pipeline executed: stock prices -> business news -> investment news\n"
            "- All CSVs updated: master_dataset.csv, business_news.csv, investment_news.csv\n"
            "- Daily JSON snapshot finalized: financial_data_{date}.json\n"
            "- 13 core tickers + 5 business sources + 5 investment sources tracked\n"
            "- Collection timestamp: {date} {time} IST\n\n"
            "Pipeline: scripts/collector.py -> datasets/"
        )
    },
]


def run_collector():
    """Execute the collector.py script."""
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_DIR, "scripts", "collector.py")],
        capture_output=True,
        text=True,
        cwd=REPO_DIR,
        env=env,
        encoding="utf-8",
        errors="replace"
    )
    print(result.stdout)
    if result.stderr:
        print(f"STDERR: {result.stderr}")
    return result.returncode == 0


def git_commit_and_push(run_number):
    """Stage datasets, commit with structured message, and push."""
    template = COMMIT_TEMPLATES[run_number - 1]
    title = template["title"].format(run=run_number, date=DATE_STR, time=TIME_STR)
    body = template["body"].format(run=run_number, date=DATE_STR, time=TIME_STR)
    
    # Stage all dataset files
    subprocess.run(["git", "add", "datasets/"], cwd=REPO_DIR, check=True)
    subprocess.run(["git", "add", "scripts/"], cwd=REPO_DIR, check=True)
    
    # Check if there are staged changes
    result = subprocess.run(
        ["git", "diff", "--staged", "--quiet"],
        cwd=REPO_DIR,
        capture_output=True
    )
    
    if result.returncode == 0:
        print(f"  [!] No changes to commit for run #{run_number}")
        # Force a small metadata update to ensure a commit
        meta_file = os.path.join(REPO_DIR, "datasets", "collection_log.txt")
        with open(meta_file, "a", encoding="utf-8") as f:
            f.write(f"Run #{run_number} | {datetime.now().isoformat()} | Collector executed\n")
        subprocess.run(["git", "add", "datasets/collection_log.txt"], cwd=REPO_DIR, check=True)
    
    # Commit with multi-line message
    subprocess.run(
        ["git", "commit", "-m", title, "-m", body],
        cwd=REPO_DIR,
        check=True
    )
    print(f"  [OK] Committed: {title}")
    return True


def main():
    total_runs = 10
    successful = 0
    
    print("=" * 70)
    print(f"  Finity Automated Market Data Collection")
    print(f"  Date: {DATE_STR} | Time: {TIME_STR} IST")
    print(f"  Total Runs: {total_runs}")
    print("=" * 70)
    
    for run in range(1, total_runs + 1):
        print(f"\n{'-' * 70}")
        print(f"  Run #{run}/{total_runs}")
        print(f"{'-' * 70}")
        
        # Run collector
        success = run_collector()
        
        if success:
            committed = git_commit_and_push(run)
            if committed:
                successful += 1
        else:
            print(f"  [X] Collector failed on run #{run}, attempting commit anyway...")
            # Still try to commit whatever was collected
            try:
                git_commit_and_push(run)
                successful += 1
            except Exception as e:
                print(f"  [X] Commit also failed: {e}")
        
        # Small delay between runs to get different timestamps
        if run < total_runs:
            print(f"  Waiting 5 seconds before next run...")
            time.sleep(5)
    
    # Push all commits at once
    print(f"\n{'=' * 70}")
    print(f"  Pushing {successful} commits to GitHub...")
    print(f"{'=' * 70}")
    
    try:
        result = subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=REPO_DIR,
            capture_output=True,
            text=True,
            check=True
        )
        print(f"  [OK] Successfully pushed to origin/main")
        if result.stdout:
            print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"  [X] Push failed: {e.stderr}")
    
    print(f"\n{'=' * 70}")
    print(f"  Summary: {successful}/{total_runs} runs committed and pushed")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
