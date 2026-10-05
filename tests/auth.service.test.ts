import { jest } from "@jest/globals";

const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();
const mockHash = jest.fn();
const mockCompare = jest.fn();
const mockSign = jest.fn();

jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: { hash: mockHash, compare: mockCompare },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: mockSign },
}));

const { AuthService } = await import("../src/services/auth.service.js");

describe("AuthService", () => {
  let service: InstanceType<typeof AuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secreto-de-prueba";
    service = new AuthService();
  });

  it("registrar lanza error si el email ya existe", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([{ id: 1, email: "admin@turnosred.com", password: "hash", rol: "admin" }])
    );

    await expect(service.registrar("admin@turnosred.com", "123456", "admin")).rejects.toThrow();
  });

  it("registrar crea el usuario con password hasheada y sin exponerla", async () => {
    mockReadFile.mockResolvedValueOnce("[]");
    mockHash.mockResolvedValueOnce("hash-generado");
    mockWriteFile.mockResolvedValueOnce(undefined);

    const usuario = await service.registrar("nuevo@turnosred.com", "123456", "recepcion");

    expect(usuario).toEqual({ id: 1, email: "nuevo@turnosred.com", rol: "recepcion" });
    expect(usuario).not.toHaveProperty("password");
    expect(mockHash).toHaveBeenCalledWith("123456", 10);
  });

  it("login lanza error si el usuario no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    await expect(service.login("noexiste@turnosred.com", "123456")).rejects.toThrow();
  });

  it("login lanza error si la contraseña es incorrecta", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([{ id: 1, email: "admin@turnosred.com", password: "hash", rol: "admin" }])
    );
    mockCompare.mockResolvedValueOnce(false);

    await expect(service.login("admin@turnosred.com", "incorrecta")).rejects.toThrow();
  });

  it("login lanza error 500 si falta JWT_SECRET", async () => {
    delete process.env.JWT_SECRET;
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([{ id: 1, email: "admin@turnosred.com", password: "hash", rol: "admin" }])
    );
    mockCompare.mockResolvedValueOnce(true);

    await expect(service.login("admin@turnosred.com", "123456")).rejects.toThrow();
  });

  it("login devuelve token y usuario cuando las credenciales son correctas", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([{ id: 1, email: "admin@turnosred.com", password: "hash", rol: "admin" }])
    );
    mockCompare.mockResolvedValueOnce(true);
    mockSign.mockReturnValueOnce("token-generado");

    const resultado = await service.login("admin@turnosred.com", "123456");

    expect(resultado.token).toBe("token-generado");
    expect(resultado.usuario).toEqual({ id: 1, email: "admin@turnosred.com", rol: "admin" });
  });
});