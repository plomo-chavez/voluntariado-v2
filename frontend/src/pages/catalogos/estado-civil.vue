<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

// prettier-ignore
const formSchema = [
  { label: "Label", type: "text", model: "label", placeholder: "Ingresa el label" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Label", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  create: "/api/catalogo/estado-civil",
  update: "/api/catalogo/estado-civil",
  fetch:  "/api/catalogo/estado-civil/get",
  delete: "/api/catalogo/estado-civil/eliminar",
};
</script>

<template>
  <CrudManager
    title="Catálogo de estado civil"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
