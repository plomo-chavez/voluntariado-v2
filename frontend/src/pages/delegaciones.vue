<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import ManagerDelegaciones from "@/components/managers/ManagerDelegaciones.vue";
// prettier-ignore
const formSchema = [
  { label: "Numero de delegacion",  type: "text",   model: "numDelegacion"},
  { label: "Nombre",                type: "text",   model: "label"},
  { label: "Estado",                type: "select", model: "estado", catalogo: "estados" },
  { label: "Municipio",             type: "select", model: "municipio", catalogo: "municipios",  dependencia: "estado", dependenciaFiltro: "estado_id", },
  { label: "Estatus",               type: "switch", model: "estatus" },
];

// prettier-ignore
const tableHeaders = [
  { title: "ID",            key: "id" },
  { title: "# Delegación",  key: "numDelegacion", classItem: " spanItem " },
  { title: "Label",         key: "label" },
  { title: "Estatus",       key: "estatus", format:'formatEstatus' },
  { title: "Estado",        key: "estado.label" },
  { title: "Municipio",     key: "municipio.label" },
  { title: "Creación",      key: "created_at" },
];

const showForm = ref<boolean>(false); // Referencia al componente FormFactory
const dataForm = ref<any>(true); // Referencia al componente FormFactory

// prettier-ignore
const apiEndpoints = {
  fetch:  "/api/delegaciones", // Endpoint para obtener datos
  create: "/api/delegacion", // Endpoint para crear un elemento
  update: "/api/delegacion", // Endpoint para actualizar un elemento
  delete: "/api/delegacion/eliminar", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  let tmp = deepToRaw(dataRow);
  dataForm.value = tmp;
  showForm.value = true;
};
</script>

<template>
  <CrudManager
    v-if="!showForm"
    title="Delegaciones"
    :formModal="true"
    :emitEdit="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    @customEdit="handleActionsEdit"
    :apiEndpoints="apiEndpoints"
  />
  <ManagerDelegaciones v-else :data="dataForm" @cancelar="showForm = false" />
</template>
