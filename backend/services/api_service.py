#!/usr/bin/env python3
"""
🌐 API Service Layer 🌐
=======================

Service layer for handling API endpoints and business logic.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging

from utils.data_processor import Gem5DataProcessor
from utils.data_helpers import Gem5DataHelpers
from utils.advanced_analysis import AdvancedAnalysisHelpers
from utils.api_helpers import APIResponse, handle_exception

logger = logging.getLogger(__name__)

# Create Blueprint for API routes
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Global data processor and helpers instances - will be initialized in app.py
data_processor = None
data_helpers = None
advanced_analysis = None

@api_bp.route('/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        status = data_helpers.get_frontend_system_status()
        return jsonify(APIResponse.success(status, "System status retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_status")), 500

@api_bp.route('/overview', methods=['GET'])
def get_overview():
    """Get overview metrics"""
    try:
        metrics = data_helpers.get_frontend_overview_data()
        return jsonify(APIResponse.success(metrics, "Overview metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_overview")), 500

@api_bp.route('/performance', methods=['GET'])
def get_performance():
    """Get detailed performance data"""
    try:
        performance_data = data_helpers.get_frontend_performance_data()
        return jsonify(APIResponse.success(performance_data, "Performance data retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_performance")), 500

@api_bp.route('/instruction-mix', methods=['GET'])
def get_instruction_mix():
    """Get instruction type distribution"""
    try:
        instruction_mix = data_helpers.get_frontend_instruction_mix()
        return jsonify(APIResponse.success(instruction_mix, "Instruction mix retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_instruction_mix")), 500

@api_bp.route('/spills', methods=['GET'])
def get_spills():
    """Get spill data"""
    try:
        limit = request.args.get('limit', 100, type=int)
        spill_data = data_helpers.get_frontend_spill_data(limit)
        return jsonify(APIResponse.success(spill_data, f"Spill data retrieved (limit: {limit})"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_spills")), 500

@api_bp.route('/memory', methods=['GET'])
def get_memory():
    """Get memory system data"""
    try:
        memory_data = data_helpers.get_frontend_memory_data()
        return jsonify(APIResponse.success(memory_data, "Memory data retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_memory")), 500

@api_bp.route('/spill-timeline', methods=['GET'])
def get_spill_timeline():
    """Get spill timeline data for visualization"""
    try:
        timeline_data = data_helpers.get_frontend_spill_timeline_data()
        return jsonify(APIResponse.success(timeline_data, "Spill timeline data retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_spill_timeline")), 500

@api_bp.route('/spill-heatmap', methods=['GET'])
def get_spill_heatmap():
    """Get spill heatmap data"""
    try:
        heatmap_data = data_helpers.get_frontend_spill_heatmap_data()
        return jsonify(APIResponse.success(heatmap_data, "Spill heatmap data retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_spill_heatmap")), 500

@api_bp.route('/reload', methods=['POST'])
def reload_data():
    """Reload all data from files"""
    try:
        success = data_helpers.reload_data_from_m5out()
        if success:
            return jsonify(APIResponse.success(None, "Data reloaded successfully"))
        else:
            return jsonify(APIResponse.error("Failed to reload data")), 500
    except Exception as e:
        return jsonify(handle_exception(e, "reload_data")), 500

@api_bp.route('/performance-report', methods=['GET'])
def get_performance_report():
    """Get comprehensive performance report"""
    try:
        report = advanced_analysis.generate_performance_report()
        return jsonify(APIResponse.success(report, "Performance report generated"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_performance_report")), 500

@api_bp.route('/advanced-metrics', methods=['GET'])
def get_advanced_metrics():
    """Get advanced performance metrics"""
    try:
        metrics = advanced_analysis.calculate_performance_metrics()
        return jsonify(APIResponse.success(metrics, "Advanced metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_advanced_metrics")), 500

@api_bp.route('/instruction-analysis', methods=['GET'])
def get_instruction_analysis():
    """Get detailed instruction mix analysis"""
    try:
        analysis = advanced_analysis.analyze_instruction_mix()
        return jsonify(APIResponse.success(analysis, "Instruction analysis retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_instruction_analysis")), 500

@api_bp.route('/spill-patterns', methods=['GET'])
def get_spill_patterns():
    """Get detailed spill pattern analysis"""
    try:
        patterns = advanced_analysis.analyze_spill_patterns()
        return jsonify(APIResponse.success(patterns, "Spill patterns retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_spill_patterns")), 500

@api_bp.route('/cache-analysis', methods=['GET'])
def get_cache_analysis():
    """Get cache performance analysis"""
    try:
        cache_analysis = advanced_analysis.analyze_cache_performance()
        return jsonify(APIResponse.success(cache_analysis, "Cache analysis retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_cache_analysis")), 500

@api_bp.route('/basic-metrics', methods=['GET'])
def get_basic_metrics():
    """Get basic metrics for simple frontend"""
    try:
        metrics = data_helpers.get_basic_metrics()
        return jsonify(APIResponse.success(metrics, "Basic metrics retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_basic_metrics")), 500

@api_bp.route('/debug-stats', methods=['GET'])
def debug_stats():
    """Debug endpoint to check stats data"""
    try:
        debug_info = {
            'stats_keys': list(data_helpers.stats_data.keys())[:10],  # First 10 keys
            'stats_count': len(data_helpers.stats_data),
            'spill_count': len(data_helpers.spill_data),
            'sample_stats': dict(list(data_helpers.stats_data.items())[:5])  # First 5 items
        }
        return jsonify(APIResponse.success(debug_info, "Debug info retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "debug_stats")), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        status = data_helpers.get_frontend_system_status()
        if status['stats_loaded'] or status['spill_data_loaded']:
            return jsonify(APIResponse.success({"status": "healthy"}, "Service is healthy"))
        else:
            return jsonify(APIResponse.error("No data loaded")), 503
    except Exception as e:
        return jsonify(handle_exception(e, "health_check")), 500
