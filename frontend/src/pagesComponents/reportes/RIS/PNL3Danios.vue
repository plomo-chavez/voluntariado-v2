<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
const emit = defineEmits(["cancelar", "nextStep", "backStep", "finalizar"]);
const props = withDefaults(
  defineProps<{
    readonly?: boolean;
    step?: number | undefined;
    steps?: number | undefined;
    formData?: any;
  }>(),
  {
    readonly: false,
    step: 1,
    steps: 8,
    formData: null,
  },
);

let formDataLocal = reactive({});

const formSchema = [
  {
    label: "Detalles de los bienes de la Cruz Roja dañados",
    type: "textarea",
    model: "detallesBienes",
    classElement: " col-12 ",
  },
  {
    label: "Detalles de cualquier lesión o daños sufridos a terceros",
    type: "textarea",
    model: "detallesDaniosTerceros",
    classElement: " col-12 ",
  },
  {
    label:
      "¿Se aplicaron los procedimientos operacionales de seguridad y directrices?",
    type: "textarea",
    model: "procedimientosSeguridad",
    classElement: " col-12 ",
  },
  {
    label: "¿Fue el incidente el primero de su tipo? ",
    type: "textarea",
    model: "incidentePrimeroTipo",
    classElement: " col-12 ",
  },
  {
    label: "¿Persiste la amenaza o riesgo para la seguridad?",
    type: "textarea",
    model: "amenazaRiesgoSeguridad",
    classElement: " col-12 ",
  },
  {
    label:
      "¿Qué medidas fueron adoptadas en respuesta a incidentes y acciones adicionales necesarias?",
    type: "textarea",
    model: "medidasAdoptadas",
    classElement: " col-12 ",
  },
  {
    label:
      "¿Qué otras medidas deberían ser adoptadas en respuesta a incidentes y acciones adicionales necesarias?",
    type: "textarea",
    model: "accionesAdicionales",
    classElement: " col-12 ",
  },
];

const handleNextStep = () => {
  emit("nextStep", { ...props.formData, ...formDataLocal });
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

const handleFinalizar = () => {
  emit("finalizar", { ...props.formData, ...formDataLocal });
};

onBeforeMount(() => {
  if (props.formData) {
    formDataLocal = { ...props.formData };
  }
});
</script>

<template>
  <template v-if="readonly">
    <FormFactory
      ref="formFactoryRef"
      :schema="formSchema"
      :modelValue="formDataLocal"
      :showButtonsAction="false"
    />

    <WizardStepButtons
      :step="step"
      :totalSteps="props.steps"
      @cancelar="handleCancelar"
      @nextStep="handleNextStep"
      @backStep="handleBackStep"
      @finalizar="handleFinalizar"
    />
  </template>
</template>
