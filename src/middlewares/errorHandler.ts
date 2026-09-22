import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  console.error("[ERROR NO CONTROLADO]", err);
  return res.status(500).json({
    status: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
    details: [],
  });
}