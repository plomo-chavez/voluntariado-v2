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
    label: "Tipo de atención:",
    model: "tipoAtencion",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center", // Alinear las opciones al centro
    maxSelections: 1,
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "Emergencia", value: "emergencia" },
      { label: "No emergencia", value: "noEmergencia" },
      { label: "Rescate", value: "rescate" },
      { label: "Humanitario", value: "humanitario" },
      { label: "Otro (especifique)", value: "otro" },
    ],
  },
  {
    label: "Servicio solicitado por:",
    model: "tipoReporte",
    type: "multiSelect",
    layout: "grid",
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "C4", value: "c4" },
      { label: "Policía", value: "policia" },
      { label: "Ejército", value: "ejercito" },
      { label: "Marina", value: "marina" },
      { label: "Protección Civil", value: "proteccionCivil" },
      { label: "Particular", value: "particular" },
      { label: "Otro", value: "otro" },
    ],
  },
  {
    label: "Tipo de incidente:",
    model: "tipoIncidente",
    type: "multiSelect",
    layout: "grid",
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "Accidente de tránsito", value: "accidenteTransito" },
      { label: "Balacera", value: "balacera" },
      { label: "Asalto / Robo", value: "asaltoRobo" },
      { label: "Amenaza", value: "amenaza" },
      { label: "Extorsión", value: "extorsion" },
      { label: "Detención / Arresto", value: "detencionArresto" },
      { label: "Impedir acceso o acción", value: "impedirAccesoAccion" },
      { label: "Agresión al personal", value: "agresionPersonal" },
      {
        label: "Agresión a instalaciones o vehículos",
        value: "agresionInstalacionesVehiculos",
      },
      { label: "Abuso del emblema", value: "abusoEmblema" },
      { label: "Otro", value: "otro" },
    ],
  },

  {
    label: "Lugar del accidente:",
    model: "lugarAccidente",
    type: "multiSelect",
    layout: "grid",
    maxSelections: 1,
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "Via publica", value: "viaPublica" },
      { label: "Domicilio del paciente", value: "domicilioPaciente" },
      { label: "Hospital", value: "hospital" },
      { label: "Ambulancia", value: "ambulancia" },
      { label: "Instalaciones CRM", value: "instalacionesCRM" },
      { label: "Otro", value: "otro" },
    ],
  },
  {
    label: "Latitud:",
    model: "lugarLatitud",
    type: "text",
    classElement: "col-6",
  },
  {
    label: "Longitud:",
    model: "lugarLongitud",
    type: "text",
    classElement: "col-6",
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
