<script setup lang="ts">
import BreadcrumbNav from "@/components/custom/BreadcrumbNav.vue";
import PNL1Evento from "@/pagesComponents/reportes/RIS/PNL1Evento.vue";
import PNL2Elementos from "@/pagesComponents/reportes/RIS/PNL2Elementos.vue";
import PNL3Danios from "@/pagesComponents/reportes/RIS/PNL3Danios.vue";
import PNLValidacion from "@/pagesComponents/reportes/RIS/PNLConfirmacion.vue";
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: null,
  },
);

// Estado del paso actual
const step = ref(0);
const stepLimit = ref(3);
const formData = ref({});

// Emitir eventos hacia el componente padre
const emit = defineEmits(["cancelar"]);

// Configuración de los pasos
// prettier-ignore
const steps = [
  { title: "1. Datos del evento", component: PNL1Evento },
  { title: "2. Atención brindada", component: PNL2Elementos },
  { title: "3. Daños sufridos", component: PNL3Danios },
];

// Funciones para manejar los pasos
const handleNextStep = (data: any) => {
  if (step.value < stepLimit.value) {
    step.value++;
    formData.value = { ...formData.value, ...data };
  }
};

const handleBackStep = () => {
  if (step.value > 0) {
    step.value--;
  }
};

const handleCancelar = () => {
  emit("cancelar");
};

const handleFinalizar = (data: any) => {
  formData.value = { ...formData.value, ...data };
  step.value = stepLimit.value + 1;
};
// Función para navegar a un paso específico desde el breadcrumb
const goToStep = (index: number) => {
  if (index <= step.value) {
    step.value = index;
  }
};

onBeforeMount(() => {
  if (props.data) {
    let dataRaw = { ...toRaw(props.data) };

    formData.value = { id: dataRaw.id, ...JSON.parse(dataRaw.data) };
    step.value = stepLimit.value + 1;
  }
});
</script>

<template>
  <div>
    <!-- Breadcrumbs -->
    <div v-if="step < stepLimit">
      <BreadcrumbNav :steps="steps" :step="step" />
      <template v-for="(stepConfig, index) in steps">
        <div v-if="step === index" :key="index" class="card">
          <p class="titleCard">{{ stepConfig.title }}</p>
          <div class="contenidoCard" v-if="step >= index">
            <component
              v-if="step === index"
              :is="stepConfig.component"
              :step="step"
              :steps="steps.length"
              :formData="formData"
              :readonly="step === index"
              @nextStep="handleNextStep"
              @backStep="handleBackStep"
              @cancelar="handleCancelar"
              @finalizar="handleFinalizar"
            />
          </div>
        </div>
      </template>
    </div>
    <PNLValidacion v-else :data="formData" @cancelar="handleCancelar" />
  </div>
</template>

<style lang="scss">
h4 {
  font-size: 25px; /* Tamaño de fuente más grande */
  font-weight: bold; /* Negrita para destacar */
  color: rgb(var(--v-theme-primary)) !important; /* Color azul para resaltar */
  margin-bottom: 5px; /* Espaciado inferior */
  letter-spacing: 1px; /* Espaciado entre letras */
}

.card {
  width: 100%;
  margin-bottom: 10px;
  height: auto;
  background-color: #ffffff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.titleCard {
  font-size: 15px;
  font-weight: bold;
  padding: 0;
  margin: 0;
  padding-bottom: 10px;
}
.contenidoCard {
  width: 100%;
  padding: 10px;
  height: 100%;
}
</style>
