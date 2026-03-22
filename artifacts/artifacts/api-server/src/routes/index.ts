import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import detectRouter from "./detect.js";
import historyRouter from "./history.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(detectRouter);
router.use(historyRouter);

export default router;
