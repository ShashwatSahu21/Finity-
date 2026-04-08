import pandas as pd
import os
import sys

DATA_DIR = "datasets"
MASTER_CSV = os.path.join(DATA_DIR, "master_dataset.csv")

def validate_dataset():
    if not os.path.exists(MASTER_CSV):
        print(f"Error: Master dataset not found at {MASTER_CSV}")
        return False
        
    try:
        df = pd.read_csv(MASTER_CSV)
        print(f"--- Dataset Validation Report ---")
        print(f"Total Records: {len(df)}")
        print(f"Unique Tickers: {df['symbol'].nunique()}")
        
        # Check for missing values
        missing = df.isnull().sum().sum()
        if missing > 0:
            print(f"Warning: Found {missing} missing values.")
        else:
            print("✓ No missing values found.")
            
        # Check for data types
        if not pd.api.types.is_numeric_dtype(df['price']):
            print("Error: Price column is not numeric.")
            return False
            
        print("✓ Data types validated.")
        print("---------------------------------")
        return True
        
    except Exception as e:
        print(f"Validation failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = validate_dataset()
    sys.exit(0 if success else 1)
