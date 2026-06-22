# Model analysis script
import pandas as pd

def analyze_performance(data):
    """
    Analyzes student performance data.
    """
    df = pd.DataFrame(data)
    results = {
        'mean_score': df['score'].mean(),
        'completion_rate': df['completed'].mean() * 100
    }
    return results

print("Performance analysis complete.")
