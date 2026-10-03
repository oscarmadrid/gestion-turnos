# ADR-002: Adopción futura de JWT para autenticación y autorización

**Fecha:** 2026-09-29
**Estado:** Propuesto

## Contexto

TurnosRed no implementa actualmente ningún mecanismo de autenticación ni autorización: todos los endpoints de `/api/turnos` y `/api/medicos` son de acceso público. Esto es aceptable en la etapa actual del proyecto (prototipo en desarrollo, sin datos sensibles reales en producción), pero representa un riesgo si el sistema avanza hacia un entorno real, donde datos de pacientes y profesionales de salud requieren control de acceso.

Este ADR documenta una decisión **futura**, no implementada todavía, para dejar registro de la estrategia planificada y evitar que la autenticación se incorpore de forma improvisada más adelante.

## Decisión

Se propone adoptar **JSON Web Tokens (JWT)** como mecanismo de autenticación y autorización en una etapa posterior del proyecto. El esquema propuesto consistiría en:
- Un endpoint de login que emita un token firmado con una clave secreta del servidor.
- Un middleware de autenticación que valide el token en el header `Authorization: Bearer <token>` antes de permitir el acceso a los endpoints protegidos.
- Posibles roles diferenciados (por ejemplo, administrador de sede vs. personal de recepción) mediante claims dentro del token.

**Esta decisión se mantiene en estado "Propuesto" y no debe implementarse en el código actual**, dado que excede el alcance funcional definido para esta etapa del proyecto.

## Consecuencias

**Positivas (una vez implementado):**
- Permitiría restringir el acceso a operaciones sensibles (creación, modificación y eliminación de turnos y médicos).
- JWT es un estándar ampliamente adoptado, con soporte nativo en la mayoría de los clientes HTTP y frameworks.
- No requiere almacenamiento de sesión en el servidor (stateless), lo cual es compatible con la arquitectura REST actual.

**Negativas / costos (a futuro):**
- Añadiría complejidad al flujo de pruebas en Postman (habría que gestionar tokens en cada request).
- Requeriría definir una estrategia de expiración y renovación de tokens, y un mecanismo seguro de almacenamiento de la clave secreta.

## Alternativas consideradas

1. **Sesiones basadas en cookies** (no priorizada): viable, pero menos natural para una API consumida por múltiples clientes (frontend web, Postman, posibles integraciones externas) que no comparten el mismo dominio.
2. **API Keys estáticas** (no priorizada): más simple de implementar, pero ofrece menor granularidad (no permite diferenciar roles ni expiración) y es menos adecuada si se prevé una app cliente interactiva.
3. **OAuth 2.0 con proveedor externo** (descartada para esta etapa): resultaría sobredimensionado para el alcance actual del proyecto, al no existir todavía integración con terceros que lo requieran.

## Limitaciones

- Esta decisión es exploratoria: no se ha evaluado aún el proveedor de identidad, la librería específica de JWT a utilizar, ni el modelo de roles definitivo.
- La implementación real requerirá actualizar también la especificación OpenAPI (agregar `securitySchemes`), lo cual queda explícitamente fuera del alcance de la Actividad 3 actual.

## Impacto sobre el proyecto

Al tratarse de una decisión en estado "Propuesto", **no genera ningún cambio en el código, las rutas, los controladores ni la especificación OpenAPI actual**. Su único impacto en esta etapa es documental: deja registro de la intención arquitectónica para guiar el desarrollo futuro del proyecto.