import { createServer } from "node:http";
import { Server } from "socket.io";
import { aplicacion } from "./app.js";
import { eventBus } from "./events/eventBus.js";

const servidorHttp = createServer(aplicacion);

const servidorTiempoReal = new Server(servidorHttp, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const PORT = process.env.PORT || 3000;

servidorTiempoReal.on("connection", (conexion) => {
  console.log(`[Socket.IO] Cliente conectado: ${conexion.id}`);

  conexion.on("disconnect", () => {
    console.log(`[Socket.IO] Cliente desconectado: ${conexion.id}`);
  });
});

eventBus.on("turno:ListarTurnos", (turnos) => {
  console.log(`[EVENTO INTERNO] Consulta de turnos registrados`);
  servidorTiempoReal.emit("turno:ListarTurnos", turnos);
});

eventBus.on("turno:ConsultaTurnoID", (turno) => {
  console.log(`[EVENTO INTERNO] Consulta de turno ID: ${turno.id}`);
  servidorTiempoReal.emit("turno:ConsultaTurnoID", turno);
});

eventBus.on("turno:nuevo", (turno) => {
  console.log(`[EVENTO INTERNO] Nuevo turno creado ID: ${turno.id}`);
  servidorTiempoReal.emit("turno:nuevo", turno);
});

eventBus.on("turno:actualizado", (turno) => {
  console.log(`[EVENTO INTERNO] Turno actualizado ID: ${turno.id}`);
  servidorTiempoReal.emit("turno:actualizado", turno);
});

eventBus.on("turno:eliminado", (id) => {
  console.log(`[EVENTO INTERNO] Turno eliminado ID: ${id}`);
  servidorTiempoReal.emit("turno:eliminado", { id });
});

servidorHttp.listen(PORT, () => {
  console.log(`Servidor disponible en http://localhost:${PORT}`);
});