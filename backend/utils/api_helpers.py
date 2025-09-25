#!/usr/bin/env python3
"""
🔧 API Response Helpers 🔧
=========================

Helper functions for creating consistent API responses.
"""

from flask import jsonify
from typing import Any, Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class APIResponse:
    """Helper class for creating consistent API responses"""
    
    @staticmethod
    def success(data: Any, message: str = "Success") -> Dict[str, Any]:
        """Create a successful API response"""
        return {
            "success": True,
            "data": data,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def error(message: str, error_code: str = "ERROR", data: Any = None) -> Dict[str, Any]:
        """Create an error API response"""
        return {
            "success": False,
            "error": error_code,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
    
    @staticmethod
    def not_found(message: str = "Resource not found") -> Dict[str, Any]:
        """Create a 404 response"""
        return APIResponse.error(message, "NOT_FOUND")
    
    @staticmethod
    def bad_request(message: str = "Bad request") -> Dict[str, Any]:
        """Create a 400 response"""
        return APIResponse.error(message, "BAD_REQUEST")
    
    @staticmethod
    def server_error(message: str = "Internal server error") -> Dict[str, Any]:
        """Create a 500 response"""
        return APIResponse.error(message, "SERVER_ERROR")

def create_response(data: Any = None, success: bool = True, message: str = None) -> Dict[str, Any]:
    """Create a standardized API response"""
    if success:
        return APIResponse.success(data, message or "Success")
    else:
        return APIResponse.error(message or "Error", data=data)

def handle_exception(e: Exception, context: str = "") -> Dict[str, Any]:
    """Handle exceptions and create error responses"""
    error_msg = f"Error in {context}: {str(e)}" if context else str(e)
    logger.error(error_msg)
    return APIResponse.server_error(error_msg)
