<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

// prettier-ignore
const formSchema = [
  { label: "Estado",              type: "select", model: "estado",      catalogo: "estados",           },
  { label: "Nombre", type: "text", model: "label", placeholder: "Ingresa el nombre" },
  { label: "Estatus", type: "switch", model: "estatus" },
];

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Estado", key: "estado.label" },
  { title: "Nombre", key: "label" },
  { title: "Estatus", key: "estatus" },
  { title: "Creación", key: "created_at" },
];

// prettier-ignore
const apiEndpoints = {
  create: "/api/catalogo/delegacion",
  update: "/api/catalogo/delegacion",
  fetch:  "/api/catalogo/delegacion/get",
  delete: "/api/catalogo/delegacion/eliminar",
};
</script>

<template>
  <CrudManager
    title="Catálogo de delegaciones"
    :formModal="true"
    :estatusDefault="true"
    :softDelete="true"
    :formSchema="formSchema"
    :tableHeaders="tableHeaders"
    :apiEndpoints="apiEndpoints"
  />
</template>
