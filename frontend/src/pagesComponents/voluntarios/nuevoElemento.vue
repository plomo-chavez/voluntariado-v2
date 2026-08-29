<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";

interface CatalogItem {
  id: string | number;
  label: string;
}

interface NuevoElementoPayload {
  curp: string;
  nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  estado?: any;
  delegacion?: any;
  area?: any;
}

const props = withDefaults(
  defineProps<{
    isDialogVisible: boolean;
    isPublic?: boolean;
    existingCurps?: string[];
    estados?: CatalogItem[];
    delegaciones?: CatalogItem[];
    areas?: CatalogItem[];
  }>(),
  {
    existingCurps: () => [],
    estados: () => [],
    delegaciones: () => [],
    areas: () => [],
    isPublic: false,
  },
);

const inputDisableEstado: any = ref(false);
const inputDisableDelegacion: any = ref(false);

const emit = defineEmits<{
  (e: "update:isDialogVisible", value: boolean): void;
  (e: "submit", payload: NuevoElementoPayload): void;
}>();

const step = ref<1 | 2>(1);
const messageValidacion: any = ref(null);

const form = ref<NuevoElementoPayload>({
  curp: "",
  nombre: "",
  segundo_nombre: "",
  primer_apellido: "",
  segundo_apellido: "",
  correo: "",
  telefono: "",
  estado: null,
  delegacion: null,
  area: null,
});

const curpSchema = [
  {
    label: "CURP",
    validated: "curp",
    classElement: " col-12 ",
    type: "text",
    model: "curp",
  },
];

const formSchema: any = [
  {
    type: "text",
    label: "Nombre",
    validated: "onlyLetters",
    model: "nombre",
    required: true,
  },
  {
    type: "text",
    label: "Segundo nombre",
    validated: "onlyLetters",
    model: "segundo_nombre",
  },
  {
    type: "text",
    label: "Primer apellido",
    validated: "onlyLetters",
    model: "primer_apellido",
    required: true,
  },
  {
    type: "text",
    label: "Segundo apellido",
    validated: "onlyLetters",
    model: "segundo_apellido",
  },
  {
    type: "text",
    label: "Correo",
    validated: "correo",
    model: "correo",
    required: true,
  },
  {
    type: "text",
    label: "Teléfono",
    validated: "telefono",
    model: "telefono",
    required: true,
  },
  {
    type: "select",
    required: true,
    label: "Estado",
    public: props.isPublic,
    disabled: inputDisableEstado.value,
    model: "estado",
    classElement: " col-4 ",
    catalogo: "estados",
  },
  {
    type: "select",
    required: true,
    label: "Delegación",
    disabled: inputDisableDelegacion.value,
    public: props.isPublic,
    model: "delegacion",
    dependenciaQuery: "estado",
    dependenciaQueryFiltro: "estado_id",
    catalogo: "delegaciones",
    classElement: " col-4 ",
    config: {
      fullInfo: true,
    },
  },
  {
    type: "select",
    label: "Área",
    public: true,
    model: "area",
    catalogo: "areas",
  },
];

const resetModal = () => {
  step.value = 1;
  form.value = {
    curp: "",
    nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo: "",
    telefono: "",
    estado: null,
    delegacion: null,
    area: null,
  };
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
  resetModal();
};
const handleCancel = () => {
  step.value = 1;
};

// prettier-ignore
const validarInBDCURP = async () => {
  try {
    const curp = form.value?.curp?.trim() ?? "";

    if (!curp) { return;}

    await apiRequest({
      url: "/api/public/elemento/verificar",
      method: "POST",
      payload: { curp },
      loader: true,
      showMessages: false,
      onSuccess: (response: any) => {
        messageValidacion.value = response;
        if (response) {
          showErrorMessage({
            title: "CURP existente",
            message: "Esta CURP ya está registrada.",
          });

          return;
        }
        step.value = 2;
      },
    });
  } catch (error) {
    console.error("Error al validar CURP en BDC:", error);
  }
};

const submitForm = async () => {
  let payload = {
    ...form.value,
  };

  await apiRequest({
    url: "/api/public/elemento",
    payload,
    onSuccess: () => {
      handleClose();
    },
  });
};

const handleFormUpdate = async (value: Record<string, any>) => {
  form.value = {
    ...form.value,
    ...value,
  };
};

// prettier-ignore
onBeforeMount(() => {
  if(!props.isPublic){
    const getDataDelegacionInfo = getDataDelegacion();

    form.value = { ...form.value, ...getDataDelegacionInfo };

    if (getDataDelegacionInfo.estado !== undefined) {
      formSchema.find((item: any) => item.model === "estado")!.disabled = true;
    }

    if (getDataDelegacionInfo.delegacion !== undefined) {
      formSchema.find((item: any) => item.model === "delegacion")!.disabled = true;
    }
  }
});
</script>

<!-- prettier-ignore -->
<template>
  <VCard v-if="props.isDialogVisible" class="mt-4">
    <VCardTitle class="d-flex justify-space-between align-center py-4 px-6">
      <span class="text-h5">Nuevo voluntario</span>
      <VChip size="small" color="primary" variant="tonal">
        Paso {{ step }} de 2
      </VChip>
    </VCardTitle>

    <VDivider />

    <VCardText class="pt-6">
      <VWindow v-model="step">
        <VWindowItem :value="1">
          <p class="text-body-1 mb-4">Primero valida la CURP antes de capturar datos del voluntario.</p>
          <ModuladorFormFactory
            :schema="curpSchema"
            :modelValue="form"
            :showMessageRequired="false"
            :formRequired="true"
            :showIconButtonCancel="false"
            :showIconButtonSubmit="false"
            :variantButtonCancel="'tonal'"
            :variantButtonSubmit="'tonal'"
            :colorButtonCancel="'secondary'"
            :colorButtonSubmit="'primary'"
            :buttonAlignmentBetween="'between'"
            :textButtonCancel="'Cancelar'"
            :textButtonSubmit="'Validar CURP'"
            @submit="validarInBDCURP"
          />
          <p v-if="messageValidacion" class="text-body-1 mb-4 text-center text-danger font-weight-medium">
            Esta CURP ya esta registrada, comunicate con tu coordinador 
          </p>
        </VWindowItem>

        <VWindowItem :value="2">
          <ModuladorFormFactory
            :schema="formSchema"
            :modelValue="form"
            :showMessageRequired="false"
            :formRequired="true"
            :showIconButtonCancel="false"
            :showIconButtonSubmit="false"
            :variantButtonCancel="'tonal'"
            :variantButtonSubmit="'tonal'"
            :colorButtonCancel="'secondary'"
            :colorButtonSubmit="'primary'"
            :buttonAlignmentBetween="'between'"
            :textButtonCancel="'Atras'"
            :textButtonSubmit="'Registrar elemento'"
            @update:modelValue="handleFormUpdate"
            @submit="submitForm"
            @cancel="handleCancel"
            />
            <!-- :showButtonsAction="false" -->
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
