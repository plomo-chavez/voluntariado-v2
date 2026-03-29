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
  create: "/api/catalogo/tipos-solicitante", // Endpoint para crear un elemento
  update: "/api/catalogo/tipos-solicitante", // Endpoint para actualizar un elemento
  fetch:  "/api/catalogo/tipos-solicitante/get", // Endpoint para obtener datos
  delete: "/api/catalogo/tipos-solicitante/eliminar", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Tipos de solicitante"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
