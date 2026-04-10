"""
Inference script for deepfake detection using the trained model
"""
import os
import sys
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeepfakeDetector:
    def __init__(self, model_path='ml/model/deepfake_detector.pth'):
        self.device = torch.device('cpu')
        self.model = self._load_model(model_path)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def _load_model(self, model_path):
        """Load the trained model"""
        try:
            model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
            num_features = model.fc.in_features
            model.fc = nn.Linear(num_features, 2)  # binary: real/fake
            
            if os.path.exists(model_path):
                model.load_state_dict(torch.load(model_path, map_location=self.device))
                logger.info(f"Loaded trained model from {model_path}")
            else:
                logger.warning(f"Model file not found at {model_path}, using untrained model")
            
            model = model.to(self.device)
            model.eval()
            return model
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def predict(self, image_file):
        """
        Make prediction on an image file
        Returns: {
            'prediction': 'Real' or 'Fake',
            'confidence': float (0-100),
            'real_prob': float,
            'fake_prob': float
        }
        """
        try:
            # Load image
            if isinstance(image_file, str):
                image = Image.open(image_file).convert('RGB')
            else:
                # Assume it's a file-like object
                image = Image.open(io.BytesIO(image_file)).convert('RGB')
            
            # Transform
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Predict
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probs = torch.softmax(outputs, dim=1)
                real_prob = probs[0][0].item()
                fake_prob = probs[0][1].item()
            
            # Determine prediction
            is_fake = fake_prob > real_prob
            confidence = (max(real_prob, fake_prob) * 100)
            
            return {
                'prediction': 'Fake' if is_fake else 'Real',
                'confidence': float(round(confidence, 2)),
                'real_prob': float(round(real_prob, 4)),
                'fake_prob': float(round(fake_prob, 4)),
            }
        except Exception as e:
            logger.error(f"Error during prediction: {e}")
            raise

# Global detector instance
detector = None

def get_detector():
    """Get or initialize the global detector"""
    global detector
    if detector is None:
        detector = DeepfakeDetector()
    return detector

def predict_image(image_path):
    """Predict whether an image is real or fake"""
    detector = get_detector()
    return detector.predict(image_path)

if __name__ == '__main__':
    # Test the detector
    detector = DeepfakeDetector()
    print("Detector loaded successfully!")
    print("Model device:", detector.device)
    print("Model ready for inference")
