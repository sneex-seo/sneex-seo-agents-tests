#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import uvicorn
import sys
import os

# Добавляем текущую директорию в путь
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting SEO Agent Web Server...")
    print("Open your browser and go to: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    
    try:
        uvicorn.run("web_interface:app", host="0.0.0.0", port=8000, reload=False)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
