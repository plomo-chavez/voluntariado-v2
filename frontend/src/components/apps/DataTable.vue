<script setup lang="ts">
import { themes } from "@/plugins/vuetify/theme";
import { formatValue } from "@/utils/formatterHelper";
import { isUserAdmin } from "@/utils/userUtils"; // Importa la función desde userUtils
import { computed, ref, watch } from "vue";
const colors = ref(themes.light.colors); // Accede a los colores del tema

const selected: any = ref([]);

interface Header {
  columnCenter?: boolean;
  title: string;
  key: string;
  format?: string | ((value: any, item: any) => string);
  classItem?: string;
}

const props = withDefaults(
  defineProps<{
    softDelete?: boolean;
    loading?: boolean;
    headers: Header[];
    fnRowClass?: any;
    data: any[];
    dataResponse: any;
    config: {
      actions: string[];
      numerador?: boolean;
      paginador?: boolean;
      busqueda?: boolean;
      exportar?: boolean;
      seleccionar?: boolean;
      noWrap?: boolean; // Nueva propiedad para controlar el truncado del texto
      columnsBySearch?: string[]; // Columnas específicas para la búsqueda
    };
  }>(),
  {
    fnRowClass: undefined, // Valor predeterminado
    softDelete: false, // Valor predeterminado
    loading: false, // Valor predeterminado
  },
);

const emit = defineEmits<{
  (event: "action", payload: { action: string; item: any }): void;
  (event: "selection-change", selectedItems: any[]): void;
  (
    event: "paginationChange",
    payload: { page: number; pageSize: number },
  ): void;
}>();

// Valores predeterminados para las opciones
const defaultConfig = {
  numerador: false,
  paginador: false,
  busqueda: true,
  exportar: false,
  seleccionar: false,
  noWrap: true,
};

const mergedConfig = { ...defaultConfig, ...props.config };

// Estado para la búsqueda
const searchQuery: any = ref("");

// Filtrar datos según la búsqueda
const filteredData = computed(() => {
  if (!mergedConfig.busqueda || !searchQuery.value) {
    return props.data;
  }

  const query = searchQuery.value.toLowerCase();
  const searchColumns =
    mergedConfig.columnsBySearch || props.headers.map((header) => header.key);

  return props.data.filter((item) =>
    searchColumns.some((column) =>
      String(item[column]).toLowerCase().includes(query),
    ),
  );
});

function exportData() {
  // Aquí puedes implementar la lógica para exportar los datos (CSV, Excel, etc.)
}

function getNestedValue(obj: any, key: string): any {
  return key.split(".").reduce((acc, curr) => acc && acc[curr], obj);
}
function onTableOptionsChange(options: any) {
  const page = Number(options?.page ?? 1);
  const pageSize = Number(options?.itemsPerPage ?? 10);
  emit("paginationChange", { page, pageSize });
}

const getFormattedValue = (item: any, header: any) => {
  const value = getNestedValue(item, header.key);

  if (typeof header.format === "function") {
    return header.format(value, item);
  } else if (typeof header.format === "string") {
    return formatValue(value, header);
  }

  return value ?? "";
};

const itsSoftDelete = (item: any) => {
  return !!props.softDelete && !!item?.deleted_at;
};

const getHeaders = () => {
  // prettier-ignore
  return [
    ...(mergedConfig.numerador ? [{ title: "#", key: "numerador", }] : []),
    ...props.headers.map((header) => ({ ...header })),
    ...(props.config.actions.length ? [ { title: "Acciones", key: "actions", }, ] : []),
  ];
};

// Clase de fila según valores del item
const rowClass = (item: any) => {
  try {
    return item?.estatus === 1 ? "bgRed" : "";
  } catch (e) {
    return "";
  }
};

const getRowProps = ({ item }: any) => {
  return {
    style: {
      backgroundColor: item.color,
    },
  };
};
1;
watch(selected, () => {
  const selectedById = props.data.filter((item) =>
    selected.value.includes(item.id),
  );
  emit("selection-change", selectedById); // Emitir los IDs seleccionados
});
</script>

<template>
  <div>
    <!-- Búsqueda y botón de exportar en una sola fila -->
    <div
      v-if="mergedConfig.busqueda || mergedConfig.exportar"
      class="mb-3 d-flex align-center justify-space-between"
    >
      <!-- prettier-ignore -->
      <div class="d-flex align-center gap-2 w-100">
        <input v-if="mergedConfig.busqueda" type="text" v-model="searchQuery" placeholder="Buscar..."  class="search-input w-100" />
        <VBtn v-if="mergedConfig.busqueda" @click="() => (searchQuery = '')" color="Primary">
          Limpiar
        </VBtn>
      </div>
      <!-- prettier-ignore -->
      <button v-if="mergedConfig.exportar" @click="exportData" class="btn-export" >
        Exportar
      </button>
    </div>
    <!-- Tabla -->

    <!-- prettier-ignore -->
    <div style="position: relative">
      <LoadingOverlay
        :fullscreen="false"
        :isActivo="props.loading"
        :texto="'Cargando información ...!!'"
      />
      <VDataTableServer
        :row-props="fnRowClass"
        :headers="getHeaders()"
        :items="filteredData"
        :items-per-page="props.dataResponse?.pageSize == props.dataResponse.total  ? -1  : props.dataResponse?.pageSize"
        :items-length="props.dataResponse?.total ?? 0"
        :show-select="mergedConfig.seleccionar"
        v-model="selected"
        select-strategy="all"
        no-data-text="No hay datos disponibles"
        items-per-page-text="Elementos por página:"
        fixed-header
        :class="{ 'no-wrap': mergedConfig.noWrap }"
        @update:options="onTableOptionsChange"
      >
        <!-- prettier-ignore -->
        <template v-for="header in getHeaders()" :key="`header.${header.key}`" #[`header.${header.key}`]>
        <div :class="{ 'centerHeader': header.key == 'actions' || (header?.columnCenter ?? false )}">
          {{ header.title }}
        </div>
      </template>

        <!-- Numerador -->
        <template #item.numerador="{ index }">
          {{ index + 1 }}
        </template>

        <!-- Datos dinámicos -->
        <!-- prettier-ignore -->
        <template v-for="header in props.headers" :key="header.key" #[`item.${header.key}`]="{ item } ">
        <span :class="[{ 'no-wrap': mergedConfig.noWrap }, header?.classItem ?? '']" >
          {{ getFormattedValue(item, header) }}
        </span>
      </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="actions">
            <!-- prettier-ignore -->
            <template v-if="itsSoftDelete(item)&& isUserAdmin()">
            <button v-if="item.deleted_at == null" @click="() => emit('action', { action: 'EliminarSoft', item })" class="action-button">
              <VIcon icon="tabler-database-x"  size="27" :style="{ color: colors?.soft, fontWeight: 'bold' }" />
            </button>
            <button v-else @click="() => emit('action', { action: 'EliminarSoft', item })" class="action-button">
              <VIcon icon="tabler-refresh"  size="27" :style="{ color: colors?.success, fontWeight: 'bold' }" />
            </button>
          </template>
            <!-- prettier-ignore -->
            <template v-else>
            <button v-for="(action, index) in props.config.actions" :key="index" @click="() => emit('action', { action, item })" class="action-button">
              <VIcon icon="tabler-eye"        size="27" v-if="action == 'Seleccionar'" :style="{ color: colors?.secondary, fontWeight: 'bold' }" />
              <VIcon icon="tabler-edit"       size="27" v-if="action == 'Editar'" :style="{ color: colors?.warning, fontWeight: 'bold' }" />
              <VIcon icon="tabler-trash"      size="27" v-if="action == 'Eliminar'" :style="{ color: colors?.error, fontWeight: 'bold' }" />
            </button>
            <VIcon v-if="props.softDelete && isUserAdmin()" icon="tabler-database-x" size="27" :style="{ color: colors?.soft, fontWeight: 'bold' }" @click="() => emit('action', { action: 'EliminarSoft', item })" />
          </template>
          </div>
        </template>
      </VDataTableServer>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.spanItem) {
  display: flex;
  justify-content: center; /* Centrar horizontalmente */
  align-items: center; /* Centrar verticalmente */
  text-align: center; /* Centrar el texto */
}
/* ::v-deep(.v-data-table__th span) {
  width: 100%;
  text-align: center !important;
} */
.d-flex {
  display: flex;
  gap: 8px;
}
.align-center {
  align-items: center;
}

.actions {
  display: flex;
  align-items: center; /* Centra verticalmente */
  justify-content: center; /* Centra horizontalmente */
  text-align: center; /* Centra el texto dentro de los elementos */
  gap: 8px; /* Espaciado entre los elementos */
}
.search-input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-clear {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-export {
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #212529;
}

.action-button:hover {
  background-color: #e2e6ea;
}

/* Estilo predeterminado para las celdas */
.v-data-table td {
  white-space: normal !important; /* Permite que el texto se ajuste automáticamente */
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

/* Estilo para evitar que el texto se divida en varias líneas */
::v-deep(.v-data-table__td) {
  white-space: nowrap !important; /* Evita que el texto se divida en varias líneas */
  overflow: hidden !important; /* Oculta el texto que exceda el ancho */
  text-overflow: ellipsis !important; /* Agrega puntos suspensivos si el texto es muy largo */
}

/* Define una clase CSS para centrar los encabezados */
.centerHeader {
  width: 100% !important;
  text-align: center !important;
}

.bgRed {
  background-color: #ffecec !important;
}
</style>
