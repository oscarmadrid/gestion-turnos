import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TurnosRed API",
      version: "1.0.0",
      description:
        "API REST para la gestión centralizada de turnos médicos y profesionales de salud.",
    },
    servers: [{ url: "http://localhost:3000/api", description: "Servidor local" }],
    components: {
      schemas: {
        Turno: {
          type: "object",
          required: ["id", "paciente", "documento", "especialidad", "fecha", "hora", "confirmado"],
          properties: {
            id: { type: "integer", example: 200, description: "Identificador del turno, provisto por la sede de origen" },
            paciente: { type: "string", example: "Carlos Ruiz" },
            documento: { type: "string", example: "31654210", description: "Documento del paciente (formato libre)" },
            especialidad: {
              type: "string",
              enum: ["Clínica médica", "Pediatría", "Odontología", "Nutrición"],
              example: "Pediatría",
            },
            fecha: { type: "string", example: "14/08/2026" },
            hora: { type: "string", example: "10:00" },
            confirmado: { type: "boolean", example: true },
            medicoId: { type: "integer", nullable: true, example: 1 },
            observaciones: { type: "string", nullable: true },
          },
        },
        Medico: {
          type: "object",
          required: ["id", "nombre", "especialidad", "matricula", "disponible"],
          properties: {
            id: { type: "integer", example: 1, description: "Autogenerado por el servidor" },
            nombre: { type: "string", example: "Dra. Ana Torres" },
            especialidad: {
              type: "string",
              enum: ["Clínica médica", "Pediatría", "Odontología", "Nutrición"],
              example: "Pediatría",
            },
            matricula: { type: "string", example: "MP-4521" },
            disponible: { type: "boolean", example: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            status: { type: "integer", example: 400 },
            message: { type: "string", example: "Error de validación en los datos ingresados" },
            code: { type: "string", example: "VALIDATION_ERROR" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  campo: { type: "string", example: "especialidad" },
                  mensaje: { type: "string", example: "La especialidad debe estar en formato Title Case" },
                },
              },
            },
          },
        },
      },
    },
  },
  // Le decimos a swagger-jsdoc dónde buscar los comentarios @openapi
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);