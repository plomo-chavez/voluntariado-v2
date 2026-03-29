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

## Inicializacion del proyecto desde cero

### Prerequisitos

Antes de comenzar, asegúrate de tener:

- **Base de datos MySQL**: Crea una base de datos vacía (ej: `cruzroja_vol_dev`)
- **Credenciales MySQL**: Usuario y contraseña con permisos de creación de tablas
- **Variables de entorno**: Copia los archivos `.env` en los directorios `/config`

### Pasos de inicialización

#### Paso 1: Instalar dependencias

```bash
# Instalar en raiz
pnpm install

# Instalar en backend
pnpm --prefix backend install

# Instalar en frontend
pnpm --prefix frontend install
```

#### Paso 2: Configurar base de datos

1. Edita `backend/config/config.cjs`:
   ```javascript
   // Actualiza los datos de conexión a tu base de datos local
   development: {
     username: 'root',        // Tu usuario MySQL
     password: 'tu_password',  // Tu contraseña
     database: 'cruzroja_vol_dev', // Nombre de tu BD
     host: '127.0.0.1',
     port: 3306,
     dialect: 'mysql'
   }
   ```

2. Verifica `backend/config/config.js` para runtime del backend

#### Paso 3: Ejecutar migraciones

Las migraciones crearán automáticamente la estructura de la base de datos:

```bash
# Aplica todas las migraciones pendientes
pnpm run migrate

# Verifica el estado de las migraciones
pnpm run migrate:status
```

**¿Qué se crea durante las migraciones?**

- **Tablas principales**:
  - `catTiposUsuarios`: Tipos de usuario (Administrador, Desarrollador)
  - `usuarios`: Cuentas de usuario del sistema
  - `config_pages`: Estructura del menú y páginas
  - `config_pages_usuario`: Matriz de permisos (usuario + tipo)
  - `logs`: Registro de actividades

- **Usuarios por defecto**:
  - **Desarrollador** (dev@gmail.com / password: `dev123`)
    - Acceso completo a todas las páginas y funciones
    - Puede gestionar tipos de usuarios, permisos y configuraciones
  
  - **Administrador** (admin@gmail.com / password: `admin123`)
    - Acceso restringido solo a la página de inicio
    - Mayor seguridad, permisos limitados

- **Estructura de menú**:
  - **Inicio**: Página principal (visible para todos)
  - **Administrador**: Herramientas administrativas
    - Gestión de Usuarios
    - Visualización de Logs
    - Gestión de Permisos de Páginas
  - **Catalogos**: Recursos y catálogos
    - Gestión de Tipos de Usuarios

#### Paso 4: Iniciar el proyecto en desarrollo

```bash
# Inicia backend y frontend simultáneamente
pnpm run dev

# O por separado:
pnpm run dev:backend  # Backend en http://localhost:5000
pnpm run dev:frontend # Frontend en http://localhost:5173
```

## Scripts del package principal

### Desarrollo

- **dev:backend**
  - Comando: `pnpm --prefix backend dev`
  - Inicia el backend con nodemon en modo desarrollo.

- **dev:frontend**
  - Comando: `pnpm --prefix frontend dev`
  - Inicia frontend con Vite en modo desarrollo.

- **dev**
  - Comando: `concurrently "pnpm dev:backend" "pnpm dev:frontend"`
  - Levanta backend y frontend simultáneamente.

### Migraciones

- **migrate**
  - Comando: `pnpm run migrate`
  - Aplica todas las migraciones pendientes a la base de datos.

- **migrate:undo**
  - Comando: `pnpm run migrate:undo`
  - Revierte la última migración aplicada.

- **migrate:status**
  - Comando: `pnpm run migrate:status`
  - Muestra el estado de todas las migraciones (up o down).

- **migration:generate**
  - Comando: `pnpm run migration:generate -- --name nombre-de-la-migracion`
  - Genera un nuevo archivo de migración.

### Despliegue

- **deploy:backend**
  - Comando: `bash ./config/deploy-backend.sh`
  - Ejecuta despliegue del backend.

- **deploy:frontend**
  - Comando: `bash ./config/deploy-frontend.sh`
  - Ejecuta despliegue del frontend.

- **deploy:env**
  - Comando: `bash ./config/deploy-config.sh`
  - Despliega o actualiza configuraciones de entorno.

- **deploy**
  - Comando: `bash ./config/deploy.sh`
  - Ejecuta el flujo de despliegue completo (backend + frontend + config).

### Pruebas

- **test:backend**
  - Comando: `bash ./config/deploy-backend-test.sh`
  - Ejecuta validaciones o despliegue de prueba para backend.

- **test:frontend**
  - Comando: `bash ./config/deploy-frontend-test.sh`
  - Ejecuta validaciones o despliegue de prueba para frontend.

- **test**
  - Comando: `concurrently "pnpm test:backend" "pnpm test:frontend"`
  - Ejecuta pruebas operativas de backend y frontend en paralelo.

### URLs de acceso (en desarrollo)

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Credenciales de prueba

Una vez que las migraciones se han ejecutado, puedes acceder con las siguientes credenciales:

| Tipo de Usuario | Email | Contraseña | Acceso |
|---|---|---|---|
| **Desarrollador** | dev@gmail.com | dev123 | Completo (todas las páginas y funciones) |
| **Administrador** | admin@gmail.com | admin123 | Solo página de Inicio |

> **Nota**: Las credenciales están definidas en `/backend/migrations/20260329062143-migracionInicial.js`. Si necesitas cambiar contraseñas, edita ese archivo y ejecuta `pnpm run migrate:undo` seguido de `pnpm run migrate`.

### Flujo de acceso

1. Abre http://localhost:5173 en tu navegador
2. La aplicación redirige al login si no estás autenticado
3. Ingresa las credenciales (cualquiera de las dos cuentas anteriores)
4. Se genera un JWT token guardado en localStorage
5. Accedes al dashboard según tus permisos

### Sistema de permisos

El sistema usa un modelo de **permisos en cascada**:

1. **Permisos de usuario** (mayor prioridad)
   - Permisos específicos asignados a un usuario individual
   - Si existe un permiso a nivel de usuario, se respeta (permite o deniega)

2. **Permisos de tipo de usuario**
   - Si no hay permiso específico de usuario, se verifica el tipo
   - Por defecto, Desarrollador tiene acceso a todo
   - Administrador solo ve la página de Inicio

3. **Páginas públicas** (menor prioridad)
   - Página de Inicio (root) siempre visible para todos

**Nota**: En la sección "Administrador > Gestión de Permisos" (solo para Desarrollador), puedes personalizar permisos para usuarios específicos o cambiar permisos por tipo de usuario.

### Estructura del proyecto después de migraciones

```
Base de datos: cruzroja_vol_dev

Tipos de Usuario:
├── Desarrollador (id=1) - Acceso completo
└── Administrador (id=2) - Acceso restringido

Usuarios:
├── dev@gmail.com (tipo: Desarrollador)
└── admin@gmail.com (tipo: Administrador)

Menú del Sistema:
├── Inicio (root)
├── Administrador
│   ├── Gestión de Usuarios
│   ├── Visualización de Logs
│   └── Gestión de Permisos de Páginas
└── Catalogos
    └── Gestión de Tipos de Usuarios
```

## Flujos rápidos

- **Arranque local completo**:
  ```bash
  pnpm run dev
  ```

- **Migrar y revisar estado**:
  ```bash
  pnpm run migrate
  pnpm run migrate:status
  ```

- **Crear una migración nueva**:
  ```bash
  pnpm run migration:generate -- --name agregar-campo-x
  ```

## Notas importantes

- Los scripts de migración desde la raíz se delegan automáticamente al backend.
- Si aparece error de conexión a la base de datos, verifica las credenciales y host en [backend/config/config.cjs](backend/config/config.cjs).
- El proyecto utiliza la tabla `z_migraciones` para controlar qué migraciones ya han sido aplicadas (evita re-ejecutaciones).
- Las migraciones son idempotentes: puedes ejecutar `pnpm run migrate` múltiples veces sin problemas.

## Troubleshooting

### Error de conexión a MySQL
- Verifica que MySQL esté corriendo: `mysql -u root -p`
- Confirma credenciales en `backend/config/config.cjs`
- Verifica que la base de datos existe: `CREATE DATABASE IF NOT EXISTS cruzroja_vol_dev;`

### Migraciones no se aplican
- Revisa el status: `pnpm run migrate:status`
- Si una migración falla, usa `pnpm run migrate:undo` para revertir
- Revisa los logs del backend en la consola

### Frontend no carga
- Asegúrate que el backend está corriendo en http://localhost:5000
- Verifica que no hay conflicto de puertos
- Limpia caché: `rm -rf frontend/.vite` y vuelve a ejecutar

### Credenciales no funcionan
- Revisa que las migraciones se ejecutaron correctamente
- Intenta revertir y aplicar de nuevo:
  ```bash
  pnpm run migrate:undo
  pnpm run migrate
  ```
- Verifica los datos en la tabla `usuarios`
- Si backend levanta pero falla en modelos, revisar consistencia de export default en backend/config/config.js.
