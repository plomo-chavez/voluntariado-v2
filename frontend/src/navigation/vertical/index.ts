// Este archivo mantiene solo las rutas públicas base.
// Las rutas de navegación dinámicas se cargan desde authStore.navItems
// que consulta /api/menu desde la BD (config_pages).

const routes: any = [
  {
    title: "Inicio",
    to: { name: "root" },
    icon: { icon: "tabler-smart-home" },
  },
  {
    title: "Reportes",
    to: { name: "reportes" },
    icon: { icon: "tabler-smart-home" },
  },
  {
    title: "Denegado",
    to: { name: "denegado" },
    icon: { icon: "tabler-alert-circle" },
    config: { requiresAuth: false },
  },
];

export default routes;
