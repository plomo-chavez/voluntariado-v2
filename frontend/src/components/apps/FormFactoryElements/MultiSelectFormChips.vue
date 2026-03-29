<template>
  <div class="multi-select-form">
    <div class="text-muted">
      <label class="multi-select-label">
        Selecciona
        {{ maxSelections == 1 ? "una opción" : "múltiples opciones" }}:
      </label>
      <label
        v-if="maxSelections != Infinity && maxSelections > 1"
        class="multi-select-counter"
      >
        Selecciona hasta {{ maxSelections }} opciones
        <span v-if="remainingSelections > 0"
          >, faltan {{ remainingSelections }}</span
        >.
      </label>
    </div>

    <div class="multi-select-options">
      <div
        v-for="option in options"
        :key="option.id"
        :class="[
          { selected: selectedOptions.some((o) => o.id === option.id) },
          'multi-select-option',
        ]"
        :style="[getOptionStyles(option)]"
        @click="toggleOption(option)"
      >
        <div>
          <span>{{ option.label }}</span>
        </div>
      </div>

      <div class="text-center fontBold" v-if="options.length === 0">
        No hay opciones disponibles.
      </div>
    </div>
  </div>
</template>

<script>
import { themes } from "@/plugins/vuetify/theme";

export default {
  name: "MultiSelectForm",
  props: {
    id: {
      type: String,
      required: false,
      default: null,
    },
    label: {
      type: String,
      required: false,
      default: "",
    },
    options: {
      type: Array,
      required: true,
      default: () => [],
    },
    columnsOption: {
      type: Number,
      required: false,
      default: 0,
    },
    alignOptions: {
      type: String,
      required: false,
      default: "left",
      validator: (value) => ["left", "center", "right"].includes(value),
    },
    modelValue: {
      type: Array,
      required: false,
      default: () => [],
    },
    layout: {
      type: String,
      required: false,
      default: "list",
      validator: (value) => ["list", "grid"].includes(value),
    },
    maxSelections: {
      type: Number,
      required: false,
      default: Infinity,
      validator: (value) => value > 0,
    },
    classCard: {
      type: String,
      required: false,
      default: "default-card-class", // Clase predeterminada
    },
  },
  computed: {
    selectedOptions: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("change");
        this.$emit("update:modelValue", value);
      },
    },
    remainingSelections() {
      return this.maxSelections - this.selectedOptions.length;
    },
    labelStyles() {
      return {
        color: this.themeColors["on-surface"],
      };
    },
  },
  data() {
    return {
      themeColors: themes.light.colors,
    };
  },
  methods: {
    toggleOption(option) {
      const index = this.selectedOptions.findIndex((o) => o.id === option.id);

      if (index === -1) {
        // Si no está seleccionado, verificar si se puede agregar
        if (
          this.maxSelections === Infinity ||
          this.selectedOptions.length < this.maxSelections
        ) {
          this.selectedOptions = [...this.selectedOptions, option];
        } else {
          // Mostrar un mensaje de error si se excede el límite
          this.$emit(
            "error",
            `Solo puedes seleccionar hasta ${this.maxSelections} opciones.`,
          );
        }
      } else {
        // Si ya está seleccionado, deselecciónalo
        this.selectedOptions = this.selectedOptions.filter(
          (o) => o.id !== option.id,
        );
      }
    },
    getOptionStyles(option) {
      const isSelected = this.selectedOptions.some((o) => o.id === option.id);
      return {
        backgroundColor: isSelected
          ? this.themeColors["primaryLight"]
          : this.themeColors["surface"],
        color: isSelected
          ? this.themeColors["on-primary"]
          : this.themeColors["on-surface"],
        borderColor: isSelected
          ? this.themeColors["primary"]
          : this.themeColors["grey-300"],
        cursor: "pointer",
        padding: "0.5rem 1rem",
        borderRadius: "4px",
        transition: "background-color 0.3s, border-color 0.3s",
        display: "flex",
      };
    },
  },
};
</script>

<style scoped>
.multi-select-form {
  display: flex;
  flex-direction: column;
}

.multi-select-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 10px !important;
}

.multi-select-counter {
  font-size: small;
  font-style: italic;
}

.multi-select-label {
  font-weight: bold;
  font-style: italic;
}

.multi-select-option {
  border: 2px solid;
  border-radius: 20px !important;
  font-size: 12px;
  font-weight: 800;
  border-radius: 100px;
}

.multi-select-option.selected {
  background-color: rgb(var(--v-theme-primaryTonalLight)) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.multi-select-option:not(.selected):hover {
  background-color: #dbdbdb !important;
}
</style>
