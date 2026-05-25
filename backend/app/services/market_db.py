import yfinance as yf
import pandas as pd
import httpx
import asyncio
import time
from datetime import datetime, timedelta
from typing import Optional

# In-memory cache variables (populated with realistic default fallback values)
_STOCKS_CACHE = [
    {"symbol": "^NSEI", "name": "NIFTY 50", "price": 22000.0, "change": 150.0, "change_percent": 0.68, "open": 21850.0, "high": 22050.0, "low": 21800.0, "volume": 250000, "timestamp": datetime.now().isoformat()},
    {"symbol": "^BSESN", "name": "SENSEX", "price": 72500.0, "change": 500.0, "change_percent": 0.69, "open": 72000.0, "high": 72600.0, "low": 71900.0, "volume": 150000, "timestamp": datetime.now().isoformat()},
    {"symbol": "BTC-USD", "name": "Bitcoin", "price": 67000.0, "change": -800.0, "change_percent": -1.18, "open": 67800.0, "high": 68200.0, "low": 66500.0, "volume": 35000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "ETH-USD", "name": "Ethereum", "price": 3500.0, "change": -50.0, "change_percent": -1.41, "open": 3550.0, "high": 3600.0, "low": 3480.0, "volume": 18000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "price": 2900.0, "change": 12.0, "change_percent": 0.41, "open": 2888.0, "high": 2915.0, "low": 2880.0, "volume": 5000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "price": 3850.0, "change": -25.0, "change_percent": -0.65, "open": 3875.0, "high": 3890.0, "low": 3830.0, "volume": 2000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "price": 1450.0, "change": 5.0, "change_percent": 0.35, "open": 1445.0, "high": 1460.0, "low": 1440.0, "volume": 8000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "price": 1550.0, "change": -10.0, "change_percent": -0.64, "open": 1560.0, "high": 1570.0, "low": 1540.0, "volume": 4000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 180.0, "change": 1.5, "change_percent": 0.84, "open": 178.5, "high": 181.0, "low": 178.0, "volume": 52000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 420.0, "change": 3.0, "change_percent": 0.72, "open": 417.0, "high": 422.0, "low": 416.0, "volume": 23000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 170.0, "change": -0.5, "change_percent": -0.29, "open": 170.5, "high": 172.0, "low": 169.0, "volume": 28000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "TSLA", "name": "Tesla Inc.", "price": 175.0, "change": -4.0, "change_percent": -2.23, "open": 179.0, "high": 180.0, "low": 173.0, "volume": 85000000, "timestamp": datetime.now().isoformat()},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "price": 900.0, "change": 15.0, "change_percent": 1.69, "open": 885.0, "high": 905.0, "low": 880.0, "volume": 45000000, "timestamp": datetime.now().isoformat()},
]

_MUTUAL_FUNDS_CACHE = [
    {"code": "120018", "name": "SBI Bluechip Fund - Direct Growth", "category": "Equity - Large Cap", "nav": 75.5, "change": 0.35, "change_percent": 0.46, "timestamp": datetime.now().isoformat()},
    {"code": "122639", "name": "Parag Parikh Flexi Cap Fund - Direct Growth", "category": "Equity - Flexi Cap", "nav": 72.0, "change": 0.45, "change_percent": 0.63, "timestamp": datetime.now().isoformat()},
    {"code": "119063", "name": "HDFC Nifty 50 Index Fund - Direct Growth", "category": "Index Fund", "nav": 35.2, "change": 0.12, "change_percent": 0.34, "timestamp": datetime.now().isoformat()},
    {"code": "118989", "name": "Axis Bluechip Fund - Direct Growth", "category": "Equity - Large Cap", "nav": 52.8, "change": -0.15, "change_percent": -0.28, "timestamp": datetime.now().isoformat()},
    {"code": "120716", "name": "Mirae Asset Large Cap Fund - Direct Growth", "category": "Equity - Large Cap", "nav": 98.4, "change": 0.55, "change_percent": 0.56, "timestamp": datetime.now().isoformat()},
]

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

# History Cache to avoid querying APIs repeatedly: (symbol, days) -> (timestamp, data)
_HISTORY_CACHE = {}

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

# Compatibility No-Ops
def load_cache_from_db():
    """No-op for backward compatibility."""
    print("[Cache] In-memory cache initialized. Database loading bypassed.")

def init_db():
    """No-op for backward compatibility."""
    pass

# Getter APIs serving from cache
def get_stocks():
    return _STOCKS_CACHE

def get_mutual_funds():
    return _MUTUAL_FUNDS_CACHE

def get_news(category=None, limit=20):
    global _NEWS_CACHE
    if not _NEWS_CACHE:
        return []
    
    if category:
        filtered = [item for item in _NEWS_CACHE if item.get("category") == category]
    else:
        filtered = list(_NEWS_CACHE)
        
    filtered.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return filtered[:limit]

# History logic using in-memory cache and live API fetching
def fetch_stock_history_sync(symbol, days):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=f"{days}d")
        hist = hist.dropna(subset=['Close'])
        if not hist.empty:
            history_data = []
            for idx, row in hist.iterrows():
                dt = idx.strftime("%Y-%m-%d")
                close_val = float(row["Close"])
                history_data.append({"date": dt, "value": close_val})
            return history_data
    except Exception as e:
        print(f"[History Error] Stock {symbol}: {e}")
    return None

async def fetch_mf_history(code, days):
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"https://api.mfapi.in/mf/{code}")
            if r.status_code == 200:
                data = r.json().get("data", [])
                history_data = []
                # AMFI returns descending order, reverse to chronological
                for item in data[:days][::-1]:
                    dt = datetime.strptime(item["date"], "%d-%m-%Y").strftime("%Y-%m-%d")
                    nav = float(item["nav"])
                    history_data.append({"date": dt, "value": nav})
                return history_data
    except Exception as e:
        print(f"[History Error] Mutual Fund {code}: {e}")
    return None

async def get_history(symbol, days=30):
    global _HISTORY_CACHE
    now = time.time()
    cache_key = (symbol, days)
    
    # Check cache (1 hour TTL)
    if cache_key in _HISTORY_CACHE:
        ts, data = _HISTORY_CACHE[cache_key]
        if now - ts < 3600:
            return data
            
    # Fetch live
    if symbol in MUTUAL_FUNDS_CONFIG:
        data = await fetch_mf_history(symbol, days)
    else:
        data = await asyncio.to_thread(fetch_stock_history_sync, symbol, days)
        
    if data:
        _HISTORY_CACHE[cache_key] = (now, data)
        return data
        
    # Fallback to expired cache if fetch fails
    if cache_key in _HISTORY_CACHE:
        return _HISTORY_CACHE[cache_key][1]
        
    # Default mock fallback
    return [{"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "value": 100.0 + i * 1.5} for i in range(days)]

# Parallel cache updater helpers
def fetch_single_stock_sync(symbol, name):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="2d")
    if not hist.empty:
        price = float(hist['Close'].iloc[-1])
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else float(hist['Open'].iloc[0])
        change = price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0
        open_val = float(hist['Open'].iloc[-1])
        high_val = float(hist['High'].max())
        low_val = float(hist['Low'].min())
        volume = int(hist['Volume'].iloc[-1])
        return {
            "symbol": symbol,
            "name": name,
            "price": price,
            "change": change,
            "change_percent": change_pct,
            "open": open_val,
            "high": high_val,
            "low": low_val,
            "volume": volume,
            "timestamp": datetime.now().isoformat()
        }
    return None

async def update_stocks_cache():
    global _STOCKS_CACHE
    tasks = []
    for symbol, name in STOCKS_CONFIG.items():
        tasks.append(asyncio.to_thread(fetch_single_stock_sync, symbol, name))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    new_stocks = []
    old_stocks_dict = {s["symbol"]: s for s in (_STOCKS_CACHE or [])}
    
    for idx, (symbol, name) in enumerate(STOCKS_CONFIG.items()):
        res = results[idx]
        if isinstance(res, dict) and res:
            new_stocks.append(res)
        elif symbol in old_stocks_dict:
            new_stocks.append(old_stocks_dict[symbol])
            print(f"[Autoupdate] Failed to fetch stock {symbol}, using cached value. Error: {res}")
        else:
            print(f"[Autoupdate] Failed to fetch stock {symbol} on startup: {res}")
            
    if new_stocks:
        _STOCKS_CACHE = new_stocks
        print(f"[Autoupdate] Updated {len(_STOCKS_CACHE)} stock prices in cache.")

async def update_mutual_funds_cache():
    global _MUTUAL_FUNDS_CACHE
    new_funds = []
    old_funds_dict = {f["code"]: f for f in (_MUTUAL_FUNDS_CACHE or [])}
    
    async with httpx.AsyncClient() as client:
        for code, info in MUTUAL_FUNDS_CONFIG.items():
            try:
                r = await client.get(f"https://api.mfapi.in/mf/{code}")
                if r.status_code == 200:
                    res_data = r.json()
                    nav_data = res_data.get("data", [])
                    if nav_data:
                        current_nav = float(nav_data[0]["nav"])
                        prev_nav = float(nav_data[1]["nav"]) if len(nav_data) > 1 else current_nav
                        change = current_nav - prev_nav
                        change_pct = (change / prev_nav) * 100 if prev_nav else 0.0
                        
                        new_funds.append({
                            "code": code,
                            "name": info["name"],
                            "category": info["category"],
                            "nav": current_nav,
                            "change": change,
                            "change_percent": change_pct,
                            "timestamp": datetime.now().isoformat()
                        })
                        continue
                raise Exception(f"HTTP status {r.status_code}")
            except Exception as e:
                if code in old_funds_dict:
                    new_funds.append(old_funds_dict[code])
                    print(f"[Autoupdate] Failed to fetch fund {code}, using cached: {e}")
                else:
                    print(f"[Autoupdate] Failed to fetch fund {code} on startup: {e}")
                    
    if new_funds:
        _MUTUAL_FUNDS_CACHE = new_funds
        print(f"[Autoupdate] Updated {len(_MUTUAL_FUNDS_CACHE)} mutual funds in cache.")

def fetch_ticker_news_sync(symbol, category="business"):
    try:
        ticker = yf.Ticker(symbol)
        news_items = ticker.news if hasattr(ticker, 'news') and ticker.news else []
        results = []
        for item in news_items[:3]:
            content = item.get("content", item) if isinstance(item, dict) else {}
            title = content.get("title", "N/A")
            summary = content.get("summary", "")
            published = content.get("pubDate", "")
            provider = content.get("provider", {}).get("displayName", "Unknown") if isinstance(content.get("provider"), dict) else "Unknown"
            
            results.append({
                "title": title,
                "summary": summary,
                "published": published,
                "provider": provider,
                "category": category,
                "source_ticker": symbol,
                "timestamp": datetime.now().isoformat()
            })
        return results
    except Exception as e:
        print(f"[Autoupdate News Error] Ticker {symbol}: {e}")
        return []

async def update_news_cache():
    global _NEWS_CACHE
    tasks = []
    
    # Track stocks tickers and business tickers
    for symbol in STOCKS_CONFIG.keys():
        tasks.append(asyncio.to_thread(fetch_ticker_news_sync, symbol, "market"))
    for symbol in ["^DJI", "^GSPC", "^IXIC", "GC=F", "CL=F"]:
        tasks.append(asyncio.to_thread(fetch_ticker_news_sync, symbol, "business"))
        
    results = await asyncio.gather(*tasks, return_exceptions=True)
    fetched_news = []
    for res in results:
        if isinstance(res, list):
            fetched_news.extend(res)
            
    if fetched_news:
        unique_news = []
        seen_titles = set()
        for item in fetched_news:
            if item["title"] not in seen_titles and item["title"] != "N/A":
                seen_titles.add(item["title"])
                unique_news.append(item)
                
        for idx, item in enumerate(unique_news, start=1):
            item["id"] = idx
            
        _NEWS_CACHE = unique_news
        print(f"[Autoupdate] Updated {len(_NEWS_CACHE)} news articles in cache.")

# Sync function triggered manually
async def sync_all_data():
    print("[Sync] Manually triggered full data sync...")
    await asyncio.gather(
        update_stocks_cache(),
        update_mutual_funds_cache(),
        update_news_cache()
    )
    print("[Sync] Full data sync completed.")

# Background update loop
async def autoupdate_loop():
    print("[Autoupdate] Starting background live autoupdate loop")
    
    # Run initial sync immediately in the background
    try:
        await sync_all_data()
    except Exception as e:
        print(f"[Autoupdate Error] Initial sync failed: {e}")
        
    last_mf_news_update = time.time()
    
    while True:
        await asyncio.sleep(5)
        # Update stock prices every 5 seconds
        try:
            await update_stocks_cache()
        except Exception as e:
            print(f"[Autoupdate Error] Stock price updates failed: {e}")
            
        # Update mutual funds and news every 60 seconds
        now = time.time()
        if now - last_mf_news_update >= 60.0:
            try:
                print("[Autoupdate] Fetching news and mutual fund updates...")
                await asyncio.gather(
                    update_mutual_funds_cache(),
                    update_news_cache()
                )
                last_mf_news_update = now
            except Exception as e:
                print(f"[Autoupdate Error] News/MF update failed: {e}")
