<script lang="ts" setup>
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { nombreCompleto } from "@/utils/formatterHelper";

const currentTab = ref("item1");
const title = ref("Nuevo registro de usuario");
const modalContrasenia = ref(false);
const formDisabled = ref(true);
const showSecciontionDelegacion: any = ref(false);
const dataContrasenia = ref({});
const formData: any = ref({});

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
  { label: "CURP",              type: "text",   model: "curp",      },
  { label: "Numero de asociado",type: "text",   model: "numeroAsociado",      },
  { label: "Nombre",            type: "text",   model: "nombre",      },
  { label: "Segundo Nombre",    type: "text",   model: "segundoNombre",      },
  { label: "Primer apellido",   type: "text",   model: "primerApellido",      },
  { label: "Segundo apellido",  type: "text",   model: "segundoApellido",      },
  { label: "Estado",            type: "select", model: "estado",      catalogo: "estados",           },
  { label: "Municipio",         type: "select", model: "municipio",  catalogo: "municipios", dependencia: "estado", dependenciaFiltro: "estado_id",},
  { label: "Delegación",        type: "select", model: "delegacion", catalogo: "delegaciones", dependencia: "municipio", dependenciaFiltro: "municipio_id", config: { fullInfo: true },},
  { label: "Estatus",           type: "switch", model: "estatus" },
];

const handleFormSubmit = async (data: any) => {
  await apiRequest({
    url: "/api/elemento",
    payload: deepToRaw(formData.value),
    messageType: "toast",
    onSuccess: () => {
      emit("cancelar");
    },
  });
};

// prettier-ignore
const handleBack = () => { emit("cancelar"); };

onBeforeMount(() => {
  const isNewRecord = !props.data.id;
  if (!isNewRecord) {
    formData.value = {
      ...props.data,
    };
  }

  title.value = props?.data?.nombre
    ? nombreCompleto(props.data)
    : "Nuevo registro de elemento";
});
</script>

<template>
  <div class="d-flex justify-start align-center mb-5">
    <VBtn
      icon="tabler-arrow-left"
      class="cursor-pointer"
      variant="text"
      color="secondary"
      @click="handleBack"
    />
    <h1 class="ml-4">{{ title }}</h1>
  </div>
  <VCard>
    <VCardText>
      <ModuladorFormFactory
        :title="null"
        :isDialogVisible="false"
        :schema="formSchema"
        :showTitle="false"
        :modelValue="formData"
        :formLive="true"
        @submit="handleFormSubmit"
        @cancel="handleBack"
      />
    </VCardText>
  </VCard>
</template>
