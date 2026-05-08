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
  create: "/api/catalogo/nacionalidad",
  update: "/api/catalogo/nacionalidad",
  fetch:  "/api/catalogo/nacionalidad/get",
  delete: "/api/catalogo/nacionalidad/eliminar",
};
</script>

<template>
  <CrudManager
    title="Catálogo de nacionalidades"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
