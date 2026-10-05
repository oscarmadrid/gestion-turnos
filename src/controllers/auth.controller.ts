import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

export async function registro(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, rol } = req.body;
    const usuario = await authService.registrar(email, password, rol);
    return res.status(201).json(usuario);
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const resultado = await authService.login(email, password);
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
}