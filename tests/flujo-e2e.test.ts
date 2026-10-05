import { writeFileSync } from "node:fs";
import request from "supertest";

process.env.DATA_PATH = "./tests/fixtures/turnos.test.json";
process.env.MEDICOS_DATA_PATH = "./tests/fixtures/medicos.test.json";
process.env.USUARIOS_DATA_PATH = "./tests/fixtures/usuarios-e2e.test.json";
process.env.JWT_SECRET = "secreto-de-test";

const { aplicacion } = await import("../src/app.js");

let token: string;
const turnoId = 900;

beforeAll(() => {
  writeFileSync(process.env.USUARIOS_DATA_PATH as string, "[]", "utf-8");
  writeFileSync(process.env.DATA_PATH as string, "[]", "utf-8");
});

describe("Flujo E2E: Registro → Login → Create → Read → Update → Delete", () => {
  it("1. Registra un nuevo usuario", async () => {
    const respuesta = await request(aplicacion).post("/api/auth/registro").send({
      email: "e2e@turnosred.com",
      password: "123456",
      rol: "admin",
    });

    expect(respuesta.status).toBe(201);
  });

  it("2. Hace login y obtiene un token", async () => {
    const respuesta = await request(aplicacion).post("/api/auth/login").send({
      email: "e2e@turnosred.com",
      password: "123456",
    });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.token).toBeDefined();
    token = respuesta.body.token;
  });

  it("3. Crea un turno con el token obtenido", async () => {
    const respuesta = await request(aplicacion)
      .post("/api/turnos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: turnoId,
        paciente: "Paciente E2E",
        documento: "11223344",
        especialidad: "Odontología",
        fecha: "25/10/2026",
        hora: "09:00",
        confirmado: "si",
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.id).toBe(turnoId);
  });

  it("4. Obtiene el turno creado por ID", async () => {
    const respuesta = await request(aplicacion).get(`/api/turnos/${turnoId}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.paciente).toBe("Paciente E2E");
  });

  it("5. Actualiza el turno", async () => {
    const respuesta = await request(aplicacion)
      .put(`/api/turnos/${turnoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ confirmado: "no" });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.confirmado).toBe(false);
  });

  it("6. Elimina el turno", async () => {
    const respuesta = await request(aplicacion)
      .delete(`/api/turnos/${turnoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(respuesta.status).toBe(204);
  });

  it("7. Confirma que el turno ya no existe", async () => {
    const respuesta = await request(aplicacion).get(`/api/turnos/${turnoId}`);

    expect(respuesta.status).toBe(404);
  });
});