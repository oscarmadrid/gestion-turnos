import { writeFileSync } from "node:fs";
import jwt from "jsonwebtoken";
import request from "supertest";

process.env.DATA_PATH = "./tests/fixtures/turnos.test.json";
process.env.MEDICOS_DATA_PATH = "./tests/fixtures/medicos.test.json";
process.env.USUARIOS_DATA_PATH = "./tests/fixtures/usuarios.test.json";
process.env.JWT_SECRET = "secreto-de-test";

const { aplicacion } = await import("../src/app.js");

const tokenValido = jwt.sign({ id: 1, rol: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

beforeEach(() => {
  writeFileSync(process.env.DATA_PATH as string, "[]", "utf-8");
});

describe("Integración: /api/turnos", () => {
  it("GET /api/turnos es público y devuelve 200", async () => {
    const respuesta = await request(aplicacion).get("/api/turnos");

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it("POST /api/turnos sin token devuelve 401 AUTH_TOKEN_MISSING", async () => {
    const respuesta = await request(aplicacion).post("/api/turnos").send({
      id: 500,
      paciente: "Test Paciente",
      documento: "12345678",
      especialidad: "Pediatría",
      fecha: "20/10/2026",
      hora: "10:00",
      confirmado: "si",
    });

    expect(respuesta.status).toBe(401);
    expect(respuesta.body.code).toBe("AUTH_TOKEN_MISSING");
  });

  it("POST /api/turnos con body inválido devuelve 400", async () => {
    const respuesta = await request(aplicacion)
      .post("/api/turnos")
      .set("Authorization", `Bearer ${tokenValido}`)
      .send({ id: 501 });

    expect(respuesta.status).toBe(400);
  });

  it("POST /api/turnos con token y body válido devuelve 201", async () => {
    const respuesta = await request(aplicacion)
      .post("/api/turnos")
      .set("Authorization", `Bearer ${tokenValido}`)
      .send({
        id: 502,
        paciente: "Test Paciente",
        documento: "12345678",
        especialidad: "Pediatría",
        fecha: "20/10/2026",
        hora: "10:00",
        confirmado: "si",
      });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.id).toBe(502);
  });
});