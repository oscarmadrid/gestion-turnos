import { jest } from "@jest/globals";

const mockReadFile = jest.fn();
const mockWriteFile = jest.fn();

jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

const { AgendaTurnos } = await import("../src/services/agenda.js");

describe("AgendaTurnos", () => {
  let agenda: InstanceType<typeof AgendaTurnos>;

  beforeEach(() => {
    jest.clearAllMocks();
    agenda = new AgendaTurnos();
  });

  it("getTurnos devuelve lista vacía si el archivo no existe", async () => {
    mockReadFile.mockRejectedValueOnce(new Error("ENOENT"));

    const resultado = await agenda.getTurnos();

    expect(resultado).toEqual([]);
  });

  it("getTurnos normaliza fecha/hora y filtra por especialidad", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        {
          id: 1,
          paciente: "Carlos Ruiz",
          documento: "31654210",
          especialidad: "Pediatría",
          fecha: "5-8-2026",
          hora: "9.30",
          confirmado: "si",
        },
      ])
    );

    const resultado = await agenda.getTurnos({ especialidad: "pediatría" });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].fecha).toBe("05/08/2026");
    expect(resultado[0].hora).toBe("9:30");
    expect(resultado[0].confirmado).toBe(true);
  });

  it("getTurnoID devuelve undefined si no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await agenda.getTurnoID(999);

    expect(resultado).toBeUndefined();
  });

  it("PostTurno lanza error si el id ya existe", async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ id: 301 }]));

    await expect(
      agenda.PostTurno({
        id: 301,
        paciente: "Laura Gómez",
        documento: "28941100",
        especialidad: "Pediatría",
        fecha: "20/10/2026",
        hora: "11:30",
        confirmado: "si",
      })
    ).rejects.toThrow();
  });

  it("PostTurno guarda el turno nuevo cuando el id no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");
    mockWriteFile.mockResolvedValueOnce(undefined);

    const creado = await agenda.PostTurno({
      id: 302,
      paciente: "Laura Gómez",
      documento: "28941100",
      especialidad: "Pediatría",
      fecha: "20/10/2026",
      hora: "11:30",
      confirmado: "si",
    });

    expect(creado.id).toBe(302);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("PutTurno devuelve null si el id no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await agenda.PutTurno(999, {} as any);

    expect(resultado).toBeNull();
  });

  it("PutTurno fusiona y guarda cuando el id existe", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify([
        {
          id: 302,
          paciente: "Laura Gómez",
          documento: "28941100",
          especialidad: "Pediatría",
          fecha: "20/10/2026",
          hora: "11:30",
          confirmado: "si",
        },
      ])
    );
    mockWriteFile.mockResolvedValueOnce(undefined);

    const actualizado = await agenda.PutTurno(302, { confirmado: "no" } as any);

    expect(actualizado?.confirmado).toBe(false);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });

  it("DeleteTurno devuelve false si el id no existe", async () => {
    mockReadFile.mockResolvedValueOnce("[]");

    const resultado = await agenda.DeleteTurno(999);

    expect(resultado).toBe(false);
  });

  it("DeleteTurno elimina y guarda cuando el id existe", async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify([{ id: 302 }]));
    mockWriteFile.mockResolvedValueOnce(undefined);

    const resultado = await agenda.DeleteTurno(302);

    expect(resultado).toBe(true);
    expect(mockWriteFile).toHaveBeenCalledTimes(1);
  });
});