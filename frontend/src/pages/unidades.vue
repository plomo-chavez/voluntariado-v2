<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import { handleFormatStatus } from "@/utils/formatterHelper";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data: any = ref(null); // Referencia al componente FormFactory

// prettier-ignore
const tableHeaders = [
  { title: "ID",      key: "id" },
  { title: "Numero",  key: "numero" },
  { title: "Marca",   key: "marca" },
  { title: "Serie",   key: "serie" },
  { title: "Modelo",  key: "modelo" },
  { title: "Estatus", key: "estatus", format: (value : any) => handleFormatStatus(value) },
  { title: "Creación",key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/unidades", // Endpoint para obtener datos
  create: "/api/unidad", // Endpoint para crear un elemento
  update: "/api/unidad", // Endpoint para actualizar un elemento
  delete: "/api/unidad/eliminar", // Endpoint para eliminar un elemento
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
  <ManagerUnidades v-if="showFormEdit" :data="data" @cancelar="handleCancelar" />
  <div v-else>
    <h1>Unidades</h1>
    <CrudManager
      title="Unidades"
      :emitEdit="true"
      :formModal="true"
      :softDelete="true"
      :show-title="false"
      :emitNew="true"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      :configTable="configTable"
      @customCreate="handleActionsCreate"
      @customEdit="handleActionsEdit"
    />
  </div>
</template>
