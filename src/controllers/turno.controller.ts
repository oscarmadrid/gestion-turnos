import { Request, Response, NextFunction } from "express";
import { AgendaTurnos } from "../services/agenda.js";
import { AppError } from "../errors/AppError.js";

const agenda = new AgendaTurnos();

export async function listarTurnos(req: Request, res: Response, next: NextFunction) {
  try {
    const { especialidad, fecha, medicoId } = req.query;

    const turnos = await agenda.getTurnos({
      especialidad: typeof especialidad === "string" ? especialidad : undefined,
      fecha: typeof fecha === "string" ? fecha : undefined,
      medicoId: medicoId ? parseInt(String(medicoId), 10) : undefined,
    });

    return res.status(200).json(turnos);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerTurnoPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const turno = await agenda.getTurnoID(id);
    if (!turno) {
      throw new AppError(404, `Turno con ID ${id} no encontrado`, "TURNO_NOT_FOUND");
    }

    return res.status(200).json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function crearTurno(req: Request, res: Response, next: NextFunction) {
  try {
    const nuevoTurno = await agenda.PostTurno(req.body);
    return res.status(201).json(nuevoTurno);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarTurno(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const turnoActualizado = await agenda.PutTurno(id, req.body);
    if (!turnoActualizado) {
      throw new AppError(404, `Turno con ID ${id} no encontrado`, "TURNO_NOT_FOUND");
    }

    return res.status(200).json(turnoActualizado);
  } catch (error) {
    return next(error);
  }
}

export async function eliminarTurno(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const eliminado = await agenda.DeleteTurno(id);
    if (!eliminado) {
      throw new AppError(404, `Turno con ID ${id} no encontrado`, "TURNO_NOT_FOUND");
    }

    // 204 No Content: éxito, sin cuerpo de respuesta
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}