#!/usr/bin/env python3
import subprocess
import time
import sys
import os
import signal
import psutil
import argparse
from pathlib import Path
from typing import Optional, Dict, Any

class ServiceManager:
    """Manages backend and frontend services with better error handling"""
    
    def __init__(self):
        self.backend_process: Optional[subprocess.Popen] = None
        self.frontend_process: Optional[subprocess.Popen] = None
        self.running = False
        
    def start_backend(self) -> bool:
        """Start the Flask backend with optimized settings"""
        print("🚀 Starting Flask backend...")
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "main.py"],
                cwd=os.getcwd(),
                stdout=None,  # Use parent's stdout
                stderr=None,  # Use parent's stderr
                text=True,
                env={**os.environ, 'FLASK_ENV': 'development'}
            )
            
            # Wait a bit and check if process is still running
            time.sleep(2)
            if self.backend_process.poll() is None:
                print("✅ Backend started successfully")
                return True
            else:
                print("❌ Backend failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_frontend(self) -> bool:
        """Start the React frontend with optimized settings"""
        print("🚀 Starting React frontend...")
        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=os.path.join(os.getcwd(), "frontend"),
                stdout=None,  # Use parent's stdout
                stderr=None,  # Use parent's stderr
                text=True,
                env={**os.environ, 'NODE_ENV': 'development'}
            )
            
            # Wait a bit and check if process is still running
            time.sleep(3)
            if self.frontend_process.poll() is None:
                print("✅ Frontend started successfully")
                return True
            else:
                print("❌ Frontend failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def check_services(self) -> Dict[str, Dict[str, Any]]:
        """Check the status of running services"""
        status = {
            'backend': {'running': False, 'port': 5000},
            'frontend': {'running': False, 'port': 5173}
        }
        
        # Check backend
        if self.backend_process:
            status['backend']['running'] = self.backend_process.poll() is None
            
        # Check frontend
        if self.frontend_process:
            status['frontend']['running'] = self.frontend_process.poll() is None
            
        return status
    
    def stop_services(self):
        """Stop all running services gracefully"""
        print("\n🛑 Stopping services...")
        
        if self.backend_process:
            try:
                self.backend_process.terminate()
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            self.backend_process = None
            print("✅ Backend stopped")
            
        if self.frontend_process:
            try:
                self.frontend_process.terminate()
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            self.frontend_process = None
            print("✅ Frontend stopped")
        
        self.running = False
        print("✅ Services stopped")
    
    def cleanup_zombie_processes(self):
        """Clean up any zombie processes that might be running"""
        print("🧹 Cleaning up any existing processes...")
        try:
            # Kill any existing Python app.py processes
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if proc.info['name'] and any(x in proc.info['name'].lower() for x in ['python', 'node', 'npm']):
                        cmdline = proc.info['cmdline']
                        if cmdline and any(x in ' '.join(cmdline) for x in ['app.py', 'vite']):
                            print(f"🔄 Terminating existing process: {proc.info['name']} (PID: {proc.info['pid']})")
                            proc.terminate()
                            proc.wait(timeout=3)
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.TimeoutExpired):
                    pass
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up processes: {e}")

def print_usage():
    print("""
Usage: python start_dev.py [OPTIONS]

Options:
  -h, --help          Show this help message
  -b, --backend-only  Start only the Flask backend
  -f, --frontend-only Start only the React frontend
  -a, --all           Start both services (default)

Examples:
  python start_dev.py              # Start both services
  python start_dev.py -b           # Start only backend
  python start_dev.py -f           # Start only frontend
  python start_dev.py --all        # Start both services
""")

def main():
    parser = argparse.ArgumentParser(description='Start Stream Save development services')
    parser.add_argument('-b', '--backend-only', action='store_true', help='Start only the Flask backend')
    parser.add_argument('-f', '--frontend-only', action='store_true', help='Start only the React frontend')
    parser.add_argument('-a', '--all', action='store_true', help='Start both services (default)')
    
    args = parser.parse_args()
    
    # Determine what to start
    start_backend = args.backend_only or args.all or (not args.frontend_only and not args.backend_only)
    start_frontend = args.frontend_only or args.all or (not args.frontend_only and not args.backend_only)
    
    if args.backend_only and args.frontend_only:
        print("❌ Cannot specify both --backend-only and --frontend-only")
        sys.exit(1)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Error: Please run this script from the project root directory")
        print("   Expected structure: backend/, frontend/, scripts/")
        sys.exit(1)
    
    manager = ServiceManager()
    manager.cleanup_zombie_processes()
    
    try:
        if start_backend:
            if not manager.start_backend():
                print("❌ Failed to start backend. Exiting...")
                sys.exit(1)
        
        if start_frontend:
            if not manager.start_frontend():
                print("❌ Failed to start frontend. Exiting...")
                if start_backend:
                    manager.stop_services()
                sys.exit(1)
        
        if start_backend and start_frontend:
            manager.running = True
            print("\n✅ Both services are starting up!")
            print("\n🌐 Access URLs:")
            print("   Backend (Stremio Addon): http://localhost:5001")
            print("   Frontend (Management UI): http://localhost:5173")
            print("   Manifest: http://localhost:5001/manifest.json")
            print("\n💡 Press Ctrl+C to stop both services")
        elif start_backend:
            manager.running = True
            print("\n✅ Backend service is running!")
            print("\n🌐 Access URLs:")
            print("   Backend (Stremio Addon): http://localhost:5001")
            print("   Manifest: http://localhost:5001/manifest.json")
            print("\n💡 Press Ctrl+C to stop the service")
        elif start_frontend:
            manager.running = True
            print("\n✅ Frontend service is running!")
            print("\n🌐 Access URLs:")
            print("   Frontend (Management UI): http://localhost:5173")
            print("\n💡 Press Ctrl+C to stop the service")
        
        try:
            while manager.running:
                time.sleep(5)
                status = manager.check_services()
                
                if start_backend and start_frontend:
                    if not status['backend']['running'] and not status['frontend']['running']:
                        print("⚠️  Both services have stopped unexpectedly")
                        break
                    elif not status['backend']['running']:
                        print("⚠️  Backend has stopped unexpectedly")
                        break
                    elif not status['frontend']['running']:
                        print("⚠️  Frontend has stopped unexpectedly")
                        break
                elif start_backend and not status['backend']['running']:
                    print("⚠️  Backend has stopped unexpectedly")
                    break
                elif start_frontend and not status['frontend']['running']:
                    print("⚠️  Frontend has stopped unexpectedly")
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Received interrupt signal...")
            
    except Exception as e:
        print(f"❌ Error starting services: {e}")
        manager.stop_services()
        sys.exit(1)
    finally:
        manager.stop_services()

if __name__ == "__main__":
    main()
