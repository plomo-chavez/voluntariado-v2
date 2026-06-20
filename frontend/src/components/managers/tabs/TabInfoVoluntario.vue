<script lang="ts" setup>
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { computed, ref, watch } from "vue";
import { safeValue } from "./customFunctionsInfo";
import SectionVoluntario from "./SectionVoluntario.vue";

// ─── Props / Emits ───────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    data: Record<string, any>;
    change: boolean;
  }>(),
  {
    change: false,
  },
);

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const isEditing = ref(false);
const loading = ref(false);
const modalExpediente = ref(false);
const expedienteOptions = ref([
  { label: "Carátula", value: "caratula", selected: false },
  {
    label: "Registro de aspirante",
    value: "registro_aspirante",
    selected: false,
  },
  { label: "Carta compromiso", value: "carta_compromiso", selected: false },
]);
const validationErrors = ref<string[]>([]);
const localData = ref(JSON.parse(JSON.stringify(props.data)));

// Sincroniza localData cuando props.data cambia (pero sin relación compartida)
watch(
  () => props.data,
  (newData) => {
    if (!isEditing.value) {
      localData.value = JSON.parse(JSON.stringify(newData));
    }
  },
  { deep: true },
);

const schema = [
  {
    label: "Numero interno",
    type: "text",
    model: "numero_interno",
    required: false,
  },
  { label: "Numero asociado", type: "text", model: "numero_asociado" },
  { label: "Fecha ingreso a CR", type: "date", model: "fecha_cr" },
  { label: "Fecha ingreso al area", type: "date", model: "fecha_area" },
  { label: "Estado", type: "select", model: "estado", catalogo: "estados" },
  {
    label: "Delegacion",
    type: "select",
    model: "delegacion",
    catalogo: "delegaciones",
  },
  {
    label: "Area",
    type: "select",
    model: "area",
    catalogo: "areas",
    required: false,
  },
  {
    label: "Cargo",
    type: "select",
    model: "cargo",
    catalogo: "cargos",
  },
  { label: "Nombre", type: "text", model: "nombre", required: false },
  { label: "Segundo nombre", type: "text", model: "segundo_nombre" },
  {
    label: "Primer apellido",
    type: "text",
    model: "primer_apellido",
    required: false,
  },
  { label: "Segundo apellido", type: "text", model: "segundo_apellido" },
  { label: "CURP", type: "text", model: "curp", required: false },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fecha_nacimiento",
    required: false,
  },
  { label: "Telefono", type: "text", model: "telefono", required: false },
  {
    label: "Correo electronico",
    type: "text",
    model: "correo",
    required: false,
  },
  { label: "Lugar de nacimiento", type: "text", model: "lugar_nacimiento" },
  {
    label: "Nacionalidad",
    type: "select",
    model: "nacionalidad",
    catalogo: "nacionalidad",
  },
  {
    label: "Sexo",
    type: "switch",
    model: "sexo",
    catalogo: "sexos",
    options: [
      { label: "Masculino", value: "Masculino" },
      { label: "Femenino", value: "Femenino" },
    ],
    required: false,
  },
  {
    label: "Estado civil",
    type: "select",
    model: "estado_civil",
    catalogo: "estado-civil",
  },
  {
    label: "Tipo de sangre",
    type: "select",
    model: "grupo_sanguineo",
    catalogo: "grupos-sanguineos",
  },
];

const institutionalItems = computed(() => [
  {
    key: "delegacion",
    label: "Delegacion",
    value: `${safeValue(localData.value.delegacion?.label)} / ${safeValue(localData.value.id_delegacion)}`,
  },
  { key: "area", label: "Area", value: safeValue(localData.value.area?.label) },
  {
    key: "cargo",
    label: "Cargo",
    value: safeValue(localData.value.cargo?.label),
  },
  {
    key: "numero_interno",
    label: "Numero interno",
    value: safeValue(localData.value.numero_interno),
  },
  {
    key: "numero_asociado",
    label: "Numero asociado",
    value: safeValue(localData.value.numero_asociado),
  },
  {
    key: "fecha_cr",
    label: "Fecha de ingreso a la CR",
    value: formatDateMoment(localData.value.fecha_cr, "DD/MM/YYYY"),
  },
  {
    key: "antiguedad",
    label: "Antiguedad",
    value: calcularDiferenciaFecha(localData.value.fecha_cr, "años"),
  },
  {
    key: "fecha_area",
    label: "Fecha de ingreso al area",
    value: formatDateMoment(localData.value.fecha_area, "DD/MM/YYYY"),
  },
]);

const personalItems = computed(() => [
  { key: "curp", label: "CURP", value: safeValue(localData.value.curp) },
  {
    key: "edad",
    label: "Edad",
    value: `${safeValue(calcularDiferenciaFecha(localData.value.fecha_nacimiento, "años"))} años`,
  },
  {
    key: "fecha_nacimiento",
    label: "Fecha de nacimiento",
    value: formatDateMoment(localData.value.fecha_nacimiento, "DD/MM/YYYY"),
  },
  {
    key: "lugar_nacimiento",
    label: "Lugar de nacimiento",
    value: safeValue(localData.value.lugar_nacimiento),
  },
  {
    key: "sexo",
    label: "Sexo",
    value: safeValue(localData.value.sexo),
  },
  {
    key: "estado_civil",
    label: "Estado civil",
    value: safeValue(localData.value.estado_civil?.label),
  },
  {
    key: "tipo_sangre",
    label: "Tipo de sangre",
    value: safeValue(localData.value.grupo_sanguineo?.label),
  },
  {
    key: "telefono",
    label: "Telefono",
    value: safeValue(localData.value.telefono),
  },
  {
    key: "correo",
    label: "Correo",
    value: safeValue(localData.value.correo),
    full: true,
  },
]);

function handleEdit() {
  localData.value = JSON.parse(JSON.stringify(props.data));
  validationErrors.value = [];
  isEditing.value = true;
}

function handleCancel() {
  localData.value = JSON.parse(JSON.stringify(props.data));
  validationErrors.value = [];
  isEditing.value = false;
}

async function handleSave() {
  const payload = { ...localData.value, step: 1 };
  await apiRequest({
    url: "/api/elemento",
    payload,
    messageType: "toast",
    onSuccess: (response: any) => {
      emit("update:data", { ...response });
      isEditing.value = false;
    },
  });
}

function handleOpenModalExpediente() {
  expedienteOptions.value.forEach((opt) => (opt.selected = false));
  modalExpediente.value = true;
}

function handleCloseModalExpediente() {
  modalExpediente.value = false;
}
async function handleDescargarDocumentos(all: any = false) {
  const payload = {
    id_voluntario: props.data.id,
    documentos: expedienteOptions.value
      .filter((opt) => opt.selected)
      .map((opt) => opt.value),
    all,
  };

  await apiRequest({
    payload,
    loader: true,
    messageType: "toast",
    url: "/api/elemento/descargar",
    onSuccess: (response: any) => {
      modalExpediente.value = false;

      if (response?.fileBase64 && response?.filename) {
        const byteCharacters = atob(response.fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const ext = (response.filename || "").split(".").pop()?.toLowerCase();
        const mimeMap = {
          pdf: "application/pdf",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          doc: "application/msword",
        };
        const mime: any = mimeMap[ext] || "application/octet-stream";
        const blob = new Blob([byteArray], { type: mime });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
      }
    },
  });
}

onMounted(() => {
  isEditing.value = false;
});
</script>

<template>
  <div v-if="true" class="perfil-user">
    <div class="perfil-header-card">
      <SectionVoluntario :data="localData" :change="props.change" />

      <div class="header-actions">
        <VBtn
          v-if="!isEditing"
          class="edit-btn-desktop"
          color="red-darken-2"
          @click="handleEdit"
        >
          <i class="mr-1 fa-solid fa-pen" aria-hidden="true" />
          Editar perfil
        </VBtn>
        <VBtn
          v-if="!isEditing"
          class="edit-btn-desktop"
          color="red-darken-2"
          @click="handleOpenModalExpediente"
        >
          <i class="mr-1 fa-solid fa-pen" aria-hidden="true" />
          Descargar expediente
        </VBtn>
      </div>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="!isEditing" key="view" class="perfil-sections">
        <div class="perfil-body-panel">
          <section class="section-block">
            <div class="section-title-wrap">
              <div class="section-title-left">
                <i
                  class="fa-solid fa-building-columns section-icon"
                  aria-hidden="true"
                />
                <h3 class="section-title">Datos institucionales</h3>
              </div>
            </div>

            <div class="institution-grid">
              <div
                v-for="item in institutionalItems"
                :key="item.key"
                class="institution-cell"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </section>

          <section class="section-block section-panel section-panel--personal">
            <div class="section-title-wrap">
              <div class="section-title-left">
                <i
                  class="fa-solid fa-id-card section-icon"
                  aria-hidden="true"
                />
                <h3 class="section-title">Datos personales</h3>
              </div>
            </div>

            <div class="info-grid info-grid--3col">
              <div
                v-for="item in personalItems"
                :key="item.key"
                class="info-item"
                :class="{ 'info-item--full': item.full }"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div v-else key="edit" class="edit-mode-wrap">
        <VAlert
          v-if="validationErrors.length"
          type="warning"
          variant="tonal"
          class="mb-4"
          title="Campos por revisar"
        >
          <div v-for="(error, index) in validationErrors" :key="index">
            {{ error }}
          </div>
        </VAlert>

        <ModuladorFormFactory
          :schema="schema"
          :modelValue="localData"
          :showMessageRequired="false"
          :formLive="true"
          @submit="handleSave"
          @cancel="handleCancel"
        />
      </div>
    </Transition>

    <VDialog :model-value="modalExpediente" persistent class="v-dialog-sm">
      <DialogCloseBtn @click="handleCloseModalExpediente" />
      <!-- prettier-ignore -->
      <VCard title="Descargar Expediente">
        <VCardText class="py-2">
          <div class="expediente-options">
            <div
              v-for="option in expedienteOptions"
              :key="option.value"
            >
              <VCheckbox
                v-model="option.selected"
                :label="option.label"
                hide-details
              />
            </div>
          </div>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            variant="tonal"
            :disabled="!expedienteOptions.some(opt => opt.selected)"
            @click="handleDescargarDocumentos"
          >
            Descargar seleccionados
          </VBtn>
          <VBtn
            color="red-darken-2"
            variant="tonal"
            @click="handleDescargarDocumentos(true)"
          >
            Descargar todo
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.perfil-user {
  --accent: #b71c1c;
  --accent-soft: #fdecec;
  --surface-muted: #f8fafc;
  --text-muted: #6b7280;
}

.perfil-header-card {
  background: linear-gradient(120deg, #ffffff 0%, #fff5f5 100%);
  border: 1px solid #f0d8d8;
  border-radius: 16px;
  box-shadow: 0 5px 14px rgba(15, 23, 42, 0.05);
  padding: 0.8rem 0.9rem;
  margin-bottom: 0.7rem;
  display: flex;
  justify-content: space-between;
  gap: 0.55rem;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.perfil-avatar {
  border: 2px solid #f2c6c6;
}

.avatar-text {
  font-weight: 700;
  color: #fff;
  font-size: 1.05rem;
}

.header-user-meta {
  min-width: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.2;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.35rem;
}

.user-role-line {
  margin: 0.2rem 0 0;
  color: #6b7280;
  font-size: 0.84rem;
  font-weight: 500;
}

.perfil-body-panel {
  padding: 0.2rem 0;
}

.section-block {
  border: 1px solid #e4e8ef;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.section-block + .section-block {
  margin-top: 0.75rem;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.45rem 0.7rem;
  background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%);
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.section-icon {
  color: #fff;
  font-size: 0.95rem;
}

.section-title {
  margin: 0;
  font-size: 0.97rem;
  font-weight: 700;
  color: #fff;
}

.section-edit-btn {
  color: #b71c1c;
}

.institution-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  background: #fff;
  padding: 0.35rem 0.6rem 0.5rem;
}

.institution-cell {
  padding: 0.44rem 0.7rem 0.44rem 0;
  border-bottom: 1px solid #f0f2f5;
}

.institution-cell:nth-child(3n - 2),
.institution-cell:nth-child(3n - 1) {
  padding-right: 1.2rem;
}

.institution-cell span {
  display: block;
  color: #9ca3af;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.1rem;
}

.institution-cell strong {
  font-size: 0.88rem;
  color: #1f2937;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.section-panel {
  background: transparent;
  border: none;
  padding: 0;
}

.section-panel--personal {
  margin-top: 0.75rem;
}

.info-grid {
  display: grid;
  gap: 0;
  background: #fff;
  padding: 0.35rem 0.6rem 0.5rem;
}

.info-grid--2col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.info-grid--3col {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.info-item {
  padding: 0.44rem 0.7rem 0.44rem 0;
  border-bottom: 1px solid #f0f2f5;
}

.info-item:nth-child(3n - 2),
.info-item:nth-child(3n - 1) {
  padding-right: 1.2rem;
}

.info-item--full {
  grid-column: 1 / -1;
}

.info-item span {
  display: block;
  color: var(--text-muted);
  font-size: 0.62rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 0.1rem;
}

.info-item strong {
  font-size: 0.88rem;
  color: #111827;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.edit-mode-wrap {
  /* background: var(--accent-soft); */
  border: 1px solid #f3d1d1;
  border-radius: 12px;
  padding: 0.8rem;
}

.actions-wrap {
  display: flex;
  gap: 0.6rem;
}

.expediente-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  padding: 0.5rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 960px) {
  .institution-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .institution-cell:nth-child(3n - 2),
  .institution-cell:nth-child(3n - 1) {
    padding-right: 0;
  }

  .institution-cell:nth-child(2n - 1) {
    padding-right: 1.2rem;
  }

  .info-grid--3col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info-item:nth-child(3n - 2),
  .info-item:nth-child(3n - 1) {
    padding-right: 0;
  }

  .info-item:nth-child(2n - 1):not(.info-item--full) {
    padding-right: 1.2rem;
  }
}

@media (max-width: 700px) {
  .perfil-body-panel {
    padding: 0.75rem;
  }

  .perfil-header-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .edit-btn-desktop {
    width: 100%;
  }

  .info-grid--2col,
  .info-grid--3col {
    grid-template-columns: 1fr;
  }

  .actions-wrap {
    flex-direction: column;
  }

  .actions-wrap :deep(.v-btn) {
    width: 100%;
  }
}
</style>
