<template>
  <div>
    <LoadingOverlay
      :isActivo="loading"
      :texto="'Cargando estadísticas ...!!'"
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

    <!-- Indicadores SAR -->
    <div class="layout-container">
      <h3>Indicadores SAR</h3>
      <div class="summary-grid">
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Total de Servicios</div>
              <div class="metric-value mb-1">
                {{ indicadores.SAR?.totalServicios ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Duración Promedio</div>
              <div class="metric-value mb-1">
                {{ indicadores.SAR?.duracionPromedio ?? 0 }} ms
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Total de Elementos</div>
              <div class="metric-value mb-1">
                {{ indicadores.SAR?.totalElementos ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Total de Pacientes</div>
              <div class="metric-value mb-1">
                {{ indicadores.SAR?.totalPacientes ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <!-- Agregar más tarjetas para otros indicadores SAR -->
      </div>

      <!-- Indicadores RIS -->
      <h3>Indicadores RIS</h3>
      <div class="summary-grid">
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Total de Incidentes</div>
              <div class="metric-value mb-1">
                {{ indicadores.RIS?.totalIncidentes ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Incidentes con Daños a Bienes</div>
              <div class="metric-value mb-1">
                {{ indicadores.RIS?.incidentesConDaniosBienes ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Total de Elementos</div>
              <div class="metric-value mb-1">
                {{ indicadores.RIS?.totalElementos ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <!-- Agregar más tarjetas para otros indicadores RIS -->
      </div>

      <!-- Indicadores Combinados -->
      <h3>Indicadores Combinados</h3>
      <div class="summary-grid">
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Ratio de Riesgo Operativo</div>
              <div class="metric-value mb-1">
                {{ indicadores.combinados?.ratioRiesgoOperativo ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <VCard class="rounded-lg p20 indicator-card" variant="outlined">
          <div class="d-flex align-center justify-space-between flex-wrap ga-4">
            <div>
              <div class="metric-label mb-1">Recursos Totales Desplegados</div>
              <div class="metric-value mb-1">
                {{ indicadores.combinados?.recursosTotalesDesplegados ?? 0 }}
              </div>
            </div>
          </div>
        </VCard>
        <!-- Agregar más tarjetas para otros indicadores combinados -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FormFactory from "@/components/apps/FormFactory.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import moment from "moment";
import { onMounted, ref } from "vue";

const formFiltros = ref({
  fechaInicio: moment().startOf("year").format("DD/MM/YYYY"),
  fechaFin: moment().endOf("year").format("DD/MM/YYYY"),
  estado: null,
  municipio: null,
  delegacion: null,
  tipoReporte: null,
  horario: null,
  area: null,
  agresor: null,
  sitioAgresion: null,
});

const indicadores = ref({
  SAR: {
    totalServicios: 0,
    duracionPromedio: 0,
  },
  RIS: {
    totalIncidentes: 0,
    incidentesConDaniosBienes: 0,
  },
  combinados: {
    ratioRiesgoOperativo: 0,
    recursosTotalesDesplegados: 0,
  },
});

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

const loading = ref(false);
const showFormFiltros = ref(false);

const handleFormFiltros = async () => {
  loading.value = true;
  await apiRequest({
    url: "/api/reportes/estadisticas2",
    payload: formFiltros.value,
    onSuccess: (data: any) => {
      indicadores.value = data;
    },
  });
  loading.value = false;
};

const handleClearFiltros = () => {
  formFiltros.value = {
    fechaInicio: moment().startOf("year").format("DD/MM/YYYY"),
    fechaFin: moment().endOf("year").format("DD/MM/YYYY"),
    estado: null,
    municipio: null,
    delegacion: null,
    tipoReporte: null,
    horario: null,
    area: null,
    agresor: null,
    sitioAgresion: null,
  };
};

const handleOcultar = () => {
  showFormFiltros.value = false;
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

  handleFormFiltros();
});
</script>

<style scoped>
.layout-container {
  padding: 20px;
}
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>
