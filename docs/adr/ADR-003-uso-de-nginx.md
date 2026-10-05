# ADR-003: Uso de Nginx como reverse proxy

**Fecha:** 2026-10-05
**Estado:** Aceptado

## Contexto

TurnosRed corre como un proceso Node.js que escucha directamente en el puerto 3000. Exponer ese puerto tal cual a internet en un escenario de producción implica que el cliente se conecta directamente al proceso de la aplicación, sin una capa intermedia que normalice las conexiones entrantes, oculte detalles de la infraestructura interna o permita operaciones comunes de despliegue (balanceo de carga, terminación TLS, compresión) sin modificar el código de la aplicación.

## Decisión

Se incorporó **Nginx** como reverse proxy delante de la aplicación Node, mediante el archivo `nginx.conf` en la raíz del proyecto. La configuración:

- Escucha en el puerto de entrada (80 en un servidor real; 8080 en el entorno de prueba local, para no requerir privilegios de administrador).
- Reenvía (`proxy_pass`) todo el tráfico a `http://localhost:3000`, donde corre la aplicación Node.
- Preserva los headers `Host`, `X-Real-IP`, `X-Forwarded-For` y `X-Forwarded-Proto`, para que la aplicación conserve la información real del cliente (IP de origen, protocolo) aunque la conexión le llegue desde Nginx y no directamente desde el navegador.

Se validó localmente instalando Nginx mediante Homebrew y ejecutándolo con la configuración del proyecto (`nginx -c nginx.conf`), confirmando con `curl` que las respuestas a través del proxy (puerto 8080) son idénticas a las obtenidas accediendo directamente al puerto 3000.

## Consecuencias

**Positivas:**
- La aplicación Node queda desacoplada del punto de entrada público; Nginx puede asumir en el futuro tareas como TLS, compresión gzip o balanceo entre múltiples instancias sin tocar el código de la API.
- Los headers de proxy preservados permiten loggear y auditar la IP real del cliente (relevante junto con el logging estructurado del punto 3).

**Negativas / costos reales:**
- Se agrega una pieza de infraestructura adicional a mantener y configurar (`nginx.conf`), fuera del ciclo de vida normal de Node/npm.
- La validación local depende de tener Nginx (u otra herramienta equivalente) instalado en la máquina; no se automatizó como parte del script `npm run dev`.

## Alternativas consideradas

- **Exponer Node directamente sin proxy:** más simple, pero no es una práctica recomendada en producción (sin normalización de headers, sin capa para TLS/balanceo, el proceso Node queda expuesto directamente).
- **Usar un proxy gestionado por la nube (ej. un Load Balancer de un proveedor cloud):** válido para un despliegue real, pero fuera del alcance de este proyecto académico, que busca demostrar el concepto de reverse proxy de forma local y reproducible.

## Limitaciones

- La configuración actual no incluye terminación TLS/HTTPS (quedaría para una iteración de despliegue real).
- No se configuró balanceo de carga entre múltiples instancias de la aplicación, ya que el proyecto corre como un único proceso Node.

## Impacto sobre el proyecto

Se agregó `nginx.conf` en la raíz del proyecto. No se modificó ningún archivo de `src/`, ya que Nginx opera como una capa externa a la aplicación.