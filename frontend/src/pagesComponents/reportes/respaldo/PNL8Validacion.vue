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

  <WizardStepButtons
    :step="step"
    :totalSteps="8"
    @cancelar="handleCancelar"
    @nextStep="handleNextStep"
    @backStep="handleBackStep"
  />
</template>
