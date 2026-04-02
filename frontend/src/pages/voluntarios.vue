<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import ManagerElementos from "@/components/managers/ManagerElementos.vue";
import nuevoElemento from "@/pagesComponents/voluntarios/nuevoElemento.vue";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data: any = ref(null); // Referencia al componente FormFactory
const showNuevoElementoModal = ref(false);

// prettier-ignore
const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Nombre", key: "nombre" },
  { title: "Tipo", key: "tipo.label" },
  { title: "Estatus", key: "estatus", format: (value : any) => (value === 1 ? "Activo" : "Inactivo"), },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/usuarios", // Endpoint para obtener datos
  create: "/api/usuario", // Endpoint para crear un elemento
  update: "/api/usuarios", // Endpoint para actualizar un elemento
  delete: "/api/usuario/eliminar", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  showFormEdit.value = true;
};

const handleActionsCreate = () => {
  showNuevoElementoModal.value = true;
};

const handleCancelar = () => {
  showFormEdit.value = false;
};

const handleSubmitNuevoElemento = (payload: any) => {
  console.log("Nuevo voluntario (visual):", payload);
  showNuevoElementoModal.value = false;
};

const configTable = ref({ actions: ["Editar", "Eliminar"] });
</script>

<template>
  <!-- prettier-ignore -->
  <ManagerElementos v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <div v-else>
    <h1>Voluntarios</h1>

    <nuevoElemento
      v-if="showNuevoElementoModal"
      :isDialogVisible="showNuevoElementoModal"
      @update:isDialogVisible="showNuevoElementoModal = $event"
      @submit="handleSubmitNuevoElemento"
    />

    <CrudManager
      v-else
      title="Voluntarios"
      :emitEdit="true"
      :formModal="true"
      :softDelete="true"
      :show-title="false"
      :emitNew="true"
      :filtroAgrupador="'tipo.label'"
      :filtroAgrupadorInicial="'Agente'"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      :configTable="configTable"
      @customCreate="handleActionsCreate"
      @customEdit="handleActionsEdit"
    />
  </div>
</template>
