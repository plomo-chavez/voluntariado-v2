<script setup lang="ts">
import BreadcrumbNav from "@/components/custom/BreadcrumbNav.vue";
import PNL1Identificacion from "@/pagesComponents/reportes/SAR/PNL1Identificacion.vue";
import PNL2Ubicacion from "@/pagesComponents/reportes/SAR/PNL2Ubicacion.vue";
import PNL3Personas from "@/pagesComponents/reportes/SAR/PNL3Personas.vue";
import PNL4Pacientes from "@/pagesComponents/reportes/SAR/PNL4Pacientes.vue";
import PNL6Observaciones from "@/pagesComponents/reportes/SAR/PNL6Observaciones.vue";
import PNLValidacion from "@/pagesComponents/reportes/SAR/PNLValidacion.vue";
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
const formData = ref({});

// Emitir eventos hacia el componente padre
const emit = defineEmits(["cancelar"]);

// Configuración de los pasos
const steps = [
  { title: "1. Datos Generales", component: PNL1Identificacion },
  { title: "2. Ubicación", component: PNL2Ubicacion },
  { title: "3. Recursos", component: PNL3Personas },
  { title: "4. Atenciones", component: PNL4Pacientes },
  { title: "6. Observaciones", component: PNL6Observaciones },
];
const stepLimit = ref(steps.length);

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

// Función para navegar a un paso específico desde el breadcrumb
const goToStep = (index: number) => {
  if (index <= step.value) {
    step.value = index;
  }
};

const handleFinalizar = (data: any) => {
  formData.value = { ...formData.value, ...data };
  step.value = stepLimit.value + 1;
};

onBeforeMount(() => {
  if (props.data) {
    let dataRaw = { ...toRaw(props.data) };
    console.log("dataRaw", dataRaw);
    formData.value = {
      id: dataRaw.id,
      ...JSON.parse(dataRaw.data),
      userCreate: dataRaw.userCreate,
    };
    console.log("formData.value", toRaw(formData.value));
    step.value = stepLimit.value + 1;
  }
  step.value = 3;
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
              :steps="stepLimit"
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
