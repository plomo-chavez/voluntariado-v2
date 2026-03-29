<script setup lang="ts">
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import WizardStepButtons from "@/components/apps/WizardStepButtons.vue";
import sarPaciente from "@/components/forms/sarPacientes.vue";

const emit = defineEmits(["cancelar", "nextStep", "backStep", "finalizar"]);
type Paciente = {
  sexo: string;
  edad: string | number;
  traslado: boolean;
  atencion: string;
  hospitalTraslado: string;
  motivoNoTraslado: string;
};

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

const atenciones = reactive<Paciente[]>([]);

const itemNew: Paciente = {
  sexo: "masculino",
  edad: 0,
  traslado: false,
  atencion: "",
  hospitalTraslado: "",
  motivoNoTraslado: "",
};

// Control lista ↔ formulario
const editMode = ref(false);
const editingIndex: any = ref(undefined);
const atencionEdit = ref<Paciente>({ ...itemNew });

const handleNextStep = () => handleValidarForm();
const handleBackStep = () => emit("backStep");
const handleCancelar = () => emit("cancelar");

const handleValidarForm = () => {
  const recursos: any = toRaw(atenciones);

  if (Array.isArray(recursos) && recursos.length > 0) {
    console.log("recursos ", { atenciones: recursos });
    emit("nextStep", { atenciones: recursos });
  } else {
    showInfoMessage({
      title: "Falta agregar atenciones ...!!",
      message: `Se requiere minimo un paciente.`,
    });
  }
};

const handleAddPaciente = () => {
  editingIndex.value = null;
  atencionEdit.value = { ...itemNew };
  editMode.value = true;
};

const handleEditPaciente = (index: number) => {
  editingIndex.value = index;
  atencionEdit.value = { ...atenciones[index] };
  editMode.value = true;
};

const handleRemovePaciente = (index: number) => {
  atenciones.splice(index, 1);
};

const handleSave = (data: Paciente) => {
  if (editingIndex.value !== null) {
    atenciones[editingIndex.value] = { ...data };
  } else {
    atenciones.push({ ...data });
  }
  editMode.value = false;
};

const handleCancelForm = () => {
  editMode.value = false;
};

onBeforeMount(() => {
  if (props.formData?.pacientes?.length) {
    atenciones.splice(0, atenciones.length, ...props.formData.pacientes);
    return;
  }
  // atenciones.splice(0, atenciones.length, ...dataDummy);
});
</script>

<template>
  <template v-if="!editMode">
    <!-- HEADER: Indicaciones + Contador + Botón Agregar -->
    <div class="d-flex justify-space-between align-center flex-wrap gap-3 mb-4">
      <div>
        <p class="text-subtitle-1 font-weight-medium mb-1">
          Registro de atenciones médicas
        </p>
        <p class="text-body-2 text-disabled mb-0">
          Agrega y gestiona cada atención brindada durante el servicio
        </p>
      </div>
      <div class="d-flex align-center gap-3">
        <VChip color="primary" variant="tonal" size="small">
          <VIcon icon="tabler-activity" start size="14" />
          {{ atenciones.length }} atención(es)
        </VChip>
        <VBtn
          variant="tonal"
          size="small"
          color="primary"
          prepend-icon="tabler-plus"
          @click="handleAddPaciente"
        >
          Agregar atención
        </VBtn>
      </div>
    </div>
    <!-- VISTA: LISTADO -->
    <div>
      <!-- Estado vacío -->
      <div
        v-if="atenciones.length === 0"
        class="empty-state pa-8 text-center mb-4"
      >
        <div class="mb-3 text-disabled">
          <VIcon icon="tabler-clipboard-x" size="48" />
        </div>
        <p class="text-body-1 font-weight-medium mb-1">
          Sin atenciones registradas
        </p>
        <p class="text-caption text-disabled mb-0">
          Haz clic en "Agregar atención" para comenzar el registro
        </p>
      </div>

      <!-- Cards de atenciones -->

      <div class="pacientes-list">
        <!-- prettier-ignore -->
        <div v-for="(paciente, index) in atenciones" :key="index" class="paciente-row">
          <!-- Header del item -->
          <div class="paciente-header">
            <div class="paciente-main d-flex align-center gap-3">
              <div class="paciente-num">{{ index + 1 }}</div>
              <div class="paciente-info">
                <div class="text-body-1 font-weight-medium">
                  Atención #{{ index + 1 }}
                </div>
                <div class="paciente-meta d-flex align-center gap-2 flex-wrap text-body-2 text-disabled mt-1">
                  <VIcon size="14" :icon="paciente.sexo === 'femenino' ? 'tabler-gender-female' : 'tabler-gender-male'"/>
                  {{ paciente.sexo }} · {{ paciente.edad }} años
                  <span :class="['paciente-chip',paciente.traslado ? 'chip-success' : 'chip-warning']">
                    {{ paciente.traslado ? "Con traslado" : "Sin traslado" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="paciente-actions d-flex align-center gap-1">
              <VMenu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <VBtn icon variant="text" size="small" color="default" v-bind="menuProps" >
                    <VIcon icon="tabler-dots-vertical" size="18" />
                    <VTooltip activator="parent">Acciones</VTooltip>
                  </VBtn>
                </template>

                <VList density="compact" min-width="170">
                  <VListItem
                    prepend-icon="tabler-edit"
                    title="Editar"
                    @click="handleEditPaciente(index)"
                  />
                  <VListItem
                    prepend-icon="tabler-trash"
                    title="Eliminar"
                    base-color="error"
                    @click="handleRemovePaciente(index)"
                  />
                </VList>
              </VMenu>
            </div>
          </div>

          <!-- Detalle -->
          <div class="paciente-body paciente-body-grid">
            <div class="detalle-item text-body-2 mb10">
              <p class="detalle-label">Atención brindada:</p>
              <p class="detalle-value">{{ paciente.atencion }}</p>
            </div>
            <div
              v-if="paciente.traslado && paciente.hospitalTraslado"
              class="detalle-item text-body-2"
            >
              <p class="detalle-label">Hospital:</p>
              <p class="detalle-value">{{ paciente.hospitalTraslado }}</p>
            </div>
            <div
              v-if="!paciente.traslado && paciente.motivoNoTraslado"
              class="detalle-item text-body-2"
            >
              <p class="detalle-label">Motivo sin traslado:</p>
              <p class="detalle-value">{{ paciente.motivoNoTraslado }}</p>
            </div>
          </div>
        </div>
      </div>

      <WizardStepButtons
        :step="step"
        :totalSteps="props.steps"
        @cancelar="handleCancelar"
        @nextStep="handleNextStep"
        @backStep="handleBackStep"
      />
    </div>
  </template>

  <!-- VISTA: FORMULARIO (Agregar / Editar) -->

  <sarPaciente
    v-else
    :modoEdicion="editingIndex"
    :atenciones="atenciones"
    :atencionEdit="atencionEdit"
    @update:atencionEdit="handleSave"
    @cancel="handleCancelForm"
  />
</template>
<style>
/* Mobile first: mantiene estilo actual */
.pacientes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.paciente-row {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.empty-state {
}

.paciente-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
}

.paciente-main {
  min-width: 0;
  flex: 1;
}

.paciente-info {
  min-width: 0;
}

.paciente-meta {
  line-height: 1.25;
}

.paciente-actions {
  flex-shrink: 0;
}

.paciente-num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.paciente-body {
  padding: 10px 12px;
}

.paciente-body-grid {
  gap: 4px;
}

.detalle-item {
  width: 100% !important;
  margin: 0;
}

.detalle-label,
.detalle-value {
  margin: 0;
}

.detalle-label {
  font-weight: 600;
}

.detalle-value {
  font-weight: 500;
}

.paciente-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
  white-space: nowrap;
}

.chip-success {
  background-color: rgba(76, 175, 80, 0.12);
  color: #388e3c;
}

.chip-warning {
  background-color: rgba(255, 152, 0, 0.12);
  color: #f57c00;
}

/* Tablet+Desktop: más corto/compacto */
@media (min-width: 960px) {
  .pacientes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 300px));
    gap: 8px;
  }

  .paciente-row {
    max-width: 300px;
  }

  .paciente-header {
    align-items: center;
    padding: 8px 12px;
  }

  .paciente-num {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .paciente-meta {
    margin-top: 2px !important;
    font-size: 12px;
    gap: 6px !important;
  }

  .paciente-body {
    padding: 8px 12px;
  }

  .paciente-body-grid {
    grid-template-columns: 1fr 1fr;
    gap: 6px 14px;
  }

  .paciente-body-grid p:first-child {
    grid-column: 1 / -1;
  }

  .paciente-chip {
    font-size: 10px;
    padding: 1px 7px;
  }
}
</style>
