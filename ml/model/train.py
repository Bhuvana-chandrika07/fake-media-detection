import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms, models
from PIL import Image
import pandas as pd
from sklearn.model_selection import train_test_split
import numpy as np
from tqdm import tqdm
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeepfakeDataset(Dataset):
    def __init__(self, df, img_dir, transform=None):
        self.df = df
        self.img_dir = img_dir
        self.transform = transform
        self.label_map = {'real': 0, 'fake': 1}

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(self.img_dir, row['image'])
        # Convert to absolute path and normalize separators
        img_path = os.path.abspath(img_path)
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            logger.error(f"Error loading image {img_path}: {e}")
            raise
        label = self.label_map[row['label']]
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

def create_dataloaders():
    # Scan directories for labels (always regenerate to ensure correct paths)
    real_dir = 'ml/ml/datasets/real-fake-faces/real_and_fake_face/training_real'
    fake_dir = 'ml/ml/datasets/real-fake-faces/real_and_fake_face/training_fake'
    
    logger.info(f"Loading real images from: {real_dir}")
    logger.info(f"Loading fake images from: {fake_dir}")
    
    real_files = [os.path.join('training_real', f)  for f in os.listdir(real_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    fake_files = [os.path.join('training_fake', f) for f in os.listdir(fake_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    logger.info(f"Found {len(real_files)} real images and {len(fake_files)} fake images")
    
    real_df = pd.DataFrame({'image': real_files, 'label': 'real'})
    fake_df = pd.DataFrame({'image': fake_files, 'label': 'fake'})
    df = pd.concat([real_df, fake_df], ignore_index=True)
    
    # Save the CSV
    processed_path = 'ml/ml/datasets/processed/train.csv'
    os.makedirs(os.path.dirname(processed_path), exist_ok=True)
    df.to_csv(processed_path, index=False)
    logger.info(f"Saved dataset info to {processed_path}")
    
    # Split
    train_df, val_df = train_test_split(df, test_size=0.2, stratify=df['label'], random_state=42)
    
    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(15),
        transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2, hue=0.1),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    transform_val = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    img_dir = 'ml/ml/datasets/real-fake-faces/real_and_fake_face'
    
    train_dataset = DeepfakeDataset(train_df, img_dir, transform_train)
    val_dataset = DeepfakeDataset(val_df, img_dir, transform_val)
    
    # Use num_workers=0 on Windows to avoid multiprocessing issues
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=0)
    
    return train_loader, val_loader

def train_model():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    logger.info(f"Using device: {device}")
    
    # Data
    train_loader, val_loader = create_dataloaders()
    
    # Model: ResNet18 pretrained
    model = models.resnet18(pretrained=True)
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, 2)  # binary: real/fake
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    optimizer = optim.AdamW(model.parameters(), lr=0.0005, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingWarmRestarts(optimizer, T_0=10, T_mult=2, eta_min=1e-6)
    
    best_acc = 0.0
    num_epochs = 50
    patience = 7
    patience_counter = 0
    
    for epoch in range(num_epochs):
        # Train
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for inputs, labels in tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs} Train'):
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total_train += labels.size(0)
            correct_train += (predicted == labels).sum().item()
        
        train_acc = 100 * correct_train / total_train
        train_loss = running_loss / len(train_loader)
        
        # Val
        model.eval()
        correct_val = 0
        total_val = 0
        val_loss = 0.0
        
        with torch.no_grad():
            for inputs, labels in tqdm(val_loader, desc='Val'):
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                
                _, predicted = torch.max(outputs, 1)
                total_val += labels.size(0)
                correct_val += (predicted == labels).sum().item()
        
        val_acc = 100 * correct_val / total_val
        val_loss = val_loss / len(val_loader)
        
        scheduler.step()
        logger.info(f'Epoch {epoch+1}: Train Loss={train_loss:.4f}, Acc={train_acc:.2f}% | Val Loss={val_loss:.4f}, Acc={val_acc:.2f}%')
        
        # Save best & early stopping
        if val_acc > best_acc:
            best_acc = val_acc
            patience_counter = 0
            torch.save(model.state_dict(), 'ml/model/deepfake_detector.pth')
            os.makedirs('ml/model', exist_ok=True)
            logger.info(f'✓ Best: {best_acc:.2f}%')
        else:
            patience_counter += 1
            if patience_counter >= patience:
                logger.info(f'Early stopping at epoch {epoch+1}')
                break
    
    logger.info(f'Training complete! Best accuracy: {best_acc:.2f}%')

if __name__ == '__main__':
    os.makedirs('ml/model', exist_ok=True)
    os.makedirs('ml/ml/datasets/processed', exist_ok=True)
    train_model()
