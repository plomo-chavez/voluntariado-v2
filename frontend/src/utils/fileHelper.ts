import { axiosInstance } from "@/utils/axiosInstance";
export function openResource(recurso: any) {
  const baseUrl = (
    axiosInstance.defaults.baseURL || window.location.origin
  ).replace(/\/$/, "");
  const ruta = String(recurso || "").replace(/^\/+/, "");
  const url = `${baseUrl}/${ruta}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
