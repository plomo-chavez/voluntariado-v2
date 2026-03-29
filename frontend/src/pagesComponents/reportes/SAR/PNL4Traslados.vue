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

let formData: any = reactive([]); // Array de formularios

// prettier-ignore
const formSchemaPacientes = [
  { label: "Cantidad de pacientes trasladados", model: "cantidadPacientesTrasladados", type: "counter", classElement: "col-4", min: 0, max: 10,},
  { label: "Hospital de destino",               model: "hospitalDestino",              type: "text",    classElement: "col-8", },
];

const handleNextStep = () => {
  emit("nextStep", { traslados: formData });
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

const itemNew = {
  cantidadPacientesTrasladados: 0,
  hospitalDestino: "",
};

// Agregar un nuevo formulario al array
const handleAddPaciente = () => {
  formData.push({ ...itemNew, id: formData.length + 1 });
};

// Eliminar un formulario del array
const handleRemovePaciente = (index: any) => {
  formData.splice(index, 1);
};

onBeforeMount(() => {
  if (props.formData) {
    formData = props.formData.traslados || [];
  }
});
</script>

<template>
  <!-- prettier-ignore -->
  <template v-if="readonly">
    <div class="divIndicaciones">
      <div class="divIndicacionesSub">
        Agrega formularios para poder registrar todos los traslados realizados
      </div>
      <div class="divIndicacionesSub2">
        <div class="mb-2 text-center">
          <VBtn variant="tonal" size="small" @click="handleAddPaciente" class="mx-auto">
            Agregar nuevo traslado
          </VBtn>
        </div>
        <div class="indicator">
          Total de traslados realizados: {{ formData.length }}
        </div>
      </div>
    </div>
    <div class="col-12 d-flex flex-wrap">
      <div v-for="(form, index) in formData" :key="form.id" class="col-12">
        <FormFactory
          :ref="'formFactoryRef' + index"
          :schema="formSchemaPacientes"
          :showButtonsAction="false"
          :modelValue="form"
        />
        <VBtn v-if="formData.length > 1" class="mt-3" variant="tonal" color="error" size="small" @click="handleRemovePaciente(index)">
          <VIcon size="18" icon="tabler-trash" />
          Eliminar
        </VBtn>
      </div>
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
.divIndicaciones {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.divIndicacionesSub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.divIndicacionesSub2 > * {
  flex: 1 1 100%; /* Por defecto, cada elemento ocupa el 100% del ancho */
}

@media (min-width: 768px) {
  .divIndicacionesSub2 > * {
    flex: 1 1 48%; /* En pantallas más grandes, cada elemento ocupa el 48% del ancho */
  }
}

.indicator {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.custom-option-class {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}
.divCounter {
  display: flex;
  align-items: center;
}
.alignVerticalCenter {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
}
.lblBtnPaciente {
  font-size: 16px;
  margin: 0;
  padding: 0;
}
.spanLbl {
  font-size: 18px;
  font-weight: bold;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 50px;
}
.chipDefault {
  background-color: #e0e0e0;
  color: #000000;
}
</style>
