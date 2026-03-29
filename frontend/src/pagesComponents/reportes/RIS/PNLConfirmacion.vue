<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";

type CatalogItem = {
  id?: number | string;
  label?: string;
};

type Atencion = {
  tratamiento?: string;
  elementos?: string[];
};

type Delegacion = {
  id?: number;
  numDelegacion?: string;
  label?: string;
  autoridades?: string | null;
};

type AutoridadDelegacion = {
  nombre?: string;
  Cargo?: string;
  cargo?: string;
  telefono?: string;
  correo?: string;
};

type Reporte = {
  id?: number;
  fecha?: string;
  esPrimero?: boolean;
  estado?: CatalogItem | null;
  municipio?: CatalogItem | null;
  delegacion?: Delegacion | null;
  hora?: string;
  area?: CatalogItem | null;
  tipoServicio?: CatalogItem | null;
  tipoIncidente?: CatalogItem | null;
  sitioIncidente?: CatalogItem | null;
  direccion?: string;
  latitud?: string | number;
  longitud?: string | number;
  descripcion?: string;
  elementos?: string[];
  atenciones?: Atencion[];
  detallesBienes?: string;
  detallesDaniosTerceros?: string;
  procedimientosSeguridad?: string;
  incidentePrimeroTipo?: string;
  amenazaRiesgoSeguridad?: string;
  medidasAdoptadas?: string;
  accionesAdicionales?: string;
  userCreate_id?: number;
  userCreate?: any;
};

const emit = defineEmits(["cancelar"]);

const props = withDefaults(
  defineProps<{
    data?: Partial<Reporte> | null;
  }>(),
  {
    data: null,
  },
);

const reporte = computed<Partial<Reporte>>(() => props.data ?? {});

const formatValue = (value: unknown, emptyText = "Sin información") => {
  if (value === null || value === undefined) return emptyText;
  if (typeof value === "string" && value.trim() === "") return emptyText;
  return String(value);
};

const safeStringArray = (arr?: string[] | null) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.filter(Boolean);
};

const safeParseAutoridades = (raw?: string | null): AutoridadDelegacion[] => {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    const autoridades: AutoridadDelegacion[] = [];
    if (data.socorros) autoridades.push(data.socorros);
    if (data.seguridad) autoridades.push(data.seguridad);
    return autoridades;
  } catch {
    return [];
  }
};

const autoridadesDelegacion = computed(() =>
  safeParseAutoridades(reporte.value.delegacion?.autoridades ?? null),
);

const elementosList = computed(() => safeStringArray(reporte.value.elementos));

const mapCoordinates = computed(() => {
  const lat = Number.parseFloat(String(reporte.value.latitud ?? ""));
  const lng = Number.parseFloat(String(reporte.value.longitud ?? ""));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
});

const mapContainerRef = ref<HTMLElement | null>(null);
const mapaInstancia = shallowRef<any>(null);
const marcadorInstancia = shallowRef<any>(null);
const leafletLib = shallowRef<any>(null);

const cargarLeaflet = async () => {
  if (!leafletLib.value) {
    // @ts-ignore: resolucion de tipos en esta configuracion.
    leafletLib.value = await import("leaflet");
  }

  return leafletLib.value;
};

const renderMapa = async () => {
  if (!mapContainerRef.value || !mapCoordinates.value) return;

  const L = await cargarLeaflet();

  if (!mapaInstancia.value) {
    mapaInstancia.value = L.map(mapContainerRef.value, {
      zoomControl: true,
      dragging: true,
    }).setView([mapCoordinates.value.lat, mapCoordinates.value.lng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapaInstancia.value);
  }

  if (!marcadorInstancia.value) {
    marcadorInstancia.value = L.marker([
      mapCoordinates.value.lat,
      mapCoordinates.value.lng,
    ]).addTo(mapaInstancia.value);
  } else {
    marcadorInstancia.value.setLatLng([
      mapCoordinates.value.lat,
      mapCoordinates.value.lng,
    ]);
  }

  mapaInstancia.value.setView(
    [mapCoordinates.value.lat, mapCoordinates.value.lng],
    16,
  );

  setTimeout(() => {
    mapaInstancia.value?.invalidateSize();
  }, 0);
};

const mapLink = computed(() => {
  if (mapCoordinates.value) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${mapCoordinates.value.lat},${mapCoordinates.value.lng}`)}`;
  }

  const direccion = reporte.value.direccion?.trim();
  if (!direccion) return "";
  return `https://www.google.com/maps/search/${encodeURIComponent(direccion)}`;
});

const saveReporte = async () => {
  const payload = { ...props.data };

  await apiRequest({
    url: "/api/reportes/ris",
    payload,
    messageType: "toast",
    onSuccess: () => {
      emit("cancelar");
    },
  });
};

onMounted(async () => {
  await nextTick();
  await renderMapa();
});

watch(mapCoordinates, async () => {
  await nextTick();
  await renderMapa();
});

onBeforeUnmount(() => {
  mapaInstancia.value?.remove();
  mapaInstancia.value = null;
  marcadorInstancia.value = null;
});
</script>

<template>
  <div class="containerCardRIS">
    <VCard class="mb-4" variant="outlined">
      <VCardText
        class="d-flex flex-wrap align-center justify-space-between ga-3"
      >
        <div>
          <div class="text-h6 font-weight-bold">
            Reporte RIS #{{ formatValue(reporte.id, "Nuevo") }}
          </div>
          <div class="text-body-2 text-medium-emphasis report-meta">
            <span class="meta-item"
              >Fecha: {{ formatValue(reporte.fecha) }}</span
            >
            <span class="meta-separator"> | </span>
            <span class="meta-item">Hora: {{ formatValue(reporte.hora) }}</span>
            <span class="meta-separator"> | </span>
            <span class="meta-item">
              Tipo: {{ reporte.tipoServicio?.label || "Sin información" }}
            </span>
          </div>
          <div class="text-body-2 text-medium-emphasis report-meta">
            <span class="meta-item">
              Registrado por: {{ formatValue(reporte.userCreate?.nombre) }}
            </span>
          </div>
        </div>

        <VChip
          v-if="reporte.esPrimero"
          color="primary"
          variant="tonal"
          size="small"
        >
          <VIcon start icon="tabler-alert-circle" size="small" />
          Primer incidente
        </VChip>
      </VCardText>
    </VCard>

    <VRow class="mb-2">
      <VCol cols="12" md="6">
        <VCard variant="outlined" class="h-100">
          <VCardItem prepend-icon="tabler-map-pin">
            <template #title>Ubicación</template>
          </VCardItem>
          <VCardText>
            <div class="mb-2">
              <strong>Estado:</strong> {{ formatValue(reporte.estado?.label) }}
            </div>
            <div class="mb-2">
              <strong>Municipio:</strong>
              {{ formatValue(reporte.municipio?.label) }}
            </div>
            <div>
              <strong>Delegación:</strong>
              {{ formatValue(reporte.delegacion?.label) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard variant="outlined" class="h-100">
          <VCardItem prepend-icon="tabler-list-check">
            <template #title>Clasificación</template>
          </VCardItem>
          <VCardText>
            <div class="mb-2">
              <strong>Área:</strong> {{ formatValue(reporte.area?.label) }}
            </div>
            <div class="mb-2">
              <strong>Tipo de incidente:</strong>
              {{ formatValue(reporte.tipoIncidente?.label) }}
            </div>
            <div>
              <strong>Sitio del incidente:</strong>
              {{ formatValue(reporte.sitioIncidente?.label) }}
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mb-4" variant="outlined">
      <VCardItem
        title="Detalles del evento"
        prepend-icon="tabler-info-circle"
      />
      <VCardText>
        <VRow class="align-center ga-y-2">
          <VCol cols="12" md>
            <strong>Dirección:</strong> {{ formatValue(reporte.direccion) }}
            <div class="text-caption text-medium-emphasis mt-1">
              Latitud: {{ formatValue(reporte.latitud) }} | Longitud:
              {{ formatValue(reporte.longitud) }}
            </div>
          </VCol>

          <VCol cols="12" md="auto" class="d-flex justify-end">
            <VBtn
              v-if="mapLink"
              :href="mapLink"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="tonal"
              color="primary"
              icon
            >
              <VIcon icon="tabler-map" />
            </VBtn>
          </VCol>
        </VRow>

        <div v-if="mapCoordinates" class="mapa-wrapper mt-3">
          <div ref="mapContainerRef" class="mapa-leaflet" />
        </div>

        <VAlert v-else type="info" variant="tonal" class="mt-3">
          Sin coordenadas para visualizar el mapa.
        </VAlert>

        <VRow class="mb-2">
          <VCol cols="12">
            <strong>Descripción:</strong>
            <div class="preserve-lines mt-1">
              {{ formatValue(reporte.descripcion) }}
            </div>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12">
            <strong>Elementos:</strong>
            <div class="d-flex flex-wrap ga-2 mt-1">
              <VChip
                v-for="(item, index) in elementosList"
                :key="`elemento-${index}-${item}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ item }}
              </VChip>
              <span
                v-if="elementosList.length === 0"
                class="text-medium-emphasis"
              >
                Sin registros
              </span>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardItem title="Atenciones" prepend-icon="tabler-heart" />
      <VCardText>
        <div v-if="(reporte.atenciones?.length ?? 0) > 0">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel
              v-for="(atencion, index) in reporte.atenciones"
              :key="`atencion-${index}`"
            >
              <VExpansionPanelTitle>
                Atención {{ index + 1 }}: {{ atencion.tratamiento }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="mb-2">
                  <strong>Tratamiento:</strong> {{ atencion.tratamiento }}
                </div>
                <div>
                  <strong>Elementos utilizados:</strong>
                  <div class="d-flex flex-wrap ga-2 mt-2">
                    <VChip
                      v-for="(elem, idx) in atencion.elementos"
                      :key="`elem-${index}-${idx}-${elem}`"
                      size="small"
                      color="info"
                      variant="tonal"
                    >
                      {{ elem }}
                    </VChip>
                    <span
                      v-if="
                        !atencion.elementos || atencion.elementos.length === 0
                      "
                      class="text-medium-emphasis"
                    >
                      Sin registros
                    </span>
                  </div>
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
        <VAlert v-else type="info" variant="tonal">
          Sin registros de atenciones.
        </VAlert>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardItem
        title="Protocolos y seguridad"
        prepend-icon="tabler-shield-check"
      />
      <VCardText class="d-flex flex-column ga-4">
        <div>
          <div class="text-subtitle-2 mb-1">Procedimientos de seguridad</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.procedimientosSeguridad) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Amenaza o riesgo de seguridad</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.amenazaRiesgoSeguridad) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Medidas adoptadas</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.medidasAdoptadas) }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardItem
        title="Daños y acciones"
        prepend-icon="tabler-alert-triangle"
      />
      <VCardText class="d-flex flex-column ga-4">
        <div>
          <div class="text-subtitle-2 mb-1">Detalles de bienes Cruz Roja</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.detallesBienes) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Detalles de daños a terceros</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.detallesDaniosTerceros) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Acciones adicionales</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.accionesAdicionales) }}
          </div>
        </div>
      </VCardText>
    </VCard>

    <VCard class="mb-6" variant="outlined">
      <VCardItem
        title="Autoridades de delegación"
        prepend-icon="tabler-building-community"
      />
      <VCardText>
        <div v-if="autoridadesDelegacion.length > 0">
          <VExpansionPanels variant="accordion">
            <VExpansionPanel
              v-for="(autoridad, index) in autoridadesDelegacion"
              :key="`autoridad-${index}`"
            >
              <VExpansionPanelTitle>
                {{ formatValue(autoridad.Cargo ?? autoridad.cargo) }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <div class="mb-2">
                  <strong>Nombre:</strong> {{ formatValue(autoridad.nombre) }}
                </div>
                <div class="mb-2">
                  <strong>Cargo:</strong>
                  {{ formatValue(autoridad.Cargo ?? autoridad.cargo) }}
                </div>
                <div class="mb-2">
                  <strong>Teléfono:</strong>
                  {{ formatValue(autoridad.telefono) }}
                </div>
                <div>
                  <strong>Correo:</strong> {{ formatValue(autoridad.correo) }}
                </div>
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>

        <VAlert v-else type="info" variant="tonal">
          Sin autoridades registradas.
        </VAlert>
      </VCardText>
    </VCard>

    <div
      class="actions-responsive d-flex justify-space-between ga-3 mt-4 w-100"
    >
      <VBtn variant="outlined" color="secondary" @click="emit('cancelar')">
        <VIcon start icon="tabler-x" />
        Cancelar
      </VBtn>

      <VBtn v-if="!reporte.id" @click="saveReporte" color="success">
        Guardar
        <VIcon end icon="tabler-device-floppy" />
      </VBtn>
    </div>
  </div>
</template>

<style scoped>
.containerCardRIS {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.preserve-lines {
  white-space: pre-line;
}

.actions-responsive {
  flex-wrap: wrap;
}

.report-meta {
  white-space: nowrap;
}

.mapa-wrapper {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.mapa-leaflet {
  width: 100%;
  height: 280px;
}

@media (max-width: 600px) {
  .actions-responsive > * {
    width: 100%;
  }

  .report-meta {
    white-space: normal;
  }

  .report-meta .meta-item {
    display: block;
  }

  .report-meta .meta-separator {
    display: none;
  }

  .text-h6 {
    font-size: 1rem !important;
    line-height: 1.3;
  }
}
</style>
