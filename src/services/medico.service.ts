import type { Medico, MedicoCrudo } from "../models/medico.js";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "../errors/AppError.js";

export interface FiltrosMedico {
  especialidad?: string;
  disponible?: boolean;
}

export class MedicoService {
  private filePath = path.resolve(process.env.MEDICOS_DATA_PATH || "./data/medicos.json");

  private normalizarMedico(medicoCrudo: MedicoCrudo): Medico | null {
    const idNum = parseInt(String(medicoCrudo.id), 10);
    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) return null;

    if (!medicoCrudo.nombre || !medicoCrudo.especialidad || !medicoCrudo.matricula) {
      return null;
    }

    const disponibleStr = String(medicoCrudo.disponible ?? "").toLowerCase().trim();
    const disponibleBool =
      disponibleStr === "si" || disponibleStr === "sí" || disponibleStr === "true" || disponibleStr === "1";

    return {
      id: idNum,
      nombre: String(medicoCrudo.nombre).trim(),
      especialidad: String(medicoCrudo.especialidad).trim(),
      matricula: String(medicoCrudo.matricula).trim(),
      disponible: disponibleBool,
    };
  }

  private async leerCrudos(): Promise<MedicoCrudo[]> {
    const contenido = await readFile(this.filePath, "utf-8").catch(() => "[]");
    return JSON.parse(contenido);
  }

  private async guardarCrudos(crudos: MedicoCrudo[]): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(crudos, null, 2), "utf-8");
  }

  async getMedicos(filtros: FiltrosMedico = {}): Promise<Medico[]> {
    const crudos = await this.leerCrudos();
    let normalizados = crudos.map((m) => this.normalizarMedico(m)).filter((m): m is Medico => m !== null);
    console.log(`[Médicos] Aceptados: ${normalizados.length} | Rechazados: ${crudos.length - normalizados.length}`);

    if (filtros.especialidad) {
        const especialidadBuscada = filtros.especialidad.toLowerCase();
        normalizados = normalizados.filter((m) => m.especialidad.toLowerCase() === especialidadBuscada);
    }

    if (filtros.disponible !== undefined) {
        normalizados = normalizados.filter((m) => m.disponible === filtros.disponible);
    }

    return normalizados;
  }

  async getMedicoID(id: number): Promise<Medico | undefined> {
    const crudos = await this.leerCrudos();
    const encontrado = crudos.find((m) => parseInt(String(m.id), 10) === id);
    if (!encontrado) return undefined;
    const normalizado = this.normalizarMedico(encontrado);
    return normalizado ?? undefined;
  }

  async crearMedico(nuevaData: MedicoCrudo): Promise<Medico> {
    const crudos = await this.leerCrudos();

    const maxId = crudos.reduce((max, m) => {
      const n = parseInt(String(m.id), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const dataConId = { ...nuevaData, id: maxId + 1 };
    const normalizado = this.normalizarMedico(dataConId);
    if (!normalizado) {
      throw new AppError(400, "No se pudo crear el médico. Verifique los campos obligatorios.", "VALIDATION_ERROR");
    }

    crudos.push(dataConId);
    await this.guardarCrudos(crudos);
    return normalizado;
  }

  async actualizarMedico(id: number, datosActualizados: MedicoCrudo): Promise<Medico | null> {
    const crudos = await this.leerCrudos();
    const index = crudos.findIndex((m) => parseInt(String(m.id), 10) === id);
    if (index === -1) return null;

    const fusionado: MedicoCrudo = { ...crudos[index], ...datosActualizados, id };
    const normalizado = this.normalizarMedico(fusionado);
    if (!normalizado) {
      throw new AppError(400, "No se pudo actualizar el médico. Verifique los campos.", "VALIDATION_ERROR");
    }

    crudos[index] = fusionado;
    await this.guardarCrudos(crudos);
    return normalizado;
  }

  async eliminarMedico(id: number): Promise<boolean> {
    const crudos = await this.leerCrudos();
    const index = crudos.findIndex((m) => parseInt(String(m.id), 10) === id);
    if (index === -1) return false;

    crudos.splice(index, 1);
    await this.guardarCrudos(crudos);
    return true;
  }
}