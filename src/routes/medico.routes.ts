import { Router } from "express";
import * as medicoController from "../controllers/medico.controller.js";
import { validate } from "../middlewares/validate.js";
import { medicoSchema, medicoUpdateSchema } from "../schemas/medico.schema.js";

const router = Router();

router.get("/medicos", medicoController.listarMedicos);
router.get("/medicos/:id", medicoController.obtenerMedicoPorId);
router.post("/medicos", validate(medicoSchema), medicoController.crearMedico);
router.put("/medicos/:id", validate(medicoUpdateSchema), medicoController.actualizarMedico);
router.delete("/medicos/:id", medicoController.eliminarMedico);

export default router;