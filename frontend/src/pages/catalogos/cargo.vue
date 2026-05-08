<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "label" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id_cargo" },
  { title: "Nombre", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  create: "/api/catalogo/cargo",
  update: "/api/catalogo/cargo",
  fetch: "/api/catalogo/cargo/get",
  delete: "/api/catalogo/cargo/eliminar",
};
</script>

<template>
  <CrudManager
    title="Catálogo de cargos"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
