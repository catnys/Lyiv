#!/usr/bin/env python3
"""
🌐 Simple API Service 🌐
========================

Simple API service for basic gem5 metrics.
"""

from flask import Blueprint, jsonify
import logging
import os

from utils.simple_reader import SimpleGem5Reader
from utils.api_helpers import APIResponse, handle_exception

logger = logging.getLogger(__name__)

# Create Blueprint for simple API routes
simple_api_bp = Blueprint('simple_api', __name__, url_prefix='/api')

# Global simple reader instance
simple_reader = None

@simple_api_bp.route('/basic-metrics', methods=['GET'])
def get_basic_metrics():
    """Get basic gem5 metrics"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        metrics = simple_reader.get_basic_metrics()
        return jsonify(APIResponse.success(metrics, "Basic metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_basic_metrics")), 500

@simple_api_bp.route('/instruction-types', methods=['GET'])
def get_instruction_types():
    """Get instruction type distribution"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        instruction_types = simple_reader.get_instruction_types()
        return jsonify(APIResponse.success(instruction_types, "Instruction types retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_instruction_types")), 500

@simple_api_bp.route('/memory-system', methods=['GET'])
def get_memory_system():
    """Get memory system statistics"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        memory_system = simple_reader.get_memory_system_stats()
        return jsonify(APIResponse.success(memory_system, "Memory system stats retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_memory_system")), 500

@simple_api_bp.route('/efficiency-metrics', methods=['GET'])
def get_efficiency_metrics():
    """Get efficiency and performance metrics"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        efficiency_metrics = simple_reader.get_efficiency_metrics()
        return jsonify(APIResponse.success(efficiency_metrics, "Efficiency metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_efficiency_metrics")), 500

@simple_api_bp.route('/cache-metrics', methods=['GET'])
def get_cache_metrics():
    """Get cache hit/miss ratios and statistics"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        cache_metrics = simple_reader.get_cache_metrics()
        return jsonify(APIResponse.success(cache_metrics, "Cache metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_cache_metrics")), 500

@simple_api_bp.route('/performance-insights', methods=['GET'])
def get_performance_insights():
    """Get performance insights and recommendations"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        insights = simple_reader.get_performance_insights()
        return jsonify(APIResponse.success(insights, "Performance insights retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_performance_insights")), 500

@simple_api_bp.route('/advanced-simulation-metrics', methods=['GET'])
def get_advanced_simulation_metrics():
    """Get advanced simulation metrics and analysis"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        metrics = simple_reader.get_advanced_simulation_metrics()
        return jsonify(APIResponse.success(metrics, "Advanced simulation metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_advanced_simulation_metrics")), 500

@simple_api_bp.route('/simulation-insights', methods=['GET'])
def get_simulation_insights():
    """Get simulation insights and recommendations"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        insights = simple_reader.get_simulation_insights()
        return jsonify(APIResponse.success(insights, "Simulation insights retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_simulation_insights")), 500

@simple_api_bp.route('/spill-analysis', methods=['GET'])
def get_spill_analysis():
    """Get spill analysis data from spill log"""
    try:
        if simple_reader is None:
            return jsonify(APIResponse.error("Data reader not initialized")), 500
        
        spill_data = simple_reader.get_spill_analysis_data()
        return jsonify(APIResponse.success(spill_data, "Spill analysis data retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_spill_analysis")), 500

@simple_api_bp.route('/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        status = {
            'data_loaded': simple_reader is not None,
            'stats_count': len(simple_reader.stats_data) if simple_reader else 0,
            'm5out_path': simple_reader.m5out_path if simple_reader else None
        }
        return jsonify(APIResponse.success(status, "System status retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_status")), 500
