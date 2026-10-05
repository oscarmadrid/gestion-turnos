# ADR-002: Adopción de JWT para autenticación y autorización

**Fecha:** 2026-10-04
**Estado:** Aceptado

## Contexto

En la etapa anterior (ADR-002 original), se había dejado registrada como decisión futura la adopción de JWT, dado que TurnosRed no contaba con ningún mecanismo de autenticación y todos los endpoints eran de acceso público. Al avanzar hacia un escenario más cercano a producción, una auditoría técnica determinó que las operaciones de escritura (creación, modificación y eliminación de turnos y médicos) debían quedar restringidas a usuarios autenticados.

## Decisión

Se implementó autenticación basada en **JSON Web Tokens (JWT)**, compuesta por:

- Dos endpoints nuevos: `POST /auth/registro` (crea un usuario, encriptando la contraseña con `bcryptjs` antes de persistirla) y `POST /auth/login` (valida credenciales y emite un token firmado con `jsonwebtoken`).
- Un middleware `verificarToken`, que extrae el token del header `Authorization: Bearer <token>`, valida su firma y vigencia contra el secreto `JWT_SECRET` (configurado por variable de entorno), e inyecta el payload decodificado (`id`, `rol`) en `req.user`.
- Protección aplicada selectivamente: las operaciones de lectura (`GET`) permanecen públicas; las de escritura (`POST`, `PUT`, `DELETE`) sobre `/turnos` y `/medicos` requieren un token válido.
- Sincronización con la especificación OpenAPI: se declaró `bearerAuth` en `components.securitySchemes`, y se marcó `security: [{ bearerAuth: [] }]` en cada operación protegida.

## Consecuencias

**Positivas:**
- Las operaciones sensibles (alta, modificación y baja de turnos y médicos) ya no son accesibles sin autenticación.
- El payload del token (`id`, `rol`) habilita una futura autorización más granular por rol, sin requerir cambios estructurales adicionales.
- Al ser stateless, no se introdujo necesidad de almacenamiento de sesión en el servidor, manteniendo la arquitectura REST original.
- La especificación OpenAPI refleja fielmente qué endpoints requieren token, visible directamente desde `/api-docs`.

**Negativas / costos reales:**
- Se sumó un nuevo recurso de persistencia (`usuarios.json`) y una nueva capa de servicio (`auth.service.ts`), aumentando la superficie del proyecto.
- Las pruebas de Postman e integración debieron actualizarse para obtener y adjuntar el token antes de ejecutar operaciones de escritura, incrementando la complejidad de los flujos de prueba (ver Actividad 4, punto 4: tests E2E).
- El manejo del secreto (`JWT_SECRET`) depende enteramente de la correcta configuración del `.env`; su ausencia provoca errores 500 no diferenciados de otros fallos internos si no se valida explícitamente (mitigado en este proyecto mediante una verificación explícita en `verificarToken` y `auth.service.ts`).

## Alternativas consideradas

Las mismas evaluadas en el ADR original (sesiones basadas en cookies, API Keys estáticas, OAuth 2.0 con proveedor externo) se mantienen descartadas por los mismos motivos: JWT sigue siendo la opción más adecuada para una API stateless consumida por múltiples clientes, sin requerir infraestructura adicional de un proveedor de identidad externo en esta etapa del proyecto.

## Limitaciones

- No se implementó renovación automática de tokens (refresh tokens); al expirar, el usuario debe volver a autenticarse mediante `/auth/login`.
- La autorización por rol (`admin` vs. `recepcion`) se limita a incluir el campo `rol` en el payload del token; no se implementó todavía un middleware que restrinja operaciones específicas según el rol (por ejemplo, impedir que `recepcion` elimine registros). Queda como mejora pendiente para una futura iteración.
- La lista de usuarios se persiste en un archivo JSON plano (`usuarios.json`), heredando las mismas limitaciones de concurrencia documentadas en el ADR-004 para la persistencia de turnos.

## Impacto sobre el proyecto

A diferencia del ADR-002 original (puramente documental), esta decisión **sí modificó el código del proyecto**: se agregaron `src/models/usuario.ts`, `src/schemas/auth.schema.ts`, `src/services/auth.service.ts`, `src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts` y `src/middlewares/verificarToken.ts`; se modificaron `turno.routes.ts`, `medico.routes.ts`, `index.ts`, `swagger.ts` y `.env.example`; y se incorporó `data/usuarios.json` como nuevo recurso de persistencia.