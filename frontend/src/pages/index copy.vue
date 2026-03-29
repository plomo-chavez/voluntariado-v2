<template>
  <div>
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
      <!-- Indicador Total -->
      <div class="indicator">
        <VCard class="rounded-lg p20">
          <!-- prettier-ignore -->
          <div class="wFull d-flex align-center items-center justify-space-between">
          <div>
              <h4>Total de Reportes <span class="textValor">{{ indicadores.total }}</span></h4>
        </div>
          <div>
            <VBtn icon size="small" variant="text" @click="handleShowFiltros">
              <VIcon icon="tabler-filter-cog" class="textBold" />
            </VBtn>
          </div>
        </div>
        </VCard>
      </div>

      <!-- Selector de Indicadores -->
      <div class="selector">
        <VCard class="rounded-lg p20">
          <h4>Selecciona un Indicador</h4>
          <VChipGroup
            v-model="selectedIndicador"
            column
            class="mt10"
            active-class="chip-active"
          >
            <VChip
              v-for="option in indicadoresOptions"
              :key="option.value"
              :value="option.value"
              class="ma2"
            >
              {{ option.label }}
            </VChip>
          </VChipGroup>
        </VCard>
      </div>

      <!-- Gráfica y Top 10 -->
      <div class="data-container">
        <!-- Gráfica (80%) -->
        <div class="chart">
          <VCard class="rounded-lg p20">
            <div
              class="wFull d-flex align-center items-center justify-space-between"
            >
              <div class="col-10">
                <h4>Gráfica de {{ selectedIndicadorLabel }}</h4>
                <BarChart v-if="chartData" :chart-data="chartData" />
              </div>
              <div class="col-2">
                <h4>Top 10 de {{ selectedIndicadorLabel }}</h4>
                <ul>
                  <li v-for="(item, index) in top10Data" :key="index">
                    {{ item.label }}: {{ item.value }}
                  </li>
                </ul>
              </div>
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
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
  },
  setup(props) {
    return () => h(Bar, { data: props.chartData as any });
  },
});

// Reutilizando datos y funciones existentes
let formFiltros: any = ref({});
let showFormFiltros = ref(false);
const loading = ref(false);

const indicadores: any = ref({});
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

const selectedIndicadorLabel = computed(() => {
  const option = indicadoresOptions.find(
    (opt: any) => opt.value === selectedIndicador.value,
  );
  return option ? option.label : "";
});

const chartData = computed(() => {
  const data: any = indicadores.value[selectedIndicador.value];
  if (!data) return null;

  return {
    labels: Object.keys(data),
    datasets: [
      {
        label: selectedIndicadorLabel.value,
        data: Object.values(data).map((value) => Number(value)) as any[],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  } as ChartData<"bar">;
});

const top10Data = computed(() => {
  const data = indicadores.value[selectedIndicador.value];
  if (!data) return [];

  return Object.entries(data)
    .map(([label, value]) => ({ label, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);
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
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.chart {
  flex: 4 1 80%;
}

.top10 {
  flex: 1 1 20%;
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 768px) {
  .data-container {
    flex-direction: column;
  }

  .chart,
  .top10 {
    flex: 1 1 100%;
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
  background-color: #1976d2 !important;
  color: white !important;
}
</style>
