<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    index?: any;
    atencionEdit?: any;
    modoEdicion?: boolean;
  }>(),
  {
    index: 0,
    atencionEdit: null,
    modoEdicion: false,
  },
);

const emit = defineEmits(["update:atencionEdit", "cancel"]); // <-- agregar

const formDataLocal: any = ref({});
const formSchemaPacientes: any = [
  {
    label: "Sexo",
    model: "sexo",
    type: "switch",
    classElement: "col-4",
    options: [
      { label: "Masculino", value: "masculino" },
      { label: "Femenino", value: "femenino" },
    ],
  },
  {
    label: "Edad",
    required: true,
    model: "edad",
    type: "number",
    classElement: "col-4",
    min: 0,
    max: 120,
    config: { precision: 0 },
  },
  {
    label: "Se Traslado",
    model: "traslado",
    type: "switch",
    classElement: "col-4",
    options: [
      { label: "Sí", value: true },
      { label: "No", value: false },
    ],
  },
  {
    label: "Atención brindada",
    model: "atencion",
    type: "text",
    classElement: "col-12",
    required: true,
  },
  {
    label: "Hospital o centro de salud al que se trasladó",
    model: "hospitalTraslado",
    type: "text",
    classElement: "col-12",
    dependenciaCanSee: "traslado",
    dependenciaCanSeeValidacion: true,
    required: true,
  },
  {
    label: "Motivo por el que no se trasladó",
    model: "motivoNoTraslado",
    type: "text",
    classElement: "col-12",
    dependenciaCanSee: "traslado",
    dependenciaCanSeeValidacion: false,
    required: true,
  },
];

async function handleChange(data: any) {
  formDataLocal.value = data;
  emit("update:atencionEdit", data); // <-- emitir cambios al padre
}
async function handleCancelar() {
  emit("cancel"); // <-- emitir cambios al padre
}

onBeforeMount(() => {
  // <-- inicializar desde prop
  if (props.atencionEdit) {
    formDataLocal.value = { ...props.atencionEdit };
  }
});
</script>

<template>
  <div class="wFull">
    <div class="card">
      <div class="d-flex align-center justify-space-between">
        <div class="text-body-1 font-weight-medium d-flex align-center mb4">
          <VIcon
            :icon="props.modoEdicion !== null ? 'tabler-edit' : 'tabler-plus'"
            size="18"
            class="mr-2"
          />
          <span>
            {{
              props.modoEdicion !== null
                ? `Editando atención #${props.index + 1}`
                : "Nueva atención"
            }}
          </span>
        </div>
        <div>
          <VBtn icon variant="text" size="small" @click="handleCancelar">
            <VIcon icon="tabler-x" size="18" />
            <VTooltip activator="parent">Cerrar</VTooltip>
          </VBtn>
        </div>
      </div>
      <VDivider />
      <div>
        <FormFactory
          :ref="'formFactoryRef'"
          :schema="formSchemaPacientes"
          :textButtonSubmit="
            props.modoEdicion !== null ? 'Guardar cambios' : 'Agregar atención'
          "
          :showMessageRequired="false"
          :modelValue="formDataLocal"
          :validarCambios="true"
          @submit="handleChange"
          @cancel="handleCancelar"
        />
        <!-- @update:atencionEdit="handleFormChange" -->
      </div>
      <VDivider />
    </div>
  </div>
</template>
