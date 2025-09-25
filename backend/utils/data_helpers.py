#!/usr/bin/env python3
"""
🔧 Gem5 Helper Methods 🔧
=========================

Helper methods for extracting and processing gem5 data for frontend consumption.
These methods provide clean, structured data for the React frontend.
"""

import pandas as pd
import numpy as np
import json
import os
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Gem5DataHelpers:
    """Helper methods for gem5 data extraction and processing"""
    
    def __init__(self, m5out_path: str = None):
        self.m5out_path = m5out_path or "/Users/catnys/Documents/Academia/register_spilling/Lyiv/m5out"
        self.stats_data = {}
        self.spill_data = pd.DataFrame()
        self.config_data = {}
        
    def load_data_from_m5out(self) -> bool:
        """Load all data from m5out directory"""
        try:
            # Load stats.txt
            stats_file = os.path.join(self.m5out_path, "stats.txt")
            if os.path.exists(stats_file):
                self._parse_stats_file(stats_file)
                logger.info("✅ Stats data loaded from m5out")
            
            # Load x86_spill_stats.txt
            spill_file = os.path.join(self.m5out_path, "x86_spill_stats.txt")
            if os.path.exists(spill_file):
                self._parse_spill_file(spill_file)
                logger.info("✅ Spill data loaded from m5out")
            
            # Load config.json
            config_file = os.path.join(self.m5out_path, "config.json")
            if os.path.exists(config_file):
                self._parse_config_file(config_file)
                logger.info("✅ Config data loaded from m5out")
                
            return True
        except Exception as e:
            logger.error(f"❌ Error loading data from m5out: {e}")
            return False
    
    def _parse_stats_file(self, file_path: str) -> None:
        """Parse stats.txt file"""
        self.stats_data = {}
        
        try:
            with open(file_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        parts = line.split('#')
                        if len(parts) >= 1:
                            name_value = parts[0].strip()
                            description = parts[1].strip() if len(parts) > 1 else ""
                            
                            name_value_parts = name_value.split()
                            if len(name_value_parts) >= 2:
                                name = name_value_parts[0]
                                value = name_value_parts[1]
                                
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
            
    def _parse_spill_file(self, file_path: str) -> None:
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
            
    def _parse_config_file(self, file_path: str) -> None:
        """Parse config.json file"""
        try:
            with open(file_path, 'r') as f:
                self.config_data = json.load(f)
        except Exception as e:
            logger.error(f"Error parsing config file: {e}")
    
    # ==================== FRONTEND DATA HELPERS ====================
    
    def get_frontend_overview_data(self) -> Dict[str, Any]:
        """Get overview data formatted for frontend"""
        return {
            'total_instructions': self._get_stat_value('system.cpu.commitStats0.numInsts', int),
            'total_cycles': self._get_stat_value('system.cpu.numCycles', int),
            'ipc': self._get_stat_value('system.cpu.ipc', float),
            'cpi': self._get_stat_value('system.cpu.cpi', float),
            'load_instructions': self._get_stat_value('system.cpu.commitStats0.numLoadInsts', int),
            'store_instructions': self._get_stat_value('system.cpu.commitStats0.numStoreInsts', int),
            'total_spills': len(self.spill_data) if not self.spill_data.empty else 0,
            'avg_tick_diff': float(self.spill_data['tick_diff'].mean()) if not self.spill_data.empty else 0,
            'max_tick_diff': int(self.spill_data['tick_diff'].max()) if not self.spill_data.empty else 0,
            'min_tick_diff': int(self.spill_data['tick_diff'].min()) if not self.spill_data.empty else 0
        }
    
    def get_frontend_performance_data(self) -> List[Dict[str, Any]]:
        """Get performance data formatted for frontend"""
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
    
    def get_frontend_instruction_mix(self) -> Dict[str, int]:
        """Get instruction mix data formatted for frontend"""
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
    
    def get_frontend_spill_data(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get spill data formatted for frontend"""
        if self.spill_data.empty:
            return []
        
        spill_list = self.spill_data.head(limit).to_dict('records')
        
        # Add formatted fields for frontend
        for spill in spill_list:
            spill['tick_diff_formatted'] = f"{spill['tick_diff']:,}"
            spill['store_inst_formatted'] = f"{spill['store_inst_count']:,}"
            spill['load_inst_formatted'] = f"{spill['load_inst_count']:,}"
        
        return spill_list
    
    def get_frontend_spill_timeline_data(self) -> Dict[str, List]:
        """Get spill timeline data for frontend charts"""
        if self.spill_data.empty:
            return {'x': [], 'y': [], 'colors': []}
        
        # Sample data for performance (limit to 1000 points)
        sample_data = self.spill_data.sample(min(1000, len(self.spill_data)))
        
        return {
            'x': sample_data['store_inst_count'].tolist(),
            'y': sample_data['tick_diff'].tolist(),
            'colors': sample_data['tick_diff'].tolist()
        }
    
    def get_frontend_spill_heatmap_data(self) -> Dict[str, List]:
        """Get spill heatmap data for frontend charts"""
        if self.spill_data.empty:
            return {'addresses': [], 'counts': []}
        
        # Get last 4 characters of memory addresses
        addresses = self.spill_data['memory_address'].str[-4:]
        address_counts = addresses.value_counts().head(20)
        
        return {
            'addresses': address_counts.index.tolist(),
            'counts': address_counts.values.tolist()
        }
    
    def get_frontend_memory_data(self) -> List[Dict[str, Any]]:
        """Get memory system data formatted for frontend"""
        memory_metrics = [
            'system.mem_ctrls.readReqs',
            'system.mem_ctrls.writeReqs',
            'system.mem_ctrls.readBursts',
            'system.mem_ctrls.writeBursts',
            'system.mem_ctrls.avgRdQLen',
            'system.mem_ctrls.avgWrQLen'
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
    
    def get_frontend_system_status(self) -> Dict[str, Any]:
        """Get system status formatted for frontend"""
        return {
            'stats_loaded': len(self.stats_data) > 0,
            'spill_data_loaded': not self.spill_data.empty,
            'config_loaded': len(self.config_data) > 0,
            'stats_count': len(self.stats_data),
            'spill_count': len(self.spill_data),
            'm5out_path': self.m5out_path,
            'm5out_exists': os.path.exists(self.m5out_path),
            'last_updated': datetime.now().isoformat()
        }
    
    # ==================== UTILITY METHODS ====================
    
    def _get_stat_value(self, key: str, value_type: type = str) -> Any:
        """Get a stat value with type conversion"""
        if key in self.stats_data:
            try:
                return value_type(self.stats_data[key]['value'])
            except (ValueError, TypeError):
                return None
        return None
    
    def reload_data_from_m5out(self) -> bool:
        """Reload all data from m5out directory"""
        logger.info("🔄 Reloading data from m5out...")
        return self.load_data_from_m5out()
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get a summary of loaded data"""
        return {
            'stats_count': len(self.stats_data),
            'spill_count': len(self.spill_data),
            'config_keys': len(self.config_data),
            'm5out_path': self.m5out_path,
            'files_exist': {
                'stats.txt': os.path.exists(os.path.join(self.m5out_path, 'stats.txt')),
                'x86_spill_stats.txt': os.path.exists(os.path.join(self.m5out_path, 'x86_spill_stats.txt')),
                'config.json': os.path.exists(os.path.join(self.m5out_path, 'config.json'))
            }
        }

    def get_basic_metrics(self) -> Dict[str, Any]:
        """Get basic metrics for simple frontend"""
        try:
            # Extract basic metrics from stats
            total_instructions = self.stats_data.get('simInsts', {}).get('value', '0')
            total_ticks = self.stats_data.get('simTicks', {}).get('value', '0')
            total_loads = self.stats_data.get('system.cpu.commitStats0.numLoadInsts', {}).get('value', '0')
            total_stores = self.stats_data.get('system.cpu.commitStats0.numStoreInsts', {}).get('value', '0')
            
            # Extract spill data - count lines that start with "SPILL"
            total_spills = len(self.spill_data) if not self.spill_data.empty else 0
            
            # Convert strings to numbers
            total_instructions = int(float(total_instructions))
            total_ticks = int(float(total_ticks))
            total_loads = int(float(total_loads))
            total_stores = int(float(total_stores))
            
            # Calculate percentages
            load_percentage = (total_loads / total_instructions * 100) if total_instructions > 0 else 0
            store_percentage = (total_stores / total_instructions * 100) if total_instructions > 0 else 0
            spill_percentage = (total_spills / total_instructions * 100) if total_instructions > 0 else 0
            
            return {
                'total_instructions': total_instructions,
                'total_ticks': total_ticks,
                'total_loads': total_loads,
                'total_stores': total_stores,
                'total_spills': int(total_spills),
                'load_percentage': float(load_percentage),
                'store_percentage': float(store_percentage),
                'spill_percentage': float(spill_percentage)
            }
        except Exception as e:
            logger.error(f"Error getting basic metrics: {e}")
            return {
                'total_instructions': 0,
                'total_ticks': 0,
                'total_loads': 0,
                'total_stores': 0,
                'total_spills': 0,
                'load_percentage': 0.0,
                'store_percentage': 0.0,
                'spill_percentage': 0.0
            }
