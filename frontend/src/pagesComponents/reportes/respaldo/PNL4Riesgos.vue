<script setup lang="ts">
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

const showMorForm = ref(false);
const formDataLocal = reactive({});

const formSchema = [
  {
    label: "Tipo de agresión:",
    model: "tipoAgresion",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center", // Alinear las opciones al centro
    columnsOption: 4,
    classElement: "col-12",
    options: [
      { label: "Verbal", value: "verbal" },
      { label: "Física", value: "fisica" },
      { label: "Retención", value: "retencion" },
      { label: "Daños", value: "danos" },
      {
        label: "Impedimento para acceder a beneficiarios",
        value: "impedimento",
      },
    ],
  },
  {
    label: "Sitio de la agresión:",
    model: "sitioAgresion",
    type: "multiSelect",
    layout: "grid",
    alignOptions: "center",
    columnsOption: 3,
    classElement: "col-12",
    options: [
      { label: "Vía pública", value: "viaPublica" },
      { label: "Ambulancia", value: "ambulancia" },
      { label: "Hospital", value: "hospital" },
      { label: "Instalaciones CRM", value: "instalacionesCRM" },
      { label: "Domicilio", value: "domicilio" },
      { label: "Otro", value: "otro" },
    ],
  },
  {
    label: "¿Hubo lesiones?",
    model: "huboLesiones",
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

const handleYesOrNo = (option: any = false) => {
  showMorForm.value = option;
};
</script>

<template>
  <h1>{{ titulo }}</h1>

  <div>
    <div v-if="!showMorForm" class="col-6 mx-auto">
      <h3>¿Hubo agresión o situación de riesgo?</h3>
      <div class="d-flex justify-space-between g-3 mt-4 w-100">
        <VBtn variant="outlined" color="error" @click="handleYesOrNo">
          <VIcon start icon="tabler-x" />
          No
        </VBtn>
        <VBtn variant="outlined" color="success" @click="handleYesOrNo(true)">
          <VIcon start icon="tabler-check" />Si
        </VBtn>
      </div>
    </div>

    <FormFactory
      v-if="showMorForm"
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
  </div>
</template>
