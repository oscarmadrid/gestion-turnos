import { Router } from "express";
import * as turnoController from "../controllers/turno.controller.js";
import { validate } from "../middlewares/validate.js";
import { turnoSchema, turnoUpdateSchema } from "../schemas/turno.schema.js";

const router = Router();

/**
 * @openapi
 * /turnos:
 *   get:
 *     summary: Lista todos los turnos
 *     description: Devuelve el listado completo de turnos, con filtros opcionales por especialidad, fecha y médico asignado.
 *     tags: [Turnos]
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema: { type: string }
 *         description: Filtra por especialidad (case-insensitive)
 *         example: Pediatría
 *       - in: query
 *         name: fecha
 *         schema: { type: string }
 *         description: Filtra por fecha exacta
 *         example: 14/08/2026
 *       - in: query
 *         name: medicoId
 *         schema: { type: integer }
 *         description: Filtra por médico asignado
 *         example: 1
 *     responses:
 *       200:
 *         description: Listado de turnos obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Turno' }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/turnos", turnoController.listarTurnos);

/**
 * @openapi
 * /turnos/{id}:
 *   get:
 *     summary: Obtiene un turno por ID
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 200
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Turno' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/turnos/:id", turnoController.obtenerTurnoPorId);

/**
 * @openapi
 * /turnos:
 *   post:
 *     summary: Crea un nuevo turno
 *     description: El campo id es obligatorio y debe ser provisto por el cliente (identificador de la sede de origen).
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Turno' }
 *     responses:
 *       201:
 *         description: Turno creado correctamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Turno' }
 *       400:
 *         description: Error de validación o ID duplicado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post("/turnos", validate(turnoSchema), turnoController.crearTurno);

/**
 * @openapi
 * /turnos/{id}:
 *   put:
 *     summary: Actualiza parcialmente un turno existente
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 200
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Turno' }
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Turno' }
 *       400:
 *         description: ID inválido o error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put("/turnos/:id", validate(turnoUpdateSchema), turnoController.actualizarTurno);

/**
 * @openapi
 * /turnos/{id}:
 *   delete:
 *     summary: Elimina un turno
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 200
 *     responses:
 *       204:
 *         description: Turno eliminado correctamente (sin contenido)
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete("/turnos/:id", turnoController.eliminarTurno);

export default router;