"""
Script benchmark: do thoi gian 7 thuat toan x 3 quy mo du lieu
"""
import sys, random, time, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from apriori import base_apriori, hash_apriori, transaction_reduction, partition_apriori, sampling_apriori, dic_apriori
from fpgrowth import fp_growth

def gen_data(n, n_products=80, avg_size=3):
    random.seed(42)
    result = []
    for _ in range(n):
        size = max(2, int(random.gauss(avg_size, 1.2)))
        t = random.sample(range(1, n_products + 1), min(size, n_products))
        result.append(t)
    return result

scales = [1000, 5000, 10000]
MIN_SUP = 5

algos = [
    ('Apriori co ban',        base_apriori),
    ('Hash-Based Apriori',    hash_apriori),
    ('Transaction Reduction', transaction_reduction),
    ('Partition Apriori',     partition_apriori),
    ('Sampling Apriori',      sampling_apriori),
    ('DIC Apriori',           dic_apriori),
    ('FP-Growth',             fp_growth),
]

print(f"\n{'='*72}")
print(f"BENCHMARK: 7 thuat toan x 3 quy mo | min_support = {MIN_SUP}")
print(f"{'='*72}")
print(f"{'Thuat toan':<26} {'1.000 GD':>12} {'5.000 GD':>12} {'10.000 GD':>13}")
print(f"{'-'*65}")

all_results = {}
for name, algo in algos:
    row = f"{name:<26}"
    all_results[name] = {}
    for n in scales:
        data = gen_data(n)
        try:
            t0 = time.time()
            frequent_itemsets, stats = algo.run(data, MIN_SUP)
            elapsed = round(time.time() - t0, 3)
        except Exception as e:
            elapsed = -1
        all_results[name][n] = elapsed
        display = f"{elapsed:.3f}s" if elapsed >= 0 else "LOI"
        row += f" {display:>12}"
    print(row)

print(f"{'='*72}")
print("\nSo tap pho bien (10.000 giao dich):")
data_10k = gen_data(10000)
for name, algo in algos:
    try:
        _, stats = algo.run(data_10k, MIN_SUP)
        print(f"  {name:<26}: {stats.get('num_frequent_itemsets', 0):>6} tap")
    except Exception as e:
        print(f"  {name:<26}: LOI - {e}")

print(f"\nHoan thanh benchmark!")
