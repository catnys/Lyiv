#!/usr/bin/env python3
"""
📊 Simple Gem5 Data Reader 📊
============================

Simple data reader for basic gem5 metrics without complex analysis.
"""

import os
import pandas as pd
import json
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class SimpleGem5Reader:
    """Simple reader for basic gem5 metrics"""
    
    def __init__(self, m5out_path: str):
        self.m5out_path = m5out_path
        self.stats_data = {}
        
    def read_all_data(self) -> bool:
        """Read all data from m5out directory"""
        try:
            # Read stats.txt
            stats_file = os.path.join(self.m5out_path, "stats.txt")
            if os.path.exists(stats_file):
                self._read_stats_file(stats_file)
                logger.info("✅ Stats data read successfully")
            else:
                logger.warning("⚠️ stats.txt not found")
            
            logger.info("ℹ️ Working with stats.txt only")
                
            return True
        except Exception as e:
            logger.error(f"❌ Error reading data: {e}")
            return False
    
    def _read_stats_file(self, file_path: str) -> None:
        """Read stats.txt file"""
        self.stats_data = {}
        
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Parse format: name value # description
                        parts = line.split('#')
                        if len(parts) >= 1:
                            name_value = parts[0].strip()
                            
                            # Extract name and value
                            name_value_parts = name_value.split()
                            if len(name_value_parts) >= 2:
                                name = name_value_parts[0]
                                value = name_value_parts[1]
                                self.stats_data[name] = value
        except Exception as e:
            logger.error(f"Error reading stats file: {e}")
    
    
    def get_basic_metrics(self) -> Dict[str, Any]:
        """Get basic metrics for frontend"""
        metrics = {}
        
        # Total instructions
        total_insts = self._get_stat_value('system.cpu.commitStats0.numInsts', int)
        metrics['total_instructions'] = total_insts or 0
        
        # Total ticks
        total_ticks = self._get_stat_value('simTicks', int)
        metrics['total_ticks'] = total_ticks or 0
        
        # Simulation timing
        sim_seconds = self._get_stat_value('simSeconds', float)
        host_seconds = self._get_stat_value('hostSeconds', float)
        host_tick_rate = self._get_stat_value('hostTickRate', int)
        host_inst_rate = self._get_stat_value('hostInstRate', int)
        
        metrics['sim_seconds'] = round(sim_seconds or 0, 6)
        metrics['host_seconds'] = round(host_seconds or 0, 6)
        metrics['host_tick_rate'] = host_tick_rate or 0
        metrics['host_inst_rate'] = host_inst_rate or 0
        
        # Simulation vs Host performance
        if sim_seconds and sim_seconds > 0:
            metrics['simulation_speedup'] = round((host_seconds or 0) / sim_seconds, 2)
        else:
            metrics['simulation_speedup'] = 0
        
        # Total loads
        total_loads = self._get_stat_value('system.cpu.commitStats0.numLoadInsts', int)
        metrics['total_loads'] = total_loads or 0
        
        # Total stores
        total_stores = self._get_stat_value('system.cpu.commitStats0.numStoreInsts', int)
        metrics['total_stores'] = total_stores or 0
        
        # Instruction breakdown
        sim_insts = self._get_stat_value('simInsts', int)
        sim_ops = self._get_stat_value('simOps', int)
        committed_ops = self._get_stat_value('system.cpu.commitStats0.numOps', int)
        committed_insts_not_nop = self._get_stat_value('system.cpu.commitStats0.numInstsNotNOP', int)
        committed_ops_not_nop = self._get_stat_value('system.cpu.commitStats0.numOpsNotNOP', int)
        
        metrics['sim_insts'] = sim_insts or 0
        metrics['sim_ops'] = sim_ops or 0
        metrics['committed_ops'] = committed_ops or 0
        metrics['committed_insts_not_nop'] = committed_insts_not_nop or 0
        metrics['committed_ops_not_nop'] = committed_ops_not_nop or 0
        
        # Instruction type counts
        fp_insts = self._get_stat_value('system.cpu.commitStats0.numFpInsts', int)
        int_insts = self._get_stat_value('system.cpu.commitStats0.numIntInsts', int)
        vec_insts = self._get_stat_value('system.cpu.commitStats0.numVecInsts', int)
        
        metrics['fp_insts'] = fp_insts or 0
        metrics['int_insts'] = int_insts or 0
        metrics['vec_insts'] = vec_insts or 0
        
        # Total cycles
        total_cycles = self._get_stat_value('system.cpu.numCycles', int)
        metrics['total_cycles'] = total_cycles or 0
        
        # CPI and IPC
        cpi = self._get_stat_value('system.cpu.cpi', float)
        ipc = self._get_stat_value('system.cpu.ipc', float)
        metrics['cpi'] = cpi or 0
        metrics['ipc'] = ipc or 0
        
        # Register usage
        int_reg_reads = self._get_stat_value('system.cpu.executeStats0.numIntRegReads', int)
        int_reg_writes = self._get_stat_value('system.cpu.executeStats0.numIntRegWrites', int)
        fp_reg_reads = self._get_stat_value('system.cpu.executeStats0.numFpRegReads', int)
        fp_reg_writes = self._get_stat_value('system.cpu.executeStats0.numFpRegWrites', int)
        
        metrics['int_reg_reads'] = int_reg_reads or 0
        metrics['int_reg_writes'] = int_reg_writes or 0
        metrics['fp_reg_reads'] = fp_reg_reads or 0
        metrics['fp_reg_writes'] = fp_reg_writes or 0
        
        # Memory references
        total_mem_refs = self._get_stat_value('system.cpu.executeStats0.numMemRefs', int)
        metrics['total_memory_refs'] = total_mem_refs or 0
        
        # Binary and architecture information
        metrics['binary_info'] = self._get_binary_info()
        
        # Calculate percentages
        if total_insts and total_insts > 0:
            metrics['load_percentage'] = (total_loads / total_insts) * 100
            metrics['store_percentage'] = (total_stores / total_insts) * 100
            metrics['memory_ref_percentage'] = (total_mem_refs / total_insts) * 100
        else:
            metrics['load_percentage'] = 0
            metrics['store_percentage'] = 0
            metrics['memory_ref_percentage'] = 0
        
        return metrics
    
    def get_instruction_types(self) -> Dict[str, Any]:
        """Get instruction type distribution"""
        instruction_types = {}
        total_instructions = 0
        
        # First pass: collect all instruction types and calculate total
        for key, value in self.stats_data.items():
            if 'committedInstType::' in key and 'total' not in key:
                inst_type = key.split('::')[-1]
                try:
                    count = int(value)
                    if count > 0:
                        instruction_types[inst_type] = count
                        total_instructions += count
                except (ValueError, TypeError):
                    pass
        
        # Second pass: add percentages
        if total_instructions > 0:
            for inst_type in instruction_types:
                percentage = (instruction_types[inst_type] / total_instructions) * 100
                instruction_types[inst_type] = {
                    'count': instruction_types[inst_type],
                    'percentage': round(percentage, 2)
                }
        
        # Add metadata
        result = {
            'instruction_types': instruction_types,
            'total_instructions': total_instructions,
            'architecture': self._detect_architecture()
        }
        
        return result
    
    def get_efficiency_metrics(self) -> Dict[str, Any]:
        """Calculate efficiency and performance metrics"""
        metrics = {}
        
        # CPU Efficiency Metrics
        total_cycles = self._get_stat_value('system.cpu.numCycles', int) or 0
        total_instructions = self._get_stat_value('system.cpu.commitStats0.numInsts', int) or 0
        sim_seconds = self._get_stat_value('simSeconds', float) or 0
        
        if total_cycles > 0:
            # CPU Utilization (theoretical max vs actual)
            ideal_cycles = total_instructions  # 1 cycle per instruction ideal
            cpu_utilization = (ideal_cycles / total_cycles) * 100
            metrics['cpu_utilization'] = round(cpu_utilization, 2)
            
            # Instruction Throughput
            if sim_seconds > 0:
                instructions_per_second = total_instructions / sim_seconds
                metrics['instructions_per_second'] = round(instructions_per_second, 0)
                metrics['mips'] = round(instructions_per_second / 1000000, 2)
        
        # Memory Efficiency Metrics
        memory_refs = self._get_stat_value('system.cpu.executeStats0.numMemRefs', int) or 0
        read_reqs = self._get_stat_value('system.mem_ctrls.readReqs', int) or 0
        write_reqs = self._get_stat_value('system.mem_ctrls.writeReqs', int) or 0
        
        if memory_refs > 0:
            memory_intensity = (memory_refs / total_instructions) * 100
            metrics['memory_intensity'] = round(memory_intensity, 2)
            
            # Memory access ratio
            if write_reqs > 0:
                read_write_ratio = read_reqs / write_reqs
                metrics['read_write_ratio'] = round(read_write_ratio, 2)
        
        # TLB Efficiency
        dtlb_accesses = self._get_stat_value('system.cpu.mmu.dtb.rdAccesses', int) or 0
        dtlb_accesses += self._get_stat_value('system.cpu.mmu.dtb.wrAccesses', int) or 0
        dtlb_misses = self._get_stat_value('system.cpu.mmu.dtb.rdMisses', int) or 0
        dtlb_misses += self._get_stat_value('system.cpu.mmu.dtb.wrMisses', int) or 0
        
        if dtlb_accesses > 0:
            dtlb_hit_rate = ((dtlb_accesses - dtlb_misses) / dtlb_accesses) * 100
            metrics['dtlb_hit_rate'] = round(dtlb_hit_rate, 2)
            metrics['dtlb_miss_rate'] = round(100 - dtlb_hit_rate, 2)
        
        # Register Usage Efficiency
        int_reg_reads = self._get_stat_value('system.cpu.executeStats0.numIntRegReads', int) or 0
        int_reg_writes = self._get_stat_value('system.cpu.executeStats0.numIntRegWrites', int) or 0
        fp_reg_reads = self._get_stat_value('system.cpu.executeStats0.numFpRegReads', int) or 0
        fp_reg_writes = self._get_stat_value('system.cpu.executeStats0.numFpRegWrites', int) or 0
        
        total_reg_ops = int_reg_reads + int_reg_writes + fp_reg_reads + fp_reg_writes
        if total_instructions > 0:
            register_intensity = (total_reg_ops / total_instructions)
            metrics['register_intensity'] = round(register_intensity, 2)
        
        # Pipeline Efficiency
        fetch_rate = self._get_stat_value('system.cpu.fetchStats0.fetchRate', float) or 0
        if fetch_rate > 0:
            metrics['fetch_efficiency'] = round(fetch_rate * 100, 2)
        
        # Memory Queue Analysis
        avg_read_queue = self._get_stat_value('system.mem_ctrls.avgRdQLen', float) or 0
        avg_write_queue = self._get_stat_value('system.mem_ctrls.avgWrQLen', float) or 0
        metrics['avg_read_queue_length'] = round(avg_read_queue, 2)
        metrics['avg_write_queue_length'] = round(avg_write_queue, 2)
        
        # Memory Bandwidth Utilization
        total_memory_requests = read_reqs + write_reqs
        if sim_seconds > 0:
            memory_bandwidth = total_memory_requests / sim_seconds
            metrics['memory_bandwidth_mbps'] = round(memory_bandwidth / 1000000, 2)
        
        return metrics
    
    def get_performance_insights(self) -> Dict[str, Any]:
        """Generate performance insights and recommendations"""
        insights = {
            'performance_issues': [],
            'recommendations': [],
            'bottlenecks': [],
            'efficiency_score': 0
        }
        
        # Get basic metrics
        cpi = self._get_stat_value('system.cpu.cpi', float) or 0
        ipc = self._get_stat_value('system.cpu.ipc', float) or 0
        dtlb_miss_rate = 0
        memory_intensity = 0
        
        # Calculate TLB miss rate
        dtlb_accesses = self._get_stat_value('system.cpu.mmu.dtb.rdAccesses', int) or 0
        dtlb_accesses += self._get_stat_value('system.cpu.mmu.dtb.wrAccesses', int) or 0
        dtlb_misses = self._get_stat_value('system.cpu.mmu.dtb.rdMisses', int) or 0
        dtlb_misses += self._get_stat_value('system.cpu.mmu.dtb.wrMisses', int) or 0
        
        if dtlb_accesses > 0:
            dtlb_miss_rate = (dtlb_misses / dtlb_accesses) * 100
        
        # Calculate memory intensity
        total_instructions = self._get_stat_value('system.cpu.commitStats0.numInsts', int) or 0
        memory_refs = self._get_stat_value('system.cpu.executeStats0.numMemRefs', int) or 0
        if total_instructions > 0:
            memory_intensity = (memory_refs / total_instructions) * 100
        
        # Performance Analysis
        if cpi > 10:
            insights['performance_issues'].append(f"High CPI ({cpi:.2f}) indicates poor instruction efficiency")
            insights['recommendations'].append("Consider optimizing instruction mix or reducing memory stalls")
        
        if ipc < 0.1:
            insights['performance_issues'].append(f"Very low IPC ({ipc:.4f}) suggests significant pipeline stalls")
            insights['recommendations'].append("Investigate branch prediction and memory latency")
        
        if dtlb_miss_rate > 5:
            insights['performance_issues'].append(f"High TLB miss rate ({dtlb_miss_rate:.2f}%)")
            insights['recommendations'].append("Consider larger TLB or better page locality")
        
        if memory_intensity > 50:
            insights['bottlenecks'].append("Memory-bound workload")
            insights['recommendations'].append("Optimize memory access patterns or increase memory bandwidth")
        
        # Calculate efficiency score (0-100)
        efficiency_score = 100
        if cpi > 5:
            efficiency_score -= min(30, (cpi - 5) * 3)
        if dtlb_miss_rate > 1:
            efficiency_score -= min(20, dtlb_miss_rate * 2)
        if memory_intensity > 30:
            efficiency_score -= min(25, (memory_intensity - 30) * 0.5)
        
        insights['efficiency_score'] = max(0, round(efficiency_score, 1))
        
        return insights
    
    def get_advanced_simulation_metrics(self) -> Dict[str, Any]:
        """Calculate advanced simulation metrics and insights"""
        metrics = {}
        
        # Get basic values
        total_instructions = self._get_stat_value('system.cpu.commitStats0.numInsts', int) or 0
        total_cycles = self._get_stat_value('system.cpu.numCycles', int) or 0
        total_ticks = self._get_stat_value('simTicks', int) or 0
        sim_seconds = self._get_stat_value('simSeconds', float) or 0
        host_seconds = self._get_stat_value('hostSeconds', float) or 0
        host_memory = self._get_stat_value('hostMemory', int) or 0
        sim_freq = self._get_stat_value('simFreq', int) or 0
        
        # Performance Efficiency Metrics
        if total_cycles > 0:
            # CPU Efficiency (ideal vs actual)
            ideal_cycles = total_instructions  # 1 cycle per instruction ideal
            cpu_efficiency = (ideal_cycles / total_cycles) * 100
            metrics['cpu_efficiency'] = round(cpu_efficiency, 2)
            
            # Pipeline Utilization
            pipeline_utilization = (total_instructions / total_cycles) * 100
            metrics['pipeline_utilization'] = round(pipeline_utilization, 2)
        
        # Simulation Performance Metrics
        if sim_seconds > 0:
            # Instructions per second
            instructions_per_second = total_instructions / sim_seconds
            metrics['instructions_per_second'] = round(instructions_per_second, 0)
            
            # MIPS (Million Instructions Per Second)
            mips = instructions_per_second / 1000000
            metrics['mips'] = round(mips, 2)
            
            # Simulation speed (simulated time vs real time)
            if host_seconds > 0:
                simulation_speed = sim_seconds / host_seconds
                metrics['simulation_speed'] = round(simulation_speed, 2)
                
                # Host efficiency
                host_efficiency = (sim_seconds / host_seconds) * 100
                metrics['host_efficiency'] = round(host_efficiency, 2)
        
        # Memory System Analysis
        memory_refs = self._get_stat_value('system.cpu.executeStats0.numMemRefs', int) or 0
        if total_instructions > 0:
            # Memory intensity
            memory_intensity = (memory_refs / total_instructions) * 100
            metrics['memory_intensity'] = round(memory_intensity, 2)
            
            # Average memory access time (cycles per memory access)
            if memory_refs > 0:
                avg_memory_access_time = total_cycles / memory_refs
                metrics['avg_memory_access_time'] = round(avg_memory_access_time, 2)
        
        # Register System Analysis
        int_reg_reads = self._get_stat_value('system.cpu.executeStats0.numIntRegReads', int) or 0
        int_reg_writes = self._get_stat_value('system.cpu.executeStats0.numIntRegWrites', int) or 0
        fp_reg_reads = self._get_stat_value('system.cpu.executeStats0.numFpRegReads', int) or 0
        fp_reg_writes = self._get_stat_value('system.cpu.executeStats0.numFpRegWrites', int) or 0
        
        total_reg_ops = int_reg_reads + int_reg_writes + fp_reg_reads + fp_reg_writes
        if total_instructions > 0:
            # Register intensity
            register_intensity = total_reg_ops / total_instructions
            metrics['register_intensity'] = round(register_intensity, 2)
            
            # Register efficiency (reads vs writes)
            total_reg_reads = int_reg_reads + fp_reg_reads
            total_reg_writes = int_reg_writes + fp_reg_writes
            if total_reg_writes > 0:
                reg_read_write_ratio = total_reg_reads / total_reg_writes
                metrics['reg_read_write_ratio'] = round(reg_read_write_ratio, 2)
        
        # System Resource Utilization
        if host_memory > 0:
            # Memory efficiency (instructions per MB of host memory)
            memory_efficiency = total_instructions / (host_memory / 1024 / 1024)
            metrics['memory_efficiency'] = round(memory_efficiency, 0)
        
        # Clock and Frequency Analysis
        if sim_freq > 0 and total_ticks > 0:
            # Effective clock frequency
            effective_freq = total_ticks / sim_seconds if sim_seconds > 0 else 0
            metrics['effective_freq_ghz'] = round(effective_freq / 1000000000, 2)
            
            # Clock efficiency
            clock_efficiency = (sim_seconds * sim_freq) / total_ticks * 100
            metrics['clock_efficiency'] = round(clock_efficiency, 2)
        
        # Workload Characteristics
        if total_instructions > 0:
            # Instruction density (instructions per tick)
            instruction_density = total_instructions / total_ticks
            metrics['instruction_density'] = round(instruction_density * 1000000, 2)  # per million ticks
            
            # Cycle density (cycles per tick)
            cycle_density = total_cycles / total_ticks
            metrics['cycle_density'] = round(cycle_density * 1000000, 2)  # per million ticks
        
        return metrics
    
    def get_simulation_insights(self) -> Dict[str, Any]:
        """Generate simulation insights and recommendations"""
        insights = {
            'performance_analysis': [],
            'bottlenecks': [],
            'recommendations': [],
            'workload_characteristics': [],
            'efficiency_score': 0
        }
        
        # Get metrics
        cpi = self._get_stat_value('system.cpu.cpi', float) or 0
        ipc = self._get_stat_value('system.cpu.ipc', float) or 0
        total_instructions = self._get_stat_value('system.cpu.commitStats0.numInsts', int) or 0
        total_cycles = self._get_stat_value('system.cpu.numCycles', int) or 0
        memory_refs = self._get_stat_value('system.cpu.executeStats0.numMemRefs', int) or 0
        
        # Performance Analysis
        if cpi > 100:
            insights['performance_analysis'].append(f"Very high CPI ({cpi:.2f}) indicates severe performance issues")
            insights['bottlenecks'].append("CPU pipeline stalls")
        elif cpi > 10:
            insights['performance_analysis'].append(f"High CPI ({cpi:.2f}) suggests performance bottlenecks")
            insights['bottlenecks'].append("Memory or pipeline stalls")
        
        if ipc < 0.01:
            insights['performance_analysis'].append(f"Extremely low IPC ({ipc:.4f}) indicates major inefficiencies")
            insights['bottlenecks'].append("Pipeline inefficiency")
        elif ipc < 0.1:
            insights['performance_analysis'].append(f"Low IPC ({ipc:.4f}) suggests pipeline stalls")
        
        # Memory Analysis
        if total_instructions > 0:
            memory_intensity = (memory_refs / total_instructions) * 100
            if memory_intensity > 50:
                insights['workload_characteristics'].append("Memory-intensive workload")
                insights['bottlenecks'].append("Memory bandwidth")
            elif memory_intensity > 30:
                insights['workload_characteristics'].append("Moderate memory usage")
            else:
                insights['workload_characteristics'].append("Compute-intensive workload")
        
        # Recommendations
        if cpi > 10:
            insights['recommendations'].append("Optimize instruction mix and reduce memory stalls")
        if ipc < 0.1:
            insights['recommendations'].append("Investigate branch prediction and pipeline efficiency")
        if memory_intensity > 40:
            insights['recommendations'].append("Consider memory hierarchy optimization")
        
        # Calculate efficiency score
        efficiency_score = 100
        if cpi > 5:
            efficiency_score -= min(40, (cpi - 5) * 4)
        if ipc < 0.1:
            efficiency_score -= min(30, (0.1 - ipc) * 300)
        if memory_intensity > 50:
            efficiency_score -= min(20, (memory_intensity - 50) * 0.4)
        
        insights['efficiency_score'] = max(0, round(efficiency_score, 1))
        
        return insights
    
    def _detect_architecture(self) -> str:
        """Detect CPU architecture from stats"""
        # Check for ARM indicators
        if any('arm' in key.lower() for key in self.stats_data.keys()):
            return 'ARM'
        
        # Check for x86 indicators
        if any('x86' in key.lower() or 'intel' in key.lower() for key in self.stats_data.keys()):
            return 'x86'
        
        # Check for RISC-V indicators
        if any('riscv' in key.lower() or 'risc' in key.lower() for key in self.stats_data.keys()):
            return 'RISC-V'
        
        # Default based on common patterns
        if 'system.cpu' in str(self.stats_data.keys()):
            return 'Generic'
        
        return 'Unknown'
    
    def get_memory_system_stats(self) -> Dict[str, Any]:
        """Get memory system statistics"""
        memory_stats = {}
        
        # Memory controller stats
        memory_keys = [
            'system.mem_ctrls.readReqs',
            'system.mem_ctrls.writeReqs',
            'system.mem_ctrls.readBursts',
            'system.mem_ctrls.writeBursts',
            'system.mem_ctrls.avgRdQLen',
            'system.mem_ctrls.avgWrQLen',
            'system.mem_ctrls.rdMisses',
            'system.mem_ctrls.wrMisses'
        ]
        
        for key in memory_keys:
            value = self._get_stat_value(key, int)
            if value is not None:
                memory_stats[key] = value
        
        # TLB stats
        tlb_keys = [
            'system.cpu.mmu.dtb.rdAccesses',
            'system.cpu.mmu.dtb.wrAccesses',
            'system.cpu.mmu.dtb.rdMisses',
            'system.cpu.mmu.dtb.wrMisses',
            'system.cpu.mmu.itb.rdAccesses',
            'system.cpu.mmu.itb.wrAccesses',
            'system.cpu.mmu.itb.rdMisses',
            'system.cpu.mmu.itb.wrMisses'
        ]
        
        for key in tlb_keys:
            value = self._get_stat_value(key, int)
            if value is not None:
                memory_stats[key] = value
        
        return memory_stats
    
    def get_cache_metrics(self) -> Dict[str, Any]:
        """Get cache hit/miss ratios and statistics"""
        cache_metrics = {}
        
        # TLB Cache Statistics
        dtlb_rd_accesses = self._get_stat_value('system.cpu.mmu.dtb.rdAccesses', int) or 0
        dtlb_wr_accesses = self._get_stat_value('system.cpu.mmu.dtb.wrAccesses', int) or 0
        dtlb_rd_misses = self._get_stat_value('system.cpu.mmu.dtb.rdMisses', int) or 0
        dtlb_wr_misses = self._get_stat_value('system.cpu.mmu.dtb.wrMisses', int) or 0
        
        itlb_rd_accesses = self._get_stat_value('system.cpu.mmu.itb.rdAccesses', int) or 0
        itlb_wr_accesses = self._get_stat_value('system.cpu.mmu.itb.wrAccesses', int) or 0
        itlb_rd_misses = self._get_stat_value('system.cpu.mmu.itb.rdMisses', int) or 0
        itlb_wr_misses = self._get_stat_value('system.cpu.mmu.itb.wrMisses', int) or 0
        
        # Calculate TLB Hit/Miss Rates
        dtlb_total_accesses = dtlb_rd_accesses + dtlb_wr_accesses
        dtlb_total_misses = dtlb_rd_misses + dtlb_wr_misses
        
        if dtlb_total_accesses > 0:
            dtlb_hit_rate = ((dtlb_total_accesses - dtlb_total_misses) / dtlb_total_accesses) * 100
            cache_metrics['dtlb_hit_rate'] = round(dtlb_hit_rate, 2)
            cache_metrics['dtlb_miss_rate'] = round(100 - dtlb_hit_rate, 2)
            cache_metrics['dtlb_total_accesses'] = dtlb_total_accesses
            cache_metrics['dtlb_total_misses'] = dtlb_total_misses
        
        itlb_total_accesses = itlb_rd_accesses + itlb_wr_accesses
        itlb_total_misses = itlb_rd_misses + itlb_wr_misses
        
        if itlb_total_accesses > 0:
            itlb_hit_rate = ((itlb_total_accesses - itlb_total_misses) / itlb_total_accesses) * 100
            cache_metrics['itlb_hit_rate'] = round(itlb_hit_rate, 2)
            cache_metrics['itlb_miss_rate'] = round(100 - itlb_hit_rate, 2)
            cache_metrics['itlb_total_accesses'] = itlb_total_accesses
            cache_metrics['itlb_total_misses'] = itlb_total_misses
        
        # Memory Controller Cache Statistics (Row Buffer Hit/Miss)
        read_row_hits = self._get_stat_value('system.mem_ctrls.dram.readRowHits', int) or 0
        write_row_hits = self._get_stat_value('system.mem_ctrls.dram.writeRowHits', int) or 0
        read_row_hit_rate = self._get_stat_value('system.mem_ctrls.dram.readRowHitRate', float) or 0
        write_row_hit_rate = self._get_stat_value('system.mem_ctrls.dram.writeRowHitRate', float) or 0
        page_hit_rate = self._get_stat_value('system.mem_ctrls.dram.pageHitRate', float) or 0
        
        cache_metrics['memory_read_row_hits'] = read_row_hits
        cache_metrics['memory_write_row_hits'] = write_row_hits
        cache_metrics['memory_read_row_hit_rate'] = round(read_row_hit_rate, 2)
        cache_metrics['memory_write_row_hit_rate'] = round(write_row_hit_rate, 2)
        cache_metrics['memory_page_hit_rate'] = round(page_hit_rate, 2)
        
        # Calculate memory row miss rates
        cache_metrics['memory_read_row_miss_rate'] = round(100 - read_row_hit_rate, 2)
        cache_metrics['memory_write_row_miss_rate'] = round(100 - write_row_hit_rate, 2)
        cache_metrics['memory_page_miss_rate'] = round(100 - page_hit_rate, 2)
        
        # Snoop Filter Cache Statistics
        snoop_hit_single = self._get_stat_value('system.membus.snoop_filter.hitSingleRequests', int) or 0
        snoop_hit_multi = self._get_stat_value('system.membus.snoop_filter.hitMultiRequests', int) or 0
        snoop_miss = self._get_stat_value('system.membus.snoop_filter.missRequests', int) or 0
        
        cache_metrics['snoop_hit_single'] = snoop_hit_single
        cache_metrics['snoop_hit_multi'] = snoop_hit_multi
        cache_metrics['snoop_miss'] = snoop_miss
        
        # Calculate snoop hit rate
        total_snoop_requests = snoop_hit_single + snoop_hit_multi + snoop_miss
        if total_snoop_requests > 0:
            snoop_hit_rate = ((snoop_hit_single + snoop_hit_multi) / total_snoop_requests) * 100
            cache_metrics['snoop_hit_rate'] = round(snoop_hit_rate, 2)
            cache_metrics['snoop_miss_rate'] = round(100 - snoop_hit_rate, 2)
        
        # Cache Performance Analysis
        cache_metrics['cache_performance'] = self._analyze_cache_performance(cache_metrics)
        
        return cache_metrics
    
    def _analyze_cache_performance(self, cache_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze cache performance and provide insights"""
        analysis = {
            'overall_score': 0,
            'issues': [],
            'recommendations': []
        }
        
        score = 0
        
        # TLB Performance Analysis
        dtlb_hit_rate = cache_metrics.get('dtlb_hit_rate', 0)
        itlb_hit_rate = cache_metrics.get('itlb_hit_rate', 0)
        
        if dtlb_hit_rate > 95:
            score += 25
        elif dtlb_hit_rate > 90:
            score += 20
        elif dtlb_hit_rate > 80:
            score += 15
        else:
            analysis['issues'].append(f"Low DTLB hit rate: {dtlb_hit_rate}%")
            analysis['recommendations'].append("Consider increasing DTLB size or improving page table management")
        
        if itlb_hit_rate > 95:
            score += 25
        elif itlb_hit_rate > 90:
            score += 20
        elif itlb_hit_rate > 80:
            score += 15
        else:
            analysis['issues'].append(f"Low ITLB hit rate: {itlb_hit_rate}%")
            analysis['recommendations'].append("Consider increasing ITLB size or improving instruction page locality")
        
        # Memory Row Buffer Performance
        page_hit_rate = cache_metrics.get('memory_page_hit_rate', 0)
        if page_hit_rate > 90:
            score += 30
        elif page_hit_rate > 80:
            score += 25
        elif page_hit_rate > 70:
            score += 20
        else:
            analysis['issues'].append(f"Low memory page hit rate: {page_hit_rate}%")
            analysis['recommendations'].append("Consider optimizing memory access patterns or increasing row buffer size")
        
        # Snoop Filter Performance
        snoop_hit_rate = cache_metrics.get('snoop_hit_rate', 0)
        if snoop_hit_rate > 80:
            score += 20
        elif snoop_hit_rate > 60:
            score += 15
        else:
            analysis['issues'].append(f"Low snoop filter hit rate: {snoop_hit_rate}%")
            analysis['recommendations'].append("Consider optimizing cache coherence protocols")
        
        analysis['overall_score'] = min(100, score)
        
        return analysis
    
    def _get_binary_info(self) -> Dict[str, Any]:
        """Get binary and architecture information from config.json"""
        binary_info = {
            'executable': 'Unknown',
            'architecture': 'Unknown',
            'isa': 'Unknown',
            'cpu_type': 'Unknown',
            'cpu_name': 'Unknown'
        }
        
        try:
            config_path = os.path.join(self.m5out_path, 'config.json')
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                
                # Extract executable path
                if 'system' in config and 'cpu' in config['system']:
                    cpu_config = config['system']['cpu']
                    if isinstance(cpu_config, list) and len(cpu_config) > 0:
                        cpu = cpu_config[0]
                        
                        # Get executable from workload
                        if 'workload' in cpu and 'executable' in cpu['workload']:
                            executable_path = cpu['workload']['executable']
                            binary_info['executable'] = os.path.basename(executable_path)
                        
                        # Get ISA information
                        if 'isa' in cpu and isinstance(cpu['isa'], list) and len(cpu['isa']) > 0:
                            isa_config = cpu['isa'][0]
                            if 'cxx_class' in isa_config:
                                isa_class = isa_config['cxx_class']
                                if 'X86ISA' in isa_class:
                                    binary_info['architecture'] = 'x86_64'
                                    binary_info['isa'] = 'X86'
                                elif 'ArmISA' in isa_class:
                                    binary_info['architecture'] = 'ARM'
                                    binary_info['isa'] = 'ARM'
                                elif 'RiscvISA' in isa_class:
                                    binary_info['architecture'] = 'RISC-V'
                                    binary_info['isa'] = 'RISC-V'
                        
                        # Get CPU type and name
                        if 'cxx_class' in cpu:
                            cpu_class = cpu['cxx_class']
                            if 'TimingSimpleCPU' in cpu_class:
                                binary_info['cpu_type'] = 'Timing Simple CPU'
                            elif 'O3CPU' in cpu_class:
                                binary_info['cpu_type'] = 'Out-of-Order CPU'
                            elif 'MinorCPU' in cpu_class:
                                binary_info['cpu_type'] = 'Minor CPU'
                        
                        # Get CPU name from ISA
                        if 'isa' in cpu and isinstance(cpu['isa'], list) and len(cpu['isa']) > 0:
                            isa_config = cpu['isa'][0]
                            if 'name_string' in isa_config:
                                binary_info['cpu_name'] = isa_config['name_string']
        
        except Exception as e:
            logger.warning(f"Could not extract binary info from config: {e}")
        
        return binary_info
    
    def _find_spill_stats_file(self) -> str:
        """Find spill stats file automatically (x86_spill_stats.txt, arm_spill_stats.txt, etc.)"""
        try:
            # Look for spill stats files in m5out directory
            spill_patterns = [
                "x86_spill_stats.txt",
                "arm_spill_stats.txt", 
                "riscv_spill_stats.txt",
                "spill_stats.txt",
                "spill_log.txt"  # fallback
            ]
            
            for pattern in spill_patterns:
                spill_file_path = os.path.join(self.m5out_path, pattern)
                if os.path.exists(spill_file_path):
                    logger.info(f"Found spill stats file: {pattern}")
                    return spill_file_path
            
            # Also check parent directory (in case spill stats is in project root)
            for pattern in spill_patterns:
                spill_file_path = os.path.join(os.path.dirname(self.m5out_path), pattern)
                if os.path.exists(spill_file_path):
                    logger.info(f"Found spill stats file in parent directory: {pattern}")
                    return spill_file_path
            
            logger.warning("No spill stats file found")
            return None
            
        except Exception as e:
            logger.error(f"Error finding spill stats file: {e}")
            return None
    
    def _detect_architecture_from_filename(self, file_path: str) -> str:
        """Detect architecture from spill stats filename"""
        filename = os.path.basename(file_path).lower()
        
        if 'x86' in filename:
            return 'x86_64'
        elif 'arm' in filename:
            return 'ARM'
        elif 'riscv' in filename or 'risc-v' in filename:
            return 'RISC-V'
        else:
            return 'Unknown'
    
    # --- Streaming spill utilities (memory-safe for very large files) ---
    def _iter_spill_lines(self, spill_log_path: str):
        """Yield parsed SPILL rows one-by-one without loading whole file into memory."""
        try:
            if not spill_log_path or not os.path.exists(spill_log_path):
                return
            with open(spill_log_path, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    if not line or not line.startswith('SPILL,'):
                        continue
                    parts = line.rstrip('\n').split(',')
                    if len(parts) < 9:
                        continue
                    yield (line_num, parts)
        except Exception as e:
            logger.error(f"Error streaming spill lines: {e}")

    def search_spills(self, q: str = '', field: str = 'all', offset: int = 0, limit: int = 100, use_regex: bool = False) -> Dict[str, Any]:
        """Search spills by streaming; returns paginated matches without loading entire file.

        Fields: all|id|pc|load_pc|store_pc|mem|time
        """
        import re, time
        start_ts = time.time()
        spill_log_path = self._find_spill_stats_file()
        items = []
        scanned = 0
        next_offset = offset

        pattern = None
        term = q or ''
        if use_regex and term:
            try:
                pattern = re.compile(term, re.IGNORECASE)
            except re.error:
                pattern = None
        elif term and '*' in term:
            # wildcard -> regex
            try:
                pattern = re.compile(term.replace('*', '.*'), re.IGNORECASE)
            except re.error:
                pattern = None
        term_lower = term.lower()

        def matches(parts):
            # parts: ["SPILL", store_pc, load_pc, mem, store_tick, load_tick, tick_diff, store_ic, load_ic]
            if not term:
                return True
            candidates = []
            if field in ('all', 'pc', 'store_pc'):
                candidates.append(parts[1])
            if field in ('all', 'pc', 'load_pc'):
                candidates.append(parts[2])
            if field in ('all', 'mem'):
                candidates.append(parts[3])
            if field in ('all', 'time'):
                candidates.extend([parts[4], parts[5], parts[6]])
            if field == 'id':
                candidates.append(str(parts[-1]))
            if pattern:
                return any(pattern.search(c or '') for c in candidates)
            return any((c or '').lower().find(term_lower) != -1 for c in candidates)

        for idx, parts in self._iter_spill_lines(spill_log_path):
            scanned += 1
            if scanned <= offset:
                continue
            if matches(parts):
                items.append({
                    'id': str(idx),
                    'pc': parts[1],
                    'load_pc': parts[2],
                    'store_pc': parts[1],
                    'memory_address': parts[3],
                    'store_tick': int(parts[4]),
                    'load_tick': int(parts[5]),
                    'duration': int(parts[6]),
                })
                if len(items) >= limit:
                    next_offset = offset + scanned
                    break

        took_ms = int((time.time() - start_ts) * 1000)
        return {
            'items': items,
            'next_offset': next_offset if len(items) >= limit else None,
            'scanned_lines': scanned,
            'took_ms': took_ms,
            'spill_file': os.path.basename(spill_log_path) if spill_log_path else None
        }

        
    def count_spills(self, q: str = '', field: str = 'all', max_scan_lines: int = 0, use_regex: bool = False) -> Dict[str, Any]:
        """Count matching spills by streaming; optional cap with max_scan_lines for responsiveness."""
        import re, time
        start_ts = time.time()
        spill_log_path = self._find_spill_stats_file()
        count = 0
        scanned = 0

        pattern = None
        term = q or ''
        if use_regex and term:
            try:
                pattern = re.compile(term, re.IGNORECASE)
            except re.error:
                pattern = None
        elif term and '*' in term:
            try:
                pattern = re.compile(term.replace('*', '.*'), re.IGNORECASE)
            except re.error:
                pattern = None
        term_lower = term.lower()

        def matches(parts):
            if not term:
                return True
            candidates = []
            if field in ('all', 'pc', 'store_pc'):
                candidates.append(parts[1])
            if field in ('all', 'pc', 'load_pc'):
                candidates.append(parts[2])
            if field in ('all', 'mem'):
                candidates.append(parts[3])
            if field in ('all', 'time'):
                candidates.extend([parts[4], parts[5], parts[6]])
            if pattern:
                return any(pattern.search(c or '') for c in candidates)
            return any((c or '').lower().find(term_lower) != -1 for c in candidates)

        for _, parts in self._iter_spill_lines(spill_log_path):
            scanned += 1
            if matches(parts):
                count += 1
            if max_scan_lines and scanned >= max_scan_lines:
                break

        took_ms = int((time.time() - start_ts) * 1000)
        return {
            'count': count,
            'scanned_lines': scanned,
            'partial': bool(max_scan_lines and scanned >= max_scan_lines),
            'took_ms': took_ms,
            'spill_file': os.path.basename(spill_log_path) if spill_log_path else None
        }

    def sample_spills(self, n: int = 1000) -> Dict[str, Any]:
        """Reservoir sample n spills without loading entire file."""
        import random, time
        start_ts = time.time()
        spill_log_path = self._find_spill_stats_file()
        reservoir = []
        scanned = 0
        for idx, parts in self._iter_spill_lines(spill_log_path):
            scanned += 1
            item = {
                'id': str(idx),
                'pc': parts[1],
                'load_pc': parts[2],
                'store_pc': parts[1],
                'memory_address': parts[3],
                'store_tick': int(parts[4]),
                'load_tick': int(parts[5]),
                'duration': int(parts[6]),
            }
            if len(reservoir) < n:
                reservoir.append(item)
            else:
                j = random.randint(0, scanned - 1)
                if j < n:
                    reservoir[j] = item
        took_ms = int((time.time() - start_ts) * 1000)
        return {
            'items': reservoir,
            'scanned_lines': scanned,
            'took_ms': took_ms,
            'spill_file': os.path.basename(spill_log_path) if spill_log_path else None
        }

    def range_spills(self, min_store_inst: int = None, max_store_inst: int = None, offset: int = 0, limit: int = 100) -> Dict[str, Any]:
        """Return spills filtered by store_inst_count range via streaming scan."""
        import time
        start_ts = time.time()
        spill_log_path = self._find_spill_stats_file()
        items = []
        scanned = 0
        delivered = 0
        next_offset = offset

        for idx, parts in self._iter_spill_lines(spill_log_path):
            scanned += 1
            if scanned <= offset:
                continue
            try:
                store_ic = int(parts[7])
            except Exception:
                continue
            if min_store_inst is not None and store_ic < min_store_inst:
                continue
            if max_store_inst is not None and store_ic > max_store_inst:
                continue
            items.append({
                'id': str(idx),
                'pc': parts[1],
                'load_pc': parts[2],
                'store_pc': parts[1],
                'memory_address': parts[3],
                'store_tick': int(parts[4]),
                'load_tick': int(parts[5]),
                'duration': int(parts[6]),
                'store_inst_count': store_ic,
                'load_inst_count': int(parts[8]) if len(parts) > 8 else None
            })
            delivered += 1
            if delivered >= limit:
                next_offset = offset + scanned
                break

        took_ms = int((time.time() - start_ts) * 1000)
        return {
            'items': items,
            'next_offset': next_offset if delivered >= limit else None,
            'scanned_lines': scanned,
            'took_ms': took_ms,
            'spill_file': os.path.basename(spill_log_path) if spill_log_path else None
        }

    def parse_spill_log(self, spill_log_path: str, max_events: int = 50000) -> List[Dict[str, Any]]:
        """Parse spill log file and return structured data (OPTIMIZED: limits to max_events for memory efficiency)
        
        Args:
            spill_log_path: Path to spill log file
            max_events: Maximum number of events to load (default: 50000 for memory efficiency)
        """
        spill_events = []
        
        try:
            if not os.path.exists(spill_log_path):
                logger.warning(f"Spill log file not found: {spill_log_path}")
                return spill_events
            
            logger.info(f"⚡ Optimized parsing: Loading up to {max_events} events for analysis")
            
            with open(spill_log_path, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    # Stop if we've reached the limit
                    if len(spill_events) >= max_events:
                        logger.info(f"⚠️ Reached max_events limit ({max_events}), stopping parse")
                        break
                    
                    line = line.strip()
                    
                    # Skip comments and empty lines
                    if not line or line.startswith('#'):
                        continue
                    
                    # Parse spill data
                    if line.startswith('SPILL,'):
                        parts = line.split(',')
                        if len(parts) >= 9:
                            try:
                                spill_event = {
                                    'store_pc': parts[1],
                                    'load_pc': parts[2],
                                    'memory_address': parts[3],
                                    'store_tick': int(parts[4]),
                                    'load_tick': int(parts[5]),
                                    'tick_diff': int(parts[6]),
                                    'store_inst_count': int(parts[7]),
                                    'load_inst_count': int(parts[8]),
                                    'line_number': line_num
                                }
                                spill_events.append(spill_event)
                            except (ValueError, IndexError) as e:
                                logger.warning(f"Error parsing line {line_num}: {e}")
                                continue
            
            logger.info(f"✅ Parsed {len(spill_events)} spill events from {spill_log_path}")
            return spill_events
            
        except Exception as e:
            logger.error(f"Error parsing spill log: {e}")
            return spill_events

    def get_spill_analysis_data(self) -> Dict[str, Any]:
        """Get comprehensive spill analysis data (OPTIMIZED for large datasets using streaming)"""
        try:
            import time
            start_time = time.time()
            
            # Look for spill stats file
            spill_log_path = self._find_spill_stats_file()
            
            if not spill_log_path or not os.path.exists(spill_log_path):
                return self._empty_spill_analysis()
            
            # Count total spills using streaming (fast)
            logger.info("⚡ Counting total spills using streaming...")
            total_spills = self._count_total_spills_streaming(spill_log_path)
            logger.info(f"📊 Total spills found: {total_spills:,}")
            
            # Decide strategy based on file size
            if total_spills > 100000:
                # Large dataset: Use reservoir sampling for statistics
                logger.info(f"⚡ Large dataset detected ({total_spills:,} spills). Using optimized sampling...")
                return self._get_spill_analysis_sampled(spill_log_path, total_spills)
            else:
                # Small dataset: Load all events
                logger.info(f"✅ Small dataset ({total_spills:,} spills). Loading all events...")
                spill_events = self.parse_spill_log(spill_log_path, max_events=total_spills)
                return self._get_spill_analysis_full(spill_events, spill_log_path, total_spills)
            
        except Exception as e:
            logger.error(f"Error generating spill analysis data: {e}")
            return self._empty_spill_analysis()
    
    def _count_total_spills_streaming(self, spill_log_path: str) -> int:
        """Count total spills by streaming through file (memory efficient)"""
        count = 0
        try:
            with open(spill_log_path, 'r') as f:
                for line in f:
                    if line.startswith('SPILL,'):
                        count += 1
        except Exception as e:
            logger.error(f"Error counting spills: {e}")
        return count
    
    def _empty_spill_analysis(self) -> Dict[str, Any]:
        """Return empty spill analysis structure"""
        return {
            'spill_count': 0,
            'architecture': 'Unknown',
            'spill_file': 'None',
            'statistics': {
                'total_spills': 0,
                'avg_spill_duration': 0,
                'unique_memory_addresses': 0,
                'unique_store_pcs': 0,
                'unique_load_pcs': 0,
                'max_spill_duration': 0,
                'min_spill_duration': 0
            },
            'charts': {}
        }
    
    def _get_spill_analysis_sampled(self, spill_log_path: str, total_spills: int) -> Dict[str, Any]:
        """Get spill analysis using reservoir sampling (optimized for large datasets)"""
        import random
        import time
        
        start_time = time.time()
        
        # Reservoir sampling parameters
        SAMPLE_SIZE = 10000  # Sample 10k events for analysis
        
        logger.info(f"⚡ Using reservoir sampling: {SAMPLE_SIZE:,} samples from {total_spills:,} spills")
        
        # Reservoir sampling for representative sample
        reservoir = []
        
        # Statistics accumulators (computed during streaming)
        duration_sum = 0
        duration_min = float('inf')
        duration_max = 0
        unique_memory_addrs = set()
        unique_store_pcs = set()
        unique_load_pcs = set()
        
        try:
            with open(spill_log_path, 'r') as f:
                idx = 0
                for line in f:
                    if not line.startswith('SPILL,'):
                        continue
                    
                    parts = line.strip().split(',')
                    if len(parts) < 9:
                        continue
                    
                    try:
                        tick_diff = int(parts[6])
                        duration_sum += tick_diff
                        duration_min = min(duration_min, tick_diff)
                        duration_max = max(duration_max, tick_diff)
                        
                        # Track ALL unique values (no sampling - process entire dataset)
                        # Sets automatically keep only unique values, memory efficient
                        unique_memory_addrs.add(parts[3])
                        unique_store_pcs.add(parts[1])
                        unique_load_pcs.add(parts[2])
                        
                        # Reservoir sampling for detailed analysis (only for charts)
                        event = {
                            'store_pc': parts[1],
                            'load_pc': parts[2],
                            'memory_address': parts[3],
                            'store_tick': int(parts[4]),
                            'load_tick': int(parts[5]),
                            'tick_diff': tick_diff,
                            'store_inst_count': int(parts[7]),
                            'load_inst_count': int(parts[8]),
                        }
                        
                        if len(reservoir) < SAMPLE_SIZE:
                            reservoir.append(event)
                        else:
                            # Reservoir sampling algorithm
                            j = random.randint(0, idx)
                            if j < SAMPLE_SIZE:
                                reservoir[j] = event
                        
                        idx += 1
                        
                        # Progress logging for large datasets
                        if idx % 1000000 == 0:
                            logger.info(f"⏳ Processed {idx:,} spills... (Unique: {len(unique_memory_addrs):,} addrs, {len(unique_store_pcs):,} store PCs, {len(unique_load_pcs):,} load PCs)")
                        
                    except (ValueError, IndexError):
                        continue
            
            elapsed = time.time() - start_time
            logger.info(f"✅ Processed {idx:,} events in {elapsed:.2f}s")
            logger.info(f"📊 Final unique counts: {len(unique_memory_addrs):,} memory addresses, {len(unique_store_pcs):,} store PCs, {len(unique_load_pcs):,} load PCs")
            
            # Calculate statistics
            avg_duration = duration_sum / total_spills if total_spills > 0 else 0
            
            # Detect architecture
            architecture = self._detect_architecture_from_filename(spill_log_path)
            
            # Generate lightweight charts from sample
            charts = self._generate_lightweight_charts(reservoir, total_spills)
            
            # Add unique memory addresses list to charts (sorted for better presentation)
            charts['unique_memory_addresses'] = {
                'title': 'All Unique Memory Addresses',
                'description': f'Complete list of all unique memory addresses used in spills ({len(unique_memory_addrs):,} total)',
                'addresses': sorted(list(unique_memory_addrs)),
                'count': len(unique_memory_addrs)
            }
            
            return {
                'spill_count': total_spills,
                'architecture': architecture,
                'spill_file': os.path.basename(spill_log_path),
                'sampled': True,
                'sample_size': len(reservoir),
                'statistics': {
                    'total_spills': total_spills,
                    'avg_spill_duration': round(avg_duration, 2),
                    'unique_memory_addresses': len(unique_memory_addrs),  # EXACT count from all data
                    'unique_store_pcs': len(unique_store_pcs),  # EXACT count from all data
                    'unique_load_pcs': len(unique_load_pcs),  # EXACT count from all data
                    'max_spill_duration': duration_max,
                    'min_spill_duration': duration_min if duration_min != float('inf') else 0
                },
                'charts': charts,
                'performance': {
                    'processing_time_seconds': round(elapsed, 2),
                    'spills_per_second': int(total_spills / elapsed) if elapsed > 0 else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error in sampled analysis: {e}")
            return self._empty_spill_analysis()
    
    def _get_spill_analysis_full(self, spill_events: List[Dict[str, Any]], spill_log_path: str, total_spills: int) -> Dict[str, Any]:
        """Get full spill analysis for smaller datasets"""
        if not spill_events:
            return self._empty_spill_analysis()
        
        # Calculate statistics
        avg_spill_duration = sum(event['tick_diff'] for event in spill_events) / len(spill_events)
        
        # Extract unique values (that is why we use sets to avoid duplicates)
        memory_addresses = set(event['memory_address'] for event in spill_events)
        store_pcs = set(event['store_pc'] for event in spill_events)
        load_pcs = set(event['load_pc'] for event in spill_events)
        
        # Detect architecture
        architecture = self._detect_architecture_from_filename(spill_log_path)
        
        # Generate charts (lightweight version still)
        charts = self._generate_lightweight_charts(spill_events, total_spills)
        
        # Add unique memory addresses list to charts (sorted for better presentation)
        charts['unique_memory_addresses'] = {
            'title': 'All Unique Memory Addresses',
            'description': f'Complete list of all unique memory addresses used in spills ({len(memory_addresses):,} total)',
            'addresses': sorted(list(memory_addresses)),
            'count': len(memory_addresses)
        }
        
        return {
            'spill_count': total_spills,
            'architecture': architecture,
            'spill_file': os.path.basename(spill_log_path),
            'sampled': False,
            'statistics': {
                'total_spills': total_spills,
                'avg_spill_duration': round(avg_spill_duration, 2),
                'unique_memory_addresses': len(memory_addresses),
                'unique_store_pcs': len(store_pcs),
                'unique_load_pcs': len(load_pcs),
                'max_spill_duration': max(event['tick_diff'] for event in spill_events),
                'min_spill_duration': min(event['tick_diff'] for event in spill_events)
            },
            'charts': charts
        }
    
    def _generate_lightweight_charts(self, spill_sample: List[Dict[str, Any]], total_spills: int) -> Dict[str, Any]:
        """Generate lightweight chart data from sample (optimized for performance)"""
        if not spill_sample:
            return {}
        
        # Limit sample size for chart generation
        MAX_CHART_POINTS = 1000
        if len(spill_sample) > MAX_CHART_POINTS:
            import random
            spill_sample = random.sample(spill_sample, MAX_CHART_POINTS)
            logger.info(f"📉 Reduced chart data to {MAX_CHART_POINTS} points for visualization")
        
        # 1. Duration distribution (histogram)
        durations = [event['tick_diff'] for event in spill_sample]
        duration_buckets = self._create_histogram_buckets(durations, 20)
        
        # 2. Simple scatter plot data
        scatter_data = []
        for i, event in enumerate(spill_sample):
            scatter_data.append({
                'id': f"spill_{i}",
                'duration': event['tick_diff'],
                'store_inst': event['store_inst_count'],
                'load_inst': event['load_inst_count'],
                'pc': event['store_pc'],
                'memory_address': event['memory_address']
            })
        
        # 3. PC pattern analysis (top patterns only)
        pc_patterns = self._analyze_pc_patterns(spill_sample)
        
        return {
            'spill_duration_distribution': {
                'title': 'Spill Duration Distribution',
                'description': f'Distribution of spill durations (sample of {len(spill_sample):,} from {total_spills:,})',
                'buckets': duration_buckets,
                'total_spills': total_spills,
                'sample_size': len(spill_sample),
                'avg_duration': sum(durations) / len(durations) if durations else 0,
                'min_duration': min(durations) if durations else 0,
                'max_duration': max(durations) if durations else 0
            },
            'scatter_plot_data': {
                'title': 'Spill Impact Analysis',
                'description': f'Scatter plot showing spill patterns (sample of {len(scatter_data):,})',
                'data': scatter_data,
                'total_points': len(scatter_data)
            },
            'pc_pattern_analysis': {
                'title': 'PC Pattern Analysis',
                'description': 'Most frequent spill locations',
                'patterns': pc_patterns,
                'sample_size': len(spill_sample)
            }
        }
    def _generate_detailed_charts(self, spill_events, total_instructions, total_cycles):
        """Generate detailed chart data for meaningful visualizations"""
        if not spill_events:
            return {}
        
        # 1. Spill Duration Distribution (Histogram)
        durations = [event['tick_diff'] for event in spill_events]
        duration_buckets = self._create_histogram_buckets(durations, 20)
        
        # 2. Memory Address Distribution (Sample for visualization)
        memory_addresses = [event['memory_address'] for event in spill_events]
        address_distribution = self._analyze_memory_address_distribution(memory_addresses)
        
        # 3. Instruction Distance Analysis (Store to Load distance)
        instruction_distances = [event['load_inst_count'] - event['store_inst_count'] for event in spill_events]
        distance_buckets = self._create_histogram_buckets(instruction_distances, 15)
        
        # 4. PC Pattern Analysis (Most frequent spill locations)
        pc_patterns = self._analyze_pc_patterns(spill_events)
        
        # 5. Timeline Analysis (Spill distribution over time)
        timeline_data = self._analyze_spill_timeline(spill_events)
        
        # Generate scatter plot data
        scatter_data = self._generate_scatter_plot_data(spill_events)
        
        return {
            'spill_duration_distribution': {
                'title': 'Spill Duration Distribution',
                'description': 'Distribution of spill durations (ticks)',
                'buckets': duration_buckets,
                'total_spills': len(spill_events),
                'avg_duration': sum(durations) / len(durations),
                'min_duration': min(durations),
                'max_duration': max(durations)
            },
            'memory_address_distribution': {
                'title': 'Memory Address Distribution',
                'description': 'Distribution of spill memory addresses',
                'data': address_distribution,
                'unique_addresses': len(set(memory_addresses)),
                'total_spills': len(spill_events)
            },
            'instruction_distance_analysis': {
                'title': 'Instruction Distance Analysis',
                'description': 'Distance between store and load instructions',
                'buckets': distance_buckets,
                'avg_distance': sum(instruction_distances) / len(instruction_distances),
                'min_distance': min(instruction_distances),
                'max_distance': max(instruction_distances)
            },
            'pc_pattern_analysis': {
                'title': 'PC Pattern Analysis',
                'description': 'Most frequent spill locations',
                'patterns': pc_patterns,
                'total_unique_pcs': len(set([event['store_pc'] for event in spill_events]))
            },
            'timeline_analysis': {
                'title': 'Spill Timeline Analysis',
                'description': 'Spill distribution over simulation time',
                'data': timeline_data,
                'total_time_span': max([event['load_tick'] for event in spill_events]) - min([event['store_tick'] for event in spill_events])
            },
            'scatter_plot_data': {
                'title': 'Spill Impact Scatter Plot',
                'description': 'Spill duration vs memory address with impact levels',
                'data': scatter_data,
                'total_points': len(scatter_data)
            }
        }
    
    def _generate_scatter_plot_data(self, spill_events):
        """Generate scatter plot data with impact levels"""
        if not spill_events:
            return []
        
        scatter_data = []
        durations = [event['tick_diff'] for event in spill_events]
        avg_duration = sum(durations) / len(durations)
        max_duration = max(durations)
        
        # Get time range for normalization
        store_times = [event['store_tick'] for event in spill_events]
        min_time = min(store_times)
        max_time = max(store_times)
        
        for i, event in enumerate(spill_events):
            duration = event['tick_diff']
            store_time = event['store_tick']
            
            # Normalize time to 0-1000 range for better visualization
            normalized_time = ((store_time - min_time) / (max_time - min_time)) * 1000
            
            # Determine impact level based on duration and other factors
            if duration > max_duration * 0.8:
                impact_level = 'critical'
            elif duration > avg_duration * 1.5:
                impact_level = 'high-impact'
            elif duration > avg_duration:
                impact_level = 'medium-impact'
            elif duration > avg_duration * 0.5:
                impact_level = 'low-impact'
            else:
                impact_level = 'normal'
            
            # Spread spill events more evenly across Y-axis with larger spacing
            # Use modulo to create multiple "rows" of events with more space
            y_position = (i % 10) * 100 + (i // 10) * 5
            
            scatter_data.append({
                'id': f"{i+1:09d}",  # Unique ID starting from 000000001
                'duration': normalized_time,  # X-axis: time
                'memory_address': y_position,  # Y-axis: spread spill event index
                'pc': event['store_pc'],
                'load_pc': event['load_pc'],
                'store_pc': event['store_pc'],
                'impact_level': impact_level,
                'store_tick': store_time,
                'tick_diff': duration
            })
        
        # Return all spill events (no sampling)
        # if len(scatter_data) > 1000:
        #     import random
        #     scatter_data = random.sample(scatter_data, 1000)
        
        return scatter_data
    
    def _create_histogram_buckets(self, data, num_buckets):
        """Create histogram buckets for data visualization"""
        if not data:
            return []
        
        min_val = min(data)
        max_val = max(data)
        bucket_size = (max_val - min_val) / num_buckets if max_val > min_val else 1
        
        buckets = []
        for i in range(num_buckets):
            bucket_start = min_val + i * bucket_size
            bucket_end = min_val + (i + 1) * bucket_size
            count = sum(1 for val in data if bucket_start <= val < bucket_end)
            
            buckets.append({
                'range': f"{int(bucket_start):,} - {int(bucket_end):,}",
                'count': count,
                'percentage': (count / len(data)) * 100,
                'start': bucket_start,
                'end': bucket_end
            })
        
        return buckets
    
    def _analyze_memory_address_distribution(self, memory_addresses):
        """Analyze memory address distribution"""
        # Convert hex addresses to integers for analysis
        int_addresses = [int(addr, 16) for addr in memory_addresses]
        
        # Group addresses by ranges
        min_addr = min(int_addresses)
        max_addr = max(int_addresses)
        range_size = (max_addr - min_addr) // 10  # 10 ranges
        
        ranges = []
        for i in range(10):
            start = min_addr + i * range_size
            end = min_addr + (i + 1) * range_size
            count = sum(1 for addr in int_addresses if start <= addr < end)
            
            ranges.append({
                'range': f"0x{start:x} - 0x{end:x}",
                'count': count,
                'percentage': (count / len(memory_addresses)) * 100,
                'start': start,
                'end': end
            })
        
        return ranges
    
    def _analyze_pc_patterns(self, spill_events):
        """Analyze PC patterns for spill locations"""
        store_pc_counts = {}
        load_pc_counts = {}
        
        for event in spill_events:
            store_pc = event['store_pc']
            load_pc = event['load_pc']
            
            store_pc_counts[store_pc] = store_pc_counts.get(store_pc, 0) + 1
            load_pc_counts[load_pc] = load_pc_counts.get(load_pc, 0) + 1
        
        # Get top 10 most frequent PCs
        top_store_pcs = sorted(store_pc_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        top_load_pcs = sorted(load_pc_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'top_store_pcs': [{'pc': pc, 'count': count} for pc, count in top_store_pcs],
            'top_load_pcs': [{'pc': pc, 'count': count} for pc, count in top_load_pcs]
        }
    
    def _analyze_spill_timeline(self, spill_events):
        """Analyze spill distribution over time"""
        # Group spills by time windows
        store_times = [event['store_tick'] for event in spill_events]
        min_time = min(store_times)
        max_time = max(store_times)
        time_window = (max_time - min_time) // 20  # 20 time windows
        
        timeline = []
        for i in range(20):
            window_start = min_time + i * time_window
            window_end = min_time + (i + 1) * time_window
            count = sum(1 for time in store_times if window_start <= time < window_end)
            
            timeline.append({
                'time_window': f"{int(window_start):,} - {int(window_end):,}",
                'count': count,
                'start_time': window_start,
                'end_time': window_end
            })
        
        return timeline

    def _get_heatmap_color(self, value: int, max_value: int) -> str:
        """Get color for heatmap based on value intensity"""
        if max_value == 0:
            return '#f3f4f6'
        
        intensity = value / max_value
        
        if intensity < 0.2:
            return '#dbeafe'  # Light blue
        elif intensity < 0.4:
            return '#93c5fd'  # Medium blue
        elif intensity < 0.6:
            return '#3b82f6'  # Blue
        elif intensity < 0.8:
            return '#1d4ed8'  # Dark blue
        else:
            return '#1e40af'  # Darker blue

    def get_scatter_plot_data(self) -> Dict[str, Any]:
        """Get scatter plot data for performance analysis"""
        try:
            # Get basic metrics
            cpi = self._get_stat_value('system.cpu.cpi', float) or 0
            ipc = self._get_stat_value('system.cpu.ipc', float) or 0
            total_instructions = self._get_stat_value('simInsts', int) or 0
            total_loads = self._get_stat_value('system.cpu.commitStats0.numLoadInsts', int) or 0
            total_stores = self._get_stat_value('system.cpu.commitStats0.numStoreInsts', int) or 0
            total_memory_refs = total_loads + total_stores
            
            # Calculate memory reference percentage
            memory_ref_percentage = (total_memory_refs / total_instructions * 100) if total_instructions > 0 else 0
            
            # Get cache metrics
            dtlb_hits = self._get_stat_value('system.cpu.mmu.dtb.hits', int) or 0
            dtlb_misses = self._get_stat_value('system.cpu.mmu.dtb.misses', int) or 0
            dtlb_total = dtlb_hits + dtlb_misses
            dtlb_miss_rate = (dtlb_misses / dtlb_total * 100) if dtlb_total > 0 else 0
            
            itlb_hits = self._get_stat_value('system.cpu.mmu.itb.hits', int) or 0
            itlb_misses = self._get_stat_value('system.cpu.mmu.itb.misses', int) or 0
            itlb_total = itlb_hits + itlb_misses
            itlb_miss_rate = (itlb_misses / itlb_total * 100) if itlb_total > 0 else 0
            
            # Get memory controller data
            read_reqs = self._get_stat_value('system.mem_ctrls.readReqs', int) or 0
            write_reqs = self._get_stat_value('system.mem_ctrls.writeReqs', int) or 0
            total_mem_reqs = read_reqs + write_reqs
            
            # Calculate memory bandwidth (simplified)
            memory_bandwidth = total_mem_reqs / (self._get_stat_value('simSeconds', float) or 1)
            
            # Get instruction type data for grouping
            int_insts = self._get_stat_value('system.cpu.commitStats0.numIntInsts', int) or 0
            fp_insts = self._get_stat_value('system.cpu.commitStats0.numFpInsts', int) or 0
            vec_insts = self._get_stat_value('system.cpu.commitStats0.numVecInsts', int) or 0
            
            # Create scatter plot data
            scatter_data = {
                'memory_performance': {
                    'title': 'Memory Access vs Performance',
                    'x_label': 'Memory Reference Percentage (%)',
                    'y_label': 'CPI (Cycles Per Instruction)',
                    'description': 'Relationship between memory access intensity and performance',
                    'data': [
                        {
                            'x': memory_ref_percentage,
                            'y': cpi,
                            'group': 'Overall',
                            'color': '#3b82f6',
                            'size': 20,
                            'details': {
                                'loads': total_loads,
                                'stores': total_stores,
                                'total_refs': total_memory_refs,
                                'instructions': total_instructions
                            }
                        },
                        {
                            'x': (total_loads / total_instructions * 100) if total_instructions > 0 else 0,
                            'y': cpi,
                            'group': 'Load Operations',
                            'color': '#10b981',
                            'size': 15,
                            'details': {
                                'load_instructions': total_loads,
                                'load_percentage': (total_loads / total_instructions * 100) if total_instructions > 0 else 0
                            }
                        },
                        {
                            'x': (total_stores / total_instructions * 100) if total_instructions > 0 else 0,
                            'y': cpi,
                            'group': 'Store Operations',
                            'color': '#f59e0b',
                            'size': 15,
                            'details': {
                                'store_instructions': total_stores,
                                'store_percentage': (total_stores / total_instructions * 100) if total_instructions > 0 else 0
                            }
                        }
                    ]
                },
                'cache_performance': {
                    'title': 'Cache Performance vs Memory Intensity',
                    'x_label': 'Cache Miss Rate (%)',
                    'y_label': 'Memory Bandwidth (Requests/sec)',
                    'description': 'Relationship between cache efficiency and memory bandwidth usage',
                    'data': [
                        {
                            'x': dtlb_miss_rate,
                            'y': memory_bandwidth,
                            'group': 'DTLB',
                            'color': '#ef4444',
                            'size': 18,
                            'details': {
                                'dtlb_hits': dtlb_hits,
                                'dtlb_misses': dtlb_misses,
                                'dtlb_total': dtlb_total,
                                'hit_rate': (dtlb_hits / dtlb_total * 100) if dtlb_total > 0 else 0
                            }
                        },
                        {
                            'x': itlb_miss_rate,
                            'y': memory_bandwidth,
                            'group': 'ITLB',
                            'color': '#8b5cf6',
                            'size': 18,
                            'details': {
                                'itlb_hits': itlb_hits,
                                'itlb_misses': itlb_misses,
                                'itlb_total': itlb_total,
                                'hit_rate': (itlb_hits / itlb_total * 100) if itlb_total > 0 else 0
                            }
                        },
                        {
                            'x': (dtlb_miss_rate + itlb_miss_rate) / 2,
                            'y': memory_bandwidth,
                            'group': 'Combined TLB',
                            'color': '#06b6d4',
                            'size': 20,
                            'details': {
                                'avg_miss_rate': (dtlb_miss_rate + itlb_miss_rate) / 2,
                                'total_tlb_accesses': dtlb_total + itlb_total
                            }
                        }
                    ]
                },
                'instruction_performance': {
                    'title': 'Instruction Types vs Performance',
                    'x_label': 'Instruction Count',
                    'y_label': 'CPI (Cycles Per Instruction)',
                    'description': 'Performance impact of different instruction types',
                    'data': [
                        {
                            'x': int_insts,
                            'y': cpi,
                            'group': 'Integer Instructions',
                            'color': '#3b82f6',
                            'size': 16,
                            'details': {
                                'instruction_type': 'Integer',
                                'count': int_insts,
                                'percentage': (int_insts / total_instructions * 100) if total_instructions > 0 else 0
                            }
                        },
                        {
                            'x': fp_insts,
                            'y': cpi,
                            'group': 'Float Instructions',
                            'color': '#10b981',
                            'size': 16,
                            'details': {
                                'instruction_type': 'Float',
                                'count': fp_insts,
                                'percentage': (fp_insts / total_instructions * 100) if total_instructions > 0 else 0
                            }
                        },
                        {
                            'x': vec_insts,
                            'y': cpi,
                            'group': 'Vector Instructions',
                            'color': '#f59e0b',
                            'size': 16,
                            'details': {
                                'instruction_type': 'Vector',
                                'count': vec_insts,
                                'percentage': (vec_insts / total_instructions * 100) if total_instructions > 0 else 0
                            }
                        }
                    ]
                }
            }
            
            return scatter_data
            
        except Exception as e:
            logger.error(f"Error generating scatter plot data: {e}")
            return {
                'memory_performance': {'title': 'Memory Access vs Performance', 'data': []},
                'cache_performance': {'title': 'Cache Performance vs Memory Intensity', 'data': []},
                'instruction_performance': {'title': 'Instruction Types vs Performance', 'data': []}
            }

    def _get_stat_value(self, key: str, value_type: type = str) -> Any:
        """Get a stat value with type conversion"""
        if key in self.stats_data:
            try:
                return value_type(self.stats_data[key])
            except (ValueError, TypeError):
                return None
        return None
