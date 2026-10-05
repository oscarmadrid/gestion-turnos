import pino from "pino";

const nivelPorDefecto = process.env.NODE_ENV === "production" ? "error" : "info";

export const logger = pino({
  level: process.env.LOG_LEVEL || nivelPorDefecto,
  redact: {
    paths: [
      "password",
      "*.password",
      "token",
      "*.token",
      "authorization",
      "headers.authorization",
      "req.headers.authorization",
      "documento",
      "*.documento",
    ],
    censor: "[OCULTO]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});