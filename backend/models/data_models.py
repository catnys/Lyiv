#!/usr/bin/env python3
"""
📋 Data Models 📋
=================

Data models and schemas for the gem5 analyzer.
"""

from dataclasses import dataclass
from typing import Dict, List, Any, Optional
from datetime import datetime

@dataclass
class SpillRecord:
    """Model for a single spill record"""
    store_pc: str
    load_pc: str
    memory_address: str
    store_tick: int
    load_tick: int
    tick_diff: int
    store_inst_count: int
    load_inst_count: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'store_pc': self.store_pc,
            'load_pc': self.load_pc,
            'memory_address': self.memory_address,
            'store_tick': self.store_tick,
            'load_tick': self.load_tick,
            'tick_diff': self.tick_diff,
            'store_inst_count': self.store_inst_count,
            'load_inst_count': self.load_inst_count,
            'tick_diff_formatted': f"{self.tick_diff:,}",
            'store_inst_formatted': f"{self.store_inst_count:,}",
            'load_inst_formatted': f"{self.load_inst_count:,}"
        }

@dataclass
class PerformanceMetric:
    """Model for a performance metric"""
    name: str
    value: str
    description: str
    unit: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'value': self.value,
            'description': self.description,
            'unit': self.unit
        }

@dataclass
class OverviewMetrics:
    """Model for overview metrics"""
    total_instructions: Optional[int] = None
    total_cycles: Optional[int] = None
    ipc: Optional[float] = None
    cpi: Optional[float] = None
    load_instructions: Optional[int] = None
    store_instructions: Optional[int] = None
    total_spills: Optional[int] = None
    avg_tick_diff: Optional[float] = None
    max_tick_diff: Optional[int] = None
    min_tick_diff: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'total_instructions': self.total_instructions,
            'total_cycles': self.total_cycles,
            'ipc': self.ipc,
            'cpi': self.cpi,
            'load_instructions': self.load_instructions,
            'store_instructions': self.store_instructions,
            'total_spills': self.total_spills,
            'avg_tick_diff': self.avg_tick_diff,
            'max_tick_diff': self.max_tick_diff,
            'min_tick_diff': self.min_tick_diff
        }

@dataclass
class SystemStatus:
    """Model for system status"""
    stats_loaded: bool
    spill_data_loaded: bool
    config_loaded: bool
    stats_count: int
    spill_count: int
    m5out_path: str
    m5out_exists: bool
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'stats_loaded': self.stats_loaded,
            'spill_data_loaded': self.spill_data_loaded,
            'config_loaded': self.config_loaded,
            'stats_count': self.stats_count,
            'spill_count': self.spill_count,
            'm5out_path': self.m5out_path,
            'm5out_exists': self.m5out_exists
        }

@dataclass
class InstructionMix:
    """Model for instruction mix data"""
    instruction_types: Dict[str, int]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return self.instruction_types

@dataclass
class VisualizationData:
    """Model for visualization data"""
    x: List[Any]
    y: List[Any]
    colors: Optional[List[Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = {
            'x': self.x,
            'y': self.y
        }
        if self.colors:
            result['colors'] = self.colors
        return result
