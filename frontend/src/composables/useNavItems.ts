import { useAuthStore } from "@/stores/authStore";
import { computed } from "vue";

export function useNavItems() {
  const auth = useAuthStore();

  const baseItems = [
    {
      title: "Inicio",
      to: { name: "root" },
      icon: { icon: "tabler-smart-home" },
    },
    {
      title: "Reportes",
      to: { name: "reportes" },
      icon: { icon: "tabler-file-report" },
    },
  ];

  const adminItems = [
    {
      title: "Administrador",
      icon: { icon: "tabler-settings" },
      children: [
        { title: "Usuarios", to: { name: "usuarios" } },
        { title: "Delegaciones", to: { name: "delegaciones" } },
      ],
    },
  ];

  const navItems = computed(() => {
    const items: any = [...baseItems];
    if ((auth.user?.tipo_id ?? 99) <= 3) {
      items.push(...adminItems);
    }
    return items;
  });

  return { navItems };
}
