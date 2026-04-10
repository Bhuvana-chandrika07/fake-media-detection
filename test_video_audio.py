#!/usr/bin/env python3
import requests
import tempfile
import os

# Test 1: Video file
video_path = tempfile.mktemp(suffix='.mp4')
with open(video_path, 'wb') as f:
    f.write(b'fake video data')

print(f"Testing video upload...")
with open(video_path, 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8080/api/detect/video', files=files)
    
print(f'Video Status: {response.status_code}')
print(f'Video Response: {response.text[:800]}')
os.remove(video_path)

# Test 2: Audio file
audio_path = tempfile.mktemp(suffix='.mp3')
with open(audio_path, 'wb') as f:
    f.write(b'fake audio data')

print(f"\nTesting audio upload...")
with open(audio_path, 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8080/api/detect/audio', files=files)
    
print(f'Audio Status: {response.status_code}')
print(f'Audio Response: {response.text[:800]}')
os.remove(audio_path)
