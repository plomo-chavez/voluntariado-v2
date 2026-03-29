<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { validateChip } from "@/utils/formatterHelper";
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

let formDataLocal: any = reactive({});

const formFactoryRef: any = ref(null);

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
    label: "Hora",
    type: "time",
    model: "hora",
    config: configTime,
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Area:",
    type: "select",
    model: "area",
    catalogo: "areas",
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Tipo de servicio:",
    type: "select",
    model: "tipoServicio",
    catalogo: "tipos-servicio",
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Tipo de incidente:",
    type: "select",
    model: "tipoIncidente",
    catalogo: "tipos-incidente",
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Sitio del incidente:",
    type: "select",
    model: "sitioIncidente",
    catalogo: "sitios-incidente",
    classElement: " col-4 ",
  },
  {
    required: true,
    label: "Dirección",
    type: "text",
    model: "direccion",
    classElement: " col-9 ",
  },
  {
    label: "¿Fue el incidente el primero de su tipo? ",
    type: "switch",
    model: "esPrimero",
    classElement: " col-3 ",
    options: [
      { label: "Sí", value: true },
      { label: "No", value: false },
    ],
  },
  {
    required: true,
    label: "Descripción",
    type: "textarea",
    model: "descripcion",
    classElement: " col-12 ",
  },
];

const handleNextStep = () => {
  const validacionForm: any = formFactoryRef.value?.validarFormulario();

  const elementos: any = formDataLocal?.elementos ?? [];
  if (!validacionForm.isValid) {
    showInfoMessage({
      title: "Formulario incompleto ...!!",
      message: `Revisa el formulario, faltan campos requeridos.`,
    });
  } else if (elementos.length === 0) {
    showInfoMessage({
      title: "Elementos participantes ...!!",
      message: `Agrega al menos un elemento participante.`,
    });
  } else if (elementos.some((el: any) => !el || el.trim() === "")) {
    showInfoMessage({
      title: "Elemento participante inválido ...!!",
      message: `Todos los elementos participantes deben ser válidos y no vacíos.`,
    });
  } else {
    emit("nextStep", formDataLocal);
  }
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

const handleUpdate = (updatedData: any, field: any) => {
  formDataLocal[field] = deepToRaw(updatedData);
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

    <div class="mt-5">
      <p class="m0 p0 font-bold">Elementos participantes</p>
      <p class="m0 p0 font-bold font-italic font12">
        Inserta el numero de asociado de los elementos participantes:
      </p>
      <ChipsInput
        :data="formDataLocal?.elementos ?? []"
        :validate="validateChip"
        :allowDuplicates="false"
        @update="(updatedData) => handleUpdate(updatedData, 'elementos')"
      />
    </div>

    <WizardStepButtons
      :step="step"
      :totalSteps="props.steps"
      @cancelar="handleCancelar"
      @nextStep="handleNextStep"
      @backStep="handleBackStep"
    />
  </template>
</template>
