<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
const emit = defineEmits(["cancelar", "nextStep", "backStep"]);
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
    label: "Autoridades publicas que participaron:",
    model: "autoridadesPublicas",
    type: "chips",
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
    label: "Autoridades CR informadas:",
    model: "autoridadesCRInformadas",
    type: "chips",
    columnsOption: 3,
    classElement: "col-12",
    options: [
      {
        label: "Coordinador Local del socorros",
        value: "coordinadorLocalSocorros",
      },
      { label: "Referente de A+S", value: "referenteAS" },
    ],
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

onBeforeMount(() => {
  if (props.formData) {
    formDataLocal = { ...props.formData };
  }
});
</script>

<template>
  <template v-if="readonly">
    <div class="col-12">
      <FormFactory
        ref="formFactoryRef"
        class=""
        :schema="formSchema"
        :modelValue="formDataLocal"
        :showButtonsAction="false"
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

<style>
.custom-option-class {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
</style>
