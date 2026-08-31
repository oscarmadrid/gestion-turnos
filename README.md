# TurnosRed - Sistema de Gestión de Turnos Médicos

TurnosRed es un prototipo de backend desarrollado en Node.js, Express y TypeScript para centralizar y normalizar la gestión de turnos de centros de atención ambulatoria. Permite procesar archivos JSON con formatos inconsistentes, gestionar operaciones CRUD mediante una API REST, y sincronizar cambios en tiempo real utilizando WebSockets (Socket.IO) y un bus de eventos interno (`EventEmitter`).

---

## 1. Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu equipo antes de comenzar:
- **Node.js** (versión 18.x o superior recomendada).
- **npm** (gestor de paquetes incluido con Node.js).

---

## 2. Instrucciones de Instalación

1. Clona el repositorio o abre la carpeta del proyecto en tu máquina local.
2. Instala todas las dependencias del proyecto ejecutando el siguiente comando en la terminal:
   ```bash
   npm install
3. Instala los tipos de desarrollo necesarios para TypeScript (Express, Node y Socket.IO):
   npm i --save-dev @types/express @types/node @types/socket.io

   1. Crea un archivo .env en la raíz del proyecto para definir tus variables de entorno.
   2. Inicia el servidor de desarrollo ejecutando:
      npm run dev

---

## 3. Tabla de Variables de Entorno
   
Crea un archivo .env en la raíz de tu proyecto e incluye la siguiente configuración para personalizar el comportamiento del servidor:

Variable    |   Descripción                                                     |   Valor por Defecto
------------|-------------------------------------------------------------------|---------------------
PORT        |	Puerto en el que se ejecutará el servidor HTTP y Socket.IO.     |	3000
DATA_PATH   |	Ruta hacia el archivo JSON de almacenamiento local de turnos.   |	./data/turnos.json

---

## 4. Scripts Disponibles en package.json

El proyecto incluye los siguientes scripts organizados para el ciclo de vida de desarrollo y producción:

- npm run dev: Inicia el servidor de desarrollo utilizando tsx para reflejar cambios automáticamente en tiempo real sin necesidad de reiniciar manualmente.

- npm run build: Compila todo el código fuente escrito en TypeScript (.ts) a JavaScript plano (.js) dentro de la carpeta de distribución para producción.

- npm start: Ejecuta la aplicación utilizando la versión compilada previamente para entornos de producción.

---

## 5. Estructura de Carpetas y Arquitectura

La arquitectura del proyecto sigue una estricta separación modular de responsabilidades para garantizar mantenibilidad y escalabilidad:

gestion-turnos/
├── data/
│   └── turnos.json
├── src/
│   ├── events/
│   │   └── eventBus.ts
│   ├── models/
│   │   └── turno.ts
│   ├── routes/
│   │   └── turno.routes.ts
│   ├── services/
│   │   └── agenda.ts
│   ├── ejemplo-callback.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── .nvmrc
├── ejemplocallback.ts
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json


└── gestion-turnos/

    ├── data/
    │   └── turnos.json          # Archivo de persistencia de datos local (JSON)
    ├── src/
    │   ├── events/
    │   │   └── eventBus.ts      # Instancia centralizada de EventEmitter (Node.js)
    │   ├── models/
    │   │   └── turno.ts         # Definición de interfaces TypeScript (Turno y TurnoCrudo)
    │   ├── app.tsx
    │   ├── routes/
    │   │   └── turno.routes.ts  # Endpoints de la API REST (Express Router)
    │   ├── services/
    │   │   └── agenda.ts        # Lógica de negocio, normalización y persistencia (AgendaTurnos)
    │   └── index.ts             # Punto de entrada principal (Express, HTTP Server y Socket.IO)
    ├── .env                     # Variables de entorno
    ├── package.json             # Dependencias y scripts de npm
    ├── README.md
    └── tsconfig.json            # Configuración del compilador de TypeScript


### Explicación de Componentes Clave:
- **`src/services/agenda.ts`**: Contiene la clase `AgendaTurnos`, encargada de leer, escribir, aplicar la normalización estricta a los datos crudos y emitir los eventos internos correspondientes.
- **`src/events/eventBus.ts`**: Provee el canal de comunicación basado en `node:events` para desacoplar las operaciones de escritura de las notificaciones secundarias.
- **`src/index.ts`**: Configura el servidor HTTP nativo, inicializa Express, monta las rutas de la API bajo el prefijo `/api` y enlaza `Socket.IO` (`servidorTiempoReal`) para la difusión de eventos en tiempo real a los clientes conectados.
```eof