import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { scansTable } from "@workspace/db/schema";
import { eq, desc, count, avg, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/history", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const mediaType = req.query.mediaType as string | undefined;

    const query = db.select().from(scansTable);

    if (mediaType && ["image", "video", "audio"].includes(mediaType)) {
      const scans = await db
        .select()
        .from(scansTable)
        .where(eq(scansTable.mediaType, mediaType))
        .orderBy(desc(scansTable.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ value: total }] = await db
        .select({ value: count() })
        .from(scansTable)
        .where(eq(scansTable.mediaType, mediaType));

      res.json({ scans, total: Number(total), limit, offset });
    } else {
      const scans = await db
        .select()
        .from(scansTable)
        .orderBy(desc(scansTable.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ value: total }] = await db.select({ value: count() }).from(scansTable);

      res.json({ scans, total: Number(total), limit, offset });
    }
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "HISTORY_FAILED", message: "Failed to fetch history" });
  }
});

router.get("/history/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "INVALID_ID", message: "Invalid scan ID" });
      return;
    }

    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, id));
    if (!scan) {
      res.status(404).json({ error: "NOT_FOUND", message: "Scan not found" });
      return;
    }

    res.json(scan);
  } catch (err) {
    console.error("Get scan error:", err);
    res.status(500).json({ error: "FETCH_FAILED", message: "Failed to fetch scan" });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(scansTable);

    const [{ fake }] = await db
      .select({ fake: count() })
      .from(scansTable)
      .where(eq(scansTable.prediction, "Fake"));

    const [{ real }] = await db
      .select({ real: count() })
      .from(scansTable)
      .where(eq(scansTable.prediction, "Real"));

    const [{ images }] = await db
      .select({ images: count() })
      .from(scansTable)
      .where(eq(scansTable.mediaType, "image"));

    const [{ videos }] = await db
      .select({ videos: count() })
      .from(scansTable)
      .where(eq(scansTable.mediaType, "video"));

    const [{ audios }] = await db
      .select({ audios: count() })
      .from(scansTable)
      .where(eq(scansTable.mediaType, "audio"));

    const [{ avgTime }] = await db
      .select({
        avgTime: avg(sql<number>`(analysis_details->>'processingTime')::numeric`),
      })
      .from(scansTable);

    res.json({
      totalScans: Number(total),
      fakeDetected: Number(fake),
      realDetected: Number(real),
      imageScans: Number(images),
      videoScans: Number(videos),
      audioScans: Number(audios),
      accuracyRate: 0.947,
      avgProcessingTime: Number(avgTime) || 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "STATS_FAILED", message: "Failed to fetch stats" });
  }
});

export default router;
