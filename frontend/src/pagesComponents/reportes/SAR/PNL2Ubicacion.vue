<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import "leaflet/dist/leaflet.css";
const emit = defineEmits(["cancelar", "nextStep", "backStep", "finalizar"]);

const props = withDefaults(
  defineProps<{
    readonly?: boolean;
    step?: number | undefined;
    formData?: any;
    steps?: any;
  }>(),
  {
    steps: null,
    readonly: false,
    step: 1,
    formData: null,
  },
);

type UbicacionFormData = {
  direccion: string;
  latitud: string;
  longitud: string;
  [key: string]: any;
};

const formDataLocal = reactive<UbicacionFormData>({
  direccion: "",
  latitud: "",
  longitud: "",
});

const mostrarMapa = ref(false);
const calculandoCoordenadas = ref(false);
const coordenadasConfirmadas = ref(false);
const mapaContainerRef = ref<HTMLElement | null>(null);
const mapaInstancia = shallowRef<any>(null);
const marcadorInstancia = shallowRef<any>(null);
const leafletLib = shallowRef<any>(null);

const bloquearInteraccion = computed(() => calculandoCoordenadas.value);

const syncEstadoInteraccionMapa = () => {
  if (!mapaInstancia.value) return;

  const disabled = bloquearInteraccion.value;

  if (disabled) {
    mapaInstancia.value.dragging?.disable();
    mapaInstancia.value.scrollWheelZoom?.disable();
    mapaInstancia.value.doubleClickZoom?.disable();
    mapaInstancia.value.boxZoom?.disable();
    mapaInstancia.value.keyboard?.disable();
    marcadorInstancia.value?.dragging?.disable();
  } else {
    mapaInstancia.value.dragging?.enable();
    mapaInstancia.value.scrollWheelZoom?.enable();
    mapaInstancia.value.doubleClickZoom?.enable();
    mapaInstancia.value.boxZoom?.enable();
    mapaInstancia.value.keyboard?.enable();
    marcadorInstancia.value?.dragging?.enable();
  }
};

const actualizarCoordenadas = (lat: number, lng: number) => {
  formDataLocal.latitud = lat.toFixed(6);
  formDataLocal.longitud = lng.toFixed(6);
  coordenadasConfirmadas.value = true;
};

const coordenadasActuales = computed(() => {
  const lat = Number.parseFloat(formDataLocal.latitud);
  const lng = Number.parseFloat(formDataLocal.longitud);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return null;
});

const cargarLeaflet = async () => {
  if (!leafletLib.value) {
    // @ts-ignore: la resolución de tipos de leaflet falla en esta configuración, pero el módulo existe en runtime.
    leafletLib.value = await import("leaflet");
  }

  return leafletLib.value;
};

const actualizarMarcador = async (lat: number, lng: number) => {
  if (!mapaInstancia.value) return;

  const L = await cargarLeaflet();

  if (!marcadorInstancia.value) {
    marcadorInstancia.value = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: "leaflet-pin-wrapper",
        html: '<div class="leaflet-pin"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      }),
    }).addTo(mapaInstancia.value);

    marcadorInstancia.value.on("dragend", async (event: any) => {
      if (bloquearInteraccion.value) return;

      const position = event.target.getLatLng();

      actualizarCoordenadas(position.lat, position.lng);
      mapaInstancia.value?.panTo(position);
    });
  } else {
    marcadorInstancia.value.setLatLng([lat, lng]);
  }

  mapaInstancia.value.setView([lat, lng], 16);
};

const iniciarMapa = async () => {
  if (!mostrarMapa.value) return;

  await nextTick();
  if (!mapaContainerRef.value) return;

  const L = await cargarLeaflet();

  if (!mapaInstancia.value) {
    const puntoInicial = coordenadasActuales.value ?? {
      lat: 19.4326,
      lng: -99.1332,
    };
    const zoomInicial = coordenadasActuales.value ? 16 : 11;

    mapaInstancia.value = L.map(mapaContainerRef.value).setView(
      [puntoInicial.lat, puntoInicial.lng],
      zoomInicial,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapaInstancia.value);

    mapaInstancia.value.on("click", async (event: any) => {
      if (bloquearInteraccion.value) return;

      const lat = Number(event.latlng.lat);
      const lng = Number(event.latlng.lng);

      actualizarCoordenadas(lat, lng);

      await actualizarMarcador(lat, lng);
    });
  }

  if (coordenadasActuales.value) {
    await actualizarMarcador(
      coordenadasActuales.value.lat,
      coordenadasActuales.value.lng,
    );
  }

  syncEstadoInteraccionMapa();

  setTimeout(() => {
    mapaInstancia.value?.invalidateSize();
  }, 0);
};

const toggleMapa = () => {
  mostrarMapa.value = !mostrarMapa.value;
};

const normalizarDireccion = (direccion: string) => {
  return direccion
    .replace(/\b(c\.?p\.?|cp)\s*\d{5}\b/gi, "")
    .replace(/#/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const construirConsultasFallback = (direccion: string) => {
  const base = normalizarDireccion(direccion);
  const setConsultas = new Set<string>();

  if (!base) return [];

  const conComas = base
    .replace(/\bcolonia\b/gi, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();

  const sinColonia = base
    .replace(/\bcolonia\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  setConsultas.add(base);
  setConsultas.add(`${base}, Mexico`);
  setConsultas.add(conComas);
  setConsultas.add(`${conComas}, Mexico`);
  setConsultas.add(sinColonia);
  setConsultas.add(`${sinColonia}, Mexico`);

  const tokens = base.split(" ").filter(Boolean);
  [6, 5, 4, 3].forEach((tamano) => {
    if (tokens.length >= tamano) {
      const cola = tokens.slice(-tamano).join(" ");
      setConsultas.add(cola);
      setConsultas.add(`${cola}, Mexico`);
    }
  });

  return Array.from(setConsultas).filter(Boolean);
};

const buscarCoordenadas = async (direccion: string) => {
  const consultas = construirConsultasFallback(direccion);

  for (const consulta of consultas) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "mx");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("q", consulta);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.7",
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
  }

  return null;
};

const calcularCoordenadasDesdeDireccion = async () => {
  const direccion = formDataLocal.direccion?.trim();

  if (!direccion) return;

  calculandoCoordenadas.value = true;

  try {
    const resultado = await buscarCoordenadas(direccion);

    if (resultado) {
      formDataLocal.latitud = String(resultado.lat ?? "");
      formDataLocal.longitud = String(resultado.lon ?? "");
      coordenadasConfirmadas.value = true;
      mostrarMapa.value = true;
      await iniciarMapa();
    } else {
      console.warn(
        "No se encontraron coordenadas para la direccion:",
        direccion,
      );
    }
  } catch (error) {
    console.error("No fue posible calcular coordenadas:", error);
  } finally {
    calculandoCoordenadas.value = false;
  }
};

const handleNextStep = () => {
  if (!coordenadasActuales.value || !coordenadasConfirmadas.value) {
    showInfoMessage({
      title: "Faltan coordenadas confirmadas",
      message:
        "Debes calcular o ajustar el pin en el mapa para confirmar latitud y longitud antes de continuar.",
    });
    return;
  }

  emit("nextStep", formDataLocal);
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

onBeforeMount(() => {
  if (props.formData) {
    Object.assign(formDataLocal, props.formData);
    if (coordenadasActuales.value) {
      coordenadasConfirmadas.value = true;
    }
  }
});

watch(
  () => formDataLocal.direccion,
  (nuevaDireccion, direccionAnterior) => {
    if (
      direccionAnterior !== undefined &&
      nuevaDireccion !== direccionAnterior
    ) {
      coordenadasConfirmadas.value = false;
    }
  },
);

watch(mostrarMapa, async (visible) => {
  if (visible) {
    await iniciarMapa();
  }
});

watch(calculandoCoordenadas, () => {
  syncEstadoInteraccionMapa();
});

watch(coordenadasActuales, async (coords) => {
  if (coords && mapaInstancia.value && mostrarMapa.value) {
    await actualizarMarcador(coords.lat, coords.lng);
  }
  // Escalera de Los Lirios 65, La Laja, 39600 Acapulco de Juárez, Gro.
});

onBeforeUnmount(() => {
  mapaInstancia.value?.remove();
  mapaInstancia.value = null;
  marcadorInstancia.value = null;
});
</script>
<template>
  <template v-if="readonly">
    <div class="ubicacion-form">
      <div v-if="calculandoCoordenadas" class="mensaje-cargando-coordenadas">
        Cargando coordenadas...
      </div>

      <div class="mensaje-indicaciones-ubicacion">
        Ingresa la direccion, luego da clic en el boton de geolocalizacion y
        confirma el punto del evento en el mapa.
      </div>

      <div v-if="mostrarMapa" class="mapa-wrapper">
        <div ref="mapaContainerRef" class="mapa-leaflet" />
      </div>

      <div class="direccion-row">
        <VTextField
          v-model="formDataLocal.direccion"
          label="Direccion"
          variant="outlined"
          density="comfortable"
          :disabled="bloquearInteraccion"
          class="direccion-input"
        />

        <VBtn
          icon
          variant="tonal"
          color="primary"
          :loading="calculandoCoordenadas"
          :disabled="bloquearInteraccion"
          class="accion-btn"
          @click="calcularCoordenadasDesdeDireccion"
        >
          <VIcon icon="tabler-map-pin" />
        </VBtn>
      </div>

      <div class="coordenadas-row">
        <VTextField
          v-model="formDataLocal.latitud"
          label="Latitud"
          variant="outlined"
          density="comfortable"
          :disabled="bloquearInteraccion"
        />
        <VTextField
          v-model="formDataLocal.longitud"
          label="Longitud"
          variant="outlined"
          density="comfortable"
          :disabled="bloquearInteraccion"
        />
      </div>
    </div>

    <div :class="{ 'bloqueado-carga': bloquearInteraccion }">
      <WizardStepButtons
        :step="step"
        :totalSteps="props.steps"
        :next-disabled="!coordenadasConfirmadas || !coordenadasActuales"
        @cancelar="handleCancelar"
        @nextStep="handleNextStep"
        @backStep="handleBackStep"
      />
    </div>
  </template>
</template>

<style scoped>
.ubicacion-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapa-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.mensaje-cargando-coordenadas {
  padding: 8px 12px;
  text-align: center;
  border-radius: 8px;
  border: 1px solid rgb(var(--v-theme-primaryTonalDark));
  background: rgb(var(--v-theme-primaryTonalLight)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.mensaje-indicaciones-ubicacion {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.7);
  font-size: 0.9rem;
}

.mapa-leaflet {
  width: 100%;
  height: 280px;
}

:deep(.leaflet-pin-wrapper) {
  background: transparent;
  border: 0;
}

:deep(.leaflet-pin) {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid #0f766e;
  border-radius: 50% 50% 50% 0;
  background: #14b8a6;
  box-shadow: 0 4px 10px rgba(15, 118, 110, 0.35);
  transform: rotate(-45deg);
}

:deep(.leaflet-pin)::after {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  content: "";
}

.direccion-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.direccion-input {
  flex: 1;
}

.accion-btn {
  flex-shrink: 0;
}

.coordenadas-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.bloqueado-carga {
  pointer-events: none;
  opacity: 0.65;
}

@media (max-width: 640px) {
  .coordenadas-row {
    grid-template-columns: 1fr;
  }
}
</style>
