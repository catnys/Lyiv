#!/usr/bin/env python3
"""
📈 Advanced Gem5 Analysis Helpers 📈
====================================

Advanced analysis methods for detailed performance and spill analysis.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)

class AdvancedAnalysisHelpers:
    """Advanced analysis methods for gem5 data"""
    
    def __init__(self, data_helpers):
        self.data_helpers = data_helpers
        self.stats_data = data_helpers.stats_data
        self.spill_data = data_helpers.spill_data
        self.config_data = data_helpers.config_data
    
    def calculate_performance_metrics(self) -> Dict[str, Any]:
        """Calculate advanced performance metrics"""
        metrics = {}
        
        # Basic metrics
        total_insts = self._get_stat_value('system.cpu.commitStats0.numInsts', int)
        total_cycles = self._get_stat_value('system.cpu.numCycles', int)
        sim_seconds = self._get_stat_value('simSeconds', float)
        
        if total_insts and total_cycles and sim_seconds:
            # Performance ratios
            metrics['ipc'] = total_insts / total_cycles
            metrics['cpi'] = total_cycles / total_insts
            metrics['instructions_per_second'] = total_insts / sim_seconds
            metrics['cycles_per_second'] = total_cycles / sim_seconds
            
            # Memory intensity
            loads = self._get_stat_value('system.cpu.commitStats0.numLoadInsts', int) or 0
            stores = self._get_stat_value('system.cpu.commitStats0.numStoreInsts', int) or 0
            metrics['memory_intensity'] = (loads + stores) / total_insts
            metrics['load_store_ratio'] = loads / stores if stores > 0 else 0
            
            # Spill impact
            if not self.spill_data.empty:
                total_spills = len(self.spill_data)
                avg_spill_latency = self.spill_data['tick_diff'].mean()
                sim_freq = self._get_stat_value('simFreq', int) or 1000000000000
                
                metrics['spill_rate'] = total_spills / total_insts
                metrics['avg_spill_latency_seconds'] = avg_spill_latency / sim_freq
                metrics['spill_overhead_percentage'] = (total_spills * avg_spill_latency) / (total_cycles * 100)
        
        return metrics
    
    def analyze_instruction_mix(self) -> Dict[str, Any]:
        """Detailed instruction mix analysis"""
        analysis = {}
        
        # Get instruction type counts
        inst_types = {}
        for key, data in self.stats_data.items():
            if 'committedInstType::' in key and 'total' not in key:
                inst_type = key.split('::')[-1]
                try:
                    count = int(data['value'])
                    if count > 0:
                        inst_types[inst_type] = count
                except:
                    pass
        
        if inst_types:
            total_insts = sum(inst_types.values())
            
            # Calculate percentages
            analysis['instruction_distribution'] = {
                inst_type: {
                    'count': count,
                    'percentage': (count / total_insts) * 100
                }
                for inst_type, count in inst_types.items()
            }
            
            # Categorize instructions
            analysis['categories'] = self._categorize_instructions(inst_types)
            
            # Performance implications
            analysis['performance_implications'] = self._analyze_performance_implications(inst_types)
        
        return analysis
    
    def analyze_spill_patterns(self) -> Dict[str, Any]:
        """Analyze register spill patterns"""
        if self.spill_data.empty:
            return {}
        
        analysis = {}
        
        # Basic spill statistics
        analysis['basic_stats'] = {
            'total_spills': len(self.spill_data),
            'avg_tick_diff': float(self.spill_data['tick_diff'].mean()),
            'max_tick_diff': int(self.spill_data['tick_diff'].max()),
            'min_tick_diff': int(self.spill_data['tick_diff'].min()),
            'std_tick_diff': float(self.spill_data['tick_diff'].std())
        }
        
        # Memory address analysis
        analysis['memory_patterns'] = self._analyze_memory_patterns()
        
        # PC pattern analysis
        analysis['pc_patterns'] = self._analyze_pc_patterns()
        
        # Timing analysis
        analysis['timing_analysis'] = self._analyze_spill_timing()
        
        return analysis
    
    def analyze_cache_performance(self) -> Dict[str, Any]:
        """Analyze cache performance metrics"""
        cache_metrics = {}
        
        # L1 Data Cache
        l1_dcache_hits = self._get_stat_value('system.cpu.dcache.overallHits::total', int) or 0
        l1_dcache_misses = self._get_stat_value('system.cpu.dcache.overallMisses::total', int) or 0
        l1_dcache_total = l1_dcache_hits + l1_dcache_misses
        
        if l1_dcache_total > 0:
            cache_metrics['l1_dcache'] = {
                'hits': l1_dcache_hits,
                'misses': l1_dcache_misses,
                'hit_rate': l1_dcache_hits / l1_dcache_total,
                'miss_rate': l1_dcache_misses / l1_dcache_total
            }
        
        # L1 Instruction Cache
        l1_icache_hits = self._get_stat_value('system.cpu.icache.overallHits::total', int) or 0
        l1_icache_misses = self._get_stat_value('system.cpu.icache.overallMisses::total', int) or 0
        l1_icache_total = l1_icache_hits + l1_icache_misses
        
        if l1_icache_total > 0:
            cache_metrics['l1_icache'] = {
                'hits': l1_icache_hits,
                'misses': l1_icache_misses,
                'hit_rate': l1_icache_hits / l1_icache_total,
                'miss_rate': l1_icache_misses / l1_icache_total
            }
        
        # L2 Cache
        l2_hits = self._get_stat_value('system.l2.overallHits::total', int) or 0
        l2_misses = self._get_stat_value('system.l2.overallMisses::total', int) or 0
        l2_total = l2_hits + l2_misses
        
        if l2_total > 0:
            cache_metrics['l2_cache'] = {
                'hits': l2_hits,
                'misses': l2_misses,
                'hit_rate': l2_hits / l2_total,
                'miss_rate': l2_misses / l2_total
            }
        
        return cache_metrics
    
    def analyze_memory_system(self) -> Dict[str, Any]:
        """Analyze memory system performance"""
        memory_metrics = {}
        
        # Memory controller stats
        reads = self._get_stat_value('system.mem_ctrls.readReqs', int) or 0
        writes = self._get_stat_value('system.mem_ctrls.writeReqs', int) or 0
        bytes_read = self._get_stat_value('system.mem_ctrls.bytesRead', int) or 0
        bytes_written = self._get_stat_value('system.mem_ctrls.bytesWritten', int) or 0
        
        memory_metrics['memory_controller'] = {
            'read_requests': reads,
            'write_requests': writes,
            'bytes_read': bytes_read,
            'bytes_written': bytes_written,
            'total_requests': reads + writes,
            'read_write_ratio': reads / writes if writes > 0 else 0
        }
        
        # Memory bandwidth
        sim_seconds = self._get_stat_value('simSeconds', float) or 1
        memory_metrics['bandwidth'] = {
            'read_bandwidth_mbps': (bytes_read / sim_seconds) / (1024 * 1024),
            'write_bandwidth_mbps': (bytes_written / sim_seconds) / (1024 * 1024),
            'total_bandwidth_mbps': ((bytes_read + bytes_written) / sim_seconds) / (1024 * 1024)
        }
        
        return memory_metrics
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        report = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'performance_metrics': self.calculate_performance_metrics(),
            'instruction_analysis': self.analyze_instruction_mix(),
            'spill_analysis': self.analyze_spill_patterns(),
            'cache_performance': self.analyze_cache_performance(),
            'memory_system': self.analyze_memory_system()
        }
        
        # Overall performance score
        report['performance_score'] = self._calculate_performance_score(report)
        
        return report
    
    # Helper methods
    def _get_stat_value(self, key: str, value_type: type = str) -> Any:
        """Get a stat value with type conversion"""
        if key in self.stats_data:
            try:
                return value_type(self.stats_data[key]['value'])
            except (ValueError, TypeError):
                return None
        return None
    
    def _categorize_instructions(self, inst_types: Dict[str, int]) -> Dict[str, Any]:
        """Categorize instructions by type"""
        categories = {
            'arithmetic': 0,
            'memory': 0,
            'control': 0,
            'floating_point': 0,
            'simd': 0,
            'other': 0
        }
        
        for inst_type, count in inst_types.items():
            if any(keyword in inst_type.lower() for keyword in ['alu', 'mult', 'div']):
                categories['arithmetic'] += count
            elif any(keyword in inst_type.lower() for keyword in ['load', 'store', 'mem']):
                categories['memory'] += count
            elif any(keyword in inst_type.lower() for keyword in ['branch', 'jump', 'call']):
                categories['control'] += count
            elif 'float' in inst_type.lower():
                categories['floating_point'] += count
            elif 'simd' in inst_type.lower():
                categories['simd'] += count
            else:
                categories['other'] += count
        
        return categories
    
    def _analyze_performance_implications(self, inst_types: Dict[str, int]) -> Dict[str, Any]:
        """Analyze performance implications of instruction mix"""
        implications = {}
        
        total_insts = sum(inst_types.values())
        
        # Calculate ratios
        implications['arithmetic_ratio'] = sum(
            count for inst_type, count in inst_types.items() 
            if any(keyword in inst_type.lower() for keyword in ['alu', 'mult', 'div'])
        ) / total_insts
        
        implications['memory_ratio'] = sum(
            count for inst_type, count in inst_types.items() 
            if any(keyword in inst_type.lower() for keyword in ['load', 'store'])
        ) / total_insts
        
        implications['float_ratio'] = sum(
            count for inst_type, count in inst_types.items() 
            if 'float' in inst_type.lower()
        ) / total_insts
        
        # Performance insights
        implications['insights'] = []
        
        if implications['memory_ratio'] > 0.3:
            implications['insights'].append("High memory intensity - consider cache optimization")
        
        if implications['float_ratio'] > 0.1:
            implications['insights'].append("Significant floating-point workload")
        
        if implications['arithmetic_ratio'] > 0.7:
            implications['insights'].append("CPU-bound workload")
        
        return implications
    
    def _analyze_memory_patterns(self) -> Dict[str, Any]:
        """Analyze memory address patterns in spills"""
        patterns = {}
        
        # Analyze memory addresses
        addresses = self.spill_data['memory_address']
        patterns['unique_addresses'] = addresses.nunique()
        patterns['address_frequency'] = addresses.value_counts().head(10).to_dict()
        
        # Analyze address ranges
        address_values = addresses.str.replace('0x', '').apply(lambda x: int(x, 16))
        patterns['address_range'] = {
            'min': hex(address_values.min()),
            'max': hex(address_values.max()),
            'range_size': address_values.max() - address_values.min()
        }
        
        return patterns
    
    def _analyze_pc_patterns(self) -> Dict[str, Any]:
        """Analyze PC patterns in spills"""
        patterns = {}
        
        # Store PC analysis
        store_pcs = self.spill_data['store_pc']
        patterns['store_pc_frequency'] = store_pcs.value_counts().head(10).to_dict()
        
        # Load PC analysis
        load_pcs = self.spill_data['load_pc']
        patterns['load_pc_frequency'] = load_pcs.value_counts().head(10).to_dict()
        
        # PC pair analysis
        pc_pairs = self.spill_data[['store_pc', 'load_pc']].apply(tuple, axis=1)
        patterns['pc_pair_frequency'] = pc_pairs.value_counts().head(10).to_dict()
        
        return patterns
    
    def _analyze_spill_timing(self) -> Dict[str, Any]:
        """Analyze spill timing patterns"""
        timing = {}
        
        # Tick difference analysis
        tick_diffs = self.spill_data['tick_diff']
        timing['tick_diff_stats'] = {
            'mean': float(tick_diffs.mean()),
            'median': float(tick_diffs.median()),
            'std': float(tick_diffs.std()),
            'q25': float(tick_diffs.quantile(0.25)),
            'q75': float(tick_diffs.quantile(0.75))
        }
        
        # Instruction count analysis
        inst_diffs = self.spill_data['load_inst_count'] - self.spill_data['store_inst_count']
        timing['inst_diff_stats'] = {
            'mean': float(inst_diffs.mean()),
            'median': float(inst_diffs.median()),
            'std': float(inst_diffs.std())
        }
        
        return timing
    
    def _calculate_performance_score(self, report: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall performance score"""
        score = 0
        max_score = 100
        
        # IPC score (higher is better)
        ipc = report['performance_metrics'].get('ipc', 0)
        ipc_score = min(ipc * 1000, 30)  # Max 30 points
        score += ipc_score
        
        # Cache hit rate score (higher is better)
        l1_dcache_hit_rate = report['cache_performance'].get('l1_dcache', {}).get('hit_rate', 0)
        cache_score = l1_dcache_hit_rate * 20  # Max 20 points
        score += cache_score
        
        # Spill rate score (lower is better)
        spill_rate = report['performance_metrics'].get('spill_rate', 0)
        spill_score = max(0, 20 - (spill_rate * 10000))  # Max 20 points
        score += spill_score
        
        # Memory efficiency score
        memory_intensity = report['performance_metrics'].get('memory_intensity', 0)
        memory_score = max(0, 15 - (memory_intensity * 50))  # Max 15 points
        score += memory_score
        
        # Instruction mix efficiency score
        arithmetic_ratio = report['instruction_analysis'].get('performance_implications', {}).get('arithmetic_ratio', 0)
        inst_score = arithmetic_ratio * 15  # Max 15 points
        score += inst_score
        
        return {
            'overall_score': min(score, max_score),
            'max_score': max_score,
            'breakdown': {
                'ipc_score': ipc_score,
                'cache_score': cache_score,
                'spill_score': spill_score,
                'memory_score': memory_score,
                'instruction_score': inst_score
            },
            'grade': self._get_performance_grade(score, max_score)
        }
    
    def _get_performance_grade(self, score: float, max_score: float) -> str:
        """Get performance grade based on score"""
        percentage = (score / max_score) * 100
        
        if percentage >= 90:
            return 'A+'
        elif percentage >= 80:
            return 'A'
        elif percentage >= 70:
            return 'B'
        elif percentage >= 60:
            return 'C'
        elif percentage >= 50:
            return 'D'
        else:
            return 'F'
