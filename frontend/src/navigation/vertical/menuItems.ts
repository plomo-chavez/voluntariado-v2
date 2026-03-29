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
  ];

  if (userType <= 3) {
    routes.push({
      title: "Administrador",
      icon: { icon: "tabler-settings" },
      children: [
        { title: "Usuarios", to: { name: "usuarios" } },
        { title: "Logs", to: { name: "logs" } },
      ],
    });
  }

  return routes;
}
