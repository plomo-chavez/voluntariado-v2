<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import SelectFile from "@/components/custom/SelectFile.vue";

const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: {},
  },
);

const form = ref<Record<string, any>>({});
const showForm = ref(true);
const nextStep = ref(false);
const previousTipoDocumento = ref("");

const createTipoDocumentoField = (compact = false) => {
  const classElement = compact
    ? " col-12 col-md-6 col-lg-6 col-xl-6 "
    : " col-12 ";

  return [
    {
      type: "select",
      required: true,
      label: "Tipo de documento",
      model: "tipo_documento",
      classElement,
      catalogo: "tipo-documentos-otros",
    },
  ];
};

const camposComunesHistorico: any = [
  {
    type: "select",
    label: "Area",
    model: "referencia_documento_catalogo",
    classElement: " col-12 col-md-6 col-lg-6 col-xl-6 ",
    catalogo: "areas",
  },
  {
    type: "date",
    model: "fechaInicio",
    label: "Fecha Inicio",
    classElement: " col-12 col-md-6 col-lg-6 col-xl-6 ",
  },
  {
    type: "date",
    model: "fechaFin",
    label: "Fecha Fin",
    classElement: " col-12 col-md-6 col-lg-6 col-xl-6 ",
  },
];

const esquemaDocumentacionGeneral: any = [
  ...camposComunesHistorico.slice(0, 1),
  {
    type: "text",
    label: "Referencia de documento",
    model: "referencia_documento",
    classElement: " col-12",
  },
  ...camposComunesHistorico.slice(1),
];

const esquemaCursosYCapacitacion: any = [
  ...camposComunesHistorico.slice(0, 1),
  {
    type: "select",
    label: "Cursos / Talleres",
    model: "curso",
    classElement: " col-12 ",
    catalogo: "cursos",
  },
  ...camposComunesHistorico.slice(1),
];

const getTipoDocumentoSchema = () => createTipoDocumentoField(nextStep.value);

let formSchema: any = getTipoDocumentoSchema();

const buildSchemaForTipo = (tipoDocumento: string) => {
  const normalizedTipo = tipoDocumento.trim();
  const baseSchema = getTipoDocumentoSchema();

  if (
    normalizedTipo === "Cursos / Talleres" ||
    normalizedTipo === "Certificaciones / Recertificaciones"
  ) {
    return [...baseSchema, ...esquemaCursosYCapacitacion];
  }

  return [...baseSchema, ...esquemaDocumentacionGeneral];
};

const refreshDynamicSchema = (tipoDocumento: string) => {
  nextStep.value = true;
  showForm.value = false;
  formSchema = buildSchemaForTipo(tipoDocumento);

  nextTick(() => {
    showForm.value = true;
  });
};

const resetDynamicSchema = () => {
  previousTipoDocumento.value = "";
  nextStep.value = false;
  formSchema = getTipoDocumentoSchema();
  showForm.value = false;

  nextTick(() => {
    showForm.value = true;
  });
};

const handleChangeForm = (newValue: any) => {
  const formValue = deepToRaw(newValue);
  const tipoDocumento = String(formValue?.tipo_documento?.label ?? "").trim();

  if (!tipoDocumento) {
    if (previousTipoDocumento.value) {
      resetDynamicSchema();
    }
    return;
  }

  if (tipoDocumento === previousTipoDocumento.value) {
    return;
  }

  previousTipoDocumento.value = tipoDocumento;
  refreshDynamicSchema(tipoDocumento);
};

const handleSubmit = () => {
  console.log("Formulario enviado:", form.value);
  uploadEvidence();
};

const handleCancel = () => {
  console.log("Formulario cancelado");
};
const handleSelectFile = (value: File | File[] | null) => {
  form.value.evidencia = value;
  console.log("Archivo seleccionado:", value);
};

async function uploadEvidence() {
  const evidenceValue = form.value?.evidencia;
  const selectedFile = Array.isArray(evidenceValue)
    ? (evidenceValue[0] ?? null)
    : (evidenceValue ?? null);

  if (!(selectedFile instanceof File)) return;

  const elementoId = props.data?.id ?? props.data?.id_voluntario;
  if (!elementoId) {
    console.error("No se encontró el id del elemento para subir el documento.");
    return;
  }

  const formData = new FormData();
  formData.append("documento", selectedFile);
  formData.append("id_elemento", String(elementoId));
  formData.append("form", String(JSON.stringify(form.value)));

  const baseUrl = (axiosInstance.defaults.baseURL || "").replace(/\/$/, "");
  const endpoint = baseUrl.endsWith("/api")
    ? "/api/elemento/carga/historico"
    : "/api/elemento/carga/historico";

  try {
    const res = await axiosInstance.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const returnedPath = res?.data?.data?.ruta || res?.data?.data?.ruta_archivo;
    if (returnedPath) {
      console.log("Documento subido con éxito. Ruta:", returnedPath);
    }

    form.value.evidencia = null;
  } catch (error) {
    console.error("Error al subir el documento", error);
  }
}

onBeforeMount(() => {});
</script>

<template>
  <div class="w-full">
    <div
      v-if="showForm"
      class="w-full mxAuto"
      :class="nextStep ? 'col-10' : 'col-12 col-md-8 col-lg-6 col-xl-6'"
    >
      <div class="d-flex w-full justify-center">
        <ModuladorFormFactory
          class="w-full"
          :formLive="true"
          :modelValue="form"
          :schema="formSchema"
          :buttonAlignmentBetween="'between'"
          :showMessageRequired="false"
          :showButtonsAction="false"
          @update:modelValue="handleChangeForm"
        />
      </div>
      <SelectFile
        label="Documento"
        :modelValue="form"
        @handleEmit="handleSelectFile"
      />

      <div class="mt-4 d-flex justify-space-between gap-3">
        <VBtn variant="tonal" color="secondary" @click.prevent="handleCancel">
          Cancelar
        </VBtn>

        <VBtn variant="tonal" color="primary" @click.prevent="handleSubmit">
          Registrar
        </VBtn>
      </div>
    </div>
  </div>
</template>
<!-- prettier-ignore -->
"Nombramientos"
    - tipo
    - area
    - label
    - fechaInicio
    - fechaFin
"Comisiones""
    - tipo
    - area
    - label
    - fechaInicio
    - fechaFin
"Reconocimientos""
    - tipo
    - area
    - label
    - fechaInicio
    - fechaFin
"Cursos / Talleres"
    - tipo
    - area
    - catalogo cursos
    - fechaInicio
    - fechaFin
"Certificaciones / Recertificaciones"
    - tipo
    - area
    - catalogo cursos
    - fechaInicio
    - fechaFin
