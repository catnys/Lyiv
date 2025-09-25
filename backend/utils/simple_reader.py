#!/usr/bin/env python3
"""
📊 Simple Gem5 Data Reader 📊
============================

Simple data reader for basic gem5 metrics without complex analysis.
"""

import os
import pandas as pd
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class SimpleGem5Reader:
    """Simple reader for basic gem5 metrics"""
    
    def __init__(self, m5out_path: str):
        self.m5out_path = m5out_path
        self.stats_data = {}
        self.spill_data = []
        
    def read_all_data(self) -> bool:
        """Read all data from m5out directory"""
        try:
            # Read stats.txt
            stats_file = os.path.join(self.m5out_path, "stats.txt")
            if os.path.exists(stats_file):
                self._read_stats_file(stats_file)
                logger.info("✅ Stats data read successfully")
            
            # Read x86_spill_stats.txt
            spill_file = os.path.join(self.m5out_path, "x86_spill_stats.txt")
            if os.path.exists(spill_file):
                self._read_spill_file(spill_file)
                logger.info("✅ Spill data read successfully")
                
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
    
    def _read_spill_file(self, file_path: str) -> None:
        """Read x86_spill_stats.txt file"""
        self.spill_data = []
        
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('SPILL,'):
                        parts = line.split(',')
                        if len(parts) >= 9:
                            spill_record = {
                                'store_pc': parts[1],
                                'load_pc': parts[2],
                                'memory_address': parts[3],
                                'store_tick': int(parts[4]),
                                'load_tick': int(parts[5]),
                                'tick_diff': int(parts[6]),
                                'store_inst_count': int(parts[7]),
                                'load_inst_count': int(parts[8])
                            }
                            self.spill_data.append(spill_record)
        except Exception as e:
            logger.error(f"Error reading spill file: {e}")
    
    def get_basic_metrics(self) -> Dict[str, Any]:
        """Get basic metrics for frontend"""
        metrics = {}
        
        # Total instructions
        total_insts = self._get_stat_value('system.cpu.commitStats0.numInsts', int)
        metrics['total_instructions'] = total_insts or 0
        
        # Total ticks
        total_ticks = self._get_stat_value('simTicks', int)
        metrics['total_ticks'] = total_ticks or 0
        
        # Total loads
        total_loads = self._get_stat_value('system.cpu.commitStats0.numLoadInsts', int)
        metrics['total_loads'] = total_loads or 0
        
        # Total stores
        total_stores = self._get_stat_value('system.cpu.commitStats0.numStoreInsts', int)
        metrics['total_stores'] = total_stores or 0
        
        # Total spills
        total_spills = len(self.spill_data)
        metrics['total_spills'] = total_spills
        
        # Calculate percentages
        if total_insts and total_insts > 0:
            metrics['spill_percentage'] = (total_spills / total_insts) * 100
            metrics['load_percentage'] = (total_loads / total_insts) * 100
            metrics['store_percentage'] = (total_stores / total_insts) * 100
        else:
            metrics['spill_percentage'] = 0
            metrics['load_percentage'] = 0
            metrics['store_percentage'] = 0
        
        return metrics
    
    def _get_stat_value(self, key: str, value_type: type = str) -> Any:
        """Get a stat value with type conversion"""
        if key in self.stats_data:
            try:
                return value_type(self.stats_data[key])
            except (ValueError, TypeError):
                return None
        return None
