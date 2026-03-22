import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { db } from "@workspace/db";
import { scansTable } from "@workspace/db/schema";
import { detectMedia } from "../lib/detector.js";

const router: IRouter = Router();

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/avi", "video/mov", "video/quicktime", "video/x-msvideo"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const audioUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/flac", "audio/x-wav"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const ML_SERVER_URL = process.env.ML_SERVER_URL || "http://localhost:5000";

async function callMLServer(
  mediaType: "image" | "video" | "audio",
  filePath: string,
  filename: string
): Promise<{
  prediction: "Real" | "Fake";
  confidence: number;
  explanation: string;
  analysisDetails: Record<string, number>;
} | null> {
  try {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    formData.append("file", blob, filename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${ML_SERVER_URL}/predict/${mediaType}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = (await response.json()) as {
      prediction: "Real" | "Fake";
      confidence: number;
      explanation: string;
      analysisDetails: Record<string, number>;
    };
    return data;
  } catch {
    return null;
  }
}

async function handleDetection(
  req: Request,
  res: Response,
  mediaType: "image" | "video" | "audio"
) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "NO_FILE", message: "No file uploaded" });
    return;
  }

  try {
    // Try ML server first, fall back to heuristic detector
    let result = await callMLServer(mediaType, file.path, file.originalname);

    if (!result) {
      console.log(`[INFO] ML server unavailable, using heuristic detector for ${mediaType}`);
      const heuristic = detectMedia(mediaType, file.path, file.originalname);
      result = {
        prediction: heuristic.prediction,
        confidence: heuristic.confidence,
        explanation: heuristic.explanation,
        analysisDetails: heuristic.analysisDetails as Record<string, number>,
      };
    }

    const [scan] = await db
      .insert(scansTable)
      .values({
        prediction: result.prediction,
        confidence: result.confidence,
        explanation: result.explanation,
        mediaType,
        filename: file.originalname,
        fileSize: file.size,
        analysisDetails: result.analysisDetails,
      })
      .returning();

    res.json({
      id: scan.id,
      prediction: scan.prediction,
      confidence: scan.confidence,
      explanation: scan.explanation,
      mediaType: scan.mediaType,
      filename: scan.filename,
      fileSize: scan.fileSize,
      analysisDetails: scan.analysisDetails,
      createdAt: scan.createdAt,
    });
  } catch (err) {
    console.error("Detection error:", err);
    res.status(500).json({ error: "DETECTION_FAILED", message: "Detection failed" });
  }
}

router.post("/detect/image", imageUpload.single("file"), (req, res) => {
  handleDetection(req, res, "image");
});

router.post("/detect/video", videoUpload.single("file"), (req, res) => {
  handleDetection(req, res, "video");
});

router.post("/detect/audio", audioUpload.single("file"), (req, res) => {
  handleDetection(req, res, "audio");
});

export default router;
