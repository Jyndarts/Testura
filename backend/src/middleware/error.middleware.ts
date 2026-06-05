import { Request, Response, NextFunction } from "express";
import { AppError, errorResponse } from "../utils/response.utils";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res
      .status(err.statusCode)
      .json(errorResponse(err.message));
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json(errorResponse("Internal server error"));
}
