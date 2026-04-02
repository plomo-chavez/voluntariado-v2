<script lang="ts" setup>
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { computed, ref, watch } from "vue";
import { toast } from "vue3-toastify";

const props = defineProps<{
  data: Record<string, any>;
}>();

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const isEditing = ref(false);
const loading = ref(false);
const validationErrors = ref<string[]>([]);
const localData = ref({ ...props.data });

watch(
  () => props.data,
  (val) => {
    if (!isEditing.value) {
      localData.value = { ...val };
    }
  },
  { deep: true },
);

const schema = [
  {
    label: "Numero interno",
    type: "text",
    model: "numero_interno",
    required: true,
  },
  { label: "Numero asociado", type: "text", model: "numero_asociado" },
  { label: "Nombre", type: "text", model: "nombre", required: true },
  { label: "Segundo nombre", type: "text", model: "segundo_nombre" },
  {
    label: "Primer apellido",
    type: "text",
    model: "primer_apellido",
    required: true,
  },
  { label: "Segundo apellido", type: "text", model: "segundo_apellido" },
  { label: "CURP", type: "text", model: "curp", required: true },
  { label: "Telefono", type: "text", model: "telefono", required: true },
  {
    label: "Correo electronico",
    type: "text",
    model: "correo",
    required: true,
  },
  {
    label: "Fecha de nacimiento",
    type: "date",
    model: "fecha_nacimiento",
    required: true,
  },
  { label: "Lugar de nacimiento", type: "text", model: "lugar_nacimiento" },
  {
    label: "Nacionalidad",
    type: "select",
    model: "id_nacionalidad",
    catalogo: "nacionalidades",
  },
  {
    label: "Sexo",
    type: "select",
    model: "sexo",
    catalogo: "sexos",
    required: true,
  },
  {
    label: "Estado civil",
    type: "select",
    model: "id_estado_civil",
    catalogo: "estados-civiles",
  },
  {
    label: "Grupo sanguineo",
    type: "select",
    model: "id_grupo_sanguineo",
    catalogo: "grupos-sanguineos",
  },
  {
    label: "Area",
    type: "select",
    model: "id_area",
    catalogo: "areas",
    required: true,
  },
  { label: "Estado", type: "select", model: "id_estado", catalogo: "estados" },
  {
    label: "Delegacion",
    type: "select",
    model: "id_delegacion",
    catalogo: "delegaciones",
  },
  { label: "Fecha ingreso a CR", type: "date", model: "fecha_ingreso_cr" },
  { label: "Fecha ingreso al area", type: "date", model: "fecha_ingreso_area" },
];

const catalogos: Record<string, Record<string | number, string>> = {
  sexos: { M: "Masculino", F: "Femenino", O: "Otro" },
  "estados-civiles": {
    1: "Soltero(a)",
    2: "Casado(a)",
    3: "Union libre",
    4: "Divorciado(a)",
    5: "Viudo(a)",
  },
};

const nombreCompleto = computed(() => {
  return [
    localData.value.nombre,
    localData.value.segundo_nombre,
    localData.value.primer_apellido,
    localData.value.segundo_apellido,
  ]
    .filter(Boolean)
    .join(" ");
});

const iniciales = computed(() => {
  const nombre = localData.value.nombre?.[0] ?? "";
  const apellido = localData.value.primer_apellido?.[0] ?? "";
  return (nombre + apellido || "VN").toUpperCase();
});

const edadCalculada = computed(() => {
  const fecha = localData.value.fecha_nacimiento;
  if (!fecha) return "-";
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  if (isNaN(nacimiento.getTime())) return "-";
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad >= 0 ? edad : "-";
});

const antiguedadCalculada = computed(() => {
  const fecha = localData.value.fecha_ingreso_cr;
  if (!fecha) return "-";
  const hoy = new Date();
  const ingreso = new Date(fecha);
  if (isNaN(ingreso.getTime())) return "-";
  let anios = hoy.getFullYear() - ingreso.getFullYear();
  const m = hoy.getMonth() - ingreso.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < ingreso.getDate())) anios--;
  if (anios < 0) return "-";
  return `${anios} ${anios === 1 ? "ano" : "anos"}`;
});

const estatusActivo = computed(() => {
  const raw = localData.value.estatus;
  return raw === true || raw === 1 || raw === "1" || raw === "activo";
});

const estatusLabel = computed(() =>
  estatusActivo.value ? "Activo" : "Inactivo",
);

const areaHeader = computed(() => {
  return (
    localData.value.area_nombre ||
    localData.value.area ||
    localData.value.id_area ||
    "-"
  );
});

const cargoHeader = computed(() => {
  return (
    localData.value.cargo_nombre ||
    localData.value.cargo ||
    localData.value.id_cargo ||
    "-"
  );
});

const identificadorHeader = computed(() => {
  const asociado = localData.value.numero_asociado;
  if (asociado) return { label: "N. asociado", value: asociado };
  return { label: "N. interno", value: localData.value.numero_interno || "-" };
});

function safeValue(value: any): string {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}

const institutionalItems = computed(() => [
  {
    key: "delegacion",
    label: "Delegacion",
    value: `${safeValue(localData.value.id_estado)} / ${safeValue(localData.value.id_delegacion)}`,
  },
  { key: "area", label: "Area", value: safeValue(localData.value.id_area) },
  { key: "cargo", label: "Cargo", value: safeValue(cargoHeader.value) },
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
    key: "fecha_ingreso_cr",
    label: "Fecha de ingreso a la CR",
    value: formatDate(localData.value.fecha_ingreso_cr),
  },
  {
    key: "antiguedad",
    label: "Antiguedad",
    value: safeValue(antiguedadCalculada.value),
  },
  {
    key: "fecha_ingreso_area",
    label: "Fecha de ingreso al area",
    value: formatDate(localData.value.fecha_ingreso_area),
  },
]);

const personalItems = computed(() => [
  { key: "curp", label: "CURP", value: safeValue(localData.value.curp) },
  {
    key: "edad",
    label: "Edad",
    value: `${safeValue(edadCalculada.value)} anos`,
  },
  {
    key: "fecha_nacimiento",
    label: "Fecha de nacimiento",
    value: formatDate(localData.value.fecha_nacimiento),
  },
  {
    key: "lugar_nacimiento",
    label: "Lugar de nacimiento",
    value: safeValue(localData.value.lugar_nacimiento),
  },
  {
    key: "sexo",
    label: "Sexo",
    value: formatByCatalog("sexos", localData.value.sexo),
  },
  {
    key: "estado_civil",
    label: "Estado civil",
    value: formatByCatalog("estados-civiles", localData.value.id_estado_civil),
  },
  {
    key: "tipo_sangre",
    label: "Tipo de sangre",
    value: safeValue(localData.value.id_grupo_sanguineo),
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

function formatDate(value: any): string {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("es-MX");
}

function formatByCatalog(catalogo: string, value: any): string {
  if (value === null || value === undefined || value === "") return "-";
  return catalogos[catalogo]?.[value] ?? String(value);
}

function validateForm() {
  const errors: string[] = [];
  const requiredFields = [
    { key: "numero_interno", label: "Numero interno" },
    { key: "nombre", label: "Nombre" },
    { key: "primer_apellido", label: "Primer apellido" },
    { key: "curp", label: "CURP" },
    { key: "telefono", label: "Telefono" },
    { key: "correo", label: "Correo electronico" },
    { key: "sexo", label: "Sexo" },
    { key: "id_area", label: "Area" },
    { key: "fecha_nacimiento", label: "Fecha de nacimiento" },
  ];

  requiredFields.forEach((field) => {
    if (!localData.value[field.key]) {
      errors.push(`El campo ${field.label} es obligatorio.`);
    }
  });

  if (localData.value.correo) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localData.value.correo)) {
      errors.push("El correo electronico no tiene un formato valido.");
    }
  }

  if (localData.value.curp) {
    const curpRegex = /^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/i;
    if (!curpRegex.test(localData.value.curp)) {
      errors.push("El CURP no tiene un formato valido.");
    }
  }

  validationErrors.value = errors;
  return errors.length === 0;
}

function handleEdit() {
  localData.value = { ...props.data };
  validationErrors.value = [];
  isEditing.value = true;
}

function handleCancel() {
  localData.value = { ...props.data };
  validationErrors.value = [];
  isEditing.value = false;
}

async function handleSave() {
  if (!validateForm()) {
    showErrorMessage({
      title: "Validacion",
      message: validationErrors.value[0] || "Revisa los campos requeridos",
    });
    return;
  }

  loading.value = true;
  try {
    emit("update:data", { ...localData.value });
    toast.success("Perfil actualizado correctamente", { theme: "dark" });
    isEditing.value = false;
  } catch (error: any) {
    showErrorMessage({
      title: "Error",
      message: error?.message || "Error al guardar",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="perfil-user">
    <div class="perfil-header-card">
      <div class="header-left">
        <VAvatar size="72" class="perfil-avatar" color="red-darken-2">
          <img
            v-if="localData.foto"
            :src="localData.foto"
            alt="Foto de perfil"
          />
          <span v-else class="avatar-text">{{ iniciales }}</span>
        </VAvatar>

        <div class="header-user-meta">
          <h2 class="user-name">
            {{ nombreCompleto || "Voluntario sin nombre" }}
          </h2>
          <p class="user-role-line">{{ areaHeader }} - {{ cargoHeader }}</p>
          <div class="user-badges">
            <p color="red-darken-2" variant="flat" size="small" label>
              {{ identificadorHeader.value }}
            </p>
            <VChip
              :color="estatusActivo ? 'success' : 'grey-darken-1'"
              variant="tonal"
              size="small"
              label
            >
              {{ estatusLabel }}
            </VChip>
          </div>
        </div>
      </div>

      <VTooltip text="Editar informacion del perfil" location="top">
        <template #activator="{ props: tooltipProps }">
          <VBtn
            v-bind="tooltipProps"
            v-if="!isEditing"
            class="edit-btn-desktop"
            color="red-darken-2"
            @click="handleEdit"
          >
            <i class="mr-1 fa-solid fa-pen" aria-hidden="true" />
            Editar perfil
          </VBtn>
        </template>
      </VTooltip>
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
          :formLive="true"
          @update:modelValue="(val) => (localData.value = val)"
        />

        <div class="actions-wrap mt-4">
          <VBtn color="red-darken-2" :loading="loading" @click="handleSave">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true" />
            Guardar cambios
          </VBtn>
          <VBtn variant="tonal" color="secondary" @click="handleCancel">
            <i class="fa-solid fa-xmark" aria-hidden="true" />
            Cancelar
          </VBtn>
        </div>
      </div>
    </Transition>
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
  background: var(--accent-soft);
  border: 1px solid #f3d1d1;
  border-radius: 12px;
  padding: 0.8rem;
}

.actions-wrap {
  display: flex;
  gap: 0.6rem;
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
