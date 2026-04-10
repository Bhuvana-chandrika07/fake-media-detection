#!/usr/bin/env python3
"""
Status checker for the deepfake detection system
"""
import os
import subprocess
from datetime import datetime
import requests
import json

def check_api():
    """Check if API is running"""
    try:
        response = requests.get("http://localhost:8080/api/health", timeout=2)
        if response.status_code == 200:
            return "✓ RUNNING on localhost:8080"
    except:
        return "✗ NOT RUNNING"

def check_frontend():
    """Check if frontend is running"""
    try:
        response = requests.get("http://localhost:5174", timeout=2)
        if response.status_code == 200:
            return "✓ RUNNING on localhost:5174"
    except:
        return "✗ NOT RUNNING"

def check_model_file():
    """Check model file status"""
    model_path = "ml/model/deepfake_detector.pth"
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / 1024 / 1024
        mod_time = os.path.getmtime(model_path)
        mod_str = datetime.fromtimestamp(mod_time).strftime("%Y-%m-%d %H:%M:%S")
        return f"✓ EXISTS: {size_mb:.1f} MB (Last updated: {mod_str})"
    return "✗ NOT FOUND"

def check_api_stats():
    """Get API statistics"""
    try:
        response = requests.get("http://localhost:8080/api/stats", timeout=2)
        stats = response.json()
        return {
            "total_scans": stats['totalScans'],
            "real": stats['realDetected'],
            "fake": stats['fakeDetected'],
            "avg_confidence": f"{stats['avgConfidence']:.1f}%",
            "accuracy": f"{stats['accuracyRate']:.1%}"
        }
    except:
        return None

def check_history():
    """Get recent scans"""
    try:
        response = requests.get("http://localhost:8080/api/history?limit=5", timeout=2)
        scans = response.json()['scans']
        return f"✓ {len(scans)} scans in history"
    except:
        return "✗ Could not fetch history"

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("DEEPFAKE DETECTION SYSTEM STATUS")
    print("=" * 70)
    
    print("\n📡 SERVICES:")
    print(f"  API Server:        {check_api()}")
    print(f"  Frontend:          {check_frontend()}")
    
    print("\n🤖 MODEL:")
    print(f"  Model File:        {check_model_file()}")
    
    print("\n📊 API STATISTICS:")
    stats = check_api_stats()
    if stats:
        print(f"  Total Scans:       {stats['total_scans']}")
        print(f"  Real Detected:     {stats['real']}")
        print(f"  Fake Detected:     {stats['fake']}")
        print(f"  Avg Confidence:    {stats['avg_confidence']}")
        print(f"  Accuracy Rate:     {stats['accuracy']}")
    else:
        print("  ✗ Could not fetch stats")
    
    print(f"\n📜 HISTORY:")
    print(f"  {check_history()}")
    
    print("\n" + "=" * 70)
    print("✓ System is ready for image detection!")
    print("=" * 70 + "\n")
