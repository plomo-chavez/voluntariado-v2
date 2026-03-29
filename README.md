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

---

## Diagnóstico de Permisos de Usuarios

### Problema: Usuario no ve menú o permisos no funcionan

El sistema de permisos permite dos modos:
1. **Permisos por tipo de usuario**: Todos los usuarios del mismo tipo heredan permisos iguales
2. **Permisos personalizados**: Permisos específicos para un usuario individual (sobrescribe el tipo)

### Diagnosticar desde el Frontend

Después de hacer login, abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver el status completo de permisos del usuario actual
diagnosticarPermisos()

// Listar todas las páginas disponibles
listarPermisosDisponibles()

// Limpiar permisos personalizados (si está bloqueado)
limpiarPermisosPersonalizados(userId)
```

**Ejemplo de salida:**
```
DIAGNÓSTICO DE PERMISOS
========================
userId: 1
tipoId: 1
tienePermisosPersonalizados: false
permisosPorTipo: [1, 2, 3, 4, 5]  ← Usa permisos del tipo
permisosPersonalizados: []         ← No tiene personalizados
descripción: "Permisos heredados del tipo de usuario"
```

### Diagnosticar desde la BD

```bash
# Conectar a MySQL
mysql -h HOST -u USER -p DATABASE
```

```sql
-- Ver user info
SELECT id, nombre, correo, tipo_id FROM usuarios WHERE correo = 'admin@gmail.com';

-- Ver permisos por TIPO
SELECT page_id, estatus 
FROM config_pages_usuario 
WHERE tipo_usuario_id = 1 AND estatus = 1;

-- Ver permisos PERSONALIZADOS de un usuario
SELECT page_id, estatus, tipo_usuario_id 
FROM config_pages_usuario 
WHERE usuario_id = 1 AND estatus = 1;
```

### Endpoint de API

```bash
# Obtener status de permisos del usuario autenticado
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/config-pages/permisos/mi-status

# Respuesta
{
  "result": true,
  "data": {
    "userId": 1,
    "tipoId": 1,
    "tienePermisosPersonalizados": false,
    "permisosPersonalizados": [],
    "permisosPorTipo": [1, 2, 3, 4, 5],
    "descripcion": "Permisos heredados del tipo de usuario"
  }
}
```

### Resolver Problemas Comunes

**Usuario no ve ningún menú:**
- Ejecutar: `diagnosticarPermisos()`
- Si `permisosPorTipo: []`: El tipo no tiene permisos asignados
  - Ir a `/admin/config-pages` → "Permisos" → "Por tipo de usuario"
  - Seleccionar el tipo y asignarle páginas

**Usuario ve menu incorrecto o está bloqueado:**
- Si `tienePermisosPersonalizados: true` pero no ve acceso:
  - Ejecutar: `limpiarPermisosPersonalizados(userId)`
  - Después asignar desde "Por tipo de usuario"

**Documentación detallada:**
- Ver archivo: [DIAGNOSTICO_PERMISOS.md](./DIAGNOSTICO_PERMISOS.md)

