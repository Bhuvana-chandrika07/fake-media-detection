"""
Model tuning utility - adjust confidence thresholds and fix prediction issues
"""
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
from pathlib import Path
import sys

class ImprovedDeepfakeDetector:
    """Enhanced detector with confidence threshold tuning"""
    
    def __init__(self, model_path='ml/model/deepfake_detector.pth'):
        self.device = torch.device('cpu')
        self.model = self._load_model(model_path)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        self.calibration_data = []
    
    def _load_model(self, model_path):
        """Load the trained model"""
        try:
            model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            num_features = model.fc.in_features
            model.fc = nn.Linear(num_features, 2)
            
            if Path(model_path).exists():
                model.load_state_dict(torch.load(model_path, map_location=self.device))
                print(f"✓ Model loaded from {model_path}")
            
            model = model.to(self.device)
            model.eval()
            return model
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def predict_raw(self, image_path: str):
        """Get raw model outputs"""
        try:
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                # Get raw logits
                real_logit = outputs[0][0].item()
                fake_logit = outputs[0][1].item()
                
                probs = torch.softmax(outputs, dim=1)
                real_prob = probs[0][0].item()
                fake_prob = probs[0][1].item()
            
            return {
                'real_logit': real_logit,
                'fake_logit': fake_logit,
                'real_prob': real_prob,
                'fake_prob': fake_prob
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            raise
    
    def predict_with_threshold(self, image_path: str, fake_threshold: float = 0.5):
        """Predict with configurable threshold
        
        Args:
            image_path: Path to image
            fake_threshold: Threshold for fake prediction (0-1)
                           If fake_prob >= threshold: predict Fake
                           Otherwise: predict Real
        """
        raw = self.predict_raw(image_path)
        
        is_fake = raw['fake_prob'] >= fake_threshold
        confidence = max(raw['real_prob'], raw['fake_prob']) * 100
        
        return {
            'prediction': 'Fake' if is_fake else 'Real',
            'confidence': round(confidence, 2),
            'real_prob': round(raw['real_prob'], 4),
            'fake_prob': round(raw['fake_prob'], 4),
            'threshold_used': fake_threshold
        }
    
    def calibrate_threshold(self, test_dir: str, true_label: str = 'Real'):
        """Find best threshold for a dataset"""
        test_path = Path(test_dir)
        images = list(test_path.glob('*.jpg'))
        
        if not images:
            print(f"No images found in {test_dir}")
            return None
        
        print(f"\n📊 Calibrating threshold with {len(images)} images")
        print(f"   True label: {true_label}")
        
        # Test different thresholds
        thresholds = np.linspace(0.3, 0.7, 9)
        results = {}
        
        for threshold in thresholds:
            correct = 0
            for img_path in images:
                raw = self.predict_raw(str(img_path))
                predicted = 'Fake' if raw['fake_prob'] >= threshold else 'Real'
                if predicted == true_label:
                    correct += 1
            
            accuracy = correct / len(images)
            results[threshold] = accuracy
            print(f"   Threshold {threshold:.2f}: {accuracy:.1%}")
        
        best_threshold = max(results, key=results.get)
        best_accuracy = results[best_threshold]
        
        print(f"\n✓ Best threshold: {best_threshold:.2f} (accuracy: {best_accuracy:.1%})")
        return best_threshold
    
    def test_on_dataset(self, test_dir1: str, label1: str, 
                       test_dir2: str, label2: str, 
                       threshold: float = 0.5):
        """Test model on two datasets"""
        dirs = [(test_dir1, label1), (test_dir2, label2)]
        total_correct = 0
        total_samples = 0
        
        print(f"\n{'='*70}")
        print(f"TESTING WITH THRESHOLD: {threshold}")
        print(f"{'='*70}")
        
        for test_dir, true_label in dirs:
            test_path = Path(test_dir)
            images = list(test_path.glob('*.jpg'))[:10]  # Test first 10
            
            if not images:
                continue
            
            print(f"\n🧪 Testing {true_label} images ({len(images)} samples):")
            correct = 0
            
            for img_path in images:
                raw = self.predict_raw(str(img_path))
                predicted = 'Fake' if raw['fake_prob'] >= threshold else 'Real'
                is_correct = predicted == true_label
                correct += is_correct
                status = '✓' if is_correct else '✗'
                print(f"  {status} {img_path.name:30} {predicted:6} (fake_prob: {raw['fake_prob']:.2f})")
            
            accuracy = correct / len(images)
            total_correct += correct
            total_samples += len(images)
            print(f"   Accuracy: {accuracy:.1%}")
        
        if total_samples > 0:
            overall = total_correct / total_samples
            print(f"\n{'='*70}")
            print(f"OVERALL ACCURACY: {overall:.1%}")
            print(f"{'='*70}\n")

# Global detector
detector = None

def get_detector():
    """Get or initialize detector"""
    global detector
    if detector is None:
        detector = ImprovedDeepfakeDetector()
    return detector

if __name__ == "__main__":
    import sys
    
    detector = ImprovedDeepfakeDetector()
    
    # Find dataset
    dataset_base = Path('ml/ml/datasets/real-fake-faces/real_and_fake_face_detection/real_and_fake_face')
    
    if dataset_base.exists():
        print("\n🔍 Found dataset!")
        
        # Find directories with images
        all_dirs = list(dataset_base.rglob('*'))
        image_dirs = [d for d in all_dirs if d.is_dir() and list(d.glob('*.jpg'))]
        
        if len(image_dirs) >= 2:
            # Use first two dirs for testing
            dir1 = image_dirs[0]
            dir2 = image_dirs[1]
            
            label1 = 'Real'
            label2 = 'Fake'
            
            if 'fake' in dir1.name.lower():
                dir1, dir2 = dir2, dir1
                label1, label2 = label2, label1
            
            test_dir1 = str(dir1)
            test_dir2 = str(dir2)
            
            # Test with default threshold
            detector.test_on_dataset(test_dir1, label1, test_dir2, label2, threshold=0.5)
            
            # Calibrate  best threshold
            print("\n⚙️  Calibrating best threshold...")
            best_threshold = detector.calibrate_threshold(test_dir1, label1)
            
            if best_threshold:
                # Test with best threshold
                detector.test_on_dataset(test_dir1, label1, test_dir2, label2, threshold=best_threshold)
