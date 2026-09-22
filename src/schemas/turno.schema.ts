import { z } from "zod";

const titleCaseRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*(\s[A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]*)*$/;

export const turnoSchema = z.object({
  id: z.number().int().positive({ message: "El id debe ser un número entero positivo" }),
  paciente: z.string().trim().min(1, { message: "El paciente es obligatorio" }),
  documento: z.string().trim().min(1, { message: "El documento es obligatorio" }),
  especialidad: z
    .string()
    .trim()
    .regex(titleCaseRegex, { message: "La especialidad debe estar en formato Title Case (ej: 'Clínica médica')" }),
  fecha: z.string().trim().min(1, { message: "La fecha es obligatoria" }),
  hora: z.string().trim().min(1, { message: "La hora es obligatoria" }),
  confirmado: z.union([z.string(), z.boolean(), z.number()]),
  medicoId: z.number().int().positive().optional(),
  observaciones: z.string().trim().optional(),
});

export const turnoUpdateSchema = turnoSchema.partial();

export type TurnoInput = z.infer<typeof turnoSchema>;