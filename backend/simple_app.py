#!/usr/bin/env python3
"""
🎮 Simple Gem5 Analyzer 🎮
==========================

Simple Flask application for basic gem5 metrics display.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
import os

from services.simple_api import simple_api_bp
from utils.simple_reader import SimpleGem5Reader

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
    CORS(app, origins=['http://localhost:8080'])
    
    # Register simple API blueprint
    app.register_blueprint(simple_api_bp)
    
    # Initialize simple reader
    m5out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'm5out')
    simple_reader = SimpleGem5Reader(m5out_path)
    
    # Load data on startup
    logger.info("🎮 Starting Simple Gem5 Analyzer...")
    if simple_reader.read_all_data():
        logger.info("✅ All data loaded successfully")
    else:
        logger.warning("⚠️ Some data failed to load")
    
    # Store reader in app context and inject into API service
    app.simple_reader = simple_reader
    
    # Inject reader into API service
    import services.simple_api
    services.simple_api.simple_reader = simple_reader
    
    # Root endpoint
    @app.route('/')
    def root():
        """Root endpoint"""
        return jsonify({
            "message": "Simple Gem5 Analyzer API",
            "version": "1.0.0",
            "endpoints": {
                "basic_metrics": "/api/basic-metrics",
                "status": "/api/status"
            },
            "frontend": "http://localhost:8080"
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "NOT_FOUND",
            "message": "Endpoint not found"
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "SERVER_ERROR", 
            "message": "Internal server error"
        }), 500
    
    return app

# Create the application
app = create_app()

if __name__ == '__main__':
    # Run the application
    logger.info("🚀 Starting Simple Flask server...")
    logger.info("📊 Backend API: http://localhost:5050")
    logger.info("🎨 Frontend: http://localhost:8080")
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5050,
        threaded=True
    )
