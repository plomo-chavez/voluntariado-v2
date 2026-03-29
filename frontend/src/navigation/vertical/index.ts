import { getUserData } from "@/utils/userUtils";

const user = getUserData();
const userType = user?.tipo_id ?? 0; // Obtén el tipo de usuario
let routes: any = [
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
    to: { name: "denegado" }, // Nombre de la ruta de la página de error
    icon: { icon: "tabler-alert-circle" }, // Puedes usar un ícono diferente
    config: { requiresAuth: false }, // Asegúrate de que esta ruta no requiera autenticación
  },
];

if (userType <= 3) {
  // Si el usuario es administrador, agrega la ruta de administración
  routes.push({
    title: "Administrador",
    icon: { icon: "tabler-settings" },

    children: [
      {
        title: "Usuarios",
        to: { name: "usuarios" },
      },
      {
        title: "Delegaciones",
        to: { name: "delegaciones" },
      },
      {
        title: "Catalogos",
        children: [
          {
            title: "Municipios",
            to: { name: "catalogos-municipios" },
          },
          {
            title: "Tipo de servicio",
            to: { name: "catalogos-tipos-servicio" },
          },
          {
            title: "Areas",
            to: { name: "catalogos-areas" },
          },
          {
            title: "Agresores",
            to: { name: "catalogos-agresores" },
          },
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
export default routes;
