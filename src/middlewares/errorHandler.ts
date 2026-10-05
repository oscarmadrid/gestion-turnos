import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { logger } from "../config/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
  logger.warn({ code: err.code, status: err.status, path: req.originalUrl }, err.message);
  return res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }


  logger.error({ err, path: req.originalUrl, method: req.method }, "Error no controlado");
  return res.status(500).json({
    status: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
    details: [],
  });
}