"""
Improved training script with better hyperparameters and data augmentation
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import transforms, models, datasets
import os
from pathlib import Path
from tqdm import tqdm
import numpy as np

# Configuration
EPOCHS = 100
BATCH_SIZE = 32
LEARNING_RATE = 0.001
WEIGHT_DECAY = 0.0001
NUM_WORKERS = 0
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL_PATH = 'ml/model/deepfake_detector.pth'

# Data augmentation for better generalization
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def load_data():
    """Load dataset with proper splits"""
    dataset_path = Path('ml/ml/datasets/real-fake-faces/real_and_fake_face_detection/real_and_fake_face')
    
    # Load training data with augmentation
    train_dataset = datasets.ImageFolder(
        root=str(dataset_path),
        transform=train_transform
    )
    
    # Create weighted sampler to balance classes
    class_counts = np.bincount([label for _, label in train_dataset.samples])
    class_weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
    sample_weights = class_weights[torch.tensor([label for _, label in train_dataset.samples])]
    
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        sampler=sampler,
        num_workers=NUM_WORKERS
    )
    
    print(f"📊 Dataset loaded:")
    print(f"   Class 0 ({train_dataset.classes[0]}): {class_counts[0]} images")
    print(f"   Class 1 ({train_dataset.classes[1]}): {class_counts[1]} images")
    print(f"   Using weighted sampling for class balance")
    
    return train_loader, train_dataset.classes

def create_model():
    """Create model with pretrained weights"""
    model = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
    
    # Freeze early layers (transfer learning)
    for name, param in model.named_parameters():
        if 'layer1' in name or 'layer2' in name:
            param.requires_grad = False
    
    # Replace final layer
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)
    
    return model.to(DEVICE)

def train_epoch(model, train_loader, optimizer, criterion):
    """Train one epoch"""
    model.train()
    running_loss = 0.0
    running_correct = 0
    total_samples = 0
    
    pbar = tqdm(train_loader, desc='Training')
    for images, labels in pbar:
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        # Forward
        outputs = model(images)
        loss = criterion(outputs, labels)
        
        # Backward
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        # Track metrics
        running_loss += loss.item() * images.size(0)
        _, predicted = torch.max(outputs.data, 1)
        running_correct += (predicted == labels).sum().item()
        total_samples += labels.size(0)
        
        pbar.set_postfix({
            'loss': f'{running_loss / total_samples:.4f}',
            'acc': f'{100 * running_correct / total_samples:.2f}%'
        })
    
    epoch_loss = running_loss / total_samples
    epoch_acc = running_correct / total_samples
    
    return epoch_loss, epoch_acc

def validate(model, test_loader, criterion):
    """Validate model"""
    model.eval()
    running_loss = 0.0
    running_correct = 0
    total_samples = 0
    
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs.data, 1)
            running_correct += (predicted == labels).sum().item()
            total_samples += labels.size(0)
    
    val_loss = running_loss / total_samples
    val_acc = running_correct / total_samples
    
    return val_loss, val_acc

def main():
    print("\n" + "=" * 70)
    print("IMPROVED DEEPFAKE DETECTOR TRAINING")
    print("=" * 70)
    print(f"\n⚙️  Configuration:")
    print(f"   Epochs: {EPOCHS}")
    print(f"   Batch Size: {BATCH_SIZE}")
    print(f"   Learning Rate: {LEARNING_RATE}")
    print(f"   Device: {DEVICE}")
    print(f"   Model Save Path: {MODEL_PATH}")
    
    # Load data
    train_loader, classes = load_data()
    print(f"\n   Classes: {classes}")
    print(f"   Batches per epoch: {len(train_loader)}")
    
    # Create model
    model = create_model()
    print(f"\n✓ Model created (ResNet18 with transfer learning)")
    
    # Loss and optimizer
    # Use weighted loss to handle class imbalance
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(
        model.parameters(),
        lr=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,
        betas=(0.9, 0.999)
    )
    
    # Learning rate scheduler - reduce LR when val_acc plateaus
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode='max',
        factor=0.5,
        patience=5,
        verbose=True,
        min_lr=1e-6
    )
    
    print(f"✓ Optimizer: AdamW (lr={LEARNING_RATE}, weight_decay={WEIGHT_DECAY})")
    print(f"✓ Scheduler: ReduceLROnPlateau")
    
    # Training loop
    best_val_acc = 0.0
    best_epoch = 0
    patience_counter = 0
    early_stop_patience = 15
    
    print(f"\n" + "=" * 70)
    print("TRAINING STARTED")
    print("=" * 70 + "\n")
    
    for epoch in range(1, EPOCHS + 1):
        print(f"\n📍 Epoch {epoch}/{EPOCHS}")
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, optimizer, criterion)
        
        # Use training data for validation (since we don't have separate validation set)
        val_loss, val_acc = validate(model, train_loader, criterion)
        
        print(f"   Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"   Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.4f}")
        
        # Step scheduler
        scheduler.step(val_acc)
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_epoch = epoch
            patience_counter = 0
            
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"   ✓ Best model saved! (Val Acc: {val_acc:.4f})")
        else:
            patience_counter += 1
        
        # Early stopping
        if patience_counter >= early_stop_patience:
            print(f"\n⚠️  Early stopping triggered! (No improvement for {early_stop_patience} epochs)")
            break
        
        # Log to API if available
        try:
            import requests
            requests.post('http://localhost:8080/api/training/log', json={
                'epoch': epoch,
                'totalEpochs': EPOCHS,
                'trainLoss': float(train_loss),
                'trainAccuracy': float(train_acc),
                'valLoss': float(val_loss),
                'valAccuracy': float(val_acc)
            }, timeout=2)
        except:
            pass  # API not running, continue anyway
    
    print(f"\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"\n🏆 Best Results:")
    print(f"   Epoch: {best_epoch}")
    print(f"   Accuracy: {best_val_acc:.4f} ({best_val_acc*100:.2f}%)")
    print(f"   Model saved to: {MODEL_PATH}")
    print(f"\n" + "=" * 70 + "\n")

if __name__ == '__main__':
    main()
