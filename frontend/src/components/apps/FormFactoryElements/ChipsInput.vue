<template>
  <div>
    <div class="divSpan">
      <span>
        Para agregar un nuevo chip, escribe en el campo de texto y haz clic en
        el botón <strong>Agregar</strong> o presiona <strong>Enter</strong>.
      </span>
    </div>
    <div class="input-container">
      <VTextField
        density="compact"
        v-model="newItem"
        type="text"
        :placeholder="
          editingIndex !== null ? 'Edita el chip...' : 'Escribe algo...'
        "
        @keyup.enter="handleKeyEnter"
        class="narrow-input"
        :error="!!errorMessage"
      />
      <VBtn
        v-if="editingIndex === null"
        color="primary"
        variant="tonal"
        @click="addItem"
      >
        <VIcon class="font-bold" icon="tabler-circle-plus-filled" />
      </VBtn>
      <VBtn v-else variant="flat" color="warning" @click="saveEdit">
        <VIcon class="font-bold" icon="tabler-device-floppy" />
      </VBtn>
      <VBtn
        v-if="editingIndex !== null"
        variant="flat"
        color="error"
        @click="cancelEdit"
      >
        <VIcon class="font-bold" icon="tabler-cancel" />
      </VBtn>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div class="divSpan">
      <span>
        Para modificar un chip, haz <strong>doble clic</strong> sobre él,
        edítalo en el campo de texto y haz clic en <strong>Guardar</strong> o
        presiona <strong>Enter</strong>.
      </span>
    </div>
    <div class="divSpan">
      <span>
        Para eliminar un chip, haz clic en el ícono (<VIcon
          size="16"
          color="error"
          icon="tabler-eraser"
        />).
      </span>
    </div>
    <div class="chips-input mt-4">
      <div class="chips-container">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="chip chipPrimary cursorPointer"
          @dblclick="startEdit(index)"
        >
          <span>{{ item }}</span>
          <VIcon
            size="18"
            class="ml-1 font-bold"
            color="error"
            icon="tabler-eraser"
            @click="removeItem(index)"
          />
        </div>
      </div>
    </div>
    <div class="divSpan2">
      <span>
        {{ items.length }}
        {{ items.length === 1 ? "registro" : "registros" }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VBtn } from "vuetify/components";

const emit = defineEmits<{
  (event: "update", value: Record<string, any>): void;
}>();

const props = withDefaults(
  defineProps<{
    data?: any;
    validate?: any; // Función de validación
    allowDuplicates?: boolean; // Nueva prop para permitir o no duplicados
  }>(),
  {
    data: null,
    validate: null, // Por defecto no hay validación
    allowDuplicates: true, // Por defecto se permiten duplicados
  },
);

const newItem = ref("");
const items = ref<string[]>([]);
const editingIndex = ref<number | null>(null);
const originalValue = ref<string>("");
const errorMessage = ref<string>("");

function addItem() {
  const trimmedValue = newItem.value.trim();

  if (trimmedValue === "") {
    errorMessage.value = "El campo no puede estar vacío.";
    return;
  }

  // Validar duplicados si no se permiten
  if (!props.allowDuplicates && items.value.includes(trimmedValue)) {
    errorMessage.value = "El valor ya existe en la lista.";
    return;
  }

  // Validar el nuevo valor
  if (props.validate) {
    if (typeof props.validate === "function") {
      const isValid = props.validate(trimmedValue);
      if (!isValid) {
        errorMessage.value = "No pasa la validación.";
        return;
      }
    } else if (typeof props.validate === "string") {
      errorMessage.value = props.validate;
      return;
    }
  }

  // Si pasa la validación, agregar el chip
  items.value.push(trimmedValue);
  newItem.value = "";
  errorMessage.value = ""; // Limpiar el mensaje de error
  update();
}

function removeItem(index: number) {
  items.value.splice(index, 1);
  update();
}

function startEdit(index: number) {
  editingIndex.value = index;
  originalValue.value = items.value[index]; // Guardar el valor original
  newItem.value = items.value[index]; // Colocar el valor en el input
}

function saveEdit() {
  const trimmedValue = newItem.value.trim();

  if (editingIndex.value !== null && trimmedValue !== "") {
    // Si el valor no ha cambiado, permite guardar sin validación
    if (trimmedValue === originalValue.value) {
      cancelEdit(); // Finalizar la edición sin cambios
      return;
    }

    // Validar duplicados si no se permiten
    if (!props.allowDuplicates && items.value.includes(trimmedValue)) {
      errorMessage.value = "El valor ya existe en la lista.";
      return;
    }

    // Validar el valor con la función de validación
    if (props.validate) {
      if (typeof props.validate === "function") {
        const isValid = props.validate(trimmedValue);
        if (!isValid) {
          errorMessage.value = "No pasa la validación.";
          return;
        }
      } else if (typeof props.validate === "string") {
        errorMessage.value = props.validate;
        return;
      }
    }

    // Usar splice para actualizar el array de forma reactiva
    items.value.splice(editingIndex.value, 1, trimmedValue);
    cancelEdit(); // Finalizar la edición
    update();
  }
}

function cancelEdit() {
  newItem.value = ""; // Limpiar el input
  editingIndex.value = null; // Salir del modo edición
  errorMessage.value = ""; // Limpiar el mensaje de error
}

function update() {
  // Emitir el evento con la lista actualizada
  emit("update", items.value);
}

function handleKeyEnter() {
  if (editingIndex.value !== null) {
    saveEdit(); // Llama a la función para guardar la edición si está en modo edición
  } else {
    addItem(); // Llama a la función para agregar un nuevo chip si no está en modo edición
  }
}

onBeforeMount(() => {
  // Inicializar items si se pasa data como prop
  if (props.data && Array.isArray(props.data)) {
    items.value = [...props.data];
  }
});
</script>

<style scoped>
.divSpan {
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  color: #555;
}
.divSpan2 {
  font-size: 14px;
  text-align: right;
  line-height: 18px;
  color: #555;
}
.chips-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-container {
  display: flex;
  align-items: center !important;
  gap: 10px;
}

.input-container input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip .delete-btn {
  margin-left: 8px;
}

.narrow-input {
  width: 200px; /* Ajusta el ancho según lo que necesites */
}

.error-message {
  color: red;
  font-size: 12px;
}
</style>
