import { customRequest } from "@/utils/axiosInstance";

export interface NavItem {
  title: string;
  to?: object;
  icon?: object;
  children?: NavItem[];
}

/** Menú mínimo cuando la API no responde o el usuario no está autenticado */
export const fallbackMenu: NavItem[] = [
  {
    title: "Inicio Fallando",
    to: { name: "root" },
    icon: { icon: "tabler-smart-home" },
  },
];

/**
 * Consulta config_pages desde el backend y devuelve el árbol de navegación
 * filtrado según el tipo del usuario autenticado.
 * Si la petición falla, retorna el fallbackMenu.
 */
export async function fetchMenuItems(): Promise<NavItem[]> {
  try {
    const response: any = await customRequest({
      url: "/api/menu",
      method: "GET",
    });
    if (response.data?.result && Array.isArray(response.data.data)) {
      console.log("Menú cargado desde API =>", response.data.data);
      return response.data.data as NavItem[];
    }
  } catch {
    // silencio — el store usará el fallback
  }
  return fallbackMenu;
}
