<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
// prettier-ignore
const formSchema = [
  { label: "Nombre", type: "text", model: "label", placeholder: "Ingresa el nombre" },
  { label: "Estado", type: "select", model: "estado", catalogo: "estados" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Label", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Estado", key: "estado.label" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  create: "/api/catalogo/municipios", // Endpoint para crear un elemento
  update: "/api/catalogo/municipios", // Endpoint para actualizar un elemento
  fetch:  "/api/catalogo/municipios/get", // Endpoint para obtener datos
  delete: "/api/catalogo/municipios/eliminar", // Endpoint para eliminar un elemento
};
</script>

<template>
  <CrudManager
    title="Municipios"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
