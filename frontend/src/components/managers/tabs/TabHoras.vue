<script lang="ts" setup>
import DataTable from "@/components/apps/DataTable.vue";
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { computed, ref, watch } from "vue";

type HoraRecord = {
  id: string;
  area: string;
  actividad: string;
  fecha_inicio: string;
  hora_inicio: string;
  fecha_fin: string;
  hora_fin: string;
  acumulado: number;
};

const props = defineProps<{
  data?: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const showAddModal = ref(false);
const showFilters = ref(false);
const rows = ref<HoraRecord[]>([]);
const areaBase = computed(
  () =>
    String(
      props.data?.area_nombre || props.data?.id_area || props.data?.area || "",
    ) || "General",
);

const nuevoRegistro = ref({
  area: areaBase.value,
  actividad: "",
  fecha_inicio: "",
  hora_inicio: "",
  fecha_fin: "",
  hora_fin: "",
});

const filtros = ref<{
  area: string | null;
  fechaDesde: string;
  fechaHasta: string;
}>({
  area: null,
  fechaDesde: "",
  fechaHasta: "",
});

const areaOptions = computed(() => {
  const base = areaBase.value;
  const found = rows.value
    .map((item) => item.area)
    .filter(Boolean)
    .map((item) => item.trim());
  return Array.from(new Set([base, ...found]));
});

const filtrosSchema = computed(() => [
  {
    label: "Area",
    type: "select",
    model: "area",
    options: areaOptions.value.map((item) => ({ label: item, value: item })),
  },
  {
    label: "Fecha desde",
    type: "date",
    model: "fechaDesde",
  },
  {
    label: "Fecha hasta",
    type: "date",
    model: "fechaHasta",
  },
]);

const tableHeaders = [
  { title: "Area", key: "area" },
  { title: "Actividad", key: "actividad" },
  { title: "Fecha de inicio", key: "fecha_inicio" },
  { title: "Hora de inicio", key: "hora_inicio" },
  { title: "Fecha fin", key: "fecha_fin" },
  { title: "Hora fin", key: "hora_fin" },
  { title: "Acumulado", key: "acumulado" },
];

const tableConfig = {
  actions: ["Seleccionar", "Eliminar"],
  busqueda: true,
  paginador: false,
  numerador: false,
  exportar: false,
  seleccionar: false,
  noWrap: false,
  columnsBySearch: [
    "area",
    "actividad",
    "fecha_inicio",
    "hora_inicio",
    "fecha_fin",
    "hora_fin",
  ],
};

function toDateTime(fecha: string, hora: string): Date | null {
  if (!fecha || !hora) return null;
  const full = `${fecha}T${hora}:00`;
  const date = new Date(full);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calcularAcumuladoHoras(
  fechaInicio: string,
  horaInicio: string,
  fechaFin: string,
  horaFin: string,
): number {
  const inicio = toDateTime(fechaInicio, horaInicio);
  const fin = toDateTime(fechaFin, horaFin);
  if (!inicio || !fin) return 0;

  const diffMs = fin.getTime() - inicio.getTime();
  if (diffMs <= 0) return 0;

  const horas = diffMs / (1000 * 60 * 60);
  return Number(horas.toFixed(2));
}

const acumuladoNuevoRegistro = computed(() =>
  calcularAcumuladoHoras(
    nuevoRegistro.value.fecha_inicio,
    nuevoRegistro.value.hora_inicio,
    nuevoRegistro.value.fecha_fin,
    nuevoRegistro.value.hora_fin,
  ),
);

watch(
  () => props.data,
  (val) => {
    const source = val?.horas_registros;
    if (Array.isArray(source)) {
      rows.value = source
        .map((item: any, index: number) => ({
          id: String(item.id || `${Date.now()}-${index}`),
          area: String(item.area || areaBase.value),
          actividad: String(item.actividad || ""),
          fecha_inicio: String(item.fecha_inicio || item.fecha || ""),
          hora_inicio: String(item.hora_inicio || ""),
          fecha_fin: String(item.fecha_fin || item.fecha || ""),
          hora_fin: String(item.hora_fin || ""),
          acumulado: Number(
            item.acumulado ||
              item.horas ||
              calcularAcumuladoHoras(
                String(item.fecha_inicio || item.fecha || ""),
                String(item.hora_inicio || ""),
                String(item.fecha_fin || item.fecha || ""),
                String(item.hora_fin || ""),
              ),
          ),
        }))
        .filter((item: HoraRecord) => !!item.actividad);
    }
  },
  { immediate: true, deep: true },
);

const rowsFiltradas = computed(() => {
  return rows.value.filter((item) => {
    if (filtros.value.area && item.area !== filtros.value.area) return false;
    if (
      filtros.value.fechaDesde &&
      item.fecha_inicio < filtros.value.fechaDesde
    )
      return false;
    if (filtros.value.fechaHasta && item.fecha_fin > filtros.value.fechaHasta)
      return false;
    return true;
  });
});

const totalRegistros = computed(() => rowsFiltradas.value.length);

const totalHoras = computed(() =>
  rowsFiltradas.value.reduce(
    (acc, item) => acc + Number(item.acumulado || 0),
    0,
  ),
);

const resumenFiltros = computed(() => ({
  area: filtros.value.area || "Todas",
  rango:
    filtros.value.fechaDesde || filtros.value.fechaHasta
      ? `${filtros.value.fechaDesde || "..."} a ${filtros.value.fechaHasta || "..."}`
      : "Todo",
}));

const tableDataResponse = computed(() => ({
  total: rowsFiltradas.value.length,
  pageSize: rowsFiltradas.value.length || 10,
  page: 1,
}));

const addFormValid = computed(() => {
  return (
    !!nuevoRegistro.value.area &&
    !!nuevoRegistro.value.actividad &&
    !!nuevoRegistro.value.fecha_inicio &&
    !!nuevoRegistro.value.hora_inicio &&
    !!nuevoRegistro.value.fecha_fin &&
    !!nuevoRegistro.value.hora_fin &&
    acumuladoNuevoRegistro.value > 0
  );
});

function resetAddForm() {
  nuevoRegistro.value = {
    area: areaBase.value,
    actividad: "",
    fecha_inicio: "",
    hora_inicio: "",
    fecha_fin: "",
    hora_fin: "",
  };
}

function openAddModal() {
  resetAddForm();
  showAddModal.value = true;
}

function openFilterModal() {
  showFilters.value = !showFilters.value;
}

function limpiarFiltros() {
  filtros.value = {
    area: null,
    fechaDesde: "",
    fechaHasta: "",
  };
}

function handleFiltrosUpdate(val: Record<string, any>) {
  filtros.value = {
    area: val.area || null,
    fechaDesde: val.fechaDesde || "",
    fechaHasta: val.fechaHasta || "",
  };
}

function saveRows() {
  emit("update:data", {
    ...(props.data || {}),
    horas_registros: rows.value,
  });
}

function agregarRegistro() {
  if (!addFormValid.value) return;

  rows.value = [
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      area: (nuevoRegistro.value.area || areaBase.value).trim(),
      actividad: nuevoRegistro.value.actividad.trim(),
      fecha_inicio: nuevoRegistro.value.fecha_inicio,
      hora_inicio: nuevoRegistro.value.hora_inicio,
      fecha_fin: nuevoRegistro.value.fecha_fin,
      hora_fin: nuevoRegistro.value.hora_fin,
      acumulado: acumuladoNuevoRegistro.value,
    },
    ...rows.value,
  ];

  saveRows();
  showAddModal.value = false;
}

function eliminarRegistro(id: string) {
  rows.value = rows.value.filter((item) => item.id !== id);
  saveRows();
}

function verRegistro(item: HoraRecord) {
  const resumen = [
    `Area: ${item.area}`,
    `Actividad: ${item.actividad}`,
    `Fecha inicio: ${item.fecha_inicio}`,
    `Hora inicio: ${item.hora_inicio}`,
    `Fecha fin: ${item.fecha_fin}`,
    `Hora fin: ${item.hora_fin}`,
    `Acumulado: ${item.acumulado}`,
  ].join("\n");

  window.alert(resumen);
}

function handleTableAction({
  action,
  item,
}: {
  action: string;
  item: HoraRecord;
}) {
  if (action === "Eliminar") {
    eliminarRegistro(item.id);
    return;
  }

  if (action === "Seleccionar") {
    verRegistro(item);
  }
}
</script>

<template>
  <div class="horas-root">
    <section class="horas-section">
      <header class="horas-header">
        <div class="horas-title-wrap">
          <i class="fa-solid fa-clock horas-icon" aria-hidden="true" />
          <h3 class="horas-title">Horas de servicio</h3>
        </div>

        <div class="horas-header-actions">
          <VBtn
            size="small"
            color="white"
            variant="flat"
            title="Agregar registro"
            @click="openAddModal"
          >
            <i class="fa-solid fa-plus" aria-hidden="true" />
          </VBtn>
        </div>
      </header>

      <VExpandTransition>
        <section v-show="showFilters" class="filters-panel">
          <div class="filters-panel-header">
            <h4 class="filters-title">Filtros</h4>
          </div>
          <div class="filters-panel-body">
            <ModuladorFormFactory
              :title="null"
              :showTitle="false"
              :schema="filtrosSchema"
              :modelValue="filtros"
              :formLive="true"
              :showButtonsAction="false"
              @update:modelValue="handleFiltrosUpdate"
            />
          </div>
          <div class="filters-panel-actions">
            <VBtn variant="text" color="secondary" @click="limpiarFiltros">
              Limpiar
            </VBtn>
            <VBtn color="red-darken-2" @click="showFilters = false">
              Aplicar
            </VBtn>
          </div>
        </section>
      </VExpandTransition>

      <div class="metrics-wrap">
        <article class="metric-card metric-card--filters">
          <div class="metric-filters-head">
            <p class="metric-label">Filtros activos</p>
            <VBtn
              size="x-small"
              color="red-darken-2"
              variant="tonal"
              title="Mostrar u ocultar filtros"
              @click="openFilterModal"
            >
              <i
                :class="[
                  'fa-solid',
                  showFilters ? 'fa-filter-circle-xmark' : 'fa-filter',
                ]"
                aria-hidden="true"
              />
              {{ showFilters ? "Ocultar" : "Mostrar" }}
            </VBtn>
          </div>
          <div class="metric-filter-inline">
            <span class="metric-filter-line"
              >Area: <strong>{{ resumenFiltros.area }}</strong></span
            >
            <span class="metric-filter-line"
              >Rango: <strong>{{ resumenFiltros.rango }}</strong></span
            >
          </div>
        </article>

        <div class="metrics-grid">
          <article class="metric-card">
            <p class="metric-label">Contador de horas</p>
            <p class="metric-value">{{ totalHoras }}</p>
          </article>
          <article class="metric-card">
            <p class="metric-label">Registros</p>
            <p class="metric-value">{{ totalRegistros }}</p>
          </article>
        </div>
      </div>

      <div class="horas-body">
        <DataTable
          :headers="tableHeaders"
          :data="rowsFiltradas"
          :dataResponse="tableDataResponse"
          :config="tableConfig"
          @action="handleTableAction"
        />
      </div>
    </section>

    <VDialog v-model="showAddModal" max-width="640">
      <VCard>
        <VCardTitle class="modal-title">Agregar registro de horas</VCardTitle>
        <VCardText class="modal-grid">
          <VTextField
            v-model="nuevoRegistro.actividad"
            label="Actividad"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VSelect
            v-model="nuevoRegistro.area"
            :items="areaOptions"
            label="Area"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VTextField
            v-model="nuevoRegistro.fecha_inicio"
            label="Fecha de inicio"
            type="date"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VTextField
            v-model="nuevoRegistro.hora_inicio"
            label="Hora de inicio"
            type="time"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VTextField
            v-model="nuevoRegistro.fecha_fin"
            label="Fecha fin"
            type="date"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VTextField
            v-model="nuevoRegistro.hora_fin"
            label="Hora fin"
            type="time"
            variant="outlined"
            density="compact"
            class="styled-input"
          />

          <VTextField
            :model-value="acumuladoNuevoRegistro"
            label="Acumulado"
            variant="outlined"
            density="compact"
            class="styled-input"
            readonly
          />
        </VCardText>
        <VCardActions class="justify-end">
          <VBtn variant="text" color="secondary" @click="showAddModal = false">
            Cancelar
          </VBtn>
          <VBtn
            color="red-darken-2"
            :disabled="!addFormValid"
            @click="agregarRegistro"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.horas-root {
  display: grid;
  gap: 0.85rem;
}

.horas-section {
  border: 1px solid #e4e8ef;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.horas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.45rem 0.7rem;
  background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%);
}

.horas-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.horas-icon {
  color: #fff;
  font-size: 0.95rem;
}

.horas-title {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
  color: #fff;
}

.horas-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.metrics-wrap {
  display: grid;
  gap: 0.7rem;
  padding: 0.65rem 0.7rem 0.3rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.metric-card {
  border: 1px solid #e5eaf1;
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
}

.metric-label {
  margin: 0;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  margin: 0.2rem 0 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 700;
}

.metric-card--filters {
  width: 100%;
}

.metric-filters-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.metric-filter-inline {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.metric-filter-line {
  margin: 0.2rem 0 0;
  color: #1f2937;
  font-size: 0.84rem;
}

.horas-body {
  padding: 0.45rem 0.6rem 0.6rem;
}

.filters-panel {
  border: 1px solid #e5eaf1;
  border-radius: 10px;
  margin: 0.6rem 0.7rem 0;
  background: #f8fafc;
}

.filters-panel-header {
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid #e5eaf1;
}

.filters-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.filters-panel-body {
  padding: 0.55rem 0.7rem 0.2rem;
}

.filters-panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0 0.7rem 0.6rem;
}

.modal-title {
  font-weight: 700;
}

.modal-grid {
  display: grid;
  gap: 0.65rem;
}

.styled-input :deep(.v-field) {
  border-radius: 10px;
  border: 1px solid #d8dee8;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.03);
}

.styled-input :deep(.v-field--focused) {
  border-color: #b71c1c;
  box-shadow: 0 0 0 2px rgba(183, 28, 28, 0.12);
}

.styled-input :deep(.v-field__outline) {
  opacity: 0;
}

@media (max-width: 640px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
