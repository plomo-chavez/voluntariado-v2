<script lang="ts" setup>
import { axiosInstance } from "@/utils/axiosInstance";
import { computed, ref } from "vue";

const props = defineProps<{ data?: any }>();

type DocItem = {
  key: string;
  text: string;
  courseUrl?: string;
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

function openFilePicker(key: string) {
  inputRefs.value[key]?.click();
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

function hasEvidence(key: string): boolean {
  return !!evidenceMap.value[key];
}

function viewEvidence(key: string) {
  const evidence = evidenceMap.value[key];
  if (!evidence?.url) return;
  window.open(evidence.url, "_blank", "noopener,noreferrer");
}

function evidenceName(key: string): string {
  return evidenceMap.value[key]?.name || "";
}

async function uploadEvidence(key: string) {
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
  formData.append("documentoType", String(key));

  const baseUrl = (axiosInstance.defaults.baseURL || "").replace(/\/$/, "");
  const endpoint = baseUrl.endsWith("/api")
    ? "/api/elemento/carga/documento"
    : "/api/elemento/carga/documento";

  try {
    await axiosInstance.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error al subir el documento", error);
  }
}

const documentacionItems = computed<DocItem[]>(() => [
  { key: "acta", text: "Acta de nacimiento" },
  { key: "curp", text: "CURP" },
  {
    key: "identificacion",
    text: "Identificacion oficial vigente",
  },
  {
    key: "comprobante",
    text: "Comprobante de domicilio y estudios",
  },
  {
    key: "seguro_personal",
    text: "Seguro personal (IMSS, Bienestar, ISSSTE u otro)",
  },
  {
    key: "seguro_institucional",
    text: "Seguro institucional",
  },
  {
    key: "credencial",
    text: "Credencial institucional (nacional o temporal)",
  },
]);

const formacionPresencial = computed<EvidenceItem[]>(() => [
  {
    key: "induccion",
    text: "Induccion a Cruz Roja",
  },
  {
    key: "primeros_auxilios",
    text: "Primeros Auxilios",
  },
  {
    key: "seguridad_voluntariado",
    text: "Seguridad para el Voluntariado",
  },
  {
    key: "voluntariado_basico",
    text: "Voluntariado Basico",
  },
  {
    key: "desastres",
    text: "Introduccion a los Desastres",
  },
  {
    key: "acceso_mas_seguro",
    text: "Acceso Mas Seguro",
  },
]);

const formacionVirtual = computed<EvidenceItem[]>(() => [
  {
    key: "stay_safe_1",
    text: "Stay Safe: Nivel 1 - Fundamentos",
    courseUrl: "https://example.org/cursos/stay-safe-nivel-1",
  },
  {
    key: "stay_safe_2",
    text: "Stay Safe: Nivel 2 - Seguridad personal y de los voluntarios en situaciones de emergencia",
    courseUrl: "https://example.org/cursos/stay-safe-nivel-2",
  },
  {
    key: "conducta_sexual",
    text: "Decir NO a la conducta sexual indebida",
    courseUrl: "https://example.org/cursos/decir-no-conducta-sexual-indebida",
  },
  {
    key: "mundo_cruz_roja",
    text: "El mundo de la Cruz Roja y la Media Luna Roja",
    courseUrl: "https://example.org/cursos/mundo-cruz-roja-media-luna-roja",
  },
  {
    key: "rcf_basico",
    text: "RCF Basico",
    courseUrl: "https://example.org/cursos/rcf-basico",
  },
]);

function openCourseUrl(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

const allItems = computed<EvidenceItem[]>(() => [
  ...documentacionItems.value,
  ...formacionPresencial.value,
  ...formacionVirtual.value,
]);
</script>

<template>
  <div class="expediente-root">
    <section class="exp-section">
      <header class="exp-section-header">
        <div class="exp-title-wrap">
          <i class="fa-solid fa-file-lines exp-icon" aria-hidden="true" />
          <h3 class="exp-title">Documentacion</h3>
        </div>
      </header>

      <div class="exp-body">
        <p class="exp-subtitle">Documentacion a entregar</p>

        <ul class="exp-list">
          <li
            v-for="item in documentacionItems"
            :key="item.key"
            class="exp-list-item"
          >
            <div class="exp-item-left">
              <i
                :class="[
                  'exp-bullet',
                  hasEvidence(item.key)
                    ? 'fa-solid fa-circle-check exp-bullet--ok'
                    : 'fa-regular fa-file-lines',
                ]"
                aria-hidden="true"
              />
              <span>{{ item.text }}</span>
            </div>

            <div class="exp-actions">
              <input
                :ref="
                  (el) => setInputRef(item.key, el as HTMLInputElement | null)
                "
                class="exp-hidden-input"
                type="file"
                @change="(event) => onFileSelected(item.key, event)"
              />

              <VBtn
                v-if="!hasEvidence(item.key)"
                size="x-small"
                icon
                color="red-darken-2"
                variant="tonal"
                title="Cargar evidencia"
                @click="openFilePicker(item.key)"
              >
                <i class="fa-solid fa-paperclip" aria-hidden="true" />
              </VBtn>

              <template v-else>
                <VBtn
                  size="x-small"
                  color="success"
                  variant="flat"
                  icon
                  title="Enviar evidencia"
                  @click="uploadEvidence(item.key)"
                >
                  <i class="fa-solid fa-check" aria-hidden="true" />
                </VBtn>
                <VBtn
                  size="x-small"
                  icon
                  color="primary"
                  variant="tonal"
                  title="Ver evidencia"
                  @click="viewEvidence(item.key)"
                >
                  <i class="fa-solid fa-eye" aria-hidden="true" />
                </VBtn>
              </template>
            </div>

            <p v-if="hasEvidence(item.key)" class="exp-file-name">
              {{ evidenceName(item.key) }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <section class="exp-section">
      <header class="exp-section-header">
        <div class="exp-title-wrap">
          <i class="fa-solid fa-graduation-cap exp-icon" aria-hidden="true" />
          <h3 class="exp-title">Formacion institucional</h3>
        </div>
      </header>

      <div class="exp-body">
        <div class="exp-block">
          <p class="exp-subtitle">Presencial</p>
          <ul class="exp-list">
            <li
              v-for="item in formacionPresencial"
              :key="item.key"
              class="exp-list-item"
            >
              <div class="exp-item-left">
                <i
                  :class="[
                    'exp-bullet',
                    hasEvidence(item.key)
                      ? 'fa-solid fa-circle-check exp-bullet--ok'
                      : 'fa-regular fa-file-lines',
                  ]"
                  aria-hidden="true"
                />
                <span>{{ item.text }}</span>
              </div>

              <div class="exp-actions exp-actions--inline">
                <input
                  :ref="
                    (el) => setInputRef(item.key, el as HTMLInputElement | null)
                  "
                  class="exp-hidden-input"
                  type="file"
                  @change="(event) => onFileSelected(item.key, event)"
                />

                <VBtn
                  v-if="!hasEvidence(item.key)"
                  size="x-small"
                  icon
                  color="red-darken-2"
                  variant="tonal"
                  title="Cargar evidencia"
                  @click="openFilePicker(item.key)"
                >
                  <i class="fa-solid fa-paperclip" aria-hidden="true" />
                </VBtn>

                <template v-else>
                  <VBtn
                    size="x-small"
                    color="success"
                    variant="flat"
                    icon
                    title="Enviar evidencia"
                    @click="uploadEvidence(item.key)"
                  >
                    <i class="fa-solid fa-check" aria-hidden="true" />
                  </VBtn>
                  <VBtn
                    size="x-small"
                    icon
                    color="primary"
                    variant="tonal"
                    title="Ver evidencia"
                    @click="viewEvidence(item.key)"
                  >
                    <i class="fa-solid fa-eye" aria-hidden="true" />
                  </VBtn>
                </template>
              </div>

              <p v-if="hasEvidence(item.key)" class="exp-file-name">
                {{ evidenceName(item.key) }}
              </p>
            </li>
          </ul>
        </div>

        <div class="exp-block">
          <p class="exp-subtitle">Modalidad virtual</p>
          <ul class="exp-list">
            <li
              v-for="item in formacionVirtual"
              :key="item.key"
              class="exp-list-item"
            >
              <div class="exp-item-left">
                <i
                  :class="[
                    'exp-bullet',
                    hasEvidence(item.key)
                      ? 'fa-solid fa-circle-check exp-bullet--ok'
                      : 'fa-regular fa-file-lines',
                  ]"
                  aria-hidden="true"
                />
                <span>{{ item.text }}</span>
              </div>

              <div class="exp-actions">
                <input
                  :ref="
                    (el) => setInputRef(item.key, el as HTMLInputElement | null)
                  "
                  class="exp-hidden-input"
                  type="file"
                  @change="(event) => onFileSelected(item.key, event)"
                />

                <VBtn
                  size="x-small"
                  icon
                  color="secondary"
                  variant="outlined"
                  title="Abrir URL del curso"
                  @click="openCourseUrl(item.courseUrl)"
                >
                  <i
                    class="fa-solid fa-up-right-from-square"
                    aria-hidden="true"
                  />
                </VBtn>

                <VBtn
                  v-if="!hasEvidence(item.key)"
                  size="x-small"
                  icon
                  color="red-darken-2"
                  variant="tonal"
                  title="Cargar evidencia"
                  @click="openFilePicker(item.key)"
                >
                  <i class="fa-solid fa-paperclip" aria-hidden="true" />
                </VBtn>

                <template v-else>
                  <VBtn
                    size="x-small"
                    color="success"
                    variant="flat"
                    icon
                    title="Enviar evidencia"
                    @click="uploadEvidence(item.key)"
                  >
                    <i class="fa-solid fa-check" aria-hidden="true" />
                  </VBtn>
                  <VBtn
                    size="x-small"
                    icon
                    color="primary"
                    variant="tonal"
                    title="Ver evidencia"
                    @click="viewEvidence(item.key)"
                  >
                    <i class="fa-solid fa-eye" aria-hidden="true" />
                  </VBtn>
                </template>
              </div>

              <p v-if="hasEvidence(item.key)" class="exp-file-name">
                {{ evidenceName(item.key) }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <div class="exp-summary">
      <span>Evidencias cargadas</span>
      <strong>
        {{ Object.keys(evidenceMap).length }} / {{ allItems.length }}
      </strong>
    </div>
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
