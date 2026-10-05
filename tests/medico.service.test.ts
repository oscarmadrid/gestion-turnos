import { jest } from "@jest/globals";

const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

const { MedicoService } = await import("../src/services/medico.service.js");

describe("MedicoService", () => {
  let service: InstanceType<typeof MedicoService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MedicoService();
  });

  it("getMedicos devuelve lista vacía si el archivo no existe", async () => {
    mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));

    const resultado = await service.getMedicos();

    expect(resultado).toEqual([]);
  });

  it("crearMedico autogenera el id en base al máximo existente", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, nombre: "Dra. Ana Torres", especialidad: "Pediatría", matricula: "MP-1", disponible: "true" },
      ])
    );
    mockWriteFile.mockResolvedValueOnce(undefined);

    const nuevo = await service.crearMedico({
      nombre: "Dr. Juan Pérez",
      especialidad: "Nutrición",
      matricula: "MP-2",
      disponible: "si",
    });

    expect(nuevo.id).toBe(2);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("crearMedico lanza AppError si faltan campos obligatorios", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    await expect(
      service.crearMedico({ nombre: "", especialidad: "", matricula: "" } as any)
    ).rejects.toThrow();
  });

  it("eliminarMedico devuelve false si el id no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await service.eliminarMedico(999);

    expect(resultado).toBe(false);
  });

    it("getMedicos aplica filtro por especialidad y disponible", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, nombre: "Dra. Ana Torres", especialidad: "Pediatría", matricula: "MP-1", disponible: "true" },
        { id: 2, nombre: "Dr. Luis Soto", especialidad: "Odontología", matricula: "MP-2", disponible: "false" },
      ])
    );

    const resultado = await service.getMedicos({ especialidad: "pediatría", disponible: true });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe("Dra. Ana Torres");
  });

  it("getMedicoID devuelve undefined si no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await service.getMedicoID(999);

    expect(resultado).toBeUndefined();
  });

  it("actualizarMedico devuelve null si el id no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await service.actualizarMedico(999, { nombre: "X" } as any);

    expect(resultado).toBeNull();
  });

  it("actualizarMedico fusiona datos y guarda cuando el id existe", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, nombre: "Dra. Ana Torres", especialidad: "Pediatría", matricula: "MP-1", disponible: "true" },
      ])
    );
    mockWriteFile.mockResolvedValueOnce(undefined);

    const actualizado = await service.actualizarMedico(1, { disponible: "false" } as any);

    expect(actualizado?.disponible).toBe(false);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("eliminarMedico elimina y guarda cuando el id existe", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        { id: 1, nombre: "Dra. Ana Torres", especialidad: "Pediatría", matricula: "MP-1", disponible: "true" },
      ])
    );
    mockWriteFile.mockResolvedValueOnce(undefined);

    const resultado = await service.eliminarMedico(1);

    expect(resultado).toBe(true);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

});