<script lang="ts" setup>
import Autoridades from "@/components/managers/ManagerDelegacionesAutoridades.vue";
import { ref } from "vue";

const currentTab = ref("item1");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const dataContrasenia = ref({});

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
    title?: string | null;
    isChild?: boolean;
  }>(),{
    isChild: false,
    title: null,
  });

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();

// prettier-ignore
const formSchema = [
  { label: "# delegación",  type: "text",   model: "numDelegacion", placeholder: "Ingresa el número de delegación",},
  { label: "Nombre",        type: "text",   model: "label",         placeholder: "Ingresa el nombre",},
  { label: "Estado",        type: "select", model: "estado",        catalogo: "estados" },
  { label: "Municipio",     type: "select", model: "municipio",     catalogo: "municipios", dependencia: "estado", dependenciaFiltro: "estado_id",},
  { label: "Estatus",       type: "switch", model: "estatus" },
];
// prettier-ignore
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };
// prettier-ignore
const handleBack = () => { emit("cancelar"); };

const handleFormSubmit = async (formData: any) => {
  await apiRequest({
    url: "/api/delegacion",
    payload: formData,
    messageType: "toast",
    onSuccess: handleEditForm,
  });
};

const handleSuccessFormSubmit = () => {
  handleEditForm();
};
</script>

<template>
  <div class="d-flex justify-start align-center mb-2">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleBack"
    />
    <h2 class="ml-4">Delegaciones</h2>
  </div>
  <VCard>
    <VTabs v-model="currentTab">
      <VTab>Informacion general</VTab>
      <VTab>Autoridades</VTab>
    </VTabs>

    <VCardText>
      <VWindow v-model="currentTab">
        <VWindowItem :value="`item1`">
          <ModuladorFormFactory
            :title="null"
            :isDialogVisible="false"
            :schema="formSchema"
            :showTitle="false"
            :isDisabled="formDisabled"
            :showButtonsAction="!formDisabled"
            :modelValue="props.data"
            @cancel="formDisabled = true"
            @submit="handleFormSubmit"
          />

          <div v-if="formDisabled" class="d-flex justify-end gap-3 mt-4">
            <VBtn color="warning" @click="handleEditForm">
              <VIcon start icon="tabler-edit" />
              Editar
            </VBtn>
          </div>
          <!-- @submit="handleFormSubmit" -->
        </VWindowItem>
        <VWindowItem :value="`item2`">
          <Autoridades :delegacion="props.data" />
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
