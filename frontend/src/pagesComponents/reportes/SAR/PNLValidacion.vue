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

type Paciente = {
  sexo?: string;
  edad?: string | number;
  traslado?: boolean;
  atencion?: string;
  hospitalTraslado?: string;
  motivoNoTraslado?: string;
};

type AutoridadDelegacion = {
  nombre?: string;
  Cargo?: string;
  cargo?: string;
  telefono?: string;
  correo?: string;
};

type Delegacion = {
  id?: number;
  numDelegacion?: string;
  label?: string;
  autoridades?: string | null;
};

type Reporte = {
  id?: number;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  estado?: CatalogItem | null;
  municipio?: CatalogItem | null;
  delegacion?: Delegacion | null;
  tipoServicio?: CatalogItem[];
  tipoReporte?: CatalogItem[];
  autoridadesPublicas?: CatalogItem[];
  autoridadesCRInformadas?: CatalogItem[];
  direccion?: string;
  latitud?: string;
  longitud?: string;
  elementos?: string[];
  fraps?: string[];
  unidades?: string[];
  atenciones?: Paciente[];
  descripcionEvento?: string;
  afectacionesSufridas?: string;
  observacionesComentarios?: string;
  userCreate_id?: number;
  userCreate?: any;
};

const emit = defineEmits(["cancelar", "nextStep", "backStep"]);

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

const safeArrayLabels = (items?: CatalogItem[] | null) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item) => item?.label).filter(Boolean) as string[];
};

const safeStringArray = (arr?: string[] | null) => {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.filter(Boolean);
};

const safeParseAutoridades = (raw?: string | null): AutoridadDelegacion[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const autoridadesDelegacion = computed(() =>
  safeParseAutoridades(reporte.value.delegacion?.autoridades ?? null),
);

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
  if (!mapCoordinates.value) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(`${mapCoordinates.value.lat},${mapCoordinates.value.lng}`)}`;
});

const tipoServicioLabels = computed(() =>
  safeArrayLabels(reporte.value.tipoServicio),
);

const tipoReporteLabels = computed(() =>
  safeArrayLabels(reporte.value.tipoReporte),
);

const autoridadesPublicasLabels = computed(() =>
  safeArrayLabels(reporte.value.autoridadesPublicas),
);

const autoridadesCRInformadasLabels = computed(() =>
  safeArrayLabels(reporte.value.autoridadesCRInformadas),
);

const elementosList = computed(() => safeStringArray(reporte.value.elementos));
const unidadesList = computed(() => safeStringArray(reporte.value.unidades));
const frapsList = computed(() => safeStringArray(reporte.value.fraps));

const recursosCount = computed(
  () => elementosList.value.length + unidadesList.value.length,
);

const saveReporte = async () => {
  const payload = { ...props.data };

  await apiRequest({
    url: "/api/reportes/sar",
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
  <div class="containerCardSAR">
    <VCard class="mb-4" variant="outlined">
      <VCardText
        class="d-flex flex-wrap align-center justify-space-between ga-3"
      >
        <div>
          <div class="text-h6 font-weight-bold">
            Reporte SAR #{{ formatValue(reporte.id, "Nuevo") }}
          </div>
          <div class="text-body-2 text-medium-emphasis report-meta">
            <span class="meta-item"
              >Fecha: {{ formatValue(reporte.fecha) }}</span
            >
            <span class="meta-separator"> | </span>
            <span class="meta-item"
              >Horario: {{ formatValue(reporte.horaInicio) }} -
              {{ formatValue(reporte.horaFin) }}</span
            >
            <span class="meta-separator"> | </span>
            <span class="meta-item"
              >Registrado por:
              {{ formatValue(reporte.userCreate?.nombre) }}</span
            >
          </div>
        </div>
      </VCardText>
    </VCard>

    <VRow class="mb-2">
      <VCol cols="12" md="6">
        <VCard variant="outlined" class="h-100">
          <VCardItem prepend-icon="tabler-users-group">
            <template #title>Recursos</template>
            <template #append>
              <VChip size="x-small" color="primary" variant="tonal">
                {{ recursosCount }}
              </VChip>
            </template>
          </VCardItem>
          <VCardText>
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis mb-1">
                Elementos ({{ elementosList.length }})
              </div>
              <div class="d-flex flex-wrap ga-2">
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
            </div>

            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Unidades ({{ unidadesList.length }})
              </div>
              <div class="d-flex flex-wrap ga-2">
                <VChip
                  v-for="(item, index) in unidadesList"
                  :key="`unidad-${index}-${item}`"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ item }}
                </VChip>
                <span
                  v-if="unidadesList.length === 0"
                  class="text-medium-emphasis"
                >
                  Sin registros
                </span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="6">
        <VCard variant="outlined" class="h-100">
          <VCardItem prepend-icon="tabler-id-badge-2">
            <template #title># Fraps</template>
            <template #append>
              <VChip size="x-small" color="primary" variant="tonal">
                {{ frapsList.length }}
              </VChip>
            </template>
          </VCardItem>
          <VCardText>
            <div class="text-caption text-medium-emphasis mb-1">
              FRaps registrados
            </div>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="(item, index) in frapsList"
                :key="`frap-${index}-${item}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ item }}
              </VChip>
              <span v-if="frapsList.length === 0" class="text-medium-emphasis">
                Sin registros
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VCard class="mb-4" variant="outlined">
      <VCardItem title="Ubicación detallada" prepend-icon="tabler-route" />
      <VCardText>
        <VRow class="mb-2">
          <VCol cols="12" md="4">
            <strong>Estado:</strong> {{ formatValue(reporte.estado?.label) }}
          </VCol>
          <VCol cols="12" md="4">
            <strong>Municipio:</strong>
            {{ formatValue(reporte.municipio?.label) }}
          </VCol>
          <VCol cols="12" md="4">
            <strong>Delegación:</strong>
            {{ formatValue(reporte.delegacion?.label) }}
          </VCol>
        </VRow>

        <VRow class="align-center ga-y-2">
          <VCol cols="12" md>
            <div class="mb-1">
              <strong>Dirección:</strong> {{ formatValue(reporte.direccion) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Latitud: {{ formatValue(reporte.latitud) }} | Longitud:
              {{ formatValue(reporte.longitud) }}
            </div>
          </VCol>

          <VCol cols="12" md="auto" class="d-flex justify-end map-action-col">
            <VBtn
              v-if="mapLink"
              :href="mapLink"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="tonal"
              color="primary"
            >
              Abrir en mapa
              <VIcon end icon="tabler-external-link" />
            </VBtn>
            <div v-else class="text-body-2 text-medium-emphasis">
              Sin coordenadas para mapa.
            </div>
          </VCol>
        </VRow>

        <div v-if="mapCoordinates" class="mapa-wrapper mt-3">
          <div ref="mapContainerRef" class="mapa-leaflet" />
        </div>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardItem title="Clasificación" prepend-icon="tabler-tags" />
      <VCardText>
        <VRow class="ga-y-4">
          <VCol cols="12" sm="6" lg="3">
            <div class="text-subtitle-2 mb-2">Tipo de servicio</div>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="(label, index) in tipoServicioLabels"
                :key="`servicio-${index}-${label}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ label }}
              </VChip>
              <span
                v-if="tipoServicioLabels.length === 0"
                class="text-medium-emphasis"
              >
                Sin registros
              </span>
            </div>
          </VCol>

          <VCol cols="12" sm="6" lg="3">
            <div class="text-subtitle-2 mb-2">Servicio solicitado por</div>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="(label, index) in tipoReporteLabels"
                :key="`reporte-${index}-${label}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ label }}
              </VChip>
              <span
                v-if="tipoReporteLabels.length === 0"
                class="text-medium-emphasis"
              >
                Sin registros
              </span>
            </div>
          </VCol>

          <VCol cols="12" sm="6" lg="3">
            <div class="text-subtitle-2 mb-2">
              Autoridades públicas participantes
            </div>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="(label, index) in autoridadesPublicasLabels"
                :key="`autoridad-publica-${index}-${label}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ label }}
              </VChip>
              <span
                v-if="autoridadesPublicasLabels.length === 0"
                class="text-medium-emphasis"
              >
                Sin registros
              </span>
            </div>
          </VCol>

          <VCol cols="12" sm="6" lg="3">
            <div class="text-subtitle-2 mb-2">Autoridades CR informadas</div>
            <div class="d-flex flex-wrap ga-2">
              <VChip
                v-for="(label, index) in autoridadesCRInformadasLabels"
                :key="`autoridad-cr-${index}-${label}`"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ label }}
              </VChip>
              <span
                v-if="autoridadesCRInformadasLabels.length === 0"
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
      <VCardItem title="Pacientes" prepend-icon="tabler-user-heart" />
      <VCardText>
        <VExpansionPanels
          v-if="(reporte.atenciones?.length ?? 0) > 0"
          variant="accordion"
        >
          <VExpansionPanel
            v-for="(paciente, index) in reporte.atenciones"
            :key="`paciente-${index}`"
          >
            <VExpansionPanelTitle>
              Paciente {{ index + 1 }} | {{ formatValue(paciente?.sexo) }} |
              {{ formatValue(paciente?.edad) }} años
            </VExpansionPanelTitle>
            <VExpansionPanelText>
              <VRow>
                <VCol cols="12" md="4">
                  <strong>Sexo:</strong> {{ formatValue(paciente?.sexo) }}
                </VCol>
                <VCol cols="12" md="4">
                  <strong>Edad:</strong> {{ formatValue(paciente?.edad) }}
                </VCol>
                <VCol cols="12" md="4" class="d-flex align-center ga-2">
                  <strong>Traslado:</strong>
                  <VChip
                    size="small"
                    :color="paciente?.traslado ? 'success' : 'warning'"
                    variant="tonal"
                  >
                    {{ paciente?.traslado ? "Sí" : "No" }}
                  </VChip>
                </VCol>
                <VCol cols="12">
                  <strong>Atención:</strong>
                  <div class="preserve-lines">
                    {{ formatValue(paciente?.atencion) }}
                  </div>
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Hospital de traslado:</strong>
                  {{ formatValue(paciente?.hospitalTraslado, "No aplica") }}
                </VCol>
                <VCol cols="12" md="6">
                  <strong>Motivo no traslado:</strong>
                  {{ formatValue(paciente?.motivoNoTraslado, "No aplica") }}
                </VCol>
              </VRow>
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>

        <VAlert v-else type="info" variant="tonal">
          Sin registros de pacientes.
        </VAlert>
      </VCardText>
    </VCard>

    <VCard class="mb-4" variant="outlined">
      <VCardItem title="Narrativa del evento" prepend-icon="tabler-notes" />
      <VCardText class="d-flex flex-column ga-4">
        <div>
          <div class="text-subtitle-2 mb-1">Descripción del evento</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.descripcionEvento) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Afectaciones sufridas</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.afectacionesSufridas) }}
          </div>
        </div>
        <div>
          <div class="text-subtitle-2 mb-1">Observaciones y comentarios</div>
          <div class="preserve-lines">
            {{ formatValue(reporte.observacionesComentarios) }}
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
        <VRow v-if="autoridadesDelegacion.length > 0">
          <VCol
            v-for="(autoridad, index) in autoridadesDelegacion"
            :key="`autoridad-delegacion-${index}`"
            cols="12"
            md="6"
          >
            <VCard variant="tonal" color="default">
              <VCardText>
                <div>
                  <strong>Nombre:</strong> {{ formatValue(autoridad.nombre) }}
                </div>
                <div>
                  <strong>Cargo:</strong>
                  {{ formatValue(autoridad.Cargo ?? autoridad.cargo) }}
                </div>
                <div>
                  <strong>Teléfono:</strong>
                  {{ formatValue(autoridad.telefono) }}
                </div>
                <div>
                  <strong>Correo:</strong> {{ formatValue(autoridad.correo) }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

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
.containerCardSAR {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.preserve-lines {
  white-space: pre-line;
}

.ga-y-4 {
  row-gap: 16px;
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
