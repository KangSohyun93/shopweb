import pandas as pd
from src.apriori import base_apriori, hash_apriori, transaction_reduction, partition_apriori, sampling_apriori, dic_apriori
from src.fpgrowth import fp_growth

def run_benchmark(transactions, min_sup):
    methods = {
        "Base Apriori": base_apriori.run,
        "Hash-based": hash_apriori.run,
        "Transaction Reduction": transaction_reduction.run,
        "Partitioning": partition_apriori.run,
        "Sampling (20%)": lambda t, s: sampling_apriori.run(t, s, sample_ratio=0.2),
        "DIC": dic_apriori.run,
        "FP-Growth": fp_growth.run
    }
    
    results = []
    
    for name, func in methods.items():
        print(f"⌛ Đang chạy: {name}...")
        _, stats = func(transactions, min_sup)
        stats["Method"] = name
        results.append(stats)
        
    df = pd.DataFrame(results)
    # Sắp xếp theo Runtime tăng dần
    df = df[["Method", "runtime", "num_candidates", "num_frequent_itemsets"]]
    df = df.sort_values(by="runtime")
    
    print("\n" + "="*60)
    print("📊 BẢNG SO SÁNH HIỆU NĂNG FRAMEWORK")
    print("="*60)
    print(df.to_string(index=False))
    print("="*60)
    
    return df