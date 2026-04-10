import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
import numpy as np

# Custom JSON encoder for numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.floating, np.integer)):
            return float(obj) if isinstance(obj, np.floating) else int(obj)
        return super().default(obj)

DB_PATH = Path(__file__).parent / "auradetect.db"

def init_db():
    """Initialize database tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            filename TEXT,
            media_type TEXT,
            file_size INTEGER,
            prediction TEXT,
            confidence REAL,
            explanation TEXT,
            analysis_details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS training_epochs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            epoch INTEGER,
            total_epochs INTEGER,
            train_loss REAL,
            train_accuracy REAL,
            val_loss REAL,
            val_accuracy REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"[OK] Database initialized: {DB_PATH}")

def add_scan(scan_data: Dict):
    """Add new scan result"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO scans (id, filename, media_type, file_size, prediction, confidence, explanation, analysis_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        scan_data.get('id'),
        scan_data.get('filename'),
        scan_data.get('mediaType'),
        scan_data.get('fileSize', 0),
        scan_data.get('prediction'),
        scan_data.get('confidence'),
        scan_data.get('explanation', ''),
        json.dumps(scan_data.get('analysisDetails', {}), cls=NumpyEncoder)
    ))
    
    conn.commit()
    conn.close()

def get_scans(limit: int = 50, media_type: Optional[str] = None, min_confidence: Optional[float] = None) -> List[Dict]:
    """Get scan history"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = '''
        SELECT id, filename, media_type, file_size, prediction, confidence, explanation, analysis_details, created_at, updated_at
        FROM scans 
        ORDER BY created_at DESC 
        LIMIT ?
    '''
    params = [limit]
    
    if media_type:
        query = query.replace('FROM scans', 'FROM scans WHERE media_type = ?')
        params.insert(0, media_type)
    if min_confidence:
        where_clause = 'WHERE confidence >= ?' if 'WHERE' not in query else query.split('WHERE')[1].split('ORDER')[0] + 'AND confidence >= ? '
        query = query.replace('WHERE', where_clause, 1)
        params.append(min_confidence)
    
    cursor.execute(query, params)
    
    scans = []
    for row in cursor.fetchall():
        scan = dict(zip(['id', 'filename', 'media_type', 'file_size', 'prediction', 'confidence', 'explanation', 
                        'analysis_details', 'created_at', 'updated_at'], row))
        scan['analysisDetails'] = json.loads(scan['analysis_details']) if scan['analysis_details'] else {}
        scan['mediaType'] = scan.pop('media_type')
        scan['fileSize'] = scan.pop('file_size')
        scan['createdAt'] = scan.pop('created_at')
        scan['updatedAt'] = scan.pop('updated_at')
        scan.pop('analysis_details')
        scans.append(scan)
    
    conn.close()
    return scans

def get_scan_by_id(scan_id: str) -> Optional[Dict]:
    """Get single scan by ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM scans WHERE id = ?', (scan_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        scan = dict(zip(['id', 'filename', 'media_type', 'file_size', 'prediction', 'confidence', 'explanation', 
                        'analysis_details', 'created_at', 'updated_at'], row))
        scan['analysisDetails'] = json.loads(scan['analysis_details']) if scan['analysis_details'] else {}
        scan['mediaType'] = scan.pop('media_type')
        scan['fileSize'] = scan.pop('file_size')
        scan['createdAt'] = scan.pop('created_at')
        scan['updatedAt'] = scan.pop('updated_at')
        scan.pop('analysis_details')
        return scan
    return None

def get_stats() -> Dict:
    """Get detection statistics"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total FROM scans')
    total = cursor.fetchone()[0]
    
    cursor.execute('SELECT AVG(confidence) FROM scans')
    avg_confidence = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT COUNT(*) FROM scans WHERE prediction = "Fake"')
    fake_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scans WHERE prediction = "Real"')
    real_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scans WHERE media_type = "image"')
    image_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scans WHERE media_type = "video"')
    video_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM scans WHERE media_type = "audio"')
    audio_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "totalScans": total,
        "fakeDetected": fake_count,
        "realDetected": real_count,
        "accuracyRate": avg_confidence / 100,
        "avgConfidence": round(avg_confidence, 2),
        "imageScans": image_count,
        "videoScans": video_count,
        "audioScans": audio_count
    }

if __name__ == "__main__":
    init_db()
    print("Database module ready")
