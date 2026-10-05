import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

export interface TokenPayload {
  id: number;
  rol: string;
}

// Extendemos el tipo Request de Express para que TypeScript conozca req.user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token no proporcionado", "AUTH_TOKEN_MISSING"));
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new AppError(500, "JWT_SECRET no configurado en el servidor", "INTERNAL_SERVER_ERROR"));
  }

  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.user = payload;
    next();
  } catch (error) {
    return next(new AppError(401, "Token inválido o expirado", "AUTH_TOKEN_INVALID"));
  }
}