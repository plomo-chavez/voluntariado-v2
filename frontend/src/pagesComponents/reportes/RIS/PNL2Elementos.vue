<template>
  <div>
    <!-- Contenido principal -->
    <div v-if="!mostrarModal" class="contenido-principal">
      <h3>Atenciones Brindadas</h3>
      <div v-if="atenciones.length > 0" class="atenciones-list">
        <div
          v-for="(atencion, index) in atenciones"
          :key="index"
          class="atencion-card card"
        >
          <div class="atencion-header">
            <div class="atencion-body">
              <div
                class="chip chipPrimary"
                v-for="(elemento, i) in atencion.elementos"
                :key="i"
              >
                <span class="elemento-id">{{ elemento }}</span>
              </div>
            </div>
            <div class="action-buttons">
              <!-- Botón de editar -->
              <VIcon
                icon="tabler-edit"
                color="warning"
                size="25"
                @click="abrirModalEdicion(index)"
              />
              <!-- Botón de eliminar -->
              <VIcon
                icon="tabler-eraser"
                color="error"
                size="25"
                @click="eliminarAtencion(index)"
              />
            </div>
          </div>
          <h3 class="atencion-title">{{ atencion.tratamiento }}</h3>
        </div>
      </div>
      <div v-if="atenciones.length == 0" class="atenciones-list">
        <p class="wFull text-center">No hay atenciones registradas.</p>
      </div>

      <div class="wFull d-flex items-center">
        <VBtn
          v-if="elementosDisponibles.length > 0"
          color="primary"
          class="mx-auto"
          @click="abrirModalAgregar"
          >Agregar Atención</VBtn
        >
      </div>

      <WizardStepButtons
        :step="step"
        :totalSteps="props.steps"
        @cancelar="handleCancelar"
        @nextStep="handleNextStep"
        @backStep="handleBackStep"
      />
    </div>

    <!-- Modal para agregar o editar atención -->
    <div v-if="mostrarModal" class="cardAtencion">
      <div class="modal-container">
        <div class="modal-title">
          {{ modoEdicion ? "Editar Atención" : "Agregar Atención" }}
        </div>
        <div class="modal-content">
          <VTextField
            v-model="selectedTratamiento"
            label="Escribe un tratamiento"
            dense
            outlined
            clearable
            class="select-tratamiento mb-4 col-md-6 col-sm-12 col-lg-6"
          />
          <VContainer>
            <template v-if="elementosDisponibles.length > 5">
              <VAutocomplete
                v-model="selectedElementos"
                :items="elementosDisponibles"
                label="Selecciona elementos"
                multiple
                dense
                outlined
                clearable
                class="select-elementos col-md-6 col-sm-12 col-lg-6"
                @selection="handleSelection"
              />
            </template>
            <template v-else>
              <div>
                <label
                  v-for="(elemento, index) in elementosDisponibles"
                  :key="index"
                  class="d-flex align-center"
                >
                  <VCheckbox
                    v-model="selectedElementos"
                    :value="elemento"
                    :label="elemento"
                  />
                </label>
              </div>
            </template>
          </VContainer>
        </div>
        <div class="modal-actions">
          <VSpacer />
          <VBtn variant="outlined" color="secondary" @click="cerrarModal">
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            variant="tonal"
            :disabled="!selectedTratamiento || selectedElementos.length === 0"
            @click="modoEdicion ? guardarEdicion() : agregarAtencion()"
          >
            {{ modoEdicion ? "Guardar Cambios" : "Agregar Atención" }}
          </VBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showInfoMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { onBeforeMount, ref } from "vue";
import {
  VAutocomplete,
  VBtn,
  VCheckbox,
  VIcon,
  VSpacer,
  VTextField,
} from "vuetify/components";

const emit = defineEmits([
  "updateAtenciones",
  "cancelar",
  "nextStep",
  "backStep",
]);

const props = withDefaults(
  defineProps<{
    formData?: any;
    step?: number | undefined;
    steps?: number | undefined;
    elementos?: any[]; // Elementos disponibles para seleccionar
    tratamientos?: string[]; // Tratamientos disponibles
  }>(),
  {
    formData: () => ({}),
    elementos: () => [],
    step: 1,
    steps: 8,
    tratamientos: () => [],
  },
);

let atenciones = ref<any[]>([]); // Array de atenciones brindadas
const elementos: any = ref([]);
const selectedTratamiento = ref<string | null>(null); // Tratamiento seleccionado
const selectedElementos = ref<string[]>([]); // Elementos seleccionados
const tratamientos = ref(props.tratamientos ? [...props.tratamientos] : []); // Lista de tratamientos (editable)
const modoEdicion = ref(false); // Indica si estamos en modo edición
const indiceEdicion = ref<number | null>(null); // Índice del registro que se está editando
const mostrarModal = ref(false); // Controla la visibilidad del modal
const elementosDisponibles: any = ref([]); // Elementos disponibles para seleccionar

// Función para actualizar los elementos disponibles
const actualizarElementosDisponibles = () => {
  const elementosSeleccionados = atenciones.value.flatMap(
    (atencion) => atencion.elementos,
  );
  elementosDisponibles.value = elementos.value.filter(
    (elemento: any) => !elementosSeleccionados.includes(elemento),
  );
};

// Función para inicializar los elementos disponibles al editar
const inicializarElementosEdicion = (index: number) => {
  const atencion = atenciones.value[index];
  const elementosSeleccionados = atenciones.value.flatMap((atencion, i) =>
    i === index ? [] : atencion.elementos,
  );
  elementosDisponibles.value = Array.from(
    new Set([...elementosDisponibles.value, ...atencion.elementos]),
  );
};

// Abrir modal para agregar una nueva atención
const abrirModalAgregar = () => {
  selectedTratamiento.value = null;
  selectedElementos.value = [];
  modoEdicion.value = false;
  actualizarElementosDisponibles(); // Actualizar los elementos disponibles antes de abrir el modal
  mostrarModal.value = true;
};

// Abrir modal para editar una atención existente
const abrirModalEdicion = (index: number) => {
  const atencion = atenciones.value[index];
  selectedTratamiento.value = atencion.tratamiento;
  selectedElementos.value = [...atencion.elementos];
  modoEdicion.value = true;
  indiceEdicion.value = index;

  inicializarElementosEdicion(index); // Inicializar los elementos disponibles para edición

  mostrarModal.value = true;
};

// Cerrar el modal
const cerrarModal = () => {
  mostrarModal.value = false;
  modoEdicion.value = false;
  selectedTratamiento.value = null;
  selectedElementos.value = [];
  indiceEdicion.value = null;
};

// Agregar una nueva atención
const agregarAtencion = () => {
  if (!selectedTratamiento.value) {
    console.error("Debes escribir un tratamiento.");
    return;
  }

  if (selectedElementos.value.length === 0) {
    console.error("Debes seleccionar al menos un elemento.");
    return;
  }

  if (!tratamientos.value.includes(selectedTratamiento.value)) {
    tratamientos.value.push(selectedTratamiento.value);
  }

  atenciones.value.push({
    tratamiento: selectedTratamiento.value,
    elementos: [...selectedElementos.value],
  });

  cerrarModal();
  actualizarElementosDisponibles(); // Actualizar los elementos disponibles después de agregar
  emit("updateAtenciones", atenciones.value);
};

// Guardar los cambios de la edición
const guardarEdicion = () => {
  if (indiceEdicion.value !== null) {
    atenciones.value[indiceEdicion.value] = {
      tratamiento: selectedTratamiento.value!,
      elementos: [...selectedElementos.value],
    };
    cerrarModal();
    actualizarElementosDisponibles(); // Actualizar los elementos disponibles después de editar
    emit("updateAtenciones", atenciones.value);
  }
};

// Eliminar una atención
const eliminarAtencion = (index: number) => {
  atenciones.value.splice(index, 1); // Elimina el elemento directamente del array reactivo
  actualizarElementosDisponibles(); // Actualizar los elementos disponibles después de eliminar
  emit("updateAtenciones", atenciones.value); // Emite el evento para notificar al componente padre
};

const handleNextStep = () => {
  if (elementosDisponibles.value.length > 0 && atenciones.value.length === 0) {
    showInfoMessage({
      title: "Atenciones incompletas ...!!",
      message: `Agrega al menos una atención brindada o elimina los elementos seleccionados.`,
    });
  } else {
    emit("nextStep", {
      ...props.formData,
      atenciones: deepToRaw(atenciones.value),
    });
  }
};

const handleBackStep = () => {
  emit("backStep");
};

const handleCancelar = () => {
  emit("cancelar");
};

const handleSelection = (value: any) => {
  if (elementosDisponibles.value.length > 5) {
    // Cierra el input de VAutocomplete al seleccionar opciones
    selectedElementos.value = value;
    const autocomplete = document.querySelector(".select-elementos .v-input");
    if (autocomplete) {
      const input = autocomplete.querySelector("input");
      if (input) {
        input.blur(); // Cierra el input
      }
    }
  }
};

// Inicializar datos al montar el componente
onBeforeMount(() => {
  if (props?.formData?.atenciones ?? false) {
    let tmp = toRaw(props?.formData?.atenciones ?? []);
    atenciones.value = Array.isArray(tmp) ? [...tmp] : [];
  } else if (props.formData?.elementos ?? false) {
    let tmp = toRaw(props?.formData?.elementos ?? []);
    elementos.value = Array.isArray(tmp) ? [...tmp] : [];
  }
  // Inicializar los elementos disponibles
  actualizarElementosDisponibles();
});
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.atenciones-list {
  margin-bottom: 20px;
}

.atencion-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  padding: 16px;
  background-color: #1e1e2f;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 16px;
}

.atencion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.atencion-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.atencion-body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.chipPrimary {
  background-color: #6200ea;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.cardAtencion {
  width: 80%;
  margin: 0 auto;
}

.modal-container {
  /* background-color: #1e1e2f; */
  /* color: #fff; */
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin: 0 auto;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 16px;
}

.modal-content {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
