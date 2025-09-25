#!/usr/bin/env python3
"""
🎮 Gem5 Web Analyzer - Main Application 🎮
=========================================

Modern Flask application for analyzing gem5 simulation results.
Modular architecture with separate services, utils, and models.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os
from datetime import datetime

# Import our modular components
from services.api_service import api_bp
from utils.data_processor import Gem5DataProcessor
from utils.data_helpers import Gem5DataHelpers
from utils.advanced_analysis import AdvancedAnalysisHelpers

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Enable CORS for React frontend
    CORS(app, origins=['http://localhost:3000'])
    
    # Register API blueprint
    app.register_blueprint(api_bp)
    
    # Initialize data processor and helpers
    m5out_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'm5out')
    data_processor = Gem5DataProcessor(m5out_path)
    data_helpers = Gem5DataHelpers(m5out_path)
    advanced_analysis = AdvancedAnalysisHelpers(data_helpers)
    
    # Load data on startup
    logger.info("🎮 Starting Gem5 Web Analyzer...")
    if data_helpers.load_data_from_m5out():
        logger.info("✅ All data loaded successfully")
    else:
        logger.warning("⚠️ Some data failed to load")
    
    # Store instances in app context and inject into API service
    app.data_processor = data_processor
    app.data_helpers = data_helpers
    app.advanced_analysis = advanced_analysis
    
    # Inject instances into API service
    import services.api_service
    services.api_service.data_processor = data_processor
    services.api_service.data_helpers = data_helpers
    services.api_service.advanced_analysis = advanced_analysis
    
    # Root endpoint
    @app.route('/')
    def root():
        """Root endpoint - redirect to React frontend"""
        return jsonify({
            "message": "Gem5 Web Analyzer API",
            "version": "2.0.0",
            "frontend": "http://localhost:3000",
            "api_docs": "http://localhost:5001/api/status",
            "timestamp": datetime.now().isoformat()
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "NOT_FOUND",
            "message": "Endpoint not found",
            "timestamp": datetime.now().isoformat()
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "SERVER_ERROR", 
            "message": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }), 500
    
    return app

# Create the application
app = create_app()

if __name__ == '__main__':
    # Run the application
    logger.info("🚀 Starting Flask development server...")
    logger.info("📊 Backend API: http://localhost:5001")
    logger.info("🎨 Frontend: http://localhost:3000")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5002,
        threaded=True
    )