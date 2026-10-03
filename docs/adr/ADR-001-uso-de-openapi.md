# ADR-001: Adopción de Swagger/OpenAPI como estándar de documentación

**Fecha:** 2026-09-29
**Estado:** Aceptado

## Contexto

TurnosRed se prepara para integrarse con otros clientes y servicios (equipos de frontend, aplicaciones de terceros). Hasta esta etapa, el contrato de la API se documentaba de forma dispersa: comentarios en el código, el README y la colección de Postman, sin una fuente única y estandarizada que describiera formalmente los endpoints, los esquemas de datos y los códigos de respuesta.

Esta falta de una especificación central genera riesgo de que la documentación quede desactualizada respecto al comportamiento real del backend (drift documental), y dificulta que un equipo externo entienda el contrato sin leer el código fuente completo.

## Decisión

Se adopta **OpenAPI 3.0** como estándar oficial para documentar el contrato REST de TurnosRed, implementado mediante las librerías `swagger-jsdoc` (que genera la especificación a partir de comentarios JSDoc ubicados junto a cada ruta) y `swagger-ui-express` (que publica una interfaz interactiva en `/api-docs`).

Se definieron esquemas reutilizables en `components/schemas` (`Turno`, `Medico`, `ErrorResponse`), alineados explícitamente con los schemas de validación de Zod, para evitar inconsistencias entre lo que la API valida y lo que la documentación declara.

## Consecuencias

**Positivas:**
- La documentación vive junto al código (Docs as Code), reduciendo la probabilidad de desactualización.
- Cualquier desarrollador o equipo externo puede explorar y probar los endpoints desde `/api-docs` sin depender de Postman instalado.
- Los esquemas reutilizables evitan duplicar definiciones de datos en cada endpoint.

**Negativas / costos:**
- Requiere disciplina del equipo para mantener los comentarios JSDoc sincronizados cada vez que cambia un endpoint o un schema de Zod.
- Agrega dos dependencias nuevas al proyecto (`swagger-jsdoc`, `swagger-ui-express`).

## Alternativas consideradas

1. **Documentación manual en el README** (descartada): no ofrece una interfaz interactiva ni validación automática del formato, y tiende a desactualizarse más rápido al no estar vinculada directamente al código de las rutas.
2. **Postman como única fuente de documentación** (descartada): Postman es excelente para pruebas, pero no genera una especificación estándar (OpenAPI) que pueda consumirse por otras herramientas (generadores de clientes, validadores de contrato, etc.).
3. **Herramientas de generación automática desde tipos de TypeScript** (descartada por ahora): soluciones como `tsoa` o `zod-to-openapi` automatizan más el proceso, pero agregan complejidad de configuración que excede el alcance actual del proyecto.

## Limitaciones

- La especificación generada depende de que los comentarios JSDoc estén escritos correctamente; un error de sintaxis en un comentario puede hacer que un endpoint no aparezca documentado, sin que el servidor arroje un error explícito.
- No se implementa (en esta etapa) una validación automática que compare la especificación OpenAPI contra el comportamiento real del backend en tiempo de ejecución (ver matriz de verificación manual en el informe de evidencias).

## Impacto sobre el proyecto

Esta decisión no modifica el comportamiento funcional de la API: es exclusivamente documental. Afecta la carpeta `src/routes` (se agregan comentarios JSDoc), `src/config/swagger.ts` (configuración nueva) y `src/index.ts` (se monta la ruta `/api-docs`). No introduce cambios en los servicios, controladores ni en la lógica de negocio existente.