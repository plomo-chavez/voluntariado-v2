<template>
  <div class="multi-select-form">
    <span>{{ classCard }}</span>
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

    <div
      class="multi-select-options"
      :style="{
        display: 'grid',
        gridTemplateColumns:
          columnsOption === 0
            ? 'repeat(auto-fit, minmax(150px, 1fr))'
            : `repeat(${columnsOption}, 1fr)`,
        gap: '1rem',
        justifyContent:
          alignOptions === 'center'
            ? 'center'
            : alignOptions === 'right'
              ? 'flex-end'
              : 'flex-start',
      }"
      :class="[
        { grid: layout === 'grid', list: layout === 'list' },
        contenedorCentrado ? 'contenedorCentradoClass' : '',
      ]"
    >
      <div
        v-for="option in options"
        :key="option.value"
        :class="[
          classCard,
          { selected: selectedOptions.some((o) => o.value === option.value) },
          layout === 'list' ? 'list-layout' : 'grid-layout',
          'multi-select-option',
        ]"
        :style="[getOptionStyles(option)]"
        @click="toggleOption(option)"
      >
        <div v-if="layout === 'list'" class="list-layout">
          <i
            v-if="!isImage(option.icon)"
            :class="['icon-class', option.icon]"
          />
          <img v-else :src="option.icon" alt="icon" class="icon-image" />
          <span class="list-label">{{ option.label }}</span>
        </div>

        <div v-else class="grid-layout">
          <i
            v-if="!isImage(option.icon)"
            :class="['icon-class', option.icon]"
          />
          <img v-else :src="option.icon" alt="icon" class="icon-image" />
          <span class="grid-label">{{ option.label }}</span>
        </div>
      </div>

      <div class="text-center fontBold" v-if="options.length === 0">
        No hay opciones disponibles.
      </div>
    </div>
  </div>
</template>

<script>
import { themes } from "@/plugins/vuetify/theme"; // Importa el objeto themes

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
      default: 0, // Por defecto, auto
    },
    alignOptions: {
      type: String,
      required: false,
      default: "left", // Valor predeterminado: alineación a la izquierda
      validator: (value) => ["left", "center", "right"].includes(value), // Solo permite estos valores
    },
    modelValue: {
      type: Array,
      required: false,
      default: () => [],
    },
    layout: {
      type: String,
      required: false,
      default: "list", // Valor predeterminado: lista
      validator: (value) => ["list", "grid"].includes(value), // Solo permite "list" o "grid"
    },
    maxSelections: {
      type: Number,
      required: false,
      default: Infinity, // Permitir todas las selecciones por defecto
      validator: (value) => value > 0, // Debe ser un número mayor a 0
    },
    classCard: {
      type: String,
      required: false,
      default: "default-card-class", // Clase predeterminada
    },
  },
  computed: {
    selectedOptions: {
      // Computada bidireccional para sincronizar `modelValue` con las opciones seleccionadas
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    remainingSelections() {
      // Calcula cuántas selecciones faltan
      return this.maxSelections - this.selectedOptions.length;
    },
    labelStyles() {
      return {
        color: this.themeColors["on-surface"], // Color dinámico del tema
      };
    },
  },
  data() {
    return {
      themeColors: themes.light.colors, // Usa los colores del tema claro por defecto
    };
  },
  methods: {
    toggleOption(option) {
      const index = this.selectedOptions.findIndex(
        (o) => o.value === option.value,
      );

      if (index === -1) {
        // Si la opción no está seleccionada
        if (this.selectedOptions.length < this.maxSelections) {
          // Agregar la opción si no se ha alcanzado el límite
          this.selectedOptions = [...this.selectedOptions, option];
        } else {
          // Mostrar un mensaje o manejar el caso en que se alcanza el límite
          console.warn(
            `Solo puedes seleccionar hasta ${this.maxSelections} opciones.`,
          );
        }
      } else {
        // Si la opción ya está seleccionada, eliminarla
        this.selectedOptions = this.selectedOptions.filter(
          (o) => o.value !== option.value,
        );
      }
    },
    getOptionStyles(option) {
      const isSelected = this.selectedOptions.some(
        (o) => o.value === option.value,
      );
      return {
        backgroundColor: isSelected
          ? this.themeColors["primaryLight"] // Usa el color pastel
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
    isImage(icon) {
      // Verifica si el icono es una URL de imagen
      return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(icon);
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
  display: grid;
  gap: 1rem;
  margin-top: 10px !important;
}

.multi-select-counter {
  font-size: small;
  font-style: italic;
  margin: 0px !important;
  padding: 0px !important;
}

.multi-select-label {
  font-weight: bold;
  font-style: italic;
  margin: 0px !important;
  padding: 0px !important;
}

.multi-select-option {
  flex: 1 1 auto;
  border: 2px solid;
  display: flex;
  gap: 0.5rem;
}

.multi-select-option:hover {
  background-color: var(--hover-color); /* Color dinámico para hover */
}

.list-layout {
  display: flex;
  gap: 0.5rem;
}

.grid-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.icon-image {
  width: 20px;
  height: 20px;
}

.icon-class {
  font-size: 20px;
}

.list-label {
  font-size: 16px;
}

.grid-label {
  font-size: 14px;
  margin-top: 4px;
}

.contenedorCentradoClass {
  text-align: center;
}
</style>
