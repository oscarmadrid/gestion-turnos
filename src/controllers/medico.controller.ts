import { Request, Response, NextFunction } from "express";
import { MedicoService } from "../services/medico.service.js";
import { AppError } from "../errors/AppError.js";

const medicoService = new MedicoService();

export async function listarMedicos(req: Request, res: Response, next: NextFunction) {
  try {
    const { especialidad, disponible } = req.query;

    const medicos = await medicoService.getMedicos({
      especialidad: typeof especialidad === "string" ? especialidad : undefined,
      disponible: disponible !== undefined ? disponible === "true" : undefined,
    });

    return res.status(200).json(medicos);
  } catch (error) {
    return next(error);
  }
}

export async function obtenerMedicoPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const medico = await medicoService.getMedicoID(id);
    if (!medico) {
      throw new AppError(404, `Médico con ID ${id} no encontrado`, "MEDICO_NOT_FOUND");
    }

    return res.status(200).json(medico);
  } catch (error) {
    return next(error);
  }
}

export async function crearMedico(req: Request, res: Response, next: NextFunction) {
  try {
    const nuevoMedico = await medicoService.crearMedico(req.body);
    return res.status(201).json(nuevoMedico);
  } catch (error) {
    return next(error);
  }
}

export async function actualizarMedico(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const actualizado = await medicoService.actualizarMedico(id, req.body);
    if (!actualizado) {
      throw new AppError(404, `Médico con ID ${id} no encontrado`, "MEDICO_NOT_FOUND");
    }

    return res.status(200).json(actualizado);
  } catch (error) {
    return next(error);
  }
}

export async function eliminarMedico(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id) || id <= 0) {
      throw new AppError(400, "El ID proporcionado no es válido", "INVALID_ID");
    }

    const eliminado = await medicoService.eliminarMedico(id);
    if (!eliminado) {
      throw new AppError(404, `Médico con ID ${id} no encontrado`, "MEDICO_NOT_FOUND");
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}