import { readFile } from 'node:fs';

readFile ("./datos/turnos.json", "utf8", (error, contenido) => {

  if (error) {
      console.error("No fue posible leer el archivo", error.message);
      return;
  }

  consolde.log("Contenido recuperado.");
  console.log(contenido);

});
