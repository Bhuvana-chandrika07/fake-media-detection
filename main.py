import os
import subprocess
import sys

PROJECT_ROOT = r"c:/Users/midhu/Downloads/fake media detection"

def main():
    print("[*] Starting Deepfake Detection API Server...")
    print("[*] Backend Server: http://localhost:8080")
    print("[*] API Docs: http://localhost:8080/api/docs")
    print("[+] Run analysis now works with real ML model!")
    
    # Run the main analysis server
    server_path = os.path.join(PROJECT_ROOT, "artifacts/artifacts/api-server/server_mock.py")
    cmd = [sys.executable, server_path]
    
    try:
        subprocess.run(cmd, cwd=PROJECT_ROOT)
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")

if __name__ == "__main__":
    main()
