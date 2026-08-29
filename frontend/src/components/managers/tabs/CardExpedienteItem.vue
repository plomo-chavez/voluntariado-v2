<script setup lang="ts">
import { useLoadingOverlayStore } from "@/stores/loadingOverlayStore";
import { axiosInstance } from "@/utils/axiosInstance";
import { openResource } from "@/utils/fileHelper";
import { computed, nextTick, ref } from "vue";
import CardExpedienteButtons from "./CardExpedienteButtons.vue";
const loadingOverlayStore = useLoadingOverlayStore();

const props = withDefaults(
  defineProps<{
    data?: any;
    buttonText?: string;
    elementoId?: number | string;
  }>(),
  {
    buttonText: "Ver documento",
  },
);

type DocItem = {
  key?: string;
  text?: string;
  ruta_archivo?: string | null;
  courseUrl?: string;
  tipo_key?: string;
};

type DocItemServer = DocItem & {
  tipo_id?: number | string;
  tipo_label?: string;
  fecha_registro?: string | null;
  id_documento?: number | string;
  id_voluntario?: number | string;
  id_tipo_documento?: number | string;
  numero?: number | string;
  vigencia?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type LocalEvidence = {
  name?: string;
  url?: string;
  file?: File | null;
};

const inputRefs = ref<Record<string, HTMLInputElement | null>>({});
const autoUploadKey = ref<string | null>(null);
const dataExpediente = ref<any[]>([]);
const classCol: any = ref("flex flex-row gap-2");
// const classCol: any = ref("flex flex-col gap-2");
// guarda una copia inicial del item para poder restaurarla
const dataLocal: any = ref(
  props.data ? JSON.parse(JSON.stringify(props.data)) : null,
);
const fileCargado: any = ref(false);

function setInputRef(key: string, el: HTMLInputElement | null) {
  inputRefs.value[key] = el;
}

function itemKey(item: DocItemServer) {
  return String(
    item?.tipo_id ?? item?.key ?? item?.tipo_label ?? item?.text ?? "",
  );
}

function openFilePicker(key: string) {
  inputRefs.value[key]?.click();
}

function handleClearInput() {
  const itemCurrent = dataLocal.value as
    | (DocItemServer & LocalEvidence)
    | undefined;
  const original = dataLocal.value as DocItemServer | null;
  if (!itemCurrent) return;

  const key = itemKey(itemCurrent as DocItemServer);
  const input = inputRefs.value[key];
  if (input) {
    try {
      input.value = "";
    } catch (e) {
      const form =
        input.closest && (input.closest("form") as HTMLFormElement | null);
      if (form) form.reset();
    }
  }

  // revocar url blob si existe
  if (itemCurrent.url && itemCurrent.url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(itemCurrent.url);
    } catch (e) {
      // ignore
    }
  }

  // si no había documento original, limpiar campos relacionados
  if (!original) {
    delete itemCurrent.file;
    delete itemCurrent.url;
    delete itemCurrent.name;
    delete itemCurrent.ruta_archivo;
    delete itemCurrent.fecha_registro;
    delete itemCurrent.id_documento;
    delete itemCurrent.id_tipo_documento;
    delete itemCurrent.numero;
    delete itemCurrent.vigencia;
  } else {
    // restaurar campos desde la copia original
    for (const k of Object.keys(original)) {
      try {
        (itemCurrent as any)[k] = (original as any)[k];
      } catch (e) {
        // ignore assignment errors
      }
    }
    // eliminar campos temporales locales
    delete itemCurrent.file;
    delete itemCurrent.url;
    delete itemCurrent.name;
  }

  fileCargado.value = false;
}

function onFileSelected(key: string, event: Event) {
  fileCargado.value = true;
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const item = dataLocal.value as (DocItemServer & LocalEvidence) | undefined;
  if (!item) return;

  if (item.url && item.url.startsWith("blob:")) {
    URL.revokeObjectURL(item.url);
  }

  item.name = file.name;
  item.url = URL.createObjectURL(file);
  item.file = file;

  target.value = "";

  // If user clicked 'Cargar otro', auto-upload immediately
  if (autoUploadKey.value && autoUploadKey.value === key) {
    nextTick(() => {
      uploadEvidence(item as DocItemServer & LocalEvidence).finally(() => {
        autoUploadKey.value = null;
      });
    });
  }
}

function hasLocalEvidence(item: DocItem): boolean {
  return !!(item as DocItem & LocalEvidence)?.file;
}

function hasRemoteEvidence(item: DocItem): boolean {
  return !!item.ruta_archivo;
}

function viewEvidence(item: DocItemServer) {
  const local = (item as DocItemServer & LocalEvidence)?.url;
  if (local) {
    window.open(local, "_blank", "noopener,noreferrer");
    return;
  }

  if (!item.ruta_archivo) return;
  openResource(item.ruta_archivo);
}

async function uploadEvidence(item: DocItemServer) {
  loadingOverlayStore.showOverlay(true, "Cargando ...!!");
  const key = itemKey(item);
  const localFile = (item as DocItemServer & LocalEvidence)?.file;

  if (!localFile) return;

  const elementoId =
    props.elementoId ?? dataLocal.value?.id ?? dataLocal.value?.id_voluntario;
  if (!elementoId) {
    console.error("No se encontró el id del elemento para subir el documento.");
    return;
  }

  const formData = new FormData();
  formData.append("documento", localFile);
  formData.append("id_elemento", String(elementoId));
  formData.append("documentoType", String(item.tipo_key));

  const baseUrl = (axiosInstance.defaults.baseURL || "").replace(/\/$/, "");
  const endpoint = baseUrl.endsWith("/api")
    ? "/api/elemento/carga/documento"
    : "/api/elemento/carga/documento";

  try {
    const res = await axiosInstance.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const documento = res?.data?.data?.documento;
    const returnedPath =
      documento?.ruta_archivo ||
      res?.data?.data?.ruta ||
      res?.data?.data?.ruta_archivo;

    for (const group of dataExpediente.value || []) {
      for (const doc of group.documentos || []) {
        const docKey = String(
          doc?.tipo_id ?? doc?.key ?? doc?.tipo_label ?? "",
        );
        if (docKey === key) {
          if (returnedPath) doc.ruta_archivo = returnedPath;
          if (documento) {
            doc.id_documento = documento.id_documento ?? doc.id_documento;
            doc.id_voluntario = documento.id_voluntario ?? doc.id_voluntario;
            doc.id_tipo_documento =
              documento.id_tipo_documento ?? doc.id_tipo_documento;
            doc.numero = documento.numero ?? doc.numero;
            doc.vigencia = documento.vigencia ?? doc.vigencia;
            doc.fecha_registro = documento.fecha_registro ?? doc.fecha_registro;
            doc.updated_at = documento.updated_at ?? doc.updated_at;
            doc.created_at = documento.created_at ?? doc.created_at;
          } else if (returnedPath) {
            doc.fecha_registro = doc.fecha_registro || new Date().toISOString();
          }
        }
      }
    }

    if (returnedPath) item.ruta_archivo = returnedPath;
    if (documento) {
      item.id_documento = documento.id_documento ?? item.id_documento;
      item.id_voluntario = documento.id_voluntario ?? item.id_voluntario;
      item.id_tipo_documento =
        documento.id_tipo_documento ?? item.id_tipo_documento;
      item.numero = documento.numero ?? item.numero;
      item.vigencia = documento.vigencia ?? item.vigencia;
      item.fecha_registro = documento.fecha_registro ?? item.fecha_registro;
      item.updated_at = documento.updated_at ?? item.updated_at;
      item.created_at = documento.created_at ?? item.created_at;
    } else if (returnedPath) {
      item.fecha_registro = item.fecha_registro || new Date().toISOString();
    }

    const prev = (item as DocItemServer & LocalEvidence)?.url;
    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
    delete (item as DocItemServer & LocalEvidence).file;
    delete (item as DocItemServer & LocalEvidence).url;
    delete (item as DocItemServer & LocalEvidence).name;

    handleClearInput();

    loadingOverlayStore.hideOverlay();
  } catch (error) {
    loadingOverlayStore.hideOverlay();
    console.error("Error al subir el documento", error);
  }
}

const status = computed(() => {
  const item = dataLocal.value ?? {};
  const hasLocal = hasLocalEvidence(item);
  const hasRemote = hasRemoteEvidence(item);

  if (item.fecha_registro) {
    return {
      label: "Registrado",
      icon: "fa-solid fa-circle-check",
      classes: "bgTonalGreen",
      iconClasses: "textTonalGreen",
      icon2: "fa-solid fa-file-lines",
      classIcon: "bgTonalGreen textTonalGreen",
      btnFileIcon: "fa-regular fa-eye",
      btnFileText: "Ver evidencia",
      btnFileClass:
        "border-[#c7e7cf] bg-[#edf9f0] textTonalGreen hover:bg-[#e5f7eb]",
    };
  }

  if (hasRemote || hasLocal) {
    return {
      label: "Adjuntado",
      icon: "fa-regular fa-file-lines",
      classes: "bgTonalYellow",
      icon2: "fa-solid fa-file-lines",
      iconClasses: "textTonalYellow",
      classIcon: "bgTonalYellow textTonalYellow",
      btnFileIcon: hasLocal ? "fa-solid fa-upload" : "fa-solid fa-upload",
      btnFileText: hasLocal ? "Cargar archivo" : "Cargar archivo",
      btnFileClass:
        "border-[#f7e6a9] bg-[#fff9e8] textTonalYellow hover:bg-[#fff3cd]",
    };
  }

  return {
    label: "Pendiente",
    icon: "fa-regular fa-circle",
    classes: "bgTonalGray",
    iconClasses: "textTonalGray",
    icon2: "fa-regular fa-file",
    classIcon: "bgTonalGray textTonalGray",
    btnFileIcon: "fa-solid fa-paperclip",
    btnFileText: "Adjuntar archivo",
    btnFileClass:
      "border-[#dfe3e8] bg-[#f4f5f7] textTonalGray hover:bg-[#eef1f4]",
    borderCard: " border-[#f7e6a9] ",
  };
});

function handleUploadDocument() {
  const item = dataLocal.value as DocItemServer | undefined;
  if (!item) return;
  uploadEvidence(item);
}
function handleViewEvidence() {
  const item = dataLocal.value as DocItemServer | undefined;
  if (!item) return;
  viewEvidence(item);
}

function handleOpenFilePicker() {
  const item = dataLocal.value as DocItemServer | undefined;
  if (!item) return;
  const key = itemKey(item);
  openFilePicker(key);
}
</script>
<!-- prettier-ignore -->
<template>
  <input
    v-if="dataLocal"
    :ref="(el) => setInputRef(itemKey(dataLocal), el as HTMLInputElement | null)"
    type="file"
    class="hidden"
    accept=".pdf,image/*"
    @change="onFileSelected(itemKey(dataLocal), $event)"
  />
  <div class="flex w-full items-center justify-between gap-3 rounded-[18px] border px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.02)]" :class="[status.borderCard]"  >
    <div class="flex min-w-0 items-center gap-3">
      <div :class="status.classIcon" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base shadow-inner shadow-white/60">
        <i :class="status.icon2" aria-hidden="true" />
      </div>

      <div class="min-w-0">
        <div class="text-base font-semibold leading-tight text-slate-800">
          {{ dataLocal?.tipo_label || "Documento" }}
        </div>

        <div class="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
          <i :class="['fa-solid', status.icon, status.iconClasses]" aria-hidden="true" />
          <span>{{ status.label }}</span>
        </div>

        <div v-if="dataLocal?.fecha_registro" class="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
          <i class="fa-regular fa-calendar-days" aria-hidden="true" />
          <span>{{ dataLocal.fecha_registro }}</span>
        </div>
      </div>
    </div>
    <div >
        <CardExpedienteButtons
        :data-local="dataLocal"
        :file-cargado="fileCargado"
        :status="status"
        @open-file="handleOpenFilePicker"
        @upload-document="handleUploadDocument"
        @clear-input="handleClearInput"
        @view-evidence="handleViewEvidence"
        />
    </div>

  </div>
</template>

<style lang="scss">
.btnWidht {
  width: 140px !important;
}
</style>
