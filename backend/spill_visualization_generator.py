#!/usr/bin/env python3
"""
Improved Scatter Plot for Register Spill Analysis
================================================

Bu dosya geliştirilmiş scatter plot grafiklerini test etmek için oluşturulmuştur.
Her grafik ayrı ayrı çizilecek ve daha büyük olacak.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set matplotlib to use non-interactive backend
plt.switch_backend('Agg')

def create_timeline_scatter():
    """
    Timeline scatter plot'u ayrı olarak oluştur
    """
    print("📈 Creating timeline scatter plot...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Büyük figure oluştur
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    
    # Her 50. spill'i al (daha az kalabalık)
    sample_spills = spill_data.iloc[::max(1, len(spill_data)//150)]
    
    # Scatter plot
    scatter = ax.scatter(
        sample_spills['load_tick'], 
        sample_spills['tick_diff'], 
        alpha=0.7, 
        s=50, 
        c=sample_spills['tick_diff'], 
        cmap='plasma',
        edgecolors='black',
        linewidth=0.3
    )
    
    # Grafik ayarları
    ax.set_title('📈 Spill Timeline Analysis - Simulation Time vs Latency', 
                fontweight='bold', fontsize=18, pad=20)
    ax.set_xlabel('Simulation Time (ticks)', fontsize=14, fontweight='bold')
    ax.set_ylabel('Spill Latency (ticks)', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    
    # Colorbar ekle
    cbar = plt.colorbar(scatter, ax=ax, label='Latency (ticks)', shrink=0.8)
    cbar.ax.tick_params(labelsize=12)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Sample Points: {len(sample_spills):,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Median Latency: {spill_data['tick_diff'].median():,.0f} ticks
Min Latency: {spill_data['tick_diff'].min():,} ticks
Max Latency: {spill_data['tick_diff'].max():,} ticks"""
    
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=11,
            verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
            facecolor="lightblue", alpha=0.9))
    
    # X ekseni formatını iyileştir
    ax.tick_params(axis='x', labelsize=12)
    ax.tick_params(axis='y', labelsize=12)
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/timeline_scatter_plot.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Timeline scatter plot saved to: {output_file}")
    return output_file

def create_memory_address_scatter():
    """
    Memory address scatter plot'u ayrı olarak oluştur
    """
    print("💾 Creating memory address scatter plot...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Büyük figure oluştur
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    
    # Her 50. spill'i al
    sample_spills = spill_data.iloc[::max(1, len(spill_data)//150)]
    
    # Scatter plot
    scatter = ax.scatter(
        sample_spills['memory_address'], 
        sample_spills['tick_diff'], 
        alpha=0.7, 
        s=50, 
        c=sample_spills['tick_diff'], 
        cmap='viridis',
        edgecolors='black',
        linewidth=0.3
    )
    
    # Grafik ayarları
    ax.set_title('💾 Memory Address vs Spill Latency Analysis', 
                fontweight='bold', fontsize=18, pad=20)
    ax.set_xlabel('Memory Address', fontsize=14, fontweight='bold')
    ax.set_ylabel('Spill Latency (ticks)', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    
    # X ekseni etiketlerini dikey yap
    ax.tick_params(axis='x', labelsize=10, rotation=90)
    ax.tick_params(axis='y', labelsize=12)
    
    # Colorbar ekle
    cbar = plt.colorbar(scatter, ax=ax, label='Latency (ticks)', shrink=0.8)
    cbar.ax.tick_params(labelsize=12)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Sample Points: {len(sample_spills):,}
Unique Addresses: {spill_data['memory_address'].nunique():,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Median Latency: {spill_data['tick_diff'].median():,.0f} ticks"""
    
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=11,
            verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
            facecolor="lightgreen", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/memory_address_scatter_plot.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Memory address scatter plot saved to: {output_file}")
    return output_file

def create_store_pc_scatter():
    """
    Store PC scatter plot'u ayrı olarak oluştur
    """
    print("🔥 Creating store PC scatter plot...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Büyük figure oluştur
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    
    # Her 50. spill'i al
    sample_spills = spill_data.iloc[::max(1, len(spill_data)//150)]
    
    # Scatter plot
    scatter = ax.scatter(
        sample_spills['store_pc'], 
        sample_spills['tick_diff'], 
        alpha=0.7, 
        s=50, 
        c=sample_spills['tick_diff'], 
        cmap='coolwarm',
        edgecolors='black',
        linewidth=0.3
    )
    
    # Grafik ayarları
    ax.set_title('🔥 Store PC vs Spill Latency Analysis', 
                fontweight='bold', fontsize=18, pad=20)
    ax.set_xlabel('Store Program Counter (PC)', fontsize=14, fontweight='bold')
    ax.set_ylabel('Spill Latency (ticks)', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    
    # X ekseni etiketlerini dikey yap
    ax.tick_params(axis='x', labelsize=10, rotation=90)
    ax.tick_params(axis='y', labelsize=12)
    
    # Colorbar ekle
    cbar = plt.colorbar(scatter, ax=ax, label='Latency (ticks)', shrink=0.8)
    cbar.ax.tick_params(labelsize=12)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Sample Points: {len(sample_spills):,}
Unique Store PCs: {spill_data['store_pc'].nunique():,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Median Latency: {spill_data['tick_diff'].median():,.0f} ticks"""
    
    ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, fontsize=11,
            verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
            facecolor="lightcoral", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/store_pc_scatter_plot.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Store PC scatter plot saved to: {output_file}")
    return output_file

def create_spill_heatmap():
    """
    Spill events için heatmap oluştur
    """
    print("🔥 Creating spill heatmap...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Memory address'leri hex'den int'e çevir ve kategorilere ayır
    spill_data['mem_addr_int'] = spill_data['memory_address'].apply(lambda x: int(x, 16))
    spill_data['mem_addr_category'] = pd.cut(
        spill_data['mem_addr_int'], 
        bins=20, 
        labels=[f'Addr_{i}' for i in range(20)]
    )
    
    # Tick difference'leri kategorilere ayır
    spill_data['latency_category'] = pd.cut(
        spill_data['tick_diff'], 
        bins=15, 
        labels=[f'Lat_{i}' for i in range(15)]
    )
    
    # Heatmap için pivot table oluştur
    heatmap_data = spill_data.groupby(['mem_addr_category', 'latency_category']).size().unstack(fill_value=0)
    
    plt.figure(figsize=(14, 10))
    im = plt.imshow(heatmap_data.values, cmap='YlOrRd', aspect='auto')
    
    # Grafik ayarları
    plt.title('🔥 Spill Events Heatmap - Memory Address vs Latency', 
              fontweight='bold', fontsize=18, pad=20)
    plt.xlabel('Latency Categories', fontsize=14, fontweight='bold')
    plt.ylabel('Memory Address Categories', fontsize=14, fontweight='bold')
    
    # Colorbar ekle
    cbar = plt.colorbar(im, label='Number of Spill Events', shrink=0.8)
    cbar.ax.tick_params(labelsize=12)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Unique Addresses: {spill_data['memory_address'].nunique():,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Max Latency: {spill_data['tick_diff'].max():,} ticks"""
    
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, fontsize=11,
             verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
             facecolor="lightcoral", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/spill_heatmap.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Spill heatmap saved to: {output_file}")
    return output_file

def create_spill_radar_chart():
    """
    Spill events için radar chart oluştur
    """
    print("🎯 Creating spill radar chart...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Latency kategorileri
    latency_ranges = [
        (0, 500000, 'Very Low'),
        (500000, 1000000, 'Low'),
        (1000000, 2000000, 'Medium'),
        (2000000, 4000000, 'High'),
        (4000000, 8000000, 'Very High'),
        (8000000, float('inf'), 'Critical')
    ]
    
    # Her kategori için spill sayısı
    categories = []
    values = []
    
    for min_val, max_val, label in latency_ranges:
        count = len(spill_data[(spill_data['tick_diff'] >= min_val) & (spill_data['tick_diff'] < max_val)])
        categories.append(label)
        values.append(count)
    
    # Açıları hesapla
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
    values += values[:1]  # Kapatmak için
    angles += angles[:1]
    
    plt.figure(figsize=(14, 10))
    ax = plt.subplot(111, projection='polar')
    
    # Radar chart çiz
    ax.plot(angles, values, 'o-', linewidth=2, color='red', alpha=0.7)
    ax.fill(angles, values, alpha=0.25, color='red')
    
    # Kategorileri ekle
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=12)
    
    # Grafik ayarları
    ax.set_title('🎯 Spill Latency Distribution Radar Chart', 
                 fontweight='bold', fontsize=18, pad=30)
    ax.grid(True)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Median Latency: {spill_data['tick_diff'].median():,.0f} ticks
Max Latency: {spill_data['tick_diff'].max():,} ticks"""
    
    plt.figtext(0.02, 0.02, stats_text, fontsize=11,
                bbox=dict(boxstyle="round,pad=0.5", facecolor="lightblue", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/spill_radar_chart.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Spill radar chart saved to: {output_file}")
    return output_file

def create_spill_bubble_chart():
    """
    Spill events için bubble chart oluştur
    """
    print("💫 Creating spill bubble chart...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Sample data al
    sample_spills = spill_data.iloc[::max(1, len(spill_data)//200)]
    
    plt.figure(figsize=(14, 10))
    
    # Bubble chart çiz
    scatter = plt.scatter(
        sample_spills['store_inst_count'], 
        sample_spills['load_inst_count'], 
        s=sample_spills['tick_diff']/1000,  # Bubble size
        c=sample_spills['tick_diff'], 
        cmap='plasma',
        alpha=0.6,
        edgecolors='black',
        linewidth=0.5
    )
    
    # Grafik ayarları
    plt.title('💫 Spill Events Bubble Chart - Store vs Load Instructions', 
              fontweight='bold', fontsize=18, pad=20)
    plt.xlabel('Store Instruction Count', fontsize=14, fontweight='bold')
    plt.ylabel('Load Instruction Count', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    
    # Colorbar ekle
    cbar = plt.colorbar(scatter, label='Latency (ticks)', shrink=0.8)
    cbar.ax.tick_params(labelsize=12)
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Sample Points: {len(sample_spills):,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Bubble Size: Latency/1000"""
    
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, fontsize=11,
             verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
             facecolor="lightgreen", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/spill_bubble_chart.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Spill bubble chart saved to: {output_file}")
    return output_file

def create_spill_network_plot():
    """
    Spill events için network-style plot oluştur
    """
    print("🕸️ Creating spill network plot...")
    
    # m5out dizinini kontrol et
    m5out_dir = Path("../m5out")
    spill_file = m5out_dir / "x86_spill_stats.txt"
    
    if not spill_file.exists():
        print(f"❌ Error: {spill_file} not found!")
        return
    
    # Spill verilerini yükle
    spill_rows = []
    with open(spill_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith('SPILL,'):
                parts = line.split(',')
                if len(parts) >= 9:
                    spill_rows.append({
                        'store_pc': parts[1],
                        'load_pc': parts[2], 
                        'memory_address': parts[3],
                        'store_tick': int(parts[4]),
                        'load_tick': int(parts[5]),
                        'tick_diff': int(parts[6]),
                        'store_inst_count': int(parts[7]),
                        'load_inst_count': int(parts[8])
                    })
    
    if not spill_rows:
        print("❌ No spill data found!")
        return
    
    spill_data = pd.DataFrame(spill_rows)
    print(f"✅ Loaded {len(spill_data)} spill events")
    
    # Sample data al
    sample_spills = spill_data.iloc[::max(1, len(spill_data)//100)]
    
    plt.figure(figsize=(14, 10))
    
    # Network-style plot
    for i, row in sample_spills.iterrows():
        # Store ve load tick'leri arasında çizgi çiz
        plt.plot([row['store_tick'], row['load_tick']], 
                 [row['store_inst_count'], row['load_inst_count']], 
                 alpha=0.3, linewidth=0.5, color='blue')
        
        # Store point
        plt.scatter(row['store_tick'], row['store_inst_count'], 
                   s=30, c='red', alpha=0.6, marker='o')
        
        # Load point
        plt.scatter(row['load_tick'], row['load_inst_count'], 
                   s=30, c='green', alpha=0.6, marker='s')
    
    # Grafik ayarları
    plt.title('🕸️ Spill Events Network Plot - Store to Load Connections', 
              fontweight='bold', fontsize=18, pad=20)
    plt.xlabel('Simulation Time (ticks)', fontsize=14, fontweight='bold')
    plt.ylabel('Instruction Count', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    
    # Legend ekle
    plt.scatter([], [], c='red', s=30, marker='o', label='Store Events', alpha=0.6)
    plt.scatter([], [], c='green', s=30, marker='s', label='Load Events', alpha=0.6)
    plt.plot([], [], color='blue', alpha=0.3, linewidth=0.5, label='Spill Connections')
    plt.legend(loc='upper right')
    
    # İstatistikler ekle
    stats_text = f"""📊 Statistics:
Total Spills: {len(spill_data):,}
Sample Points: {len(sample_spills):,}
Mean Latency: {spill_data['tick_diff'].mean():,.0f} ticks
Red: Store Events, Green: Load Events"""
    
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, fontsize=11,
             verticalalignment='top', bbox=dict(boxstyle="round,pad=0.5", 
             facecolor="lightyellow", alpha=0.9))
    
    plt.tight_layout()
    
    # Dosyayı kaydet
    output_file = "../images/graphs/spill_network_plot.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✅ Spill network plot saved to: {output_file}")
    return output_file

def main():
    """
    Ana test fonksiyonu
    """
    print("🚀 Creating Creative Spill Visualizations for Register Spill Analysis")
    print("="*70)
    
    # Her grafiği ayrı ayrı oluştur
    files_created = []
    
    # 1. Timeline scatter
    file1 = create_timeline_scatter()
    if file1:
        files_created.append(file1)
    
    # 2. Memory address scatter
    file2 = create_memory_address_scatter()
    if file2:
        files_created.append(file2)
    
    # 3. Store PC scatter
    file3 = create_store_pc_scatter()
    if file3:
        files_created.append(file3)
    
    # 4. Spill heatmap
    file4 = create_spill_heatmap()
    if file4:
        files_created.append(file4)
    
    # 5. Spill radar chart
    file5 = create_spill_radar_chart()
    if file5:
        files_created.append(file5)
    
    # 6. Spill bubble chart
    file6 = create_spill_bubble_chart()
    if file6:
        files_created.append(file6)
    
    # 7. Spill network plot
    file7 = create_spill_network_plot()
    if file7:
        files_created.append(file7)
    
    print("\n" + "="*70)
    print("🎉 Creative spill visualizations completed!")
    print("📁 Generated files:")
    for file in files_created:
        print(f"   ✅ {file}")
    
    print(f"\n📊 Total files created: {len(files_created)}")
    print("🔍 Each plot shows spill data in a unique, non-linear way")

if __name__ == "__main__":
    main()