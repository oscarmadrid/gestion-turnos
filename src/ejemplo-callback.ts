import fs from 'node:fs';

// Ejemplo comparativo utilizando callbacks tradicionales (node:fs)
// Esto demuestra la complejidad del anidamiento (callback hell) frente a la limpieza de async/await.
export function cargarTurnosConCallback(ruta: string) {
  fs.readFile(ruta, 'utf-8', (error, contenido) => {
    if (error) {
      console.error('Error con callback:', error.message);
      return;
    }
    try {
      const turnos = JSON.parse(contenido);
      console.log('Turnos con callback:', turnos);
    } catch (parseError: any) {
      console.error('Error al parsear JSON:', parseError.message);
    }
  });
}
