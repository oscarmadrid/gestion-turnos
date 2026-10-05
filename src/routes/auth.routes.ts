import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registroSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();

/**
 * @openapi
 * /auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@turnosred.com }
 *               password: { type: string, example: "123456" }
 *               rol: { type: string, enum: [admin, recepcion], example: recepcion }
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/auth/registro", validate(registroSchema), authController.registro);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Autentica un usuario y devuelve un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@turnosred.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     email: { type: string }
 *                     rol: { type: string }
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/auth/login", validate(loginSchema), authController.login);

export default router;