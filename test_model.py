"""
Test model predictions on real images from the dataset
"""
import sys
sys.path.insert(0, 'ml/model')
from inference import get_detector
from pathlib import Path

detector = get_detector()

# Find dataset paths
dataset_base = Path('ml/ml/datasets/real-fake-faces/real_and_fake_face_detection/real_and_fake_face')
fake_dir = dataset_base / 'training_fake'

# Find all subdirectories that might contain images
all_dirs = list(dataset_base.rglob('*'))
image_dirs = [d for d in all_dirs if d.is_dir()]

print("=" * 70)
print("MODEL PREDICTION TEST")
print("=" * 70)
print(f"\nSearching in: {dataset_base}")

real_images = []
fake_images = []

# Look for images in subdirectories
for dirpath in dataset_base.rglob('*'):
    if dirpath.is_dir() and 'fake' not in dirpath.name.lower():
        imgs = list(dirpath.glob('*.jpg'))[:3]
        if imgs and not real_images:
            real_images = imgs
            print(f'✓ Found {len(real_images)} real images in: {dirpath.name}')
    
    if dirpath.is_dir() and 'fake' in dirpath.name.lower():
        imgs = list(dirpath.glob('*.jpg'))[:3]
        if imgs and not fake_images:
            fake_images = imgs
            print(f'✓ Found {len(fake_images)} fake images in: {dirpath.name}')

# If nothing found with intelligent search, just search everything
if not real_images or not fake_images:
    all_images = list(dataset_base.rglob('*.jpg'))
    print(f'✓ Found {len(all_images)} total images in dataset')
    
    if all_images:
        if not real_images:
            real_images = all_images[::2][:3]  # Take every other starting at 0
        if not fake_images:
            fake_images = all_images[1::2][:3]  # Take every other starting at 1

real_correct = 0
fake_correct = 0

# Test real images
if real_images:
    print('\n=== Testing Sampled Images (First Set) ===')
    for img_path in real_images:
        result = detector.predict(str(img_path))
        is_correct = result['prediction'] == 'Real'
        real_correct += is_correct
        status = '✓' if is_correct else '✗'
        print(f'{status} {img_path.name:30} {result["prediction"]:6} ({result["confidence"]}%)')
    
    real_accuracy = (real_correct / len(real_images)) * 100 if real_images else 0
    print(f'\nAccuracy (Set 1): {real_accuracy:.1f}%')

# Test fake images
if fake_images:
    print('\n=== Testing Sampled Images (Second Set) ===')
    for img_path in fake_images:
        result = detector.predict(str(img_path))
        is_correct = result['prediction'] == 'Fake'
        fake_correct += is_correct
        status = '✓' if is_correct else '✗'
        print(f'{status} {img_path.name:30} {result["prediction"]:6} ({result["confidence"]}%)')
    
    fake_accuracy = (fake_correct / len(fake_images)) * 100 if fake_images else 0
    print(f'\nAccuracy (Set 2): {fake_accuracy:.1f}%')

print("\n" + "=" * 70)
if real_images and fake_images:
    total_accuracy = ((real_correct + fake_correct) / (len(real_images) + len(fake_images))) * 100
    print(f"OVERALL TEST ACCURACY: {total_accuracy:.1f}%")
    
    if total_accuracy < 60:
        print("\n⚠️ WARNING: Model accuracy is VERY LOW!")
        print("   Real images being classified as FAKE")
        print("\n💡 SOLUTION: Retrain the model with:")
        print("   1. More epochs (increase from 50 to 100)")
        print("   2. Better learning rate")
        print("   3. Check class weights (may need to balance training)")
elif not real_images and not fake_images:
    print("❌ Could not find test images in dataset")
else:
    print("⚠️ Limited test data available")
print("=" * 70)
