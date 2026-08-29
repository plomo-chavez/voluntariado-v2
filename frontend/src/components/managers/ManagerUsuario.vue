<script lang="ts" setup>
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";

const currentTab = ref("item1");
const title = ref("Nuevo registro de usuario");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const showSecciontionDelegacion: any = ref(false);
const dataContrasenia = ref({});
const formData: any = ref({});
const formInicial: any = ref(true);

// prettier-ignore
const props = withDefaults(
  defineProps<{
    data: any;
  }>(),{});

const emit = defineEmits<{
  (event: "cancelar"): void;
}>();
// prettier-ignore
let formSchema : any = [
  { label: "Nombre",              type: "text",   model: "nombre",      placeholder: "Ingresa el nombre" },
  { label: "Correo electronico",  type: "text",   model: "correo",      placeholder: "Ingresa el nombre" },
  { label: "Tipo de usuario",     type: "select", model: "tipo", catalogo: "tipos-usuarios",   placeholder: "Selecciona el tipo de usuario"},
  { label: "Estatus",             type: "switch", model: "estatus" },
];
// prettier-ignore
let formSchemaDelegacion : any = [];

// prettier-ignore
let formSchemaEstado : any = [
  { label: "Estado",              type: "select", model: "estado",      catalogo: "estados",           },
];
// prettier-ignore
const formSchemaContrasenia : any = [
  { label: "Nombre",              type: "text", model: "nombre",   placeholder: "Ingresa el nombre", disabled:true},
  { label: "Tipo de usuario",     type: "text", model: "tipo",     placeholder: "Ingresa el nombre", disabled:true},
  { label: "Correo electronico",  type: "text", model: "correo",   placeholder: "Ingresa el nombre", disabled:true},
  { label: "Contraseña",          type: "text", model: "password", placeholder: "Ingresa el nombre" },
];

const handleShowModalContrasenia = () => {
  dataContrasenia.value = {
    ...props.data,
    tipo: props.data.tipo.label,
    password: "",
  };
  modalContrasenia.value = true;
};

const handleUpdateForm = (newValue: any) => {
  let newValueRaw = deepToRaw(newValue);
  const isDiferente = formInicial.value
    ? true
    : formData?.value?.tipo?.id !== newValueRaw?.tipo?.id;
  formData.value = newValueRaw;
  if (isDiferente) {
    handleChangeForm();
    formInicial.value = false;
  }
  handle();
};

const handleUpdateFormDelegacion = (newValue: any) => {
  let newValueRaw = deepToRaw(newValue);
  formData.value = {
    ...formData.value,
    ...newValueRaw,
  };
};
// prettier-ignore
const handleEditForm = () => { formDisabled.value = !formDisabled.value; };

const handleCancelar = () => {
  if (props.data.id) {
    formDisabled.value = true;
  } else {
    emit("cancelar");
  }
};

const handle = () => {
  const payload = deepToRaw(formData.value);

  // Eliminar `estado` si el tipo NO requiere estado (tipos <= 4)
  if ((payload.tipo?.id ?? 0) <= 4) {
    payload.estado_id = null;
    delete payload.estado;
  }

  // Eliminar `delegacion` si el tipo NO requiere delegación (tipos <= 6)
  if ((payload.tipo?.id ?? 0) <= 6) {
    payload.delegacion_id = null;
    delete payload.delegacion;
  }

  formData.value = payload;
};

// prettier-ignore
const handleFormSubmit = async (data: any) => {
  const payload = deepToRaw(formData.value);
  
  await apiRequest({
    onSuccess: () => { handleCancelar(); },
    messageType:"toast",
    url: "/api/usuario",
    loader:true,
    payload,
  });
};

// prettier-ignore
const handleFormSubmitChangePassword = async (data: any) => {
  let payload = {
    contrasenia: data.password,
    id: data.id,
  };
  await apiRequest({
    onSuccess: () => { handleCancelar(); },
    url: "/api/usuario/cambiar",
    messageType:"toast",
    loader:true,
    payload,
  });
};

// prettier-ignore
const handleBack = () => { emit("cancelar"); };

// prettier-ignore
const handleChangeForm = () => {
  showSecciontionDelegacion.value = false;

  if ((formData?.value?.tipo?.id ?? 0) > 4) {
    formSchemaDelegacion = [...formSchemaEstado]
    if ((formData?.value?.tipo?.id ?? 0) > 6) {
    formSchemaDelegacion.push({
      label: "Delegación",
      type: "select",
      model: "delegacion",
      catalogo: "delegaciones",
      dependenciaQuery: "estado",
      dependenciaQueryFiltro: "estado_id",
      config: { fullInfo: true },
    });
    }
      setTimeout(() => { showSecciontionDelegacion.value = true; }, 1);
  }
};

onBeforeMount(() => {
  const isNewRecord = !props.data.id;
  if (isNewRecord) {
    // Inserta la propiedad "Contraseña" entre "tipo" y "estatus"
    // prettier-ignore
    const index = formSchema.findIndex((field : any) => field.model === "estatus");
    formSchema.splice(index, 0, {
      label: "Contraseña",
      type: "text",
      model: "password",
      placeholder: "Ingresa el nombre",
    });

    formDisabled.value = false;
  } else {
    formData.value = {
      ...props.data,
    };
  }

  title.value = props?.data?.nombre ?? "Nuevo registro de usuario";
  handleChangeForm();
});
</script>

<template>
  <!-- prettier-ignore -->
  <div class="d-flex justify-start align-center mb-5">
    <VBtn icon="tabler-arrow-left" class="cursor-pointer" variant="text" color="secondary" @click="handleBack"/>
    <h1 class="ml-4">{{ title }}</h1>
  </div>

  <VCard>
    <VCardText>
      <ModuladorFormFactory
        :title="null"
        :isDialogVisible="false"
        :schema="formSchema"
        :showTitle="false"
        :isDisabled="formDisabled"
        :modelValue="formData"
        :formLive="true"
        @update:modelValue="handleUpdateForm"
        @cancel="formDisabled = true"
        :showButtonsAction="false"
      />
      <div v-if="showSecciontionDelegacion">
        <h3 class="ml-4">Información de la Delegación</h3>
        <ModuladorFormFactory
          :isDialogVisible="false"
          :schema="formSchemaDelegacion"
          :showTitle="false"
          :isDisabled="formDisabled"
          :modelValue="formData"
          :formLive="true"
          @update:modelValue="handleUpdateFormDelegacion"
          @cancel="formDisabled = true"
          :showButtonsAction="false"
        />
      </div>
      <ModuladorFormFactory
        :title="'Cambiar contraseña'"
        :isDialogVisible="modalContrasenia"
        :schema="formSchemaContrasenia"
        :showTitle="false"
        :formModal="true"
        :formLive="true"
        :modelValue="dataContrasenia"
        @update:isDialogVisible="modalContrasenia = false"
        @cancel="modalContrasenia = false"
        @submit="handleFormSubmitChangePassword"
      />

      <div v-if="formDisabled" class="d-flex justify-end gap-3 mt-4">
        <!-- prettier-ignore -->
        <VBtn color="secondary" @click="handleShowModalContrasenia">
              <VIcon start icon="tabler-key" />
              Cambiar contraseña
            </VBtn>

        <VBtn color="warning" @click="handleEditForm">
          <VIcon start icon="tabler-edit" />
          Editar
        </VBtn>
      </div>
      <div v-else class="d-flex justify-end gap-3 mt-4">
        <div>
          <VBtn variant="outlined" color="secondary" @click="handleCancelar">
            <VIcon start icon="tabler-x" />Cancelar
          </VBtn>
        </div>
        <VBtn @click="handleFormSubmit" color="success">
          <VIcon start icon="tabler-device-floppy" />
          Guardar
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
