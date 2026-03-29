<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id_grupo_sanguineo" },
  { title: "Nombre", key: "nombre" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  create: "/api/catalogo/grupo-sanguineo",
  update: "/api/catalogo/grupo-sanguineo",
  fetch:  "/api/catalogo/grupo-sanguineo/get",
  delete: "/api/catalogo/grupo-sanguineo/eliminar",
};
</script>

<template>
  <CrudManager
    title="Catálogo de grupos sanguíneos"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
