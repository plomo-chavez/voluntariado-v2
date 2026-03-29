<script setup lang="ts">
import risIsotipo from "@/assets/images/logos/RIS - isotipo.png";
import sarIsotipo from "@/assets/images/logos/SAR - isotipo.png";
import ReporteRIS from "@/pagesComponents/reportes/RIS/ReporteRISInicial.vue";
import ReporteSAR from "@/pagesComponents/reportes/SAR/ReporteSARInicial.vue";
import { ref } from "vue";
// Emitir eventos hacia el componente padre
const emit = defineEmits(["cancelar", "finalizar"]);

const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: null,
  },
);

const tipoReporte = ref<string | null>(null);

const handleSelectTipo = (tipoReporteParam: any = null) => {
  if (tipoReporteParam) {
    tipoReporte.value = tipoReporteParam;
  }
};
const handleCancelar = () => {
  emit("cancelar");
};

onBeforeMount(() => {
  if (props.data && props.data.tipo) {
    tipoReporte.value = props.data?.tipo?.toUpperCase() ?? null;
  }
});
</script>

<template>
  <div
    v-if="tipoReporte != null"
    class="d-flex justify-start align-center mb-5 align-items-center"
  >
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleCancelar"
    />
    <h2 class="wizard-title">{{ tipoReporte }} - Registro</h2>
  </div>
  <div v-if="tipoReporte == null" class="wizard-container">
    <p class="wizard-chip">Nuevo reporte</p>
    <h3 class="wizard-subtitle">
      Selecciona el tipo de reporte que vas a registrar
    </h3>
    <p class="wizard-description">
      Elige una opción para continuar con el formulario inicial.
    </p>

    <div class="wizard-card-container">
      <div
        class="wizard-card"
        @click="handleSelectTipo('RIS')"
        :class="{ 'wizard-card-active': tipoReporte === 'RIS' }"
      >
        <img class="wizard-card-logo" :src="risIsotipo" alt="Isotipo RIS" />
        <p class="wizard-card-title">Reporte de Incidente de Seguridad</p>
        <p class="wizard-card-text">
          Para registrar incidentes y eventos de riesgo.
        </p>
      </div>
      <div
        class="wizard-card"
        @click="handleSelectTipo('SAR')"
        :class="{ 'wizard-card-active': tipoReporte === 'SAR' }"
      >
        <img class="wizard-card-logo" :src="sarIsotipo" alt="Isotipo SAR" />
        <p class="wizard-card-title">Reporte Servicios de Alto Riesgo</p>
        <p class="wizard-card-text">Para registrar servicios de alto riesgo.</p>
      </div>
    </div>
  </div>
  <ReporteRIS
    v-if="tipoReporte === 'RIS'"
    :data="props.data"
    titulo="Reporte RIS"
    :step="1"
    @cancelar="handleCancelar"
  />
  <ReporteSAR
    v-else-if="tipoReporte === 'SAR'"
    :data="props.data"
    titulo="Reporte SAR"
    :step="1"
    @cancelar="handleCancelar"
  />
</template>

<style scoped>
.wizard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  padding: 24px;
  border-radius: 18px;
  background: linear-gradient(160deg, #fff7ef 0%, #ffffff 60%);
  border: 1px solid #f3e3d3;
  max-inline-size: 920px;
}

.wizard-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1b1b1f;
}

.wizard-chip {
  margin: 0;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background-color: rgb(var(--v-theme-primaryTonalLight));
  color: rgb(var(--v-theme-primaryDark));
}

.wizard-subtitle {
  font-size: 1.4rem;
  line-height: 1.25;
  margin: 0.9rem 0 0.5rem;
  text-align: center;
  color: #1b1b1f;
}

.wizard-description {
  margin: 0 0 1.4rem;
  color: #5c5c66;
  text-align: center;
}

.wizard-card-container {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 760px;
}

.wizard-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  min-height: 178px;
  padding: 1.1rem;
  background-color: #ffffff;
  border: 1px solid rgb(var(--v-theme-primaryTonal));
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(99, 69, 38, 0.08);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.wizard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 22px rgba(99, 69, 38, 0.15);
  border-color: rgb(var(--v-theme-primaryDark));
}

.wizard-card-active {
  background: linear-gradient(
    160deg,
    rgb(var(--v-theme-primaryTonal)) 0%,
    #fff8f1 100%
  );
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 10px 24px rgba(125, 69, 8, 0.16);
}

.wizard-card-logo {
  width: 100%;
  /* height: 56px; */
  object-fit: contain;
  /* margin-bottom: 0.6rem; */
}

.wizard-card-label {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.07em;
  font-weight: 700;
  color: rgb(var(--v-theme-primaryDark));
}

.wizard-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0.45rem 0 0.5rem;
  color: rgb(var(--v-theme-primaryDark));
}

.wizard-card-text {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.4;
  color: #5f5244;
}

@media (max-width: 768px) {
  .wizard-container {
    padding: 18px;
    border-radius: 14px;
  }

  .wizard-card-container {
    grid-template-columns: 1fr;
  }

  .wizard-subtitle {
    font-size: 1.2rem;
  }
}

.d-flex {
  display: flex;
  align-items: center; /* Alinea los elementos verticalmente */
}
</style>
