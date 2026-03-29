<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
const emit = defineEmits(["cancelar", "nextStep", "backStep"]);
const props = withDefaults(
  defineProps<{
    titulo: string;
    step: number;
  }>(),
  {
    titulo: "",
  }
);

const formDataLocal = reactive({});

const formSchema = [
  {
    label: "Numero total de personal CRM en el evento:",
    model: "numeroPersonalCRM",
    type: "number",
    classElement: "col-4",
    config: {
      precision: 0,
    },
  },
  {
    label: "Personal CRM afectado - Hombres:",
    model: "personalAfectadoHombres",
    type: "number",
    classElement: "col-4",
    config: {
      precision: 0,
    },
  },
  {
    label: "Personal CRM afectado - Mujeres:",
    model: "personalAfectadoMujeres",
    type: "number",
    classElement: "col-4",
    config: {
      precision: 0,
    },
  },
  {
    label: "Pacientes involucrados:",
    model: "pacientesInvolucrados",
    type: "number",
    classElement: "col-6",
    config: {
      precision: 0,
    },
  },
  {
    label: "Terceros afectados:",
    model: "tercerosAfectados",
    type: "number",
    classElement: "col-6",
    config: {
      precision: 0,
    },
  },
  {
    label: "Tipo de atención:",
    model: "tipoAtencion",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center", // Alinear las opciones al centro
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "Física", value: "fisica" },
      { label: "Psicológica", value: "psicologica" },
      { label: "Material", value: "material" },
      { label: "Sin afectación", value: "sinAfectacion" },
    ],
  },
];

const handleNextStep = () => {
  emit("nextStep");
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};
</script>

<template>
  <h1>{{ titulo }}</h1>
  <FormFactory
    ref="formFactoryRef"
    :schema="formSchema"
    :modelValue="formDataLocal"
    :showButtonsAction="false"
  />
  <WizardStepButtons
    :step="step"
    :totalSteps="8"
    @cancelar="handleCancelar"
    @nextStep="handleNextStep"
    @backStep="handleBackStep"
  />
</template>

<style>
.custom-option-class {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
</style>
