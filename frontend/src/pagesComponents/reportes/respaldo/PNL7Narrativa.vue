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
    label: "Descripción breve del evento:",
    model: "descripcionEvento",
    type: "textarea", // Campo de texto
    classElement: "col-12",
    required: true, // Campo obligatorio
  },
  {
    label: "Observaciones adicionales:",
    model: "observacionesAdicionales",
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
  <p>Plugin de firma eleectronica</p>
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
