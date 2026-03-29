<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
const emit = defineEmits(["cancelar", "nextStep", "backStep", "finalizar"]);

const props = withDefaults(
  defineProps<{
    readonly?: boolean;
    step?: number | undefined;
    formData?: any;
    steps?: any;
  }>(),
  {
    steps: null,
    readonly: false,
    step: 1,
    formData: null,
  },
);

let formDataLocal = reactive({});

const formSchema = [
  {
    label: "Descripción breve del evento:",
    model: "descripcionEvento",
    type: "textarea", // Campo de texto
    classElement: "col-12",
    required: true, // Campo obligatorio
  },
  {
    label: "Afectaciones sufridas al persona o bienes de la CR:",
    model: "afectacionesSufridas",
    type: "textarea", // Campo de texto
    classElement: "col-12",
    required: true, // Campo obligatorio
  },
  {
    label: "Observaciones y comentarios generales:",
    model: "observacionesComentarios",
    type: "textarea", // Campo de texto
    classElement: "col-12",
    required: true, // Campo obligatorio
  },
];

const handleNextStep = () => {
  emit("nextStep", formDataLocal);
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

const handleFinalizar = () => {
  handleValidarForm();
};

const handleValidarForm = () => {
  const data: any = toRaw(formDataLocal);

  // Verificar si todos los campos están presentes
  const camposRequeridos = [
    "descripcionEvento",
    "afectacionesSufridas",
    "observacionesComentarios",
  ];

  const camposFaltantes = camposRequeridos.filter((campo) => !(campo in data));

  if (camposFaltantes.length > 0) {
    showInfoMessage({
      title: "Campos faltantes ...!!",
      message: `Faltan los uno o varios campos por contestar.`,
    });
    return;
  }

  // Verificar si algún campo está vacío o nulo
  const camposVacios = camposRequeridos.filter(
    (campo) => !data[campo] || data[campo].trim() === "",
  );

  if (camposVacios.length > 0) {
    showInfoMessage({
      title: "Campos vacíos ...!!",
      message: `Hay uno o varios campos vacíos.`,
    });
    return;
  }

  // Si todo está completo y válido, emitir el evento finalizar
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
      class="col-12"
      :schema="formSchema"
      :showMessageRequired="false"
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

<style>
.custom-option-class {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
</style>
