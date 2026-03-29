import { ref } from "vue";

export function useCatalogo() {
  const opciones = ref<any[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  const obtenerCatalogo = async (item: any, dependenciaFiltro: any = null) => {
    cargando.value = true;
    error.value = null;

    try {
      let data: any = null;
      let url: any = "";

      // prettier-ignore
      switch (item.catalogo) {
        case "tipos-usuarios":    url = "/api/catalogos/tipos-usuarios"; break;
        case "estados":           url = "/api/catalogos/estados"; break;
        case "municipios":        url = "/api/catalogos/municipios"; break;
        case "delegaciones":      url = "/api/catalogos/delegaciones"; break;
        case "tipos-servicio":    url = "/api/catalogos/tipos-servicio"; break;
        case "areas":             url = "/api/catalogos/areas"; break;
        case "agresores":         url = "/api/catalogos/agresores"; break;
        case "tipos-agresion":    url = "/api/catalogos/tipos-agresion"; break;
        case "sitios-agresion":   url = "/api/catalogos/sitios-agresion"; break;
        case "tipos-solicitante": url = "/api/catalogos/tipos-solicitante"; break;
        case "tipos-incidente":   url = "/api/catalogos/tipos-incidente"; break;
        case "sitios-incidente":  url = "/api/catalogos/sitios-incidente"; break;
        case "horarios":          url = "/api/catalogos/horarios"; break;
      }

      let payload: any = dependenciaFiltro || item.payload || {};

      const response = await customRequest({
        url: url,
        method: "POST",
        data: payload,
      });

      data = response.data.data;

      if (!item.formatCatalogo) {
        let config = {
          labelKey: "label",
          valueKey: "id",
          fullInfo: false,
        };
        if (item.config) {
          config = { ...config, ...item.config };
        }
        data = data.map((item: any) => {
          if (config.fullInfo) {
            return {
              ...item,
              label: item[config.labelKey],
              id: item[config.valueKey],
            };
          } else {
            return {
              label: item[config.labelKey],
              id: item[config.valueKey],
            };
          }
        });
      }

      opciones.value = item.formatCatalogo ? item.formatCatalogo(data) : data;
    } catch (err) {
      error.value = "Error al cargar el catálogo.";
      console.error(err);
    } finally {
      cargando.value = false;
    }
    return opciones.value;
  };

  return {
    obtenerCatalogo,
  };
}
