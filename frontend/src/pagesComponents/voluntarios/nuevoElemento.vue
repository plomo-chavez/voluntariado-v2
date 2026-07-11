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
  },
);

const emit = defineEmits<{
  (e: "update:isDialogVisible", value: boolean): void;
  (e: "submit", payload: NuevoElementoPayload): void;
}>();

const step = ref<1 | 2>(1);

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
    classElement: " col-12 ",
    type: "text",
    model: "curp",
    required: true,
  },
];

const formSchema = [
  { label: "Nombre", type: "text", model: "nombre", required: true },
  {
    label: "Segundo nombre",
    type: "text",
    model: "segundo_nombre",
  },
  {
    label: "Primer apellido",
    type: "text",
    model: "primer_apellido",
    required: true,
  },
  {
    label: "Segundo apellido",
    type: "text",
    model: "segundo_apellido",
  },
  {
    label: "Correo",
    type: "text",
    model: "correo",
    required: true,
  },
  {
    label: "Teléfono",
    type: "text",
    model: "telefono",
    required: true,
  },
  {
    required: true,
    label: "Estado",
    type: "select",
    public: true,
    model: "estado",
    classElement: " col-4 ",
    catalogo: "estados",
  },
  {
    required: true,
    label: "Delegación",
    public: true,
    type: "select",
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
    label: "Área",
    type: "select",
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

const validarInBDCURP = async (curp: string): Promise<boolean> => {
  try {
    let isValid = true;
    await apiRequest({
      url: "/api/elemento/verificar",
      payload: { curp },
      showMessages: false,
      onSuccess: (response: any) => {
        console.log("CURP no encontrada en BDC, se puede usar.", !response);
        isValid = !response;
      },
      onError: () => {
        isValid = true;
      },
    });

    return isValid;
  } catch (error) {
    console.error("Error al validar CURP en BDC:", error);
    return false;
  }
};

const validateCurpAndContinue = async () => {
  const curp = (form.value.curp || "").trim().toUpperCase();
  form.value.curp = curp;

  if (!curp) {
    showErrorMessage({
      title: "CURP requerida",
      message: "Ingresa una CURP para continuar.",
    });
    return;
  }

  const curpIsValid = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i.test(curp);

  if (!curpIsValid) {
    showErrorMessage({
      title: "CURP inválida",
      message: "Verifica el formato de la CURP.",
    });
    return;
  }

  const validacionInBD = await validarInBDCURP(curp);

  console.log("[validacionInBD] =>", validacionInBD);

  if (!validacionInBD) {
    showErrorMessage({
      title: "CURP existente",
      message: "Esta CURP ya está registrada.",
    });
    return;
  }

  step.value = 2;
};

const submitForm = async () => {
  let payload = {
    ...form.value,
  };

  await apiRequest({
    url: "/api/elemento",
    payload,
    messageType: "toast",
    onSuccess: () => {
      console.log("Datos enviados correctamente:", payload);
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
</script>

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
          <p class="text-body-1 mb-4">
            Primero valida la CURP antes de capturar datos del voluntario.
          </p>

          <ModuladorFormFactory
            :schema="curpSchema"
            :modelValue="form"
            :showButtonsAction="false"
            :formRequired="true"
            @update:modelValue="handleFormUpdate"
          />
        </VWindowItem>

        <VWindowItem :value="2">
          <ModuladorFormFactory
            :schema="formSchema"
            :modelValue="form"
            :showButtonsAction="false"
            :formRequired="true"
            @update:modelValue="handleFormUpdate"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>

    <VDivider />

    <VCardActions class="py-4 px-6 d-flex justify-space-between">
      <div>
        <VBtn variant="tonal" color="secondary" @click="handleClose">
          Cancelar
        </VBtn>
      </div>

      <div class="d-flex ga-2">
        <VBtn
          v-if="step === 2"
          variant="outlined"
          color="secondary"
          @click="step = 1"
        >
          Regresar
        </VBtn>

        <VBtn
          v-if="step === 1"
          color="primary"
          @click="validateCurpAndContinue"
        >
          Validar CURP
        </VBtn>

        <VBtn v-else color="primary" @click="submitForm">
          Guardar voluntario
        </VBtn>
      </div>
    </VCardActions>
  </VCard>
</template>
