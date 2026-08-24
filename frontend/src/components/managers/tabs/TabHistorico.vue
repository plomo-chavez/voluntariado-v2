<script lang="ts" setup>
import DataTable from "@/components/apps/DataTable.vue";
import NuevoRegistroHistorico from "@/pagesComponents/elementos/NuevoRegistroHistorico.vue";
import { computed, ref, watch } from "vue";

type FormacionRecord = {
  id: string;
  tipo: "institucional" | "externo";
  area?: string;
  capacitacion?: string;
  nombre_taller?: string;
  institucion?: string;
  fecha: string;
  evidencia_nombre?: string;
  evidencia_url?: string;
};

const props = defineProps<{
  data?: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const showModal = ref(false);
const moodAdd = ref(false);
const rows = ref<FormacionRecord[]>([]);

const tableHeaders = [
  { title: "Tipo", key: "tipoLabel" },
  { title: "Capacitacion / Taller", key: "nombre" },
  { title: "Area / Institucion", key: "detalle" },
  { title: "Fecha", key: "fecha" },
  { title: "Evidencia", key: "evidencia" },
];

const tableConfig = {
  actions: ["Seleccionar", "Eliminar"],
  busqueda: true,
  paginador: false,
  numerador: false,
  exportar: false,
  seleccionar: false,
  noWrap: false,
  columnsBySearch: ["tipoLabel", "nombre", "detalle", "fecha", "evidencia"],
};

const tableDataResponse = computed(() => ({
  total: rows.value.length,
  pageSize: rows.value.length || 10,
  page: 1,
}));

const tableRows = computed(() =>
  rows.value.map((item) => ({
    ...item,
    tipoLabel: item.tipo === "institucional" ? "Institucional" : "Externo",
    nombre: rowNombre(item),
    detalle: rowDetalle(item),
    fecha: item.fecha || "-",
    evidencia: item.evidencia_nombre || "Sin evidencia",
  })),
);

const form = ref({
  tipo: "institucional" as "institucional" | "externo",
  area: "",
  capacitacion: "",
  nombre_taller: "",
  institucion: "",
  fecha: "",
  evidencia_nombre: "",
  evidencia_url: "",
});

const inputEvidencia = ref<HTMLInputElement | null>(null);

const areaOptions = [
  "Voluntariado",
  "Socorros",
  "Capacitacion",
  "Juventud",
  "Administracion",
];

watch(
  () => props.data,
  (val) => {
    const source = val?.formaciones;
    if (Array.isArray(source)) {
      rows.value = source.map((item: any, index: number) => ({
        id: String(item.id || `${Date.now()}-${index}`),
        tipo: item.tipo === "externo" ? "externo" : "institucional",
        area: item.area || "",
        capacitacion: item.capacitacion || "",
        nombre_taller: item.nombre_taller || "",
        institucion: item.institucion || "",
        fecha: item.fecha || "",
        evidencia_nombre: item.evidencia_nombre || "",
        evidencia_url: item.evidencia_url || "",
      }));
    }
  },
  { immediate: true, deep: true },
);

const formValid = computed(() => {
  if (!form.value.fecha || !form.value.evidencia_url) return false;

  if (form.value.tipo === "institucional") {
    return !!form.value.area && !!form.value.capacitacion;
  }

  return !!form.value.nombre_taller && !!form.value.institucion;
});

function openAddModal() {
  resetForm();
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function resetForm() {
  form.value = {
    tipo: "institucional",
    area: "",
    capacitacion: "",
    nombre_taller: "",
    institucion: "",
    fecha: "",
    evidencia_nombre: "",
    evidencia_url: "",
  };
}

function openFilePicker() {
  inputEvidencia.value?.click();
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (form.value.evidencia_url?.startsWith("blob:")) {
    URL.revokeObjectURL(form.value.evidencia_url);
  }

  form.value.evidencia_nombre = file.name;
  form.value.evidencia_url = URL.createObjectURL(file);
  target.value = "";
}

function viewEvidence(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function handleTableAction({ action, item }: { action: string; item: any }) {
  if (action === "Eliminar") {
    removeRow(item.id);
    return;
  }

  if (action === "Seleccionar") {
    viewEvidence(item.evidencia_url);
  }
}

function submitFormacion() {
  if (!formValid.value) return;

  const item: FormacionRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tipo: form.value.tipo,
    area: form.value.tipo === "institucional" ? form.value.area : "",
    capacitacion:
      form.value.tipo === "institucional" ? form.value.capacitacion : "",
    nombre_taller:
      form.value.tipo === "externo" ? form.value.nombre_taller : "",
    institucion: form.value.tipo === "externo" ? form.value.institucion : "",
    fecha: form.value.fecha,
    evidencia_nombre: form.value.evidencia_nombre,
    evidencia_url: form.value.evidencia_url,
  };

  rows.value = [item, ...rows.value];
  emit("update:data", { ...(props.data || {}), formaciones: rows.value });
  closeModal();
}

function removeRow(id: string) {
  const row = rows.value.find((item) => item.id === id);
  if (row?.evidencia_url?.startsWith("blob:")) {
    URL.revokeObjectURL(row.evidencia_url);
  }

  rows.value = rows.value.filter((item) => item.id !== id);
  emit("update:data", { ...(props.data || {}), formaciones: rows.value });
}

function rowNombre(item: FormacionRecord): string {
  return item.tipo === "institucional"
    ? item.capacitacion || "-"
    : item.nombre_taller || "-";
}

function rowDetalle(item: FormacionRecord): string {
  return item.tipo === "institucional"
    ? item.area || "-"
    : item.institucion || "-";
}
function handleAddIncidente() {
  moodAdd.value = true;
}
</script>
<!-- prettier-ignore -->
<template>
  <div class="formacion-root">
    <!-- Vista Uno -->
    <div v-if="!moodAdd">
      <section class="formacion-section">
        <header class="formacion-header">
          <div class="formacion-title-wrap">
            <i class="fa-solid fa-graduation-cap formacion-icon" aria-hidden="true" />
            <h3 class="formacion-title">Formacion</h3>
          </div>

          <VBtn
            size="small"
            color="white"
            variant="flat"
            title="Agregar formacion"
            @click="handleAddIncidente"
          >
            <i class="fa-solid fa-plus" aria-hidden="true" />
          </VBtn>
        </header>

        <div class="formacion-body">
          <DataTable
            :headers="tableHeaders"
            :data="tableRows"
            :dataResponse="tableDataResponse"
            :config="tableConfig"
            @action="handleTableAction"
          />
        </div>
      </section>
    </div>
    <NuevoRegistroHistorico v-else :data="props.data"/>
  </div>
</template>

<style scoped>
.formacion-root {
  display: grid;
  gap: 0.85rem;
}

.formacion-section {
  border: 1px solid #e4e8ef;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.formacion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.45rem 0.7rem;
  background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%);
}

.formacion-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.formacion-icon {
  color: #fff;
  font-size: 0.95rem;
}

.formacion-title {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
  color: #fff;
}

.formacion-body {
  padding: 0.45rem 0.6rem 0.6rem;
}

.modal-title {
  font-weight: 700;
}

.modal-grid {
  display: grid;
  gap: 0.65rem;
}

.evidencia-field {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.evidencia-name {
  color: #64748b;
  font-size: 0.8rem;
}

.hidden-input {
  display: none;
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
</style>
