#!/usr/bin/env python3
"""
📊 Gem5 Data Processing Utilities 📊
==================================

Helper functions for processing and analyzing gem5 simulation data.
"""

import pandas as pd
import numpy as np
import json
import os
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Gem5DataProcessor:
    """Process and analyze gem5 simulation data"""
    
    def __init__(self, m5out_path: str = None):
        self.m5out_path = m5out_path or "/Users/catnys/Documents/Academia/register_spilling/Lyiv/m5out"
        self.stats_data = {}
        self.spill_data = pd.DataFrame()
        self.config_data = {}
        
    def load_all_data(self) -> bool:
        """Load all available gem5 data"""
        try:
            # Load stats.txt
            stats_file = os.path.join(self.m5out_path, "stats.txt")
            if os.path.exists(stats_file):
                self.parse_stats_file(stats_file)
                logger.info("✅ Stats data loaded")
            
            # Load x86_spill_stats.txt
            spill_file = os.path.join(self.m5out_path, "x86_spill_stats.txt")
            if os.path.exists(spill_file):
                self.parse_spill_file(spill_file)
                logger.info("✅ Spill data loaded")
            
            # Load config.json
            config_file = os.path.join(self.m5out_path, "config.json")
            if os.path.exists(config_file):
                self.parse_config_file(config_file)
                logger.info("✅ Config data loaded")
                
            return True
        except Exception as e:
            logger.error(f"❌ Error loading data: {e}")
            return False
    
    def parse_stats_file(self, file_path: str) -> None:
        """Parse stats.txt file"""
        self.stats_data = {}
        
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Parse format: name value # description (unit)
                        parts = line.split('#')
                        if len(parts) >= 1:
                            name_value = parts[0].strip()
                            description = parts[1].strip() if len(parts) > 1 else ""
                            
                            # Extract name and value
                            name_value_parts = name_value.split()
                            if len(name_value_parts) >= 2:
                                name = name_value_parts[0]
                                value = name_value_parts[1]
                                
                                # Extract unit from description
                                unit = ""
                                if '(' in description and ')' in description:
                                    unit = description.split('(')[-1].split(')')[0]
                                    
                                self.stats_data[name] = {
                                    'value': value,
                                    'description': description,
                                    'unit': unit
                                }
        except Exception as e:
            logger.error(f"Error parsing stats file: {e}")
            
    def parse_spill_file(self, file_path: str) -> None:
        """Parse x86_spill_stats.txt file"""
        spill_data = []
        
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('SPILL,'):
                        parts = line.split(',')
                        if len(parts) >= 9:
                            spill_data.append({
                                'store_pc': parts[1],
                                'load_pc': parts[2],
                                'memory_address': parts[3],
                                'store_tick': int(parts[4]),
                                'load_tick': int(parts[5]),
                                'tick_diff': int(parts[6]),
                                'store_inst_count': int(parts[7]),
                                'load_inst_count': int(parts[8])
                            })
                            
            self.spill_data = pd.DataFrame(spill_data)
        except Exception as e:
            logger.error(f"Error parsing spill file: {e}")
            
    def parse_config_file(self, file_path: str) -> None:
        """Parse config.json file"""
        try:
            with open(file_path, 'r') as f:
                self.config_data = json.load(f)
        except Exception as e:
            logger.error(f"Error parsing config file: {e}")
    
    def get_overview_metrics(self) -> Dict[str, Any]:
        """Get key overview metrics"""
        metrics = {}
        
        # CPU metrics
        if 'system.cpu.commitStats0.numInsts' in self.stats_data:
            metrics['total_instructions'] = int(self.stats_data['system.cpu.commitStats0.numInsts']['value'])
        
        if 'system.cpu.numCycles' in self.stats_data:
            metrics['total_cycles'] = int(self.stats_data['system.cpu.numCycles']['value'])
        
        if 'system.cpu.ipc' in self.stats_data:
            metrics['ipc'] = float(self.stats_data['system.cpu.ipc']['value'])
        
        if 'system.cpu.cpi' in self.stats_data:
            metrics['cpi'] = float(self.stats_data['system.cpu.cpi']['value'])
        
        if 'system.cpu.commitStats0.numLoadInsts' in self.stats_data:
            metrics['load_instructions'] = int(self.stats_data['system.cpu.commitStats0.numLoadInsts']['value'])
        
        if 'system.cpu.commitStats0.numStoreInsts' in self.stats_data:
            metrics['store_instructions'] = int(self.stats_data['system.cpu.commitStats0.numStoreInsts']['value'])
        
        # Spill metrics
        if not self.spill_data.empty:
            metrics['total_spills'] = len(self.spill_data)
            metrics['avg_tick_diff'] = float(self.spill_data['tick_diff'].mean())
            metrics['max_tick_diff'] = int(self.spill_data['tick_diff'].max())
            metrics['min_tick_diff'] = int(self.spill_data['tick_diff'].min())
        
        return metrics
    
    def get_performance_data(self) -> List[Dict[str, Any]]:
        """Get detailed performance data"""
        performance_metrics = [
            'system.cpu.commitStats0.numInsts',
            'system.cpu.numCycles',
            'system.cpu.ipc',
            'system.cpu.cpi',
            'system.cpu.commitStats0.numLoadInsts',
            'system.cpu.commitStats0.numStoreInsts',
            'system.cpu.commitStats0.numFpInsts',
            'system.cpu.commitStats0.numIntInsts',
            'system.cpu.commitStats0.numBranches',
            'system.cpu.commitStats0.numCallsReturns'
        ]
        
        data = []
        for metric in performance_metrics:
            if metric in self.stats_data:
                stat = self.stats_data[metric]
                data.append({
                    'name': metric,
                    'value': stat['value'],
                    'description': stat['description'],
                    'unit': stat['unit']
                })
        
        return data
    
    def get_instruction_mix(self) -> Dict[str, int]:
        """Get instruction type distribution"""
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
        
        return inst_types
    
    def get_spill_data(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get spill data for visualization"""
        if self.spill_data.empty:
            return []
        
        # Convert to list of dictionaries
        spill_list = self.spill_data.head(limit).to_dict('records')
        
        # Add some computed fields
        for spill in spill_list:
            spill['tick_diff_formatted'] = f"{spill['tick_diff']:,}"
            spill['store_inst_formatted'] = f"{spill['store_inst_count']:,}"
            spill['load_inst_formatted'] = f"{spill['load_inst_count']:,}"
        
        return spill_list
    
    def get_memory_data(self) -> List[Dict[str, Any]]:
        """Get memory system data"""
        memory_metrics = [
            'system.mem_ctrls.readReqs',
            'system.mem_ctrls.writeReqs',
            'system.mem_ctrls.readBursts',
            'system.mem_ctrls.writeBursts',
            'system.mem_ctrls.avgRdQLen',
            'system.mem_ctrls.avgWrQLen',
            'system.mem_ctrls.readBursts',
            'system.mem_ctrls.writeBursts'
        ]
        
        data = []
        for metric in memory_metrics:
            if metric in self.stats_data:
                stat = self.stats_data[metric]
                data.append({
                    'name': metric,
                    'value': stat['value'],
                    'description': stat['description'],
                    'unit': stat['unit']
                })
        
        return data
    
    def get_spill_timeline_data(self) -> Dict[str, List]:
        """Get data for spill timeline visualization"""
        if self.spill_data.empty:
            return {'x': [], 'y': [], 'colors': []}
        
        # Sample data for performance (limit to 1000 points)
        sample_data = self.spill_data.sample(min(1000, len(self.spill_data)))
        
        return {
            'x': sample_data['store_inst_count'].tolist(),
            'y': sample_data['tick_diff'].tolist(),
            'colors': sample_data['tick_diff'].tolist()
        }
    
    def get_spill_heatmap_data(self) -> Dict[str, List]:
        """Get data for spill heatmap"""
        if self.spill_data.empty:
            return {'addresses': [], 'counts': []}
        
        # Get last 4 characters of memory addresses
        addresses = self.spill_data['memory_address'].str[-4:]
        address_counts = addresses.value_counts().head(20)
        
        return {
            'addresses': address_counts.index.tolist(),
            'counts': address_counts.values.tolist()
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get system status information"""
        return {
            'stats_loaded': len(self.stats_data) > 0,
            'spill_data_loaded': not self.spill_data.empty,
            'config_loaded': len(self.config_data) > 0,
            'stats_count': len(self.stats_data),
            'spill_count': len(self.spill_data),
            'm5out_path': self.m5out_path,
            'm5out_exists': os.path.exists(self.m5out_path)
        }
