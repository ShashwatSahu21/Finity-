import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime

# Configuration
TICKERS = [
    "^NSEI", "^BSESN", "BTC-USD", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", 
    "INFY.NS", "AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "ETH-USD"
]
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
                    "news": ticker.news[:5] if hasattr(ticker, 'news') else []
                }
                all_data.append(info)
                print(f"✓ {symbol} fetched.")
            else:
                print(f"✗ {symbol} no data found.")
        except Exception as e:
            print(f"Error fetching {symbol}: {str(e)}")
            
    return all_data

def save_data(data):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    # Filename with date
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = os.path.join(DATA_DIR, f"financial_data_{date_str}.json")
    
    # Save as JSON
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)
    
    # Also append to a master CSV for long-term training
    master_csv = os.path.join(DATA_DIR, "master_dataset.csv")
    df = pd.DataFrame(data)
    # Flatten news for CSV or just save prices
    df_csv = df.drop(columns=['news']) 
    
    if not os.path.exists(master_csv):
        df_csv.to_csv(master_csv, index=False)
    else:
        df_csv.to_csv(master_csv, mode='a', header=False, index=False)
    
    print(f"Data saved to {filename} and {master_csv}")

if __name__ == "__main__":
    data = get_stock_data()
    if data:
        save_data(data)
    else:
        print("No data collected.")
