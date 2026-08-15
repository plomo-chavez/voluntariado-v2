<script lang="ts" setup>
import { axiosInstance } from "@/utils/axiosInstance";
import { openResource } from "@/utils/fileHelper";
import { ref } from "vue";

const props = defineProps<{ data?: any }>();

const titulo: any = {
  formacion: "Formación Institucional",
  expediente: "Documento del expediente",
  otros: "Otrós",
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
  <div v-if="true" class="expediente-root">
    <section v-for="group in dataExpediente" :key="group.id" class="exp-section">
      <header class="exp-section-header">
        <div class="exp-title-wrap">
          <i class="fa-solid fa-file-lines exp-icon" aria-hidden="true" />
          <h3 class="exp-title">{{ titulo[group.tipo] }}</h3>
        </div>
      </header>

      <div class="exp-body">
        <ul class="exp-list">
          <li v-for="item in group.documentos ?? []" :key="itemKey(item)" class="exp-list-item" >
            <div class="exp-item-left">
              <i v-if="hasEvidence(item) && hasRemoteEvidence(item) && group.tipo != 'otros'" aria-hidden="true" :class="['exp-bullet','fa-solid fa-circle-check exp-bullet--ok']" />
              <i v-else aria-hidden="true" :class="['exp-bullet','fa-regular fa-file-lines']" />
              <span>{{ item.tipo_label }}</span>
            </div>

            <div class="exp-actions">
              <input :ref=" (el) => setInputRef(itemKey(item), el as HTMLInputElement | null)" class="exp-hidden-input" type="file" @change="(event) => onFileSelected(itemKey(item), event)" />
              <template v-if="group.tipo != 'otros'">
                <!-- Local file selected but not uploaded -->
                <template v-if="hasLocalEvidence(itemKey(item))">
                  <VBtn size="x-small" color="success" variant="flat" icon title="Enviar evidencia" @click="uploadEvidence(item)">
                    <i class="fa-solid fa-check" aria-hidden="true" />
                  </VBtn>
                  <VBtn size="x-small" icon color="red-darken-2" variant="tonal" title="Limpiar selección local" @click="clearLocalEvidence(itemKey(item))">
                    <i class="fa-regular fa-circle-xmark" />
                  </VBtn>
                  <VBtn size="x-small" icon color="primary" variant="tonal" title="Ver evidencia local" @click="viewEvidence(item)">
                    <i class="fa-solid fa-eye" aria-hidden="true" />
                  </VBtn>
                </template>

                <!-- Remote file already exists -->
                <template v-else-if="hasRemoteEvidence(item)">
                  <VBtn size="x-small" icon color="red-darken-2" variant="tonal" title="Recargar evidencia" @click="openFilePicker(itemKey(item))">
                    <i class="fa-solid fa-arrows-rotate" aria-hidden="true" />
                  </VBtn>
                  <VBtn size="x-small" icon color="primary" variant="tonal" title="Ver evidencia" @click="viewEvidence(item)">
                    <i class="fa-solid fa-eye" aria-hidden="true" />
                  </VBtn>
                </template>

                <!-- No file -->
                <template v-else>
                  <VBtn size="x-small" icon color="red-darken-2" variant="tonal" title="Cargar evidencia" @click="openFilePicker(itemKey(item))">
                    <i class="fa-solid fa-paperclip" aria-hidden="true" />
                  </VBtn>
                </template>
              </template>
              <template v-else>
                <VBtn size="x-small" icon color="primary" variant="tonal" title="Ver evidencia" @click="viewEvidence(item)">
                  <i class="fa-solid fa-eye" aria-hidden="true" />
                </VBtn>
              </template>
            </div>

            <p v-if="hasEvidence(item) && !hasRemoteEvidence(item)" class="exp-file-name">
              {{ evidenceName(itemKey(item), item) }}
            </p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.expediente-root {
  display: grid;
  gap: 0.85rem;
}

.exp-section {
  border: 1px solid #e4e8ef;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.exp-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.45rem 0.7rem;
  background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%);
}

.exp-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.exp-icon {
  color: #fff;
  font-size: 0.95rem;
}

.exp-title {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
  color: #fff;
}

.exp-body {
  padding: 0.5rem 0.7rem 0.65rem;
}

.exp-block + .exp-block {
  margin-top: 0.55rem;
}

.exp-subtitle {
  margin: 0 0 0.3rem;
  color: #64748b;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
}

.exp-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.exp-list-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
  flex-wrap: wrap;
  padding: 0.4rem 0;
  border-bottom: 1px solid #edf1f6;
  color: #1f2937;
  font-size: 0.9rem;
}

.exp-list-item:last-child {
  border-bottom: 0;
}

.exp-list-item--with-area {
  gap: 0.7rem;
}

.exp-item-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.exp-item-left span,
.exp-list-item span {
  overflow-wrap: anywhere;
}

.exp-bullet {
  color: #9a1f1f;
  flex-shrink: 0;
  font-size: 0.95rem;
}

.exp-bullet--ok {
  color: #2e7d32;
}

.exp-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.exp-actions--inline {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.exp-hidden-input {
  display: none;
}

.exp-file-name {
  margin: 0;
  width: 100%;
  color: #64748b;
  font-size: 0.75rem;
}

.exp-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.84rem;
}

.exp-summary strong {
  color: #9a1f1f;
}

@media (max-width: 700px) {
  .exp-list-item--with-area {
    flex-direction: column;
    align-items: flex-start;
  }

  .exp-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
