<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";
import ManagerWizardVoluntario from "@/components/managers/ManagerWizardVoluntario.vue";
import ElementoPendiente from "@/pagesComponents/elementos/ElementoPendiente.vue";
import nuevoElemento from "@/pagesComponents/voluntarios/nuevoElemento.vue";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data: any = ref(null); // Referencia al componente FormFactory
const showFormNew = ref(false);

// prettier-ignore
const tableHeaders = [
  { title: "No.Asociado", key: "numero_asociado" },
  { title: "Nombre", key: "nombre", format: (value : any, row : any) => {  return nombreCompleto(row); }, },
  { title: "Cargo", key: "cargo.label" },
  { title: "Estado", key: "estado.label" },
  { title: "Delegación", key: "delegacion.label"},
  { title: "Estatus", key: "estatus", format: (value : any) => (value === 1 ? "Activo" : "Inactivo"), },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/elementos", // Endpoint para obtener datos
  create: "/api/elemento", // Endpoint para crear un elemento
  update: "/api/elemento", // Endpoint para actualizar un elemento
  delete: "/api/elemento/eliminar", // Endpoint para eliminar un elemento
};

const handleActionsEdit = (dataRow: any) => {
  data.value = { ...dataRow };
  showFormNew.value = false;
  showFormEdit.value = true;
};

const handleActionsCreate = () => {
  showFormEdit.value = false;
  showFormNew.value = true;
};

const handleCancelar = () => {
  showFormEdit.value = false;
};

const handleSubmitNuevoElemento = (payload: any) => {
  console.log("Nuevo elemento (visual):", payload);
  showFormNew.value = false;
};

// estatusRegistro
// 0 - Pendiente de revisión
// 1 - Activo
// prettier-ignore
const fnRowClass = (row: any) => {
  let { item } = row;
  item = deepToRaw(item)
  let classEstatus = "";

  switch (item.estatusRegistro) {
    case 0: classEstatus = ' bgPrimaryTonalLight '; break; // Pendiente
  }

  return { class: classEstatus };
};

const configTable = ref({ actions: ["Editar", "Eliminar"] });
</script>

<template>
  <!-- prettier-ignore -->
  <template v-if="showFormEdit" >
    <ElementoPendiente       v-if="data.estatusRegistro == 0" :data="data" @cancelar="handleCancelar" />
    <ManagerWizardVoluntario v-if="data.estatusRegistro == 1" :data="data" @back="handleCancelar" />
   </template>

  <nuevoElemento
    v-else-if="showFormNew"
    :isDialogVisible="showFormNew"
    @update:isDialogVisible="showFormNew = $event"
    @submit="handleSubmitNuevoElemento"
  />

  <div v-else>
    <h1>Elementos</h1>
    <CrudManager
      :fnRowClass="fnRowClass"
      title="Elementos"
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
