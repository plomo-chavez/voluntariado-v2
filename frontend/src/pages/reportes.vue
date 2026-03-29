<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import Wizard from "@/pagesComponents/reportes/WizardReportes.vue";

const showWizard = ref(false); // Referencia al componente FormFactory
const showFormEdit = ref(false); // Referencia al componente FormFactory
const dataLocal: any = ref(null); // Referencia al componente FormFactory

const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Tipo", key: "tipo" },
  { title: "Estado", key: "estado.label" },
  { title: "Municipio", key: "municipio.label" },
  { title: "Delegacion", key: "delegacion.label" },
  { title: "Estatus", key: "estatus" },
  { title: "Registrado", key: "userCreate.nombre" },
  { title: "Creación", key: "created_at" },
  { title: "Últ. Modificación", key: "updated_at" },
];

const apiEndpoints = {
  fetch: "/api/reportes/get", // Endpoint para obtener datos
  delete: "/api/reportes/eliminar", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  let tmp = deepToRaw(dataRow);

  dataLocal.value = tmp;
  console.log("dataLocal.value", tmp);
  showWizard.value = true;
};

const handleActionsCreate = () => {
  dataLocal.value = null; // Reiniciar dataLocal para crear una nueva cotización
  showWizard.value = true;
};
const handleActionsCancel = () => {
  showWizard.value = false;
  showFormEdit.value = false;
};
</script>

<template>
  <div v-if="showWizard">
    <Wizard @cancelar="handleActionsCancel" :data="dataLocal" />
  </div>
  <div v-if="!showWizard && !showFormEdit">
    <CrudManager
      title="Reportes "
      :softDelete="true"
      :formModal="true"
      :show-title="true"
      :emitEdit="true"
      :emitNew="true"
      :seleccionar="true"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      @customEdit="handleActionsEdit"
      @customCreate="handleActionsCreate"
    />
  </div>
</template>
