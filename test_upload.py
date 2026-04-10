#!/usr/bin/env python3
import requests
from PIL import Image
import tempfile
import os
import json

# Create a test image
test_img = Image.new('RGB', (224, 224), color='blue')
img_path = tempfile.mktemp(suffix='.png')
test_img.save(img_path)

print(f"Testing image upload with {img_path}")

# Upload it
with open(img_path, 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8080/api/detect/image', files=files)
    
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print('✓ Success!')
    print(f"  Prediction: {data.get('prediction')}")
    print(f"  Confidence: {data.get('confidence')}%")
    print(f"  Analysis Details: {json.dumps(data.get('analysisDetails'), indent=2)}")
else:
    print(f'Error: {response.text}')

os.remove(img_path)
