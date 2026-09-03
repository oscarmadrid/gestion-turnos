import { Router, Request, Response } from "express";
import { AgendaTurnos } from "../services/agenda.js";

const router = Router();
const agenda = new AgendaTurnos();

// GET /turnos (Obtener todos los turnos) - Código 200 o 500
router.get("/turnos", async (req: Request, res: Response) => {
  try {
    const turnos = await agenda.getTurnos();
    return res.status(200).json(turnos);
  } catch (error: any) {
    return res.status(500).json({ error: "Error interno al obtener los turnos", detalle: error.message });
  }
});

// GET /turnos/:id (Obtener un turno por ID) - Códigos 200, 400, 404 o 500
router.get("/turnos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "El ID proporcionado no es válido" });
    }

    const turno = await agenda.getTurnoID(id);
    if (!turno) {
      return res.status(404).json({ error: `Turno con ID ${id} no encontrado` });
    }

    return res.status(200).json(turno);
  } catch (error: any) {
    return res.status(500).json({ error: "Error interno al buscar el turno", detalle: error.message });
  }
});

// POST /turnos (Crear un nuevo turno) - Códigos 201 o 400
router.post("/turnos", async (req: Request, res: Response) => {
  try {
    const nuevoTurno = await agenda.PostTurno(req.body);
    return res.status(201).json(nuevoTurno);
  } catch (error: any) {
    return res.status(400).json({ error: "No se pudo crear el turno. Verifique los datos.", detalle: error.message });
  }
});

// PUT /turnos/:id (Actualizar un turno existente) - Códigos 200, 400 o 404
router.put("/turnos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "El ID proporcionado no es válido" });
    }

    const turnoActualizado = await agenda.PutTurno(id, req.body);
    if (!turnoActualizado) {
      return res.status(404).json({ error: `Turno con ID ${id} no encontrado o datos inválidos` });
    }

    return res.status(200).json(turnoActualizado);
  } catch (error: any) {
    return res.status(400).json({ error: "Error al actualizar el turno", detalle: error.message });
  }
});

// DELETE /turnos/:id (Eliminar un turno) - Códigos 200, 400, 404 o 500
router.delete("/turnos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "El ID proporcionado no es válido" });
    }

    const eliminado = await agenda.DeleteTurno(id);
    if (!eliminado) {
      return res.status(404).json({ error: `Turno con ID ${id} no encontrado` });
    }

    return res.status(200).json({ mensaje: `Turno con ID ${id} eliminado exitosamente` });
  } catch (error: any) {
    return res.status(500).json({ error: "Error interno al eliminar el turno", detalle: error.message });
  }
});

export default router;