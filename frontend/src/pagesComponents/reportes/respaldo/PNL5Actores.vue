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
    label: "Actor agresor:",
    model: "actorAgresor",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center",
    columnsOption: 3,
    classElement: "col-12",
    options: [
      { label: "Fuerzas de seguridad", value: "fuerzasSeguridad" },
      { label: "Fuerzas armadas", value: "fuerzasArmadas" },
      { label: "Personal de salud", value: "personalSalud" },
      { label: "Familiares del paciente", value: "familiaresPaciente" },
      { label: "Comunidad en general", value: "comunidadGeneral" },
      { label: "Paciente", value: "paciente" },
      { label: "Delincuencia común", value: "delincuenciaComun" },
      { label: "Otro", value: "otro" },
    ],
  },
  {
    label: "Autoridades involucradas:",
    model: "autoridadesInvolucradas",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center",
    columnsOption: 3,
    classElement: "col-12",
    options: [
      { label: "Policía municipal", value: "policiaMunicipal" },
      { label: "Policía estatal", value: "policiaEstatal" },
      { label: "Guardia Nacional", value: "guardiaNacional" },
      { label: "Ejército Mexicano", value: "ejercitoMexicano" },
      { label: "Marina", value: "marina" },
      { label: "Protección Civil", value: "proteccionCivil" },
      { label: "Ninguna", value: "ninguna" },
    ],
  },
  {
    label: "Momento del incidente:",
    model: "momentoIncidente",
    type: "multiSelect",
    layout: "horizontal",
    alignOptions: "center",
    columnsOption: 3,
    maxSelections: 1,
    classElement: "col-12",
    options: [
      { label: "Antes del servicio", value: "antesServicio" },
      { label: "Durante el servicio", value: "duranteServicio" },
      { label: "Después del servicio", value: "despuesServicio" },
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
