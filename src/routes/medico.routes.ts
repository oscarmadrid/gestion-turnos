import { Router } from "express";
import * as medicoController from "../controllers/medico.controller.js";
import { validate } from "../middlewares/validate.js";
import { medicoSchema, medicoUpdateSchema } from "../schemas/medico.schema.js";
import { verificarToken } from "../middlewares/verificarToken.js";

const router = Router();

/**
 * @openapi
 * /medicos:
 *   get:
 *     summary: Lista todos los médicos
 *     description: Devuelve el listado completo de médicos, con filtros opcionales por especialidad y disponibilidad.
 *     tags: [Médicos]
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema: { type: string }
 *         description: Filtra por especialidad (case-insensitive)
 *         example: Odontología
 *       - in: query
 *         name: disponible
 *         schema: { type: boolean }
 *         description: Filtra por disponibilidad
 *         example: true
 *     responses:
 *       200:
 *         description: Listado de médicos obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Medico' }
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/medicos", medicoController.listarMedicos);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     summary: Obtiene un médico por ID
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Médico encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Medico' }
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Médico no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/medicos/:id", medicoController.obtenerMedicoPorId);

/**
 * @openapi
 * /medicos:
 *   post:
 *     summary: Crea un nuevo médico
 *     description: El campo id se autogenera en el servidor, no debe enviarse en el body.
 *     tags: [Médicos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Medico' }
 *     responses:
 *       201:
 *         description: Médico creado correctamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Medico' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
  *       401:
 *         description: Token no proporcionado, inválido o expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' } 
 */
router.post("/medicos", verificarToken, validate(medicoSchema), medicoController.crearMedico);

/**
 * @openapi
 * /medicos/{id}:
 *   put:
 *     summary: Actualiza parcialmente un médico existente
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Medico' }
 *     responses:
 *       200:
 *         description: Médico actualizado correctamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Medico' }
 *       400:
 *         description: ID inválido o error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Médico no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
  *       401:
 *         description: Token no proporcionado, inválido o expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' } 
 */
router.put("/medicos/:id", verificarToken, validate(medicoUpdateSchema), medicoController.actualizarMedico);

/**
 * @openapi
 * /medicos/{id}:
 *   delete:
 *     summary: Elimina un médico
 *     tags: [Médicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Médico eliminado correctamente (sin contenido)
 *       404:
 *         description: Médico no encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' } 
 */
router.delete("/medicos/:id", verificarToken, medicoController.eliminarMedico);

export default router;