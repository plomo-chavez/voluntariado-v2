<script lang="ts" setup>
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  data: Record<string, any>;
}>();

type FieldItem = {
  key: string;
  label: string;
  value: string;
  full?: boolean;
};

type SectionItem = {
  key: string;
  title: string;
  icon: string;
  items: FieldItem[];
};

const emit = defineEmits<{
  (event: "update:data", value: Record<string, any>): void;
}>();

const activeEditSection = ref<string | null>(null);
const localData = ref<Record<string, any>>({ ...props.data });

watch(
  () => props.data,
  (val) => {
    if (!activeEditSection.value) {
      localData.value = { ...val };
    }
  },
  { deep: true },
);

const sectionSchemas: Record<string, any[]> = {
  salud: [
    { label: "Seguro social", type: "text", model: "seguro_social" },
    {
      label: "Seguro institucional",
      type: "text",
      model: "seguro_institucional",
    },
    {
      label: "Capacidades diferentes",
      type: "text",
      model: "capacidades_diferentes",
    },
    { label: "Alergias", type: "text", model: "alergias" },
    { label: "Enfermedades", type: "text", model: "enfermedades" },
  ],
  contacto: [
    { label: "Direccion", type: "text", model: "direccion" },
    { label: "Colonia", type: "text", model: "colonia" },
    { label: "No. interno", type: "text", model: "no_interno" },
    { label: "No. externo", type: "text", model: "no_externo" },
    { label: "CP", type: "text", model: "cp" },
    { label: "Estado", type: "text", model: "estado_domicilio" },
    { label: "Ciudad", type: "text", model: "ciudad" },
    { label: "Pasaporte", type: "text", model: "pasaporte" },
    { label: "Licencia", type: "text", model: "licencia" },
  ],
  emergencia: [
    {
      label: "Nombre",
      type: "text",
      model: "contacto_emergencia_nombre",
    },
    {
      label: "Parentesco",
      type: "text",
      model: "contacto_emergencia_parentesco",
    },
    {
      label: "Telefono",
      type: "text",
      model: "contacto_emergencia_telefono",
    },
  ],
  profesionales: [
    { label: "Grado de estudios", type: "text", model: "grado_estudios" },
    { label: "Profesion", type: "text", model: "profesion" },
    { label: "Ocupacion actual", type: "text", model: "ocupacion_actual" },
    {
      label: "Empresa o institucion",
      type: "text",
      model: "empresa_institucion",
    },
    { label: "Idioma", type: "text", model: "idioma" },
    { label: "% escritura", type: "text", model: "idioma_escritura" },
    { label: "% hablado", type: "text", model: "idioma_hablado" },
  ],
  interes: [
    {
      label: "Como te enteraste de la institucion",
      type: "text",
      model: "medio_difusion",
    },
    {
      label: "Que esperas recibir de la Cruz Roja",
      type: "text",
      model: "expectativas_cruz_roja",
    },
    {
      label: "Has sido voluntario en otra institucion",
      type: "text",
      model: "voluntario_otra_institucion",
    },
  ],
  disponibilidad: [
    { label: "Lunes", type: "text", model: "disponibilidad_lunes" },
    { label: "Martes", type: "text", model: "disponibilidad_martes" },
    {
      label: "Miercoles",
      type: "text",
      model: "disponibilidad_miercoles",
    },
    { label: "Jueves", type: "text", model: "disponibilidad_jueves" },
    { label: "Viernes", type: "text", model: "disponibilidad_viernes" },
    { label: "Sabado", type: "text", model: "disponibilidad_sabado" },
    { label: "Domingo", type: "text", model: "disponibilidad_domingo" },
    { label: "Turno", type: "text", model: "turno" },
    { label: "Horario", type: "text", model: "horario" },
  ],
};

function safeValue(value: any): string {
  return value === null || value === undefined || value === ""
    ? "-"
    : String(value);
}

function pickValue(...values: any[]): string {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }
  return "-";
}

function normalizeBool(value: any): string {
  if (value === true || value === 1 || value === "1") return "Si";
  if (value === false || value === 0 || value === "0") return "No";
  return safeValue(value);
}

const saludItems = computed<FieldItem[]>(() => [
  {
    key: "seguro_social",
    label: "Seguro social",
    value: pickValue(props.data.seguro_social, props.data.nss),
  },
  {
    key: "seguro_institucional",
    label: "Seguro institucional",
    value: safeValue(props.data.seguro_institucional),
  },
  {
    key: "capacidades_diferentes",
    label: "Capacidades diferentes",
    value: normalizeBool(props.data.capacidades_diferentes),
  },
  {
    key: "alergias",
    label: "Alergias",
    value: safeValue(props.data.alergias),
  },
  {
    key: "enfermedades",
    label: "Enfermedades",
    value: safeValue(props.data.enfermedades),
  },
]);

const contactoItems = computed<FieldItem[]>(() => [
  {
    key: "direccion",
    label: "Direccion",
    value: safeValue(props.data.direccion),
    full: true,
  },
  {
    key: "colonia",
    label: "Colonia",
    value: safeValue(props.data.colonia),
  },
  {
    key: "no_interno",
    label: "No. interno",
    value: pickValue(
      props.data.no_interno,
      props.data.numero_interno_domicilio,
    ),
  },
  {
    key: "no_externo",
    label: "No. externo",
    value: pickValue(
      props.data.no_externo,
      props.data.numero_externo_domicilio,
    ),
  },
  {
    key: "cp",
    label: "CP",
    value: pickValue(props.data.cp, props.data.codigo_postal),
  },
  {
    key: "estado",
    label: "Estado",
    value: safeValue(props.data.estado_domicilio || props.data.estado),
  },
  {
    key: "ciudad",
    label: "Ciudad",
    value: safeValue(props.data.ciudad),
  },
  {
    key: "pasaporte",
    label: "Pasaporte",
    value: safeValue(props.data.pasaporte),
  },
  {
    key: "licencia",
    label: "Licencia",
    value: safeValue(props.data.licencia),
  },
]);

const emergenciaItems = computed<FieldItem[]>(() => [
  {
    key: "emergencia_nombre",
    label: "Nombre",
    value: pickValue(
      props.data.contacto_emergencia_nombre,
      props.data.nombre_emergencia,
    ),
  },
  {
    key: "emergencia_parentesco",
    label: "Parentesco",
    value: pickValue(
      props.data.contacto_emergencia_parentesco,
      props.data.parentesco_emergencia,
    ),
  },
  {
    key: "emergencia_telefono",
    label: "Telefono",
    value: pickValue(
      props.data.contacto_emergencia_telefono,
      props.data.telefono_emergencia,
    ),
  },
]);

const profesionalesItems = computed<FieldItem[]>(() => [
  {
    key: "grado_estudios",
    label: "Grado de estudios",
    value: safeValue(props.data.grado_estudios),
  },
  {
    key: "profesion",
    label: "Profesion",
    value: safeValue(props.data.profesion),
  },
  {
    key: "ocupacion_actual",
    label: "Ocupacion actual",
    value: safeValue(props.data.ocupacion_actual),
  },
  {
    key: "empresa_institucion",
    label: "Empresa o institucion",
    value: safeValue(props.data.empresa_institucion),
  },
  {
    key: "idioma",
    label: "Idioma",
    value: safeValue(props.data.idioma),
  },
  {
    key: "idioma_escritura",
    label: "% escritura",
    value: safeValue(props.data.idioma_escritura),
  },
  {
    key: "idioma_hablado",
    label: "% hablado",
    value: safeValue(props.data.idioma_hablado),
  },
]);

const interesItems = computed<FieldItem[]>(() => [
  {
    key: "medio_difusion",
    label: "Como te enteraste de la institucion",
    value: pickValue(props.data.medio_difusion, props.data.como_te_enteraste),
    full: true,
  },
  {
    key: "expectativas",
    label: "Que esperas recibir de la Cruz Roja",
    value: pickValue(
      props.data.expectativas_cruz_roja,
      props.data.que_esperas_recibir,
    ),
    full: true,
  },
  {
    key: "voluntario_otra_institucion",
    label: "Alguna vez has sido voluntario de otra institucion",
    value: normalizeBool(props.data.voluntario_otra_institucion),
    full: true,
  },
]);

const disponibilidadItems = computed<FieldItem[]>(() => [
  {
    key: "lunes",
    label: "Lunes",
    value: normalizeBool(props.data.disponibilidad_lunes),
  },
  {
    key: "martes",
    label: "Martes",
    value: normalizeBool(props.data.disponibilidad_martes),
  },
  {
    key: "miercoles",
    label: "Miercoles",
    value: normalizeBool(props.data.disponibilidad_miercoles),
  },
  {
    key: "jueves",
    label: "Jueves",
    value: normalizeBool(props.data.disponibilidad_jueves),
  },
  {
    key: "viernes",
    label: "Viernes",
    value: normalizeBool(props.data.disponibilidad_viernes),
  },
  {
    key: "sabado",
    label: "Sabado",
    value: normalizeBool(props.data.disponibilidad_sabado),
  },
  {
    key: "domingo",
    label: "Domingo",
    value: normalizeBool(props.data.disponibilidad_domingo),
  },
  {
    key: "turno",
    label: "Turno",
    value: safeValue(props.data.turno),
  },
  {
    key: "horario",
    label: "Horario",
    value: safeValue(props.data.horario),
  },
]);

const sections = computed<SectionItem[]>(() => [
  {
    key: "salud",
    title: "Salud",
    icon: "fa-solid fa-heart-pulse",
    items: saludItems.value,
  },
  {
    key: "contacto",
    title: "Datos de contacto",
    icon: "fa-solid fa-location-dot",
    items: contactoItems.value,
  },
  {
    key: "emergencia",
    title: "Datos de contacto de emergencia",
    icon: "fa-solid fa-triangle-exclamation",
    items: emergenciaItems.value,
  },
  {
    key: "profesionales",
    title: "Datos profesionales",
    icon: "fa-solid fa-briefcase",
    items: profesionalesItems.value,
  },
  {
    key: "interes",
    title: "Datos de interes institucional",
    icon: "fa-solid fa-hand-holding-heart",
    items: interesItems.value,
  },
  {
    key: "disponibilidad",
    title: "Datos de disponibilidad",
    icon: "fa-solid fa-calendar-days",
    items: disponibilidadItems.value,
  },
]);

const regularSections = computed(() =>
  sections.value.filter((section) => section.key !== "disponibilidad"),
);

const disponibilidadSection = computed(() =>
  sections.value.find((section) => section.key === "disponibilidad"),
);

const diasDisponibilidad = computed(() => [
  {
    key: "lunes",
    short: "L",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_lunes,
  },
  {
    key: "martes",
    short: "M",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_martes,
  },
  {
    key: "miercoles",
    short: "M",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_miercoles,
  },
  {
    key: "jueves",
    short: "J",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_jueves,
  },
  {
    key: "viernes",
    short: "V",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_viernes,
  },
  {
    key: "sabado",
    short: "S",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_sabado,
  },
  {
    key: "domingo",
    short: "D",
    active: !!(activeEditSection.value ? localData.value : props.data)
      .disponibilidad_domingo,
  },
]);

function turnoActivo(tipo: "matutino" | "vespertino" | "discontinuo") {
  const sourceData = activeEditSection.value ? localData.value : props.data;
  const turnoRaw = String(sourceData.turno || "").toLowerCase();

  if (tipo === "matutino") {
    return !!sourceData.turno_matutino || turnoRaw.includes("mat");
  }

  if (tipo === "vespertino") {
    return !!sourceData.turno_vespertino || turnoRaw.includes("vesp");
  }

  return (
    !!sourceData.turno_discontinuo ||
    !!sourceData.turno_discont ||
    turnoRaw.includes("discont")
  );
}

const horarioParts = computed(() => {
  const sourceData = activeEditSection.value ? localData.value : props.data;
  const horario = String(sourceData.horario || "");
  const [inicio, fin] = horario
    .split(/\s*-\s*/)
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    inicio: inicio || "-",
    fin: fin || "-",
  };
});

function handleEditSection(sectionKey: string) {
  localData.value = { ...props.data };
  activeEditSection.value = sectionKey;
}

function handleCancelEdit() {
  localData.value = { ...props.data };
  activeEditSection.value = null;
}

function handleSaveSection() {
  emit("update:data", { ...localData.value });
  activeEditSection.value = null;
}
</script>

<template>
  <div class="personal-root">
    <section
      v-for="section in regularSections"
      :key="section.key"
      class="personal-section"
    >
      <header class="section-header">
        <div class="section-header-left">
          <i :class="`${section.icon} section-icon`" aria-hidden="true" />
          <h3 class="section-title">{{ section.title }}</h3>
        </div>
        <VBtn
          size="x-small"
          icon
          variant="flat"
          color="white"
          class="section-edit-btn"
          @click="handleEditSection(section.key)"
        >
          <i class="fa-solid fa-pen" aria-hidden="true" />
        </VBtn>
      </header>

      <div v-if="activeEditSection === section.key" class="section-form-wrap">
        <ModuladorFormFactory
          :schema="sectionSchemas[section.key] || []"
          :modelValue="localData"
          :formLive="true"
          @update:modelValue="(val) => (localData.value = val)"
        />

        <div class="section-form-actions">
          <VBtn size="small" color="red-darken-2" @click="handleSaveSection">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true" />
            Guardar
          </VBtn>
          <VBtn
            size="small"
            variant="tonal"
            color="secondary"
            @click="handleCancelEdit"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true" />
            Cancelar
          </VBtn>
        </div>
      </div>

      <div v-else class="fields-grid">
        <div
          v-for="item in section.items"
          :key="item.key"
          class="field-item"
          :class="{ 'field-item--full': item.full }"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section
      v-if="disponibilidadSection"
      class="personal-section availability-wrap"
    >
      <header class="section-header">
        <div class="section-header-left">
          <i
            :class="`${disponibilidadSection.icon} section-icon`"
            aria-hidden="true"
          />
          <h3 class="section-title">
            {{ disponibilidadSection.title }}
          </h3>
        </div>
        <VBtn
          size="x-small"
          icon
          variant="flat"
          color="white"
          class="section-edit-btn section-edit-btn--availability"
          @click="handleEditSection(disponibilidadSection.key)"
        >
          <i class="fa-solid fa-pen" aria-hidden="true" />
        </VBtn>
      </header>

      <div
        v-if="activeEditSection === disponibilidadSection.key"
        class="section-form-wrap"
      >
        <ModuladorFormFactory
          :schema="sectionSchemas[disponibilidadSection.key] || []"
          :modelValue="localData"
          :formLive="true"
          @update:modelValue="(val) => (localData.value = val)"
        />

        <div class="section-form-actions">
          <VBtn size="small" color="red-darken-2" @click="handleSaveSection">
            <i class="fa-solid fa-floppy-disk" aria-hidden="true" />
            Guardar
          </VBtn>
          <VBtn
            size="small"
            variant="tonal"
            color="secondary"
            @click="handleCancelEdit"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true" />
            Cancelar
          </VBtn>
        </div>
      </div>

      <div v-else class="availability-box">
        <div class="availability-row availability-row--head">
          <div class="cell-title">Dias</div>
          <div class="cell-title">Turno</div>
        </div>

        <div class="availability-row availability-row--main">
          <div class="dias-group">
            <div
              v-for="dia in diasDisponibilidad"
              :key="dia.key"
              class="tag-day"
              :class="{ 'tag-day--active': dia.active }"
            >
              {{ dia.short }}
            </div>
          </div>

          <div class="turno-group">
            <div
              class="tag-turno"
              :class="{ 'tag-turno--active': turnoActivo('matutino') }"
            >
              Mat.
            </div>
            <div
              class="tag-turno"
              :class="{ 'tag-turno--active': turnoActivo('vespertino') }"
            >
              Vesp.
            </div>
            <div
              class="tag-turno"
              :class="{ 'tag-turno--active': turnoActivo('discontinuo') }"
            >
              Discont.
            </div>
          </div>
        </div>

        <div class="availability-row availability-row--time">
          <div class="time-label">Horario de:</div>
          <div class="time-box">{{ horarioParts.inicio }}</div>
          <div class="time-sep">a:</div>
          <div class="time-box">{{ horarioParts.fin }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.personal-root {
  display: grid;
  gap: 0.85rem;
}

.personal-section {
  border: 1px solid #e4e8ef;
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  background: #fff;
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0;
  padding: 0.45rem 0.7rem;
  background: linear-gradient(90deg, #b71c1c 0%, #d32f2f 100%);
}

.section-header-left {
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
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  color: #b71c1c;
}

.section-form-wrap {
  padding: 0.65rem;
}

.section-form-actions {
  display: flex;
  gap: 0.55rem;
  margin-top: 0.55rem;
}

.fields-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  background: #fff;
  padding: 0.35rem 0.6rem 0.5rem;
}

.field-item {
  border: 0;
  border-bottom: 1px solid #edf1f6;
  background: transparent;
  border-radius: 0;
  min-height: 0;
  padding: 0.44rem 0.7rem 0.44rem 0;
  margin-right: 0.9rem;
}

.field-item--full {
  grid-column: 1 / -1;
  margin-right: 0;
}

.field-item span {
  display: block;
  color: #475569;
  font-size: 0.63rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 0.12rem;
}

.field-item strong {
  display: block;
  color: #1f2937;
  font-size: 0.88rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.availability-wrap {
  border-color: #dce3ef;
}

.section-edit-btn--availability {
  color: #b71c1c;
}

.availability-box {
  background: #fff;
  padding: 0.4rem 0.6rem 0.55rem;
  display: grid;
  gap: 0.32rem;
}

.availability-row {
  display: grid;
  gap: 0.3rem;
}

.availability-row--head {
  grid-template-columns: 3fr 2fr;
}

.availability-row--main {
  grid-template-columns: 3fr 2fr;
}

.availability-row--time {
  grid-template-columns: 1.45fr 1.7fr 0.5fr 1.35fr;
}

.cell-title,
.time-label,
.time-box,
.time-sep,
.tag-day,
.tag-turno {
  border: 0;
  border-bottom: 1px solid #edf1f6;
  background: transparent;
  border-radius: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.77rem;
  color: #334155;
  padding: 0.35rem 0.2rem;
}

.cell-title {
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dias-group {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.22rem;
}

.turno-group {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.22rem;
}

.tag-day,
.tag-turno {
  font-weight: 600;
  color: #64748b;
}

.tag-day--active,
.tag-turno--active {
  background: transparent;
  border-bottom-color: #e7a2a2;
  color: #9a1f1f;
}

.time-label {
  justify-content: flex-start;
  padding-left: 0;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.time-box {
  justify-content: flex-start;
  padding-left: 0;
  background: transparent;
  color: #111827;
  border-bottom-color: #d9e1ec;
  font-weight: 600;
}

.time-sep {
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 960px) {
  .fields-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .availability-row--head,
  .availability-row--main {
    grid-template-columns: 1fr;
  }

  .availability-row--time {
    grid-template-columns: 1fr;
  }

  .time-label,
  .time-box,
  .time-sep {
    justify-content: center;
    padding-left: 0;
  }
}

@media (max-width: 700px) {
  .fields-grid {
    grid-template-columns: 1fr;
  }

  .field-item,
  .field-item:nth-child(2n - 1):not(.field-item--full) {
    padding-right: 0;
    margin-right: 0;
  }
}
</style>
