#!/usr/bin/env python
"""
AI-Gov Backend Server Runner

This script starts the FastAPI backend server for the AI-Gov application.
It handles environment variable loading and server configuration.
"""

import os
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration from environment variables
HOST = os.getenv("HOST", "localhost")
PORT = int(os.getenv("PORT", "8000"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Configure reload based on environment
RELOAD = ENVIRONMENT.lower() == "development"

if __name__ == "__main__":
    print(f"Starting AI-Gov backend server in {ENVIRONMENT} mode")
    print(f"Server running at http://{HOST}:{PORT}")
    
    if RELOAD:
        print("Auto-reload is enabled. The server will restart on file changes.")
    
    # Start the server
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=RELOAD,
        log_level="info"
    )