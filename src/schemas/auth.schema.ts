import { z } from "zod";

export const registroSchema = z.object({
  email: z.string().trim().email({ message: "Ingresa un email válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  rol: z.enum(["admin", "recepcion"]).default("recepcion"),
});

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Ingresa un email válido" }),
  password: z.string().min(1, { message: "La contraseña es obligatoria" }),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;