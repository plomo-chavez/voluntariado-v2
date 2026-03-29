# Voluntariado

Guia de uso del proyecto y scripts principales del package raiz.

## Requisitos

- Node.js 20 o superior
- pnpm 9 o superior
- Acceso a la base de datos MySQL configurada para backend

## Estructura general

- backend: API con Express y Sequelize
- frontend: App Vue con Vite
- config: scripts de despliegue y pruebas

## Inicializacion del proyecto

1. Instalar dependencias en raiz:
   - pnpm install
2. Instalar dependencias del backend:
   - pnpm --prefix backend install
3. Instalar dependencias del frontend:
   - pnpm --prefix frontend install
4. Validar configuracion de base de datos:
   - Revisar backend/config/config.cjs para migraciones
   - Revisar backend/config/config.js para runtime del backend
5. Revisar tabla de control de migraciones:
   - El proyecto usa z_migraciones como tabla de metadatos
6. Ejecutar migraciones:
   - pnpm run migrate
7. Verificar estado de migraciones:
   - pnpm run migrate:status
8. Levantar el proyecto en desarrollo:
   - pnpm run dev

## Scripts del package principal

### Desarrollo

- dev:backend
  - Comando: pnpm --prefix backend dev
  - Inicia el backend con nodemon.

- dev:frontend
  - Comando: pnpm --prefix frontend dev
  - Inicia frontend con Vite.

- dev
  - Comando: concurrently "pnpm dev:backend" "pnpm dev:frontend"
  - Levanta backend y frontend al mismo tiempo.

### Migraciones

- migrate
  - Comando: pnpm --prefix backend migrate
  - Aplica migraciones pendientes.

- migrate:undo
  - Comando: pnpm --prefix backend migrate:undo
  - Revierte la ultima migracion aplicada.

- migrate:status
  - Comando: pnpm --prefix backend migrate:status
  - Muestra migraciones en estado up o down.

- migration:generate
  - Comando: pnpm --prefix backend migration:generate
  - Genera archivo de migracion nuevo.
  - Uso recomendado:
    - pnpm run migration:generate -- --name nombre-de-la-migracion

### Despliegue

- deploy:backend
  - Comando: bash ./config/deploy-backend.sh
  - Ejecuta despliegue del backend.

- deploy:frontend
  - Comando: bash ./config/deploy-frontend.sh
  - Ejecuta despliegue del frontend.

- deploy:env
  - Comando: bash ./config/deploy-config.sh
  - Despliega o actualiza configuraciones de entorno.

- deploy
  - Comando: bash ./config/deploy.sh
  - Ejecuta flujo de despliegue completo.

### Pruebas operativas

- test:backend
  - Comando: bash ./config/deploy-backend-test.sh
  - Ejecuta validaciones o despliegue de prueba para backend.

- test:frontend
  - Comando: bash ./config/deploy-frontend-test.sh
  - Ejecuta validaciones o despliegue de prueba para frontend.

- test
  - Comando: concurrently "pnpm test:backend" "pnpm test:frontend"
  - Ejecuta pruebas operativas de backend y frontend en paralelo.

## Flujos rapidos

- Arranque local completo:
  - pnpm run dev

- Migrar y revisar estado:
  - pnpm run migrate
  - pnpm run migrate:status

- Crear una migracion nueva:
  - pnpm run migration:generate -- --name agregar-campo-x

## Notas importantes

- Si ejecutas scripts de migracion desde la raiz, se delegan al backend automaticamente.
- Si aparece error de conexion de base de datos, revisar credenciales y host en backend/config/config.cjs.
- Si backend levanta pero falla en modelos, revisar consistencia de export default en backend/config/config.js.
