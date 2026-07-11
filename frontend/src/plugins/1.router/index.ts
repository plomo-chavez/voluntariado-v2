import navItems from "@/navigation/vertical";
import { useAuthStore } from "@/stores/authStore";
import { getTokenUser, handleLogOut } from "@/utils/authHelper";
import { customRequest } from "@/utils/axiosInstance";
import { setupLayouts } from "virtual:generated-layouts";
import type { App } from "vue";
import type { RouteRecordRaw } from "vue-router/auto";
import { createRouter, createWebHistory } from "vue-router/auto";

function findNavItemByName(items: any[], name: string): any | undefined {
  for (const item of items) {
    if (item.to && item.to.name === name) {
      return item;
    }
    if (item.children && Array.isArray(item.children)) {
      const found = findNavItemByName(item.children, name);
      if (found) return found;
    }
  }
  return undefined;
}

function getRequiresAuth(item: any): any {
  return item.config && typeof item.config.requiresAuth === "boolean"
    ? item.config.requiresAuth
    : null;
}

async function verificarToken(to: any) {
  let token = getTokenUser();
  if (token != "") {
    let response: any = await customRequest({
      url: "/api/verificar/" + to.name,
      method: "POST",
      data: { token },
    });

    if (!response.data.result) {
      // Verifica si el mensaje es "No tienes permisos para acceder a esta página"
      if (
        response.data.message ===
        "No tienes permisos para acceder a esta página"
      ) {
        // Redirige a una página específica, por ejemplo, "sin-permiso"
        return { redirect: { name: "denegado" } };
      } else {
        // Si no es ese mensaje, realiza el logout
        handleLogOut();
        return false;
      }
    } else {
      return true;
    }
  } else {
    handleLogOut();
    return false;
  }
}

/**
 * Determina si una ruta requiere autenticación
 * Busca en: index.ts (estático) + authStore.navItems (dinámico)
 */
function thisHasRequiresAuth(name: string): any {
  // Primero buscar en index.ts (rutas públicas y base)
  let item = findNavItemByName(navItems, name);
  if (item) {
    return getRequiresAuth(item) == null ? true : getRequiresAuth(item);
  }

  // Luego buscar en authStore.navItems (menú dinámico)
  try {
    const authStore = useAuthStore();
    if (authStore.navItems && Array.isArray(authStore.navItems)) {
      item = findNavItemByName(authStore.navItems, name);
      if (item) {
        return getRequiresAuth(item) == null ? true : getRequiresAuth(item);
      }
    }
  } catch {
    // authStore no disponible aún, continuar con fallback
  }

  // Por defecto, requiere autenticación
  return true;
}

function recursiveLayouts(route: RouteRecordRaw): RouteRecordRaw {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i]);
    return route;
  }
  return setupLayouts([route])[0];
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth", top: 60 };
    return { top: 0 };
  },
  extendRoutes: (pages) => [
    {
      path: "/",
      redirect: { name: "login" }, // Redirige a la ruta de login
    },
    ...[...pages].map((route) => recursiveLayouts(route)),
  ],
});

// --- AQUÍ VA EL GUARD ---
router.beforeEach(async (to, from, next) => {
  // Si es login y ya hay sesión, redirige a home
  const isAuthenticated = getTokenUser();
  if (to.name === "login") {
    if (isAuthenticated) {
      return next({ name: "root" });
    } else {
      return next();
    }
  } else if (to.meta?.public === true) {
    return next();
  } else {
    const requiresAuth = thisHasRequiresAuth(to.name);
    if (!requiresAuth) {
      return next();
    } else if (requiresAuth && isAuthenticated) {
      const tokenValido: any = await verificarToken(to);
      if (tokenValido === false) {
        return next({ name: "login" });
      } else if (tokenValido?.redirect) {
        // Maneja la redirección si verificarToken devuelve un objeto con redirect
        return next(tokenValido.redirect);
      }
      return next();
    } else if (requiresAuth && !isAuthenticated) {
      return next({ name: "login" });
    }
  }
});
// --- FIN GUARD ---

export { router };

export default function (app: App) {
  app.use(router);
}
