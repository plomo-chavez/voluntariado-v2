<template>
  <div v-if="true">
    <LoadingOverlay
      :isActivo="loading"
      :texto="'Cargando estadisticas ...!!'"
    />

    <!-- Filtros -->
    <div class="mb30">
      <transition name="fade">
        <VCard v-if="showFormFiltros" class="rounded-lg mx-auto p20">
          <div>
            <div
              class="wFull d-flex align-center items-center justify-space-between mb10"
            >
              <h2>Filtros</h2>
              <VBtn
                icon
                size="small"
                color="error"
                variant="text"
                @click="handleOcultar"
              >
                <VIcon icon="tabler-x" class="textBold" />
              </VBtn>
            </div>
            <FormFactory
              v-if="schemaFiltros != null"
              :schema="schemaFiltros"
              :formLive="true"
              :modelValue="formFiltros"
              :text-button-cancel="'Limpiar'"
              :showMessageRequired="false"
              @submit="handleFormFiltros"
              @cancel="handleClearFiltros"
            />
          </div>
        </VCard>
      </transition>
    </div>

    <div class="layout-container">
      <div class="summary-grid">
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div class="d-flex align-center ga-4">
              <div class="indicator-card__icon">
                <VIcon icon="tabler-report-analytics" size="26" />
              </div>

              <div>
                <div class="metric-label mb-1">Total de reportes</div>
                <div class="metric-value mb-1">
                  {{ indicadores.total ?? 0 }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  Resumen general de reportes encontrados con los filtros
                  actuales.
                </div>
              </div>
            </div>

            <VBtn
              color="primary"
              variant="tonal"
              prepend-icon="tabler-filter-cog"
              @click="handleShowFiltros"
            >
              Filtros
            </VBtn>
          </div>
        </VCard>

        <VCard class="rounded-lg p20 insight-card" variant="outlined">
          <div class="metric-label mb-2">Indicador seleccionado</div>
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
          >
            <div>
              <div class="text-h6 mb-1">{{ selectedIndicadorLabel }}</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ selectedIndicadorEntries.length }} categorías |
                {{ selectedIndicadorTotal }} registros
              </div>
            </div>
            <VChip color="primary" variant="tonal">
              {{ selectedIndicadorLeader?.label ?? "Sin datos" }}
            </VChip>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Máximo valor:
            <strong>{{ selectedIndicadorLeader?.value ?? 0 }}</strong>
          </div>
        </VCard>
      </div>

      <VCard class="rounded-lg p20" variant="outlined">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3"
        >
          <div>
            <h4 class="mb-1">Selecciona un indicador</h4>
            <div class="text-body-2 text-medium-emphasis">
              Explora la distribución de reportes por categoría.
            </div>
          </div>
        </div>

        <VChipGroup
          v-model="selectedIndicador"
          class="mt10"
          active-class="chip-active"
          selected-class="chip-active"
        >
          <VChip
            v-for="option in indicadoresOptions"
            :key="option.value"
            :value="option.value"
            class="ma2"
            filter
          >
            {{ option.label }}
          </VChip>
        </VChipGroup>
      </VCard>

      <VCard class="rounded-lg p20" variant="outlined">
        <div class="d-flex align-center justify-space-between flex-wrap ga-3">
          <div>
            <h4 class="mb-1">Vista de indicadores</h4>
            <div class="text-body-2 text-medium-emphasis">
              Cambia entre resumen en tarjetas y visualización gráfica.
            </div>
          </div>

          <div class="view-toggle-group">
            <VBtn
              :variant="indicatorView === 'cards' ? 'flat' : 'outlined'"
              :color="indicatorView === 'cards' ? 'primary' : 'default'"
              @click="indicatorView = 'cards'"
            >
              <VIcon start icon="tabler-layout-grid" />
              Cards
            </VBtn>
            <VBtn
              :variant="indicatorView === 'charts' ? 'flat' : 'outlined'"
              :color="indicatorView === 'charts' ? 'primary' : 'default'"
              @click="indicatorView = 'charts'"
            >
              <VIcon start icon="tabler-chart-bar" />
              Gráficas
            </VBtn>
          </div>
        </div>
      </VCard>

      <div v-if="indicatorView === 'cards'" class="mini-cards-grid">
        <VCard
          v-for="card in dashboardCards"
          :key="card.value"
          class="rounded-lg p20"
          variant="outlined"
        >
          <div class="d-flex align-center justify-space-between ga-2 mb-3">
            <div class="text-subtitle-2">{{ card.label }}</div>
            <VChip size="small" color="primary" variant="tonal">
              {{ card.categories }} categorías
            </VChip>
          </div>

          <div class="d-flex align-end justify-space-between ga-3 mb-2">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">
                Valor líder
              </div>
              <div class="text-h5 font-weight-bold">
                {{ card.leader?.value ?? 0 }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-body-2 text-medium-emphasis">Participación</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ card.leaderShare }}%
              </div>
            </div>
          </div>

          <div class="text-caption text-medium-emphasis mb-1">
            Categoría líder
          </div>
          <div class="text-body-2 font-weight-medium card-leader-label mb-3">
            {{ card.leader?.label ?? "Sin datos" }}
          </div>

          <VProgressLinear
            :model-value="card.leaderShare"
            color="primary"
            bg-color="grey-200"
            height="8"
            rounded
          />

          <div class="text-caption text-medium-emphasis mt-3">
            Total acumulado del indicador: {{ card.total }}
          </div>
        </VCard>
      </div>

      <div v-else class="data-container">
        <VCard class="rounded-lg p20" variant="outlined">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
          >
            <div>
              <h4 class="mb-1">Gráfica de {{ selectedIndicadorLabel }}</h4>
              <div class="text-body-2 text-medium-emphasis">
                Distribución completa del indicador seleccionado.
              </div>
            </div>
          </div>

          <div v-if="chartData" class="chart-card">
            <BarChart :chart-data="chartData" :chart-options="chartOptions" />
          </div>
          <VAlert v-else type="info" variant="tonal">
            No hay información disponible para este indicador.
          </VAlert>
        </VCard>

        <VCard class="rounded-lg p20" variant="outlined">
          <div class="mb-4">
            <h4 class="mb-1">Top 10 de {{ selectedIndicadorLabel }}</h4>
            <div class="text-body-2 text-medium-emphasis">
              Valores con mayor frecuencia.
            </div>
          </div>

          <div v-if="top10Data.length > 0">
            <div
              v-for="(item, index) in top10Data"
              :key="index"
              class="top-item"
            >
              <div class="top-item__label">
                {{ index + 1 }}. {{ item.label }}
              </div>
              <div class="top-item__value">{{ item.value }}</div>
            </div>
          </div>
          <VAlert v-else type="info" variant="tonal">
            Sin datos para mostrar en el ranking.
          </VAlert>
        </VCard>
      </div>

      <!-- <VCard class="rounded-lg p20" variant="outlined">
        <div class="mb-4">
          <h4 class="mb-1">Detalle de {{ selectedIndicadorLabel }}</h4>
          <div class="text-body-2 text-medium-emphasis">
            Lista completa ordenada de mayor a menor.
          </div>
        </div>

        <div v-if="selectedIndicadorEntries.length > 0" class="list-table">
          <div
            v-for="(item, index) in selectedIndicadorEntries"
            :key="`${item.label}-${index}`"
            class="list-table__row"
          >
            <div>
              <div class="list-table__label text-body-2 mb-1">
                {{ item.label }}
              </div>
              <VProgressLinear
                :model-value="
                  selectedIndicadorTotal
                    ? (item.value / selectedIndicadorTotal) * 100
                    : 0
                "
                color="primary"
                height="8"
                rounded
              />
            </div>
            <div class="list-table__value">{{ item.value }}</div>
          </div>
        </div>
        <VAlert v-else type="info" variant="tonal">
          No hay datos que mostrar en este indicador.
        </VAlert>
      </VCard> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import moment from "moment";
import { computed, defineComponent, h, ref } from "vue";
import { Bar } from "vue-chartjs";

// Registrar componentes de Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);

// Componente de la gráfica
const BarChart = defineComponent({
  props: {
    chartData: {
      type: Object as () => ChartData<"bar">,
      required: true,
    },
    chartOptions: {
      type: Object as () => ChartOptions<"bar">,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(Bar, {
        data: props.chartData as any,
        options: props.chartOptions as any,
      });
  },
});

type IndicadorMap = Record<string, number>;
type IndicadoresResponse = {
  total?: number;
  [key: string]: number | IndicadorMap | undefined;
};

type IndicadorEntry = {
  label: string;
  value: number;
};

// Reutilizando datos y funciones existentes
let formFiltros: any = ref({});
let showFormFiltros = ref(false);
const loading = ref(false);

const indicadores = ref<IndicadoresResponse>({});
let schemaFiltros: any = ref([
  {
    ref: "fecha",
    type: "rangeDate",
    minModel: "fechaInicio",
    minLabel: "Fecha de inicio",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
    maxModel: "fechaFin",
    maxLabel: "Fecha de fin",
    minConfig: {
      dateFormat: "d/m/Y",
      enableTime: false,
    },
    maxConfig: {
      dateFormat: "d/m/Y",
      enableTime: false,
    },
  },
  {
    label: "Estado",
    type: "select",
    model: "estado",
    catalogo: "estados",
    classElement: " col-4 ",
  },
  {
    label: "Municipio",
    type: "select",
    model: "municipio",
    catalogo: "municipios",
    dependencia: "estado",
    dependenciaFiltro: "estado_id",
    classElement: " col-4 ",
  },
  {
    label: "Delegación",
    type: "select",
    model: "delegacion",
    catalogo: "delegaciones",
    dependencia: "municipio",
    dependenciaFiltro: "municipio_id",
    config: { fullInfo: true },
    classElement: " col-4 ",
  },
  {
    type: "select",
    model: "tipoReporte",
    label: "Tipos de Reporte",
    options: [
      { label: "RIS", value: "RIS" },
      { label: "SAR", value: "SAR" },
    ],
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
  {
    type: "select",
    model: "horario",
    label: "Horarios",
    catalogo: "horarios",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
  {
    type: "select",
    model: "area",
    label: "Areas",
    catalogo: "areas",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
  {
    type: "select",
    model: "agresor",
    label: "Agresor",
    catalogo: "agresores",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
  {
    type: "select",
    model: "sitioAgresion",
    label: "Sitios de agresion",
    catalogo: "sitios-incidente",
    classElement: " col-sm-6 col-md-3  col-lg-3 ",
  },
]);

// Función para mostrar/ocultar el formulario de filtros
const handleShowFiltros = () => {
  showFormFiltros.value = true; // Alternar visibilidad
};

// Función para manejar el envío del formulario
const handleFormFiltros = async () => {
  handleGetIndicadores();
  showFormFiltros.value = false;
};

const handleGetIndicadores = async () => {
  loading.value = true;
  let tmp = toRaw(formFiltros.value);
  await apiRequest({
    url: "/api/reportes/estadisticas",
    payload: tmp,
    messageType: "toast",
    onSuccess: (dataResponse: any) => {
      indicadores.value = dataResponse;
    },
  });
  loading.value = false;
};

// Función para limpiar los filtros
const handleClearFiltros = () => {
  formFiltros.value = {}; // Reiniciar el formulario
  showFormFiltros.value = false; // Alternar visibilidad
};

const handleOcultar = () => {
  showFormFiltros.value = false; // Alternar visibilidad
};

onMounted(() => {
  // Determinar si se debe agregar el campo "Subagente"
  const incluirSubagente = false; // Cambia esta condición según tu lógica

  // Crear una copia del esquema base
  const now = moment();

  formFiltros.value.fechaInicio = now.startOf("year").format("DD/MM/YYYY");

  // Agregar el campo "Subagente" si es necesario
  if (incluirSubagente) {
    schemaFiltros.value.push({
      label: "Subagente",
      type: "select",
      model: "subagente",
      catalogo: "subagentes",
      classElement: " col-sm-6 col-md-3  col-lg-3 ",
    });
  }

  handleGetIndicadores();
});

// Opciones para los chips
const indicadoresOptions: any = [
  { label: "Estado", value: "porEstado" },
  { label: "Municipio", value: "porMunicipio" },
  { label: "Delegación", value: "porDelegacion" },
  { label: "Tipo de Reporte", value: "tipoReporte" },
  { label: "Área", value: "porArea" },
  { label: "Horario", value: "porHorario" },
  { label: "Sitio de Agresión", value: "porSitioAgresion" },
  { label: "Agresor", value: "porAgresor" },
];

const selectedIndicador = ref("porEstado");
const indicatorView = ref<"cards" | "charts">("cards");

const selectedIndicadorLabel = computed(() => {
  const option = indicadoresOptions.find(
    (opt: any) => opt.value === selectedIndicador.value,
  );
  return option ? option.label : "";
});

const selectedIndicadorData = computed<IndicadorMap>(() => {
  const data = indicadores.value[selectedIndicador.value];
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  return data as IndicadorMap;
});

const selectedIndicadorEntries = computed<IndicadorEntry[]>(() => {
  return Object.entries(selectedIndicadorData.value)
    .map(([label, value]) => ({ label, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value);
});

const selectedIndicadorTotal = computed(() => {
  return selectedIndicadorEntries.value.reduce(
    (sum, item) => sum + item.value,
    0,
  );
});

const selectedIndicadorLeader = computed(() => {
  return selectedIndicadorEntries.value[0] ?? null;
});

const themePrimaryBorderColor = computed(() => {
  if (typeof window === "undefined") return "rgba(11, 35, 123, 1)";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--v-theme-primary")
    .trim();

  return value ? `rgba(${value}, 1)` : "rgba(11, 35, 123, 1)";
});

const themePrimaryTonalLightBackground = computed(() => {
  if (typeof window === "undefined") return "rgba(242, 106, 115, 0.18)";

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--v-theme-primaryTonal")
    .trim();

  return value ? `rgba(${value}, 0.18)` : "rgba(242, 106, 115, 0.18)";
});

const dashboardCards = computed(() => {
  return indicadoresOptions.map((option: any) => {
    const raw = indicadores.value[option.value];
    const entries =
      !raw || typeof raw !== "object" || Array.isArray(raw)
        ? []
        : Object.entries(raw as IndicadorMap)
            .map(([label, value]) => ({ label, value: Number(value) || 0 }))
            .sort((a, b) => b.value - a.value);

    const total = entries.reduce((sum, item) => sum + item.value, 0);
    const leader = entries[0] ?? null;

    return {
      ...option,
      categories: entries.length,
      total,
      leader,
      leaderShare:
        leader && total > 0 ? Math.round((leader.value / total) * 100) : 0,
    };
  });
});

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.label}: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        minRotation: 0,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

const chartData = computed(() => {
  if (selectedIndicadorEntries.value.length === 0) return null;

  const labels = selectedIndicadorEntries.value.map((item) => item.label);
  const data = selectedIndicadorEntries.value.map((item) => item.value);

  return {
    labels,
    datasets: [
      {
        label: selectedIndicadorLabel.value,
        data,
        backgroundColor: themePrimaryTonalLightBackground.value,
        borderColor: themePrimaryBorderColor.value,
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 42,
      },
    ],
  } as ChartData<"bar">;
});

const top10Data = computed(() => {
  return selectedIndicadorEntries.value.slice(0, 10);
});
</script>

<style scoped>
/* Layout principal */
.layout-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filters,
.indicator,
.selector {
  flex: 1 1 100%;
}

.data-container {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 20px;
}

.chart-card {
  height: 420px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.mini-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.view-toggle-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: rgb(var(--v-theme-on-surface));
}

.metric-label {
  color: rgba(var(--v-theme-on-surface), 0.66);
}

.insight-card,
.indicator-card {
  height: 100%;
}

.indicator-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.top-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.top-item:last-child {
  border-bottom: 0;
}

.top-item__label {
  overflow: hidden;
  color: rgb(var(--v-theme-on-surface));
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-item__value {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.card-leader-label {
  line-height: 1.35;
  text-wrap: balance;
}

.list-table {
  display: grid;
  gap: 10px;
}

.list-table__row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 100px;
  gap: 12px;
  align-items: center;
}

.list-table__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-table__value {
  font-weight: 700;
  text-align: right;
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 1260px) {
  .mini-cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .data-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-grid,
  .mini-cards-grid {
    grid-template-columns: 1fr;
  }

  .view-toggle-group {
    width: 100%;
  }

  .view-toggle-group > * {
    flex: 1 1 calc(50% - 6px);
  }
}

/* Estilos adicionales */
.textValor {
  font-size: 24px;
  font-weight: bold;
  color: black;
  text-align: center;
}

.chip-active {
  font-weight: 700;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}
</style>
