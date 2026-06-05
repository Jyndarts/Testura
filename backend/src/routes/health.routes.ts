import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        status: "ok",
        db: "connected",
        timestamp: new Date().toISOString(),
      },
      message: "OK",
    });
  } catch {
    res.status(503).json({
      success: true,
      data: {
        status: "ok",
        db: "error",
        timestamp: new Date().toISOString(),
      },
      message: "OK",
    });
  }
});

export default router;
