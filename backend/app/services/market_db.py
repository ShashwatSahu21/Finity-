import sqlite3
import os
import yfinance as yf
import pandas as pd
import httpx
import asyncio
from datetime import datetime, timedelta
import json

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "database", "finity_market.db")

# Cache memory for stock, mutual fund, and news data
_STOCKS_CACHE = None
_MUTUAL_FUNDS_CACHE = None
_NEWS_CACHE = [
    {
        "id": 1,
        "title": "Indian Benchmark Indices Trade Stable Near Key Levels",
        "summary": "Nifty 50 and Sensex continue to hold crucial support levels as investors analyze domestic earnings and global trends.",
        "published": datetime.now().isoformat(),
        "provider": "Finity Intelligence",
        "category": "business",
        "source_ticker": "^NSEI",
        "timestamp": datetime.now().isoformat()
    },
    {
        "id": 2,
        "title": "Reliance and IT Majors Drive Late-Day Index Recovery",
        "summary": "A late-day surge in Reliance Industries and tech giants TCS and Infosys helps lift the domestic indices out of red.",
        "published": datetime.now().isoformat(),
        "provider": "Finity Intelligence",
        "category": "market",
        "source_ticker": "RELIANCE.NS",
        "timestamp": datetime.now().isoformat()
    },
    {
        "id": 3,
        "title": "Mutual Fund SIP Inflows Reach Record Milestones in India",
        "summary": "Systematic Investment Plans (SIP) see continuous growth as retail investors show sustained confidence in mutual fund assets.",
        "published": datetime.now().isoformat(),
        "provider": "AMFI Updates",
        "category": "business",
        "source_ticker": "120018",
        "timestamp": datetime.now().isoformat()
    }
]

def load_cache_from_db():
    global _STOCKS_CACHE, _MUTUAL_FUNDS_CACHE
    try:
        init_db()  # Ensure tables exist
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Load stocks
        cursor.execute("SELECT * FROM stocks")
        _STOCKS_CACHE = [dict(r) for r in cursor.fetchall()]
        
        # Load mutual funds
        cursor.execute("SELECT * FROM mutual_funds")
        _MUTUAL_FUNDS_CACHE = [dict(r) for r in cursor.fetchall()]
        
        conn.close()
        print(f"[Cache] Loaded caches from SQLite database: {len(_STOCKS_CACHE)} stocks, {len(_MUTUAL_FUNDS_CACHE)} mutual funds")
    except Exception as e:
        print("[Cache Error] Failed to load cache from DB:", e)

# Tickers config
STOCKS_CONFIG = {
    "^NSEI": "NIFTY 50",
    "^BSESN": "SENSEX",
    "BTC-USD": "Bitcoin",
    "ETH-USD": "Ethereum",
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "HDFCBANK.NS": "HDFC Bank",
    "INFY.NS": "Infosys Ltd",
    "AAPL": "Apple Inc.",
    "MSFT": "Microsoft Corp.",
    "GOOGL": "Alphabet Inc.",
    "TSLA": "Tesla Inc.",
    "NVDA": "NVIDIA Corp."
}

MUTUAL_FUNDS_CONFIG = {
    "120018": {"name": "SBI Bluechip Fund - Direct Growth", "category": "Equity - Large Cap"},
    "122639": {"name": "Parag Parikh Flexi Cap Fund - Direct Growth", "category": "Equity - Flexi Cap"},
    "119063": {"name": "HDFC Nifty 50 Index Fund - Direct Growth", "category": "Index Fund"},
    "118989": {"name": "Axis Bluechip Fund - Direct Growth", "category": "Equity - Large Cap"},
    "120716": {"name": "Mirae Asset Large Cap Fund - Direct Growth", "category": "Equity - Large Cap"}
}

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create stocks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stocks (
            symbol TEXT PRIMARY KEY,
            name TEXT,
            price REAL,
            change REAL,
            change_percent REAL,
            open REAL,
            high REAL,
            low REAL,
            volume INTEGER,
            timestamp TEXT
        )
    """)
    
    # Create mutual funds table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mutual_funds (
            code TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            nav REAL,
            change REAL,
            change_percent REAL,
            timestamp TEXT
        )
    """)
    
    # Drop previous news table to ensure news is not stored in DB
    cursor.execute("DROP TABLE IF EXISTS news")
    
    # Create price history table for charting
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            symbol TEXT,
            date TEXT,
            close REAL,
            PRIMARY KEY (symbol, date)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Database initialized at:", DB_PATH)

def get_stocks():
    global _STOCKS_CACHE
    if _STOCKS_CACHE is None:
        load_cache_from_db()
    return _STOCKS_CACHE if _STOCKS_CACHE is not None else []

def get_mutual_funds():
    global _MUTUAL_FUNDS_CACHE
    if _MUTUAL_FUNDS_CACHE is None:
        load_cache_from_db()
    return _MUTUAL_FUNDS_CACHE if _MUTUAL_FUNDS_CACHE is not None else []

def get_news(category=None, limit=20):
    global _NEWS_CACHE
    if not _NEWS_CACHE:
        return []
    
    # Filter by category if provided
    if category:
        filtered = [item for item in _NEWS_CACHE if item.get("category") == category]
    else:
        filtered = list(_NEWS_CACHE)
        
    # Sort by timestamp descending
    filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return filtered[:limit]

def get_history(symbol, days=30):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if we have history in db
    cursor.execute("""
        SELECT date, close FROM price_history 
        WHERE symbol = ? AND date >= ? 
        ORDER BY date ASC
    """, (symbol, (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")))
    rows = cursor.fetchall()
    conn.close()
    
    if rows:
        return [{"date": r[0], "value": r[1]} for r in rows]
    
    # Fallback or initial load: Fetch from yfinance or AMFI
    if symbol in MUTUAL_FUNDS_CONFIG:
        # Fetch from AMFI API
        try:
            r = httpx.get(f"https://api.mfapi.in/mf/{symbol}")
            if r.status_code == 200:
                data = r.json().get("data", [])
                # Store history in DB in background
                conn = sqlite3.connect(DB_PATH)
                history_data = []
                for item in data[:days][::-1]: # reverse to get chronological
                    # Date in AMFI is DD-MM-YYYY, convert to YYYY-MM-DD
                    dt = datetime.strptime(item["date"], "%d-%m-%Y").strftime("%Y-%m-%d")
                    nav = float(item["nav"])
                    history_data.append((symbol, dt, nav))
                    conn.execute("INSERT OR REPLACE INTO price_history VALUES (?, ?, ?)", (symbol, dt, nav))
                conn.commit()
                conn.close()
                return [{"date": x[1], "value": x[2]} for x in history_data]
        except Exception as e:
            print("Error fetching MF history:", e)
            
    else:
        # Fetch from yfinance
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=f"{days}d")
            hist = hist.dropna(subset=['Close'])
            if not hist.empty:
                conn = sqlite3.connect(DB_PATH)
                history_data = []
                for idx, row in hist.iterrows():
                    dt = idx.strftime("%Y-%m-%d")
                    close_val = float(row["Close"])
                    history_data.append((symbol, dt, close_val))
                    conn.execute("INSERT OR REPLACE INTO price_history VALUES (?, ?, ?)", (symbol, dt, close_val))
                conn.commit()
                conn.close()
                return [{"date": x[1], "value": x[2]} for x in history_data]
        except Exception as e:
            print("Error fetching Stock history:", e)
            
    # Mock data fallback
    return [{"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "value": 100 + i * 2} for i in range(days)]

async def sync_all_data():
    """Fetches live stock, mutual fund, and news data, saving them in SQLite."""
    init_db()
    conn = sqlite3.connect(DB_PATH)
    
    fetched_news = []
    
    # 1. Sync stocks
    for symbol, name in STOCKS_CONFIG.items():
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="5d")
            hist = hist.dropna(subset=['Close'])
            if not hist.empty:
                price = float(hist['Close'].iloc[-1])
                prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else float(hist['Open'].iloc[0])
                change = price - prev_close
                change_pct = (change / prev_close) * 100 if prev_close else 0.0
                open_val = float(hist['Open'].iloc[-1])
                high_val = float(hist['High'].iloc[-1])
                low_val = float(hist['Low'].iloc[-1])
                volume = int(hist['Volume'].iloc[-1])
                
                print(f"[Debug Sync] {symbol} price={price}, change={change}, open_val={open_val}, high_val={high_val}, low_val={low_val}, volume={volume}")
                
                conn.execute("""
                    INSERT OR REPLACE INTO stocks (symbol, name, price, change, change_percent, open, high, low, volume, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (symbol, name, price, change, change_pct, open_val, high_val, low_val, volume, datetime.now().isoformat()))
                
                # Fetch news if any
                news_items = ticker.news if hasattr(ticker, 'news') and ticker.news else []
                for item in news_items[:3]:
                    content = item.get("content", item) if isinstance(item, dict) else {}
                    title = content.get("title", "N/A")
                    summary = content.get("summary", "")
                    published = content.get("pubDate", "")
                    provider = content.get("provider", {}).get("displayName", "Unknown") if isinstance(content.get("provider"), dict) else "Unknown"
                    
                    fetched_news.append({
                        "title": title,
                        "summary": summary,
                        "published": published,
                        "provider": provider,
                        "category": "market",
                        "source_ticker": symbol,
                        "timestamp": datetime.now().isoformat()
                    })
                    
            print(f"[Sync] Stock {symbol} updated")
        except Exception as e:
            print(f"[Sync Error] Stock {symbol}: {e}")
            
    # 2. Sync mutual funds
    async with httpx.AsyncClient() as client:
        for code, info in MUTUAL_FUNDS_CONFIG.items():
            try:
                r = await client.get(f"https://api.mfapi.in/mf/{code}")
                if r.status_code == 200:
                    res_data = r.json()
                    meta = res_data.get("meta", {})
                    nav_data = res_data.get("data", [])
                    if nav_data:
                        current_nav = float(nav_data[0]["nav"])
                        prev_nav = float(nav_data[1]["nav"]) if len(nav_data) > 1 else current_nav
                        change = current_nav - prev_nav
                        change_pct = (change / prev_nav) * 100 if prev_nav else 0.0
                        
                        conn.execute("""
                            INSERT OR REPLACE INTO mutual_funds (code, name, category, nav, change, change_percent, timestamp)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (code, info["name"], info["category"], current_nav, change, change_pct, datetime.now().isoformat()))
                        
                print(f"[Sync] Mutual Fund {code} updated")
            except Exception as e:
                print(f"[Sync Error] Mutual Fund {code}: {e}")
                
    # 3. Fetch general business/investment news
    biz_tickers = ["^DJI", "^GSPC", "^IXIC", "GC=F", "CL=F"]
    for symbol in biz_tickers:
        try:
            ticker = yf.Ticker(symbol)
            news_items = ticker.news if hasattr(ticker, 'news') and ticker.news else []
            for item in news_items[:3]:
                content = item.get("content", item) if isinstance(item, dict) else {}
                title = content.get("title", "N/A")
                summary = content.get("summary", "")
                published = content.get("pubDate", "")
                provider = content.get("provider", {}).get("displayName", "Unknown") if isinstance(content.get("provider"), dict) else "Unknown"
                
                fetched_news.append({
                    "title": title,
                    "summary": summary,
                    "published": published,
                    "provider": provider,
                    "category": "business",
                    "source_ticker": symbol,
                    "timestamp": datetime.now().isoformat()
                })
        except Exception as e:
            print(f"[Sync Error] General news for {symbol}: {e}")
            
    conn.commit()
    conn.close()
    
    # Deduplicate and cache news in-memory
    if fetched_news:
        unique_news = []
        seen_titles = set()
        for item in fetched_news:
            if item["title"] not in seen_titles:
                seen_titles.add(item["title"])
                unique_news.append(item)
        for idx, item in enumerate(unique_news, start=1):
            item["id"] = idx
        global _NEWS_CACHE
        _NEWS_CACHE = unique_news
        
    load_cache_from_db()
    print("[Sync] Completed syncing all financial data")

async def autoupdate_loop():
    """Background loop to update data every 30 seconds."""
    print("[Autoupdate] Starting 30-second background autoupdate loop")
    # Initial load of cache from DB
    load_cache_from_db()
    
    # Delay first run slightly to let startup finish smoothly
    await asyncio.sleep(2)
    
    while True:
        try:
            print("[Autoupdate] Fetching latest market data...")
            await sync_all_data()
            print("[Autoupdate] Market data sync completed successfully.")
        except Exception as e:
            print(f"[Autoupdate Error] Failed to sync market data: {e}")
        await asyncio.sleep(30)

if __name__ == "__main__":
    init_db()
    asyncio.run(sync_all_data())
