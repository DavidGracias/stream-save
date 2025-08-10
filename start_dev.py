#!/usr/bin/env python3
import subprocess
import time
import sys
import os
from pathlib import Path

def start_backend():
    """Start the Flask backend"""
    print("🚀 Starting Flask backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "main.py"],
        cwd=os.getcwd(),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return backend_process

def start_frontend():
    """Start the React frontend"""
    print("⚛️  Starting React frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd="react_ui_ts",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return frontend_process

def main():
    print("🎬 Starting Stream Save Development Environment...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("❌ Error: main.py not found. Please run this script from the project root.")
        sys.exit(1)
    
    if not Path("react_ui_ts").exists():
        print("❌ Error: react_ui_ts directory not found.")
        sys.exit(1)
    
    try:
        # Start backend
        backend = start_backend()
        time.sleep(2)  # Give backend time to start
        
        # Start frontend
        frontend = start_frontend()
        time.sleep(2)  # Give frontend time to start
        
        print("\n✅ Both services are starting up!")
        print("📱 Frontend: http://localhost:5173")
        print("🔧 Backend: http://localhost:5000")
        print("📋 Stremio Addon: http://localhost:5000/manifest.json")
        print("\n💡 Press Ctrl+C to stop both services")
        
        # Wait for user to stop
        try:
            backend.wait()
            frontend.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping services...")
            backend.terminate()
            frontend.terminate()
            print("✅ Services stopped!")
            
    except Exception as e:
        print(f"❌ Error starting services: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
