"""
Training Logger - Log training progress to API for real-time monitoring
"""
import requests
import json
from typing import Optional, Dict

API_URL = "http://localhost:8080"

def log_training_epoch(epoch: int, total_epochs: int, 
                       train_loss: float, train_accuracy: float,
                       val_loss: float, val_accuracy: float) -> bool:
    """
    Log an epoch's training metrics to the API
    
    Args:
        epoch: Current epoch number
        total_epochs: Total epochs in training
        train_loss: Training loss value
        train_accuracy: Training accuracy (0-1)
        val_loss: Validation loss value
        val_accuracy: Validation accuracy (0-1)
    
    Returns:
        True if logged successfully, False otherwise
    """
    try:
        data = {
            "epoch": epoch,
            "totalEpochs": total_epochs,
            "trainLoss": round(train_loss, 4),
            "trainAccuracy": round(train_accuracy, 4),
            "valLoss": round(val_loss, 4),
            "valAccuracy": round(val_accuracy, 4)
        }
        
        response = requests.post(
            f"{API_URL}/api/training/log",
            json=data,
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"✓ Logged epoch {epoch}/{total_epochs}")
            return True
        else:
            print(f"✗ Failed to log epoch: {response.status_code}")
            return False
    
    except requests.ConnectionError:
        print("⚠ Warning: Could not connect to API server for logging")
        return False
    except Exception as e:
        print(f"⚠ Warning: Error logging to API: {e}")
        return False

def get_training_progress() -> Optional[Dict]:
    """Get current training progress from API"""
    try:
        response = requests.get(
            f"{API_URL}/api/training/progress",
            timeout=5
        )
        
        if response.status_code == 200:
            return response.json()
        return None
    
    except Exception as e:
        print(f"Error getting training progress: {e}")
        return None

if __name__ == "__main__":
    # Test logging
    success = log_training_epoch(1, 50, 0.45, 0.65, 0.42, 0.68)
    if success:
        progress = get_training_progress()
        print(f"Current progress: {progress}")
