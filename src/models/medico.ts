export interface MedicoCrudo {
  id?: string | number;
  nombre?: string;
  especialidad?: string;
  matricula?: string | number;
  disponible?: string | boolean | number;
}

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  matricula: string;
  disponible: boolean;
}