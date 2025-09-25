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

@simple_api_bp.route('/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        status = {
            'data_loaded': simple_reader is not None,
            'stats_count': len(simple_reader.stats_data) if simple_reader else 0,
            'spill_count': len(simple_reader.spill_data) if simple_reader else 0,
            'm5out_path': simple_reader.m5out_path if simple_reader else None
        }
        return jsonify(APIResponse.success(status, "System status retrieved"))
    except Exception as e:
        return jsonify(handle_exception(e, "get_status")), 500
