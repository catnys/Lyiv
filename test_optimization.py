#!/usr/bin/env python3
"""
Test script to verify optimized spill analysis performance
"""

import sys
import os

# Add backend to path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

from utils.simple_reader import SimpleGem5Reader
import time

def test_optimized_spill_analysis():
    """Test the optimized spill analysis functionality"""
    print("=" * 80)
    print("Testing Optimized Spill Analysis")
    print("=" * 80)
    
    # Initialize reader
    m5out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'm5out')
    reader = SimpleGem5Reader(m5out_path)
    
    # Read basic data
    print("\n1. Loading stats data...")
    reader.read_all_data()
    print("   ✅ Stats loaded successfully")
    
    # Test spill analysis
    print("\n2. Testing spill analysis...")
    start_time = time.time()
    spill_data = reader.get_spill_analysis_data()
    elapsed = time.time() - start_time
    
    print(f"\n   Results:")
    print(f"   - Total spills: {spill_data['spill_count']:,}")
    print(f"   - Architecture: {spill_data['architecture']}")
    print(f"   - Spill file: {spill_data['spill_file']}")
    print(f"   - Sampled: {spill_data.get('sampled', False)}")
    if spill_data.get('sampled'):
        print(f"   - Sample size: {spill_data.get('sample_size', 0):,}")
    print(f"   - Processing time: {elapsed:.2f}s")
    
    if 'statistics' in spill_data:
        stats = spill_data['statistics']
        print(f"\n   Statistics:")
        print(f"   - Avg duration: {stats['avg_spill_duration']:.2f}")
        print(f"   - Min duration: {stats['min_spill_duration']}")
        print(f"   - Max duration: {stats['max_spill_duration']}")
        print(f"   - Unique memory addresses: {stats['unique_memory_addresses']:,}")
        print(f"   - Unique store PCs: {stats['unique_store_pcs']:,}")
        print(f"   - Unique load PCs: {stats['unique_load_pcs']:,}")
    
    if 'charts' in spill_data and spill_data['charts']:
        print(f"\n   Charts generated: {len(spill_data['charts'])}")
        for chart_name in spill_data['charts'].keys():
            print(f"   - {chart_name}")

    # 💾 Memory Access Analysis
    print("\n💾 Memory Access Analysis:")
    basic_metrics = reader.get_basic_metrics()
    print(f"   - Total Stores: {basic_metrics.get('total_stores', 0):,}")
    print(f"   - Total Loads: {basic_metrics.get('total_loads', 0):,}")
    
    # Test streaming search
    print("\n3. Testing streaming search...")
    start_time = time.time()
    search_result = reader.search_spills(q='', offset=0, limit=100)
    elapsed = time.time() - start_time
    
    print(f"\n   Search Results:")
    print(f"   - Found: {len(search_result['items'])} items")
    print(f"   - Scanned lines: {search_result['scanned_lines']:,}")
    print(f"   - Processing time: {elapsed:.2f}s")
    
    # Test count
    print("\n4. Testing streaming count...")
    start_time = time.time()
    count_result = reader.count_spills(max_scan_lines=10000)
    elapsed = time.time() - start_time
    
    print(f"\n   Count Results:")
    print(f"   - Count: {count_result['count']:,}")
    print(f"   - Scanned: {count_result['scanned_lines']:,}")
    print(f"   - Partial: {count_result['partial']}")
    print(f"   - Processing time: {elapsed:.2f}s")
    
    print("\n" + "=" * 80)
    print("✅ All tests completed successfully!")
    print("=" * 80)

if __name__ == '__main__':
    test_optimized_spill_analysis()
