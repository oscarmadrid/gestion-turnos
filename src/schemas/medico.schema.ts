import { z } from "zod";

const titleCaseRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*(\s[A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]*)*$/;

export const medicoSchema = z.object({
  nombre: z.string().trim().min(1, { message: "El nombre es obligatorio" }),
  especialidad: z
    .string()
    .trim()
    .regex(titleCaseRegex, { message: "La especialidad debe estar en formato Title Case (ej: 'Odontología')" }),
  matricula: z.string().trim().min(1, { message: "La matrícula es obligatoria" }),
  disponible: z.union([z.string(), z.boolean(), z.number()]),
});

export const medicoUpdateSchema = medicoSchema.partial();

export type MedicoInput = z.infer<typeof medicoSchema>;