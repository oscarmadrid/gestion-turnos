import type { Turno, TurnoCrudo } from "../models/turno.js";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { eventBus } from "../events/eventBus.js";

export class AgendaTurnos {
    private filePath = path.resolve(process.env.DATA_PATH || "./data/turnos.json");

    private normalizarFecha(fechaStr: string): string {
        const limpio = String(fechaStr).trim().replace(/-/g, "/");
        const partes = limpio.split("/");
        if (partes.length === 3) {
            let [dia, mes, anio] = partes;
            if (anio.length === 2) anio = "20" + anio;
            dia = dia.padStart(2, "0");
            mes = mes.padStart(2, "0");
            return `${dia}/${mes}/${anio}`;
        }
        return fechaStr;
    }

    private normalizarHora(horaStr: string): string {
        const limpio = String(horaStr).trim();
        return limpio.replace(/\./g, ":");
    }

    private normalizarTurno(turnoCrudo: TurnoCrudo): Turno | null {
        const idNum = parseInt(String(turnoCrudo.id), 10);
        if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) return null;

        if (!turnoCrudo.paciente || !turnoCrudo.documento || !turnoCrudo.especialidad || !turnoCrudo.fecha || !turnoCrudo.hora || !turnoCrudo.confirmado) {
            return null;
        }

        const confirmadoStr = String(turnoCrudo.confirmado ?? "").toLowerCase().trim();
        const confirmadoBool = confirmadoStr === "si" || confirmadoStr === "sí" || confirmadoStr === "true" || confirmadoStr === "1";

        return {
            id: idNum,
            paciente: String(turnoCrudo.paciente).trim(),
            documento: String(turnoCrudo.documento).trim(),
            especialidad: String(turnoCrudo.especialidad).trim(),
            fecha: this.normalizarFecha(String(turnoCrudo.fecha)),
            hora: this.normalizarHora(String(turnoCrudo.hora)),
            confirmado: confirmadoBool,
            ...(turnoCrudo.observaciones && { observaciones: String(turnoCrudo.observaciones).trim() }),
        };
    }
    
    async getTurnos(): Promise<Turno[]> {
    try {
        const contenido = await readFile(this.filePath, "utf-8");
        const crudos: TurnoCrudo[] = JSON.parse(contenido);

        const turnosNormalizados = crudos
            .map((t) => this.normalizarTurno(t))
            .filter((t): t is Turno => t !== null);

        // Emitimos el evento de consulta general con la lista completa
        eventBus.emit("turno:ListarTurnos", turnosNormalizados);

        return turnosNormalizados;
    } catch {
        return [];
    }
}

    async getTurnosID(id: number): Promise<Turno | undefined> {
        const turnos = await this.getTurnos();
        return turnos.find((t) => t.id === id);
    }

    async PostTurno(nuevaData: TurnoCrudo): Promise<Turno> {
        const contenido = await readFile(this.filePath, "utf-8").catch(() => "[]");
        const crudos: TurnoCrudo[] = JSON.parse(contenido);

        // Validamos si ya existe un turno con el ID que mandó el cliente
        const existe = crudos.some((t) => t.id === nuevaData.id);
        if (existe) {
            throw new Error(`El ID ${nuevaData.id} ya se encuentra registrado.`);
        }

        // Normalizamos el turno usando el ID que traía el cliente
        const turnoNormalizado = this.normalizarTurno(nuevaData);
        if (!turnoNormalizado) {
            throw new Error("No se pudo normalizar el turno para agregarlo.");
        }

        // Guardamos el objeto crudo original con su ID respetado
        crudos.push(nuevaData);
        await writeFile(this.filePath, JSON.stringify(crudos, null, 2), "utf-8");

        // EMISIÓN EVENTO
        eventBus.emit("turno:nuevo", turnoNormalizado);

        return turnoNormalizado;
    }

    async PutTurno(id: number, datosActualizados: TurnoCrudo): Promise<Turno | null> {
        const contenido = await readFile(this.filePath, "utf-8").catch(() => "[]");
        const crudos: TurnoCrudo[] = JSON.parse(contenido);

        const index = crudos.findIndex((t) => parseInt(String(t.id), 10) === id);
        if (index === -1) return null;

        const turnoCrudoActual = crudos[index];
        const turnoFusionado: TurnoCrudo = {
            ...turnoCrudoActual,
            ...datosActualizados,
            id: id,
        };

        const turnoNormalizado = this.normalizarTurno(turnoFusionado);
        if (!turnoNormalizado) return null;

        crudos[index] = turnoFusionado;
        await writeFile(this.filePath, JSON.stringify(crudos, null, 2), "utf-8");

        // EMISIÓN EVENTO
        eventBus.emit("turno:actualizado", turnoNormalizado);

        return turnoNormalizado;
    }

    async DeleteTurno(id: number): Promise<boolean> {
        const contenido = await readFile(this.filePath, "utf-8").catch(() => "[]");
        const crudos: TurnoCrudo[] = JSON.parse(contenido);

        const index = crudos.findIndex((t) => parseInt(String(t.id), 10) === id);
        if (index === -1) return false;

        crudos.splice(index, 1);
        await writeFile(this.filePath, JSON.stringify(crudos, null, 2), "utf-8");

        // EMISIÓN DEL EVENTO INTERNO
        eventBus.emit("turno:eliminado", id);

        return true;
    }
}