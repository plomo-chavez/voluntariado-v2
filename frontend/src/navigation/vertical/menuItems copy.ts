interface NavItem {
  title: string;
  to?: object;
  icon?: object;
  children?: NavItem[];
  meta?: {
    action?: string;
    subject?: string;
  };
}

export function getMenuItemsForUserType(userType: number): NavItem[] {
  const routes: NavItem[] = [
    {
      title: "Inicio",
      to: { name: "root" },
      icon: { icon: "tabler-smart-home" },
    },
    {
      title: "Estadísticas",
      to: { name: "estadisticas" },
      icon: { icon: "tabler-chart-bar" },
    },
    {
      title: "Reportes",
      to: { name: "reportes" },
      icon: { icon: "tabler-smart-home" },
    },
    {
      title: "Elementos",
      to: { name: "elementos" },
      icon: { icon: "tabler-users" },
    },
    {
      title: "Unidades",
      to: { name: "unidades" },
      icon: { icon: "tabler-truck" },
    },
  ];

  if (userType <= 3) {
    routes.push({
      title: "Administrador",
      icon: { icon: "tabler-settings" },
      children: [
        { title: "Usuarios", to: { name: "usuarios" } },
        { title: "Logs", to: { name: "logs" } },
        { title: "Delegaciones", to: { name: "delegaciones" } },
        {
          title: "Catalogos",
          children: [
            { title: "Municipios", to: { name: "catalogos-municipios" } },
            {
              title: "Tipo de servicio",
              to: { name: "catalogos-tipos-servicio" },
            },
            { title: "Areas", to: { name: "catalogos-areas" } },
            { title: "Agresores", to: { name: "catalogos-agresores" } },
            {
              title: "Tipo de agresión",
              to: { name: "catalogos-tipos-agresion" },
            },
            {
              title: "Sitio de agresión",
              to: { name: "catalogos-sitios-agresion" },
            },
            {
              title: "Tipos de incidente",
              to: { name: "catalogos-tipos-incidente" },
            },
            {
              title: "Tipos de solicitante",
              to: { name: "catalogos-tipos-solicitante" },
            },
          ],
        },
      ],
    });
  }

  return routes;
}
