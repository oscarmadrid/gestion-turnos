import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Usuario, UsuarioCrudo, UsuarioPublico } from "../models/usuario.js";
import { AppError } from "../errors/AppError.js";
import { logger } from "../config/logger.js";

export class AuthService {
  private filePath = path.resolve(process.env.USUARIOS_DATA_PATH || "./data/usuarios.json");

  private async leerUsuarios(): Promise<UsuarioCrudo[]> {
    const contenido = await readFile(this.filePath, "utf-8").catch(() => "[]");
    return JSON.parse(contenido);
  }

  private async guardarUsuarios(usuarios: UsuarioCrudo[]): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(usuarios, null, 2), "utf-8");
  }

  async registrar(email: string, password: string, rol: string): Promise<UsuarioPublico> {
    const usuarios = await this.leerUsuarios();

    const yaExiste = usuarios.some((u) => u.email === email);
    if (yaExiste) {
      throw new AppError(409, `El email ${email} ya está registrado`, "RESOURCE_CONFLICT");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const maxId = usuarios.reduce((max, u) => {
      const n = parseInt(String(u.id), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const nuevoUsuario: Usuario = { id: maxId + 1, email, password: passwordHash, rol: rol as "admin" | "recepcion" };
    usuarios.push(nuevoUsuario);
    await this.guardarUsuarios(usuarios);

    return { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol };
  }

  async login(email: string, password: string): Promise<{ token: string; usuario: UsuarioPublico }> {
    const usuarios = await this.leerUsuarios();
    const encontrado = usuarios.find((u) => u.email === email);

    if (!encontrado || !encontrado.password) {
      logger.warn({ email }, "Intento de login fallido: usuario no encontrado");
      throw new AppError(401, "Credenciales inválidas", "AUTH_TOKEN_INVALID");
    }

    const passwordValida = await bcrypt.compare(password, encontrado.password);
    if (!passwordValida) {
      logger.warn({ email }, "Intento de login fallido: contraseña incorrecta");
      throw new AppError(401, "Credenciales inválidas", "AUTH_TOKEN_INVALID");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError(500, "JWT_SECRET no configurado en el servidor", "INTERNAL_SERVER_ERROR");
    }

    const payload = { id: encontrado.id, rol: encontrado.rol };
    const token = jwt.sign(payload, secret, { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as any });

    logger.info({ email, id: encontrado.id }, "Login exitoso");
    
    return {
      token,
      usuario: { id: Number(encontrado.id), email: String(encontrado.email), rol: String(encontrado.rol) },
    };
  }
}