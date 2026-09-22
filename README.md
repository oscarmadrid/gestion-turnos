# TurnosRed - Sistema de Gestión de Turnos Médicos

TurnosRed es un prototipo de backend desarrollado en Node.js, Express y TypeScript para centralizar y normalizar la gestión de turnos de centros de atención ambulatoria. Permite procesar archivos JSON con formatos inconsistentes, gestionar operaciones CRUD mediante una API REST, y sincronizar cambios en tiempo real utilizando WebSockets (Socket.IO) y un bus de eventos interno (`EventEmitter`).

---

## 1. Requisitos + instalación + ejecución

## Requisitos previos
- **Node.js** (versión 20.x o superior recomendada) (ver `.nvmrc`).
- npm

## Instalación
```bash
git clone https://github.com/oscarmadrid/gestion-turnos.git
cd gestion-turnos
npm install
cp .env.example .env
```

## Ejecución
```bash
npm run dev      # modo desarrollo (tsx watch)
npm run build    # compila TypeScript a dist/
npm start        # ejecuta el build compilado
```

El servidor levanta por defecto en `http://localhost:3000`. El cliente de prueba de Socket.IO queda disponible en `http://localhost:3000/socket-test-client.html`.

---

## 2. Tabla de Variables de Entorno

Crea un archivo .env en la raíz de tu proyecto e incluye la siguiente configuración para personalizar el comportamiento del servidor:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto donde escucha el servidor Express | `3000` |
| `DATA_PATH` | Ruta al archivo JSON de persistencia de Turnos | `./data/turnos.json` |
| `MEDICOS_DATA_PATH` | Ruta al archivo JSON de persistencia de Médicos | `./data/medicos.json` |

---

## 3. Scripts Disponibles en package.json

El proyecto incluye los siguientes scripts organizados para el ciclo de vida de desarrollo y producción:

- npm run dev: Inicia el servidor de desarrollo utilizando tsx para reflejar cambios automáticamente en tiempo real sin necesidad de reiniciar manualmente.

- npm run build: Compila todo el código fuente escrito en TypeScript (.ts) a JavaScript plano (.js) dentro de la carpeta de distribución para producción.

- npm start: Ejecuta la aplicación utilizando la versión compilada previamente para entornos de producción.

---

## 4. Estructura de Carpetas y Arquitectura

La arquitectura del proyecto sigue una estricta separación modular de responsabilidades para garantizar mantenibilidad y escalabilidad:

```
gestion-turnos/
├── data/
│   ├── turnos.json
│   └── medicos.json
├── public/
│   └── socket-test-client.html   # Cliente de prueba Socket.IO en tiempo real
├── src/
│   ├── controllers/
│   │   ├── turno.controller.ts   # Maneja req/res de Turnos, delega al service
│   │   └── medico.controller.ts  # Maneja req/res de Médicos, delega al service
│   ├── errors/
│   │   └── AppError.ts           # Clase de error personalizada con status/code
│   ├── events/
│   │   └── eventBus.ts           # EventEmitter centralizado (Node.js)
│   ├── middlewares/
│   │   ├── errorHandler.ts       # Middleware único de manejo de errores
│   │   └── validate.ts           # Middleware genérico de validación con Zod
│   ├── models/
│   │   ├── turno.ts              # Interfaces TurnoCrudo / Turno
│   │   └── medico.ts             # Interfaces MedicoCrudo / Medico
│   ├── routes/
│   │   ├── turno.routes.ts       # Definición de endpoints de Turnos
│   │   └── medico.routes.ts      # Definición de endpoints de Médicos
│   ├── schemas/
│   │   ├── turno.schema.ts       # Validación Zod para Turno
│   │   └── medico.schema.ts      # Validación Zod para Médico
│   ├── services/
│   │   ├── agenda.ts             # Lógica de negocio y persistencia de Turnos
│   │   └── medico.service.ts     # Lógica de negocio y persistencia de Médicos
│   └── index.ts                  # Punto de entrada: Express, HTTP Server, Socket.IO
├── .env
├── .env.example
├── package.json
├── README.md
└── tsconfig.json
```

---

## 5. Nota sobre el ID en la creación de turnos

A diferencia de una API REST convencional, el endpoint `POST /api/turnos` **no autogenera el `id`**: el cliente debe incluirlo explícitamente en el body de la solicitud.

Esta decisión responde al contexto del negocio: TurnosRed centraliza turnos que ya poseen un identificador propio asignado por el sistema de cada sede de origen. Ese `id` no es un valor técnico interno, sino un dato de negocio que debe preservarse para mantener la trazabilidad con el sistema externo del cual proviene el turno.

Si el `id` enviado ya existe en el sistema, la API responde con **400 Bad Request** y un mensaje indicando que el identificador ya está registrado.

**Ejemplo de body válido:**

```json
{
  "id": 200,
  "paciente": "Carlos Ruiz",
  "documento": "31654210",
  "especialidad": "pediatría",
  "fecha": "14/08/2026",
  "hora": "10:00",
  "confirmado": "si"
}
```

---

## 6. Documentación de endpoints + query params

## Endpoints

Todas las respuestas de error siguen este formato estándar:
```json
{
  "status": 400,
  "message": "Descripción del error",
  "code": "CODIGO_DEL_ERROR",
  "details": []
}
```

### Turnos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/turnos` | Lista todos los turnos. Admite filtros por query params. |
| GET | `/api/turnos/:id` | Obtiene un turno por ID. 404 si no existe. |
| POST | `/api/turnos` | Crea un turno. El `id` es obligatorio en el body (identificador de la sede de origen). |
| PUT | `/api/turnos/:id` | Actualiza parcialmente un turno existente. |
| DELETE | `/api/turnos/:id` | Elimina un turno. Devuelve 204 sin body. |

**Filtros disponibles en `GET /api/turnos`:**

| Query param | Ejemplo | Descripción |
|---|---|---|
| `especialidad` | `?especialidad=Pediatría` | Filtra por especialidad (case-insensitive) |
| `fecha` | `?fecha=14/08/2026` | Filtra por fecha exacta |
| `medicoId` | `?medicoId=1` | Filtra por médico asignado |

Ejemplo combinado: `GET /api/turnos?especialidad=Pediatría&fecha=14/08/2026`

### Médicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/medicos` | Lista todos los médicos. Admite filtros por query params. |
| GET | `/api/medicos/:id` | Obtiene un médico por ID. 404 si no existe. |
| POST | `/api/medicos` | Crea un médico. El `id` se autogenera en el servidor. |
| PUT | `/api/medicos/:id` | Actualiza parcialmente un médico existente. |
| DELETE | `/api/medicos/:id` | Elimina un médico. Devuelve 204 sin body. |

**Filtros disponibles en `GET /api/medicos`:**

| Query param | Ejemplo | Descripción |
|---|---|---|
| `especialidad` | `?especialidad=Odontología` | Filtra por especialidad (case-insensitive) |
| `disponible` | `?disponible=true` | Filtra por disponibilidad (`true` / `false`) |

Ejemplo combinado: `GET /api/medicos?especialidad=Odontología&disponible=true`

---

## 7. Uso de Inteligencia Artificial

| Tarea | Herramienta | Prompt (resumen) | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Middleware de errores estandarizado | Claude | "Necesito centralizar el manejo de errores con clase AppError y un middleware único" | Clase `AppError`, `errorHandler.ts` y reestructuración de `routes` → `controllers` | Se integró con los servicios existentes reemplazando los `throw new Error` genéricos por `AppError` con status/code |
| CRUD del recurso Médico | Claude | "Agregar CRUD completo de Médico siguiendo la misma arquitectura en capas" | Modelo, servicio, controlador y rutas de Médico | Se decidió autogenerar el `id` en Médico (a diferencia de Turno, donde el id viene de la sede de origen) |
| Validación con Zod | Claude | "Implementar Zod para Turno y Médico, especialidad en Title Case, documento como string" | Schemas `turno.schema.ts`, `medico.schema.ts` y middleware `validate.ts` | Se ajustó el regex de Title Case para admitir tildes y espacios múltiples |
| Filtros por query params | Claude | "Agregar filtros especialidad/fecha/medicoId sin crear endpoints nuevos" | Extensión de `getTurnos` y `getMedicos` con parámetro `filtros` | Se agregó el campo `medicoId` faltante en la interfaz `Turno` y en `normalizarTurno` |
| Colección de Postman + tests | Claude | "Armar tests automatizados con happy path y casos borde para las 10 requests" | Scripts `pm.test()` para cada request, variables de entorno dinámicas | Corrección manual de script mal ubicado (pre-request vs. post-response) y de campos copiados incorrectamente entre Turno y Médico |
| Mock Server | Claude (chat) + AI integrada de Postman | "Simular la API sin backend real a partir de la colección" | Mock handler (`default.js`) generado por el asistente de Postman con seed data | Se corrigió el prefijo de rutas (`/api`) para que coincida con el servidor real |