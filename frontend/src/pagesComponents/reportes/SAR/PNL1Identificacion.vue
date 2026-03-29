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

const configTime = {
  enableTime: true, // Habilita el selector de tiempo
  noCalendar: true, // Deshabilita el calendario
  dateFormat: "H:i", // Formato de 24 horas
  time_24hr: true, // Asegura el formato de 24 horas
  allowInput: false, // Deshabilita la entrada manual
};

const formSchema = [
  {
    required: true,
    label: "Estado",
    type: "select",
    model: "estado",
    classElement: " col-4 ",
    catalogo: "estados",
  },
  {
    required: true,
    label: "Municipio",
    type: "select",
    model: "municipio",
    classElement: " col-4 ",
    dependenciaQuery: "estado",
    dependenciaQueryFiltro: "estado_id",
    catalogo: "municipios",
  },
  {
    required: true,
    label: "Delegación",
    type: "select",
    model: "delegacion",
    dependenciaQuery: "municipio",
    dependenciaQueryFiltro: "municipio_id",
    catalogo: "delegaciones",
    classElement: " col-4 ",
    config: {
      fullInfo: true,
    },
  },
  {
    required: true,
    label: "Fecha de incidente",
    type: "date",
    model: "fecha",
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Hora de inicio",
    type: "time",
    model: "horaInicio",
    config: configTime,
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Hora de fin",
    type: "time",
    model: "horaFin",
    config: configTime,
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Tipo de servicio:",
    model: "tipoServicio",
    type: "chips",
    layout: "grid",
    optionType: "chip",
    classElement: "col-6",
    maxSelections: 1,
    catalogo: "tipos-servicio",
  },
  {
    required: true,
    label: "Servicio solicitado por:",
    model: "tipoReporte",
    type: "chips",
    maxSelections: 1,
    classElement: "col-6",
    catalogo: "tipos-solicitante",
  },
  {
    required: true,
    label: "Autoridades publicas que participaron:",
    model: "autoridadesPublicas",
    type: "chips",
    columnsOption: 3,
    classElement: "col-6",
    catalogo: "agresores",
  },
  {
    required: true,
    label: "Autoridades CR informadas:",
    model: "autoridadesCRInformadas",
    type: "chips",
    columnsOption: 3,
    classElement: "col-6",
    catalogo: "agresores",
  },
];

const formFactoryRef: any = ref(null);

const handleNextStep = () => {
  const validacionForm: any = formFactoryRef.value?.validarFormulario(true);
  console.log("Validación del formulario:", validacionForm);
  if (validacionForm.isValid) {
    emit("nextStep", formDataLocal);
  } else {
    showInfoMessage({
      title: "Formulario incompleto ...!!",
      message: `Revisa el formulario, faltan campos requeridos.`,
    });
  }
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
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
      :showMessageRequired="false"
      :showButtonsAction="false"
    />

    <WizardStepButtons
      :step="step"
      :totalSteps="props.steps"
      @cancelar="handleCancelar"
      @nextStep="handleNextStep"
      @backStep="handleBackStep"
    />
  </template>
</template>
