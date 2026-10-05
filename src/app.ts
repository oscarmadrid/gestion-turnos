import "dotenv/config";
import express from "express";
import turnoRoutes from "./routes/turno.routes.js";
import medicoRoutes from "./routes/medico.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./errors/AppError.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import morgan from "morgan";
import { logger } from "./config/logger.js";

export const aplicacion = express();

aplicacion.use(express.json());
aplicacion.use(express.static("public"));
aplicacion.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

aplicacion.use("/api", authRoutes);
aplicacion.use("/api", turnoRoutes);
aplicacion.use("/api", medicoRoutes);
aplicacion.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta no encontrada (cualquier método/URL que no matchee)
aplicacion.use((req, res, next) => {
  next(new AppError(404, `Ruta ${req.method} ${req.originalUrl} no encontrada`, "RESOURCE_NOT_FOUND"));
});

// Middleware de errores — siempre al final, después de todas las rutas
aplicacion.use(errorHandler);