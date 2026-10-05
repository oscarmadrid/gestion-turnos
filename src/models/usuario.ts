export interface UsuarioCrudo {
  id?: string | number;
  email?: string;
  password?: string;
  rol?: string;
}

export interface Usuario {
  id: number;
  email: string;
  password: string;
  rol: "admin" | "recepcion";
}

export interface UsuarioPublico {
  id: number;
  email: string;
  rol: string;
}