<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "label", placeholder: "Ingresa el nombre" },
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
  create: "/api/catalogo/areas", // Endpoint para crear un elemento
  update: "/api/catalogo/areas", // Endpoint para actualizar un elemento
  fetch:  "/api/catalogo/areas/get", // Endpoint para obtener datos
  delete: "/api/catalogo/areas/eliminar", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Areas"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
