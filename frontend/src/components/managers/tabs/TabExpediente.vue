<script lang="ts" setup>
import CardExpedienteItem from "@/components/managers/tabs/CardExpedienteItem.vue";
import { axiosInstance } from "@/utils/axiosInstance";
import { openResource } from "@/utils/fileHelper";
import { ref } from "vue";

const props = defineProps<{ data?: any }>();

const titulo: any = {
  formacion: "Formación institucional",
  expediente: "Documentos del expediente",
  otros: "Histórico",
};

const sectionMeta: Record<string, { label: string; tone: string }> = {
  expediente: { label: "Requeridos", tone: "red" },
  formacion: { label: "Formación", tone: "amber" },
  otros: { label: "Histórico", tone: "slate" },
};

const dataExpediente = ref<any>(null);

type DocItem = {
  key: string;
  text: string;
  ruta_archivo: string;
  courseUrl?: string;
  tipo_key?: string;
};

// Los items que vienen del backend tienen `tipo_id` y `tipo_label`.
type DocItemServer = DocItem & {
  tipo_id?: number | string;
  tipo_label?: string;
};

type EvidenceItem = DocItem;

type EvidenceState = {
  name: string;
  url: string;
  file?: File | null;
};

const evidenceMap = ref<Record<string, EvidenceState>>({});
const inputRefs = ref<Record<string, HTMLInputElement | null>>({});

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

// Limpia sólo la selección local para una key (sin abrir el file picker)
function clearLocalEvidence(key: string) {
  const state = evidenceMap.value[key];
  if (state?.url && state.url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(state.url);
    } catch (e) {
      // ignore
    }
  }
  delete evidenceMap.value[key];
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
}

function onFileSelected(key: string, event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const previous = evidenceMap.value[key]?.url;
  if (previous?.startsWith("blob:")) {
    URL.revokeObjectURL(previous);
  }

  evidenceMap.value[key] = {
    name: file.name,
    url: URL.createObjectURL(file),
    file,
  };

  target.value = "";
}

function hasLocalEvidence(key: string): boolean {
  return !!evidenceMap.value[key]?.file;
}

function hasRemoteEvidence(item: DocItem): boolean {
  return !!item.ruta_archivo;
}

function hasEvidence(item: DocItemServer): boolean {
  return hasLocalEvidence(itemKey(item)) || hasRemoteEvidence(item);
}

function viewEvidence(item: DocItemServer) {
  // If a local file is selected, open that blob URL. Otherwise open remote resource.
  const local = evidenceMap.value[itemKey(item)];
  if (local?.url) {
    window.open(local.url, "_blank", "noopener,noreferrer");
    return;
  }

  if (!item.ruta_archivo) return;
  openResource(item.ruta_archivo);
}

function evidenceName(key: string, item?: DocItemServer): string {
  const local = evidenceMap.value[key];
  if (local?.name) return local.name;
  if (item?.ruta_archivo) {
    const parts = String(item.ruta_archivo || "").split("/");
    return parts[parts.length - 1] || "";
  }
  return "";
}

async function uploadEvidence(item: DocItemServer) {
  const key = itemKey(item);
  const evidence = evidenceMap.value[key];

  if (!evidence?.file) return;

  const elementoId = props.data?.id ?? props.data?.id_voluntario;
  if (!elementoId) {
    console.error("No se encontró el id del elemento para subir el documento.");
    return;
  }

  const formData = new FormData();
  formData.append("documento", evidence.file);
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

    const returnedPath = res?.data?.data?.ruta || res?.data?.data?.ruta_archivo;
    if (returnedPath) {
      // actualizar en dataExpediente el item que coincida con la key (buscar por tipo_id)
      for (const group of dataExpediente.value || []) {
        for (const doc of group.documentos || []) {
          const docKey = String(
            doc?.tipo_id ?? doc?.key ?? doc?.tipo_label ?? "",
          );
          if (docKey === key) {
            doc.ruta_archivo = returnedPath;
          }
        }
      }

      // limpiar objeto local
      const prev = evidenceMap.value[key]?.url;
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      delete evidenceMap.value[key];
    }
  } catch (error) {
    console.error("Error al subir el documento", error);
  }
}

onBeforeMount(async () => {
  await apiRequest({
    url: "/api/elemento/documentos",
    loader: true,
    payload: {
      id_voluntario: props.data?.id ?? props.data?.id_voluntario,
    },
    messageType: "toast",
    onSuccess: (data: any) => {
      dataExpediente.value = data;
    },
  });
});
</script>

<template>
  <!-- prettier-ignore -->
  <div v-if="dataExpediente?.length" class="grid gap-5 md:grid-cols-2">

    <section :key="dataExpediente[0].id" class="h-full overflow-hidden rounded-[15px] border border-success-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
      <header class="flex items-center justify-between gap-3 border-b border-slate-200 bgPrimaryTonalDarkDarker from-slate-900 via-slate-800 to-slate-700 px-4 py-3.5 text-white">
        <div class="flex items-center gap-3">
          <div :class="[ 'flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm', dataExpediente[0].tipo === 'otros' ? 'bg-white/10 text-slate-100' : 'bg-white/10 text-red-100',]">
            <i :class="[ 'fa-solid', dataExpediente[0].tipo === 'otros' ? 'fa-clock-rotate-left' : 'fa-folder-open',]" aria-hidden="true"/>
          </div>

          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              {{ sectionMeta[dataExpediente[0].tipo]?.label ?? "Documentos" }}
            </p>
            <h3 class="m-0 text-base font-bold text-white">
              {{ titulo[dataExpediente[0].tipo] }}
            </h3>
          </div>
        </div>
      </header>

      <div class="grid gap-3 bg-slate-50 p-3 sm:p-4">
        <template v-for="item in dataExpediente[0].documentos ?? []" :key="itemKey(item)">
          <CardExpedienteItem :data="item" :elemento-id="props.data?.id ?? props.data?.id_voluntario" />
        </template>
      </div>
    </section>
    <section :key="dataExpediente[1].id" class="h-full overflow-hidden rounded-[15px] border border-success-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
      <header class="flex items-center justify-between gap-3 border-b border-slate-200 bgPrimaryTonalDarkDarker from-slate-900 via-slate-800 to-slate-700 px-4 py-3.5 text-white">
        <div class="flex items-center gap-3">
          <div :class="[ 'flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm', dataExpediente[1].tipo === 'otros' ? 'bg-white/10 text-slate-100' : 'bg-white/10 text-red-100',]">
            <i :class="[ 'fa-solid', dataExpediente[1].tipo === 'otros' ? 'fa-clock-rotate-left' : 'fa-folder-open',]" aria-hidden="true"/>
          </div>

          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              {{ sectionMeta[dataExpediente[1].tipo]?.label ?? "Documentos" }}
            </p>
            <h3 class="m-0 text-base font-bold text-white">
              {{ titulo[dataExpediente[1].tipo] }}
            </h3>
          </div>
        </div>
      </header>

      <div class="grid gap-3 bg-slate-50 p-3 sm:p-4">
        <template v-for="item in dataExpediente[1].documentos ?? []" :key="itemKey(item)">
          <CardExpedienteItem :data="item" :elemento-id="props.data?.id ?? props.data?.id_voluntario" />
        </template>
      </div>
    </section>
  </div>

  <div
    v-else
    class="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500"
  >
    No hay documentos registrados en este expediente.
  </div>
</template>

<style scoped>
:deep(.v-btn) {
  min-width: 0;
}
</style>
