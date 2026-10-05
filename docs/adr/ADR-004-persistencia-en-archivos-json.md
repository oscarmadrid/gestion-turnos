# ADR-004: Persistencia en archivos JSON planos

**Fecha:** 2026-10-05
**Estado:** Aceptado

## Contexto

Desde el inicio del proyecto, TurnosRed persiste sus datos (`turnos.json`, `medicos.json`, `usuarios.json`) como archivos JSON planos en el sistema de archivos local, leídos y escritos mediante `node:fs/promises` (`readFile`/`writeFile`) en cada operación. No se incorporó un motor de base de datos (relacional ni documental) en ninguna de las 4 actividades.

## Decisión

Se mantiene la persistencia basada en archivos JSON para los tres recursos del sistema (turnos, médicos, usuarios), con el siguiente patrón en los tres servicios (`agenda.ts`, `medico.service.ts`, `auth.service.ts`):

1. Leer el archivo completo (`readFile`).
2. Parsear el JSON a memoria.
3. Modificar el arreglo en memoria (agregar, actualizar o eliminar un elemento).
4. Reescribir el archivo completo (`writeFile`) con el arreglo actualizado.

Esta decisión se sostuvo por tratarse de un prototipo académico, donde la prioridad era demostrar la arquitectura en capas, la validación y, en esta última etapa, la seguridad y el testing — no la persistencia transaccional de nivel productivo.

## Consecuencias

**Positivas:**
- Cero dependencias externas (no requiere instalar ni levantar un motor de base de datos para correr el proyecto).
- Los datos son legibles y editables directamente como texto plano, útil para debugging e inspección manual durante el desarrollo.
- Simplifica el entorno de testing: los tests de integración y E2E (ver Actividad 4, punto 4) pueden apuntar a archivos de fixture aislados simplemente cambiando una variable de entorno (`DATA_PATH`, `MEDICOS_DATA_PATH`, `USUARIOS_DATA_PATH`).

**Negativas / riesgos reales de concurrencia:**
- El patrón "leer todo → modificar en memoria → escribir todo" **no es atómico**. Si dos requests llegan casi al mismo tiempo (por ejemplo, dos `POST /turnos` simultáneos), ambos pueden leer el archivo en el mismo estado, modificar su copia en memoria de forma independiente, y el segundo `writeFile` en completarse **sobrescribe por completo** los cambios del primero (condición de carrera clásica *read-modify-write*, conocida como *lost update*).
- No hay bloqueo de archivo (*file locking*) ni control de versiones optimista, por lo que no hay forma de detectar que el archivo cambió entre la lectura y la escritura.
- No existen transacciones: si el proceso se interrumpe a mitad de un `writeFile`, el archivo puede quedar corrupto o truncado.
- El rendimiento se degrada linealmente con el tamaño del archivo, ya que cada operación reescribe el dataset completo, sin importar cuántos registros se modifiquen.

## Alternativas consideradas

- **Base de datos relacional (PostgreSQL/MySQL):** ofrece transacciones ACID y resolvería por completo el problema de concurrencia, pero exige levantar y administrar un motor de base de datos adicional, fuera del alcance definido para las 4 actividades del curso.
- **Base de datos documental (MongoDB):** similar en espíritu al modelo actual (documentos JSON), con mejor manejo de concurrencia, pero igualmente fuera del alcance definido.
- **SQLite embebido:** opción intermedia (sin servidor externo, con transacciones reales), que se considera la migración más natural si el proyecto avanzara hacia un escenario productivo real.

## Limitaciones

- El sistema **no es seguro para escrituras concurrentes** tal como está. En un entorno con múltiples usuarios reales escribiendo al mismo tiempo, es posible perder datos silenciosamente.
- Esta limitación aplica por igual a `turnos.json`, `medicos.json` y `usuarios.json` (y por lo tanto a los flujos de registro/login de autenticación del punto 1).
- No se implementó ningún mecanismo de mitigación (colas de escritura, locks en memoria, ni librerías de "write queue") dado que excede el alcance de esta actividad.

## Impacto sobre el proyecto

No se modifica código existente; este ADR documenta una decisión arquitectónica ya vigente desde la Actividad 1 y dimensiona explícitamente su riesgo, tal como lo exige la Actividad 4.