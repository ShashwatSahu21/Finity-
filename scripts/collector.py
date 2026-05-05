import yfinance as yf
import pandas as pd
import json
import os
import sys
import io
from datetime import datetime

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
TICKERS = [
    "^NSEI", "^BSESN", "BTC-USD", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", 
    "INFY.NS", "AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "ETH-USD"
]

# Business & Investment focused tickers for dedicated news sections
BUSINESS_NEWS_TICKERS = ["^DJI", "^GSPC", "^IXIC", "GC=F", "CL=F"]
INVESTMENT_NEWS_TICKERS = ["SPY", "QQQ", "VTI", "ARKK", "GLD"]

DATA_DIR = "datasets"

def get_stock_data():
    all_data = []
    print(f"Fetching data for {len(TICKERS)} tickers...")
    
    for symbol in TICKERS:
        try:
            ticker = yf.Ticker(symbol)
            # Fetch 1 day of data with 1m interval if possible, else 1d
            hist = ticker.history(period="1d")
            
            if not hist.empty:
                last_price = hist['Close'].iloc[-1]
                change = hist['Close'].iloc[-1] - hist['Open'].iloc[0]
                
                info = {
                    "symbol": symbol,
                    "timestamp": datetime.now().isoformat(),
                    "price": float(last_price),
                    "change": float(change),
                    "open": float(hist['Open'].iloc[0]),
                    "high": float(hist['High'].max()),
                    "low": float(hist['Low'].min()),
                    "volume": int(hist['Volume'].iloc[-1]),
                    "news": ticker.news[:5] if hasattr(ticker, 'news') and ticker.news else []
                }
                all_data.append(info)
                print(f"  [OK] {symbol} fetched.")
            else:
                print(f"  [--] {symbol} no data found.")
        except Exception as e:
            print(f"  [ERR] {symbol}: {str(e)}")
            
    return all_data


def get_business_news():
    """Collect business news from major market indices and commodities."""
    business_news = []
    print(f"\nFetching business news from {len(BUSINESS_NEWS_TICKERS)} sources...")
    
    for symbol in BUSINESS_NEWS_TICKERS:
        try:
            ticker = yf.Ticker(symbol)
            news_items = ticker.news if hasattr(ticker, 'news') and ticker.news else []
            
            for item in news_items[:3]:
                content = item.get("content", item) if isinstance(item, dict) else {}
                headline = {
                    "source_ticker": symbol,
                    "category": "business",
                    "collected_at": datetime.now().isoformat(),
                    "title": content.get("title", "N/A") if isinstance(content, dict) else "N/A",
                    "summary": content.get("summary", "") if isinstance(content, dict) else "",
                    "published": content.get("pubDate", "") if isinstance(content, dict) else "",
                    "provider": content.get("provider", {}).get("displayName", "Unknown") if isinstance(content, dict) else "Unknown",
                }
                business_news.append(headline)
                
            print(f"  [OK] {symbol}: {len(news_items[:3])} business articles collected")
        except Exception as e:
            print(f"  [ERR] {symbol} business news: {str(e)}")
    
    # Deduplicate by title
    seen_titles = set()
    unique_news = []
    for article in business_news:
        if article["title"] not in seen_titles:
            seen_titles.add(article["title"])
            unique_news.append(article)
    
    print(f"  -> {len(unique_news)} unique business news articles collected")
    return unique_news


def get_investment_news():
    """Collect investment-focused news from ETFs and fund tickers."""
    investment_news = []
    print(f"\nFetching investment news from {len(INVESTMENT_NEWS_TICKERS)} sources...")
    
    for symbol in INVESTMENT_NEWS_TICKERS:
        try:
            ticker = yf.Ticker(symbol)
            news_items = ticker.news if hasattr(ticker, 'news') and ticker.news else []
            
            for item in news_items[:3]:
                content = item.get("content", item) if isinstance(item, dict) else {}
                headline = {
                    "source_ticker": symbol,
                    "category": "investment",
                    "collected_at": datetime.now().isoformat(),
                    "title": content.get("title", "N/A") if isinstance(content, dict) else "N/A",
                    "summary": content.get("summary", "") if isinstance(content, dict) else "",
                    "published": content.get("pubDate", "") if isinstance(content, dict) else "",
                    "provider": content.get("provider", {}).get("displayName", "Unknown") if isinstance(content, dict) else "Unknown",
                }
                investment_news.append(headline)
                
            print(f"  [OK] {symbol}: {len(news_items[:3])} investment articles collected")
        except Exception as e:
            print(f"  [ERR] {symbol} investment news: {str(e)}")
    
    # Deduplicate by title
    seen_titles = set()
    unique_news = []
    for article in investment_news:
        if article["title"] not in seen_titles:
            seen_titles.add(article["title"])
            unique_news.append(article)
    
    print(f"  -> {len(unique_news)} unique investment news articles collected")
    return unique_news


def save_data(stock_data, business_news=None, investment_news=None):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    # Filename with date
    date_str = datetime.now().strftime("%Y-%m-%d")
    
    # Build combined payload
    payload = {
        "collection_timestamp": datetime.now().isoformat(),
        "market_data": stock_data,
        "business_news": business_news or [],
        "investment_news": investment_news or [],
        "metadata": {
            "tickers_tracked": len(TICKERS),
            "business_sources": len(BUSINESS_NEWS_TICKERS),
            "investment_sources": len(INVESTMENT_NEWS_TICKERS),
            "total_business_articles": len(business_news) if business_news else 0,
            "total_investment_articles": len(investment_news) if investment_news else 0,
        }
    }
    
    filename = os.path.join(DATA_DIR, f"financial_data_{date_str}.json")
    
    # Save as JSON
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(payload, f, indent=4, ensure_ascii=False)
    
    # Also append stock data to a master CSV for long-term training
    master_csv = os.path.join(DATA_DIR, "master_dataset.csv")
    df = pd.DataFrame(stock_data)
    # Flatten news for CSV or just save prices
    df_csv = df.drop(columns=['news'], errors='ignore') 
    
    if not os.path.exists(master_csv):
        df_csv.to_csv(master_csv, index=False)
    else:
        df_csv.to_csv(master_csv, mode='a', header=False, index=False)
    
    # Save business news to dedicated CSV
    business_csv = os.path.join(DATA_DIR, "business_news.csv")
    if business_news:
        df_biz = pd.DataFrame(business_news)
        if not os.path.exists(business_csv):
            df_biz.to_csv(business_csv, index=False)
        else:
            df_biz.to_csv(business_csv, mode='a', header=False, index=False)
    
    # Save investment news to dedicated CSV
    investment_csv = os.path.join(DATA_DIR, "investment_news.csv")
    if investment_news:
        df_inv = pd.DataFrame(investment_news)
        if not os.path.exists(investment_csv):
            df_inv.to_csv(investment_csv, index=False)
        else:
            df_inv.to_csv(investment_csv, mode='a', header=False, index=False)
    
    print(f"\nData saved to {filename}")
    print(f"Master CSV: {master_csv}")
    if business_news:
        print(f"Business News CSV: {business_csv}")
    if investment_news:
        print(f"Investment News CSV: {investment_csv}")


if __name__ == "__main__":
    print("=" * 60)
    print(f"  Finity Market Data Collection Pipeline")
    print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Phase 1: Stock price data
    stock_data = get_stock_data()
    
    # Phase 2: Business news
    business_news = get_business_news()
    
    # Phase 3: Investment news
    investment_news = get_investment_news()
    
    if stock_data:
        save_data(stock_data, business_news, investment_news)
        print(f"\n[DONE] Collection complete: {len(stock_data)} tickers, "
              f"{len(business_news)} business articles, "
              f"{len(investment_news)} investment articles")
    else:
        print("No data collected.")
