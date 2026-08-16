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
        case "delegaciones":      url = "/api/catalogos/delegaciones"; break;
        case "areas":             url = "/api/catalogos/areas"; break;
        case "cargos":            url = "/api/catalogos/cargos"; break;
        case "nacionalidad":      url = "/api/catalogos/nacionalidad"; break;
        case "estado-civil":      url = "/api/catalogos/estado-civil"; break;
        case "grupos-sanguineos": url = "/api/catalogos/grupos-sanguineos"; break;
        case "parentesco":        url = "/api/catalogos/parentesco"; break;
        case "grados-estudios":   url = "/api/catalogos/grados-estudios"; break;
        case "medio-difusion":    url = "/api/catalogos/medio-difusion"; break;
        case "idiomas":           url = "/api/catalogos/idiomas"; break;
      }

      if (item?.public ?? false) {
        url = url.replace("/api/", "/api/public/");
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
        console.log("\n\ndata: ", data);
        console.log("\n\nitem: ", item);
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
