<script setup lang="ts">
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { validateChip } from "@/utils/formatterHelper";
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

let formDataLocal: any = reactive({});

const formSchema = [
  {
    label: "Numero total de personal CRM en el evento:",
    model: "numeroPersonalCRM",
    min: 0,
    max: 10,
    type: "counter",
    classElement: "col-6",
  },
  {
    label: "Numero total de unidades de CRM en el evento:",
    model: "numeroUnidadesCRM",
    min: 0,
    max: 10,
    type: "counter",
    classElement: "col-6",
  },
  {
    label: "Personal CRM afectado - Hombres:",
    model: "personalAfectadoHombres",
    min: 0,
    max: 10,
    type: "counter",
    classElement: "col-6",
  },
  {
    label: "Personal CRM afectado - Mujeres:",
    model: "personalAfectadoMujeres",
    min: 0,
    max: 10,
    type: "counter",
    classElement: "col-6",
  },
];

const handleNextStep = () => handleValidarForm();
const handleBackStep = () => emit("backStep");
const handleCancelar = () => emit("cancelar");

const handleValidarForm = () => {
  const recursos: any = toRaw(formDataLocal);
  // emit("nextStep", { pacientes: formDataLocal })

  if (
    Array.isArray(recursos.elementos) &&
    recursos.elementos.length > 0 &&
    Array.isArray(recursos.unidades) &&
    recursos.unidades.length > 0 &&
    Array.isArray(recursos.fraps) &&
    recursos.fraps.length > 0
  ) {
    emit("nextStep", recursos);
  } else {
    showInfoMessage({
      title: "Falta agregar recursos ...!!",
      message: `Se requiere minimo un elemento, una unidad y un frap.`,
    });
  }
};

const handleUpdate = (updatedData: any, field: any) => {
  formDataLocal[field] = deepToRaw(updatedData);
};

onBeforeMount(() => {
  if (props.formData) {
    formDataLocal = props.formData;
  }
});
</script>

<template>
  <template v-if="readonly">
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
    <div class="mt-5">
      <p class="m0 p0 font-bold">Unidades participantes</p>
      <p class="m0 p0 font-bold font-italic font12">
        Inserta el numero de asociado de los unidades participantes:
      </p>
      <ChipsInput
        :data="formDataLocal?.unidades ?? []"
        :validate="validateChip"
        :allowDuplicates="false"
        @update="(updatedData) => handleUpdate(updatedData, 'unidades')"
      />
    </div>
    <div class="mt-5">
      <p class="m0 p0 font-bold">Fraps usados</p>
      <p class="m0 p0 font-bold font-italic font12">
        Inserta el numero de asociado de los fraps usados:
      </p>
      <ChipsInput
        :data="formDataLocal?.fraps ?? []"
        :validate="validateChip"
        :allowDuplicates="false"
        @update="(updatedData) => handleUpdate(updatedData, 'fraps')"
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
