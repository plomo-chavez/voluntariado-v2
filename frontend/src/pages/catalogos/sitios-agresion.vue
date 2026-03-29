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
  create: "/api/catalogo/sitios-agresion", // Endpoint para crear un elemento
  update: "/api/catalogo/sitios-agresion", // Endpoint para actualizar un elemento
  fetch:  "/api/catalogo/sitios-agresion/get", // Endpoint para obtener datos
  delete: "/api/catalogo/sitios-agresion/eliminar", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Sitios de agresión"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
