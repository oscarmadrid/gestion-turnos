import { Router } from "express";
import * as turnoController from "../controllers/turno.controller.js";
import { validate } from "../middlewares/validate.js";
import { turnoSchema, turnoUpdateSchema } from "../schemas/turno.schema.js";

const router = Router();

router.get("/turnos", turnoController.listarTurnos);
router.get("/turnos/:id", turnoController.obtenerTurnoPorId);
router.post("/turnos", validate(turnoSchema), turnoController.crearTurno);
router.put("/turnos/:id", validate(turnoUpdateSchema), turnoController.actualizarTurno);
router.delete("/turnos/:id", turnoController.eliminarTurno);

export default router;