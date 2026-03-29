<!-- filepath: /src/components/StepNavigation.vue -->
<script setup lang="ts">
const emit = defineEmits(["cancelar", "nextStep", "backStep", "finalizar"]);
const props = withDefaults(
  defineProps<{
    step: number;
    totalSteps: number;
    nextDisabled?: boolean;
  }>(),
  {
    step: 0,
    totalSteps: 1,
    nextDisabled: false,
  },
);
</script>

<template>
  <div class="d-flex justify-space-between g-3 mt-4 w-100">
    <div>
      <VBtn
        variant="outlined"
        color="secondary"
        @click="step > 0 ? emit('backStep') : emit('cancelar')"
      >
        <VIcon start icon="tabler-x" />
        {{ step > 0 ? "Anterior" : "Cancelar" }}
      </VBtn>
    </div>
    <VBtn
      :disabled="props.nextDisabled"
      @click="emit(step < totalSteps - 1 ? 'nextStep' : 'finalizar')"
      color="success"
    >
      <VIcon start icon="tabler-check" />
      {{ step < totalSteps - 1 ? "Siguiente" : "Finalizar" }}
    </VBtn>
  </div>
</template>
