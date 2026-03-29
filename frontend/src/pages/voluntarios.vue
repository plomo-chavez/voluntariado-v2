<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import ManagerUsuario from "@/components/managers/ManagerUsuario.vue";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data: any = ref(null); // Referencia al componente FormFactory

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
  data.value = {};
  showFormEdit.value = true;
};

const handleCancelar = () => {
  showFormEdit.value = false;
};

const configTable = ref({ actions: ["Editar", "Eliminar"] });
</script>

<template>
  <!-- prettier-ignore -->
  <ManagerUsuario v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <div v-else>
    <h1>Usuarios</h1>
    <CrudManager
      title="Usuarios"
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
