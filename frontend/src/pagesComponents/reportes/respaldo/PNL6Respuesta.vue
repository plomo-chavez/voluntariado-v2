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
    label: "¿Se aplicaron los protocolos de seguridad?",
    model: "protocolosSeguridad",
    type: "radio", // Selección única
    layout: "horizontal",
    alignOptions: "center",
    columnsOption: 2,
    classElement: "col-12",
    options: [
      { label: "Sí", value: true },
      { label: "No", value: false },
    ],
    required: true, // Campo obligatorio
  },
  {
    label: "Medidas adoptadas:",
    model: "medidasAdoptadas",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center",
    columnsOption: 3,
    classElement: "col-12",
    options: [
      { label: "Retiro del personal", value: "retiroPersonal" },
      {
        label: "Coordinación con autoridades",
        value: "coordinacionAutoridades",
      },
      { label: "Suspensión del servicio", value: "suspensionServicio" },
      { label: "Atención médica", value: "atencionMedica" },
      { label: "Atención psicosocial", value: "atencionPsicosocial" },
      { label: "Resguardo de unidades", value: "resguardoUnidades" },
      { label: "Otra", value: "otra" },
    ],
  },
  {
    label: "¿Persiste el riesgo o amenaza?",
    model: "riesgoPersiste",
    type: "multiSelect",
    layout: "horizontal",
    alignOptions: "center",
    columnsOption: 2,
    maxSelections: 1,
    classElement: "col-12",
    options: [
      { label: "Sí", value: true },
      { label: "No", value: false },
    ],
  },
  {
    label: "Medidas recomendadas:",
    model: "medidasRecomendadas",
    type: "textarea", // Campo de texto
    classElement: "col-12",
    required: true, // Campo obligatorio
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
