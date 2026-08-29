<script lang="ts" setup>
import CrudManager from "@/components/apps/VistaUno.vue";
import NuevoRegistroHistorico from "@/pagesComponents/elementos/NuevoRegistroHistorico.vue";
import { openResource } from "@/utils/fileHelper";
import { ref } from "vue";

const props = defineProps<{
  data?: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const moodAdd = ref(false);
const payloadHistorico: any = ref({
  id_voluntario: props.data?.id ?? null,
});

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/elemento/historico", // Endpoint para obtener datos
  create: "/api/elemento", // Endpoint para crear un elemento
  update: "/api/elemento", // Endpoint para actualizar un elemento
  delete: "/api/elemento/eliminar", // Endpoint para eliminar un elemento
};

const configTable = ref({ actions: ["Seleccionar"] });

const tableHeaders = [
  { title: "#", key: "id_documento" },
  { title: "Documento", key: "tipoDocumento.label" },
  { title: "Área", key: "area.label" },
  { title: "Referencia", key: "referencia_documento" },
  { title: "Registro", key: "created_at" },
];
function handleAddIncidente() {
  moodAdd.value = true;
}

function handleCancelar() {
  moodAdd.value = false;
}

function handleActionsSelecionar(dataRow: any) {
  dataRow = deepToRaw(dataRow);
  viewEvidence(dataRow);
}

function viewEvidence(item: any) {
  if (!item.ruta_archivo) return;
  openResource(item.ruta_archivo);
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
          <!-- <DataTable
            :headers="tableHeaders"
            :data="tableRows"
            :dataResponse="tableDataResponse"
            :config="tableConfig"
            @action="handleTableAction"
          /> -->

          <CrudManager
          :emitNew="true"
          title="Elementos"
          :payloadDefault="payloadHistorico"
          :softDelete="false"
          :show-title="false"
          :showBtnNuevo="false"
          :showStyleCard="false"
          :emitSeleccionar="true"
          :tableHeaders="tableHeaders"
          :apiEndpoints="apiEndpoints"
          :configTable="configTable"
          @customSeleccionar="handleActionsSelecionar"
          />
        </div>
      </section>
    </div>
    <NuevoRegistroHistorico v-else :data="props.data" @cancelar="handleCancelar"/>
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
