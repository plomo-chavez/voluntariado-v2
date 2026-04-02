<script lang="ts" setup>
import TabExpediente from "@/components/managers/tabs/TabExpediente.vue";
import TabFormacion from "@/components/managers/tabs/TabFormacion.vue";
import TabHoras from "@/components/managers/tabs/TabHoras.vue";
import TabInfoPersonal from "@/components/managers/tabs/TabInfoPersonal.vue";
import TabInfoVoluntario from "@/components/managers/tabs/TabInfoVoluntario.vue";
import { ref } from "vue";

// ─── Props / Emits ───────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    data?: Record<string, any>;
    title?: string | null;
  }>(),
  {
    title: "Perfil de Voluntario",
    data: () => ({}),
  },
);

const emit = defineEmits<{
  (event: "back"): void;
}>();

// ─── Tabs ────────────────────────────────────────────────────────────────────────
const TABS = [
  {
    key: "infoVoluntario",
    label: "Información del voluntario",
    icon: "mdi-account-card",
  },
  { key: "infoPersonal", label: "Información personal", icon: "mdi-account" },
  { key: "expediente", label: "Expediente", icon: "mdi-folder-account" },
  { key: "formacion", label: "Formación", icon: "mdi-school" },
  { key: "horas", label: "Horas", icon: "mdi-clock-outline" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const activeTab = ref<TabKey>("infoVoluntario");

// ─── Datos del voluntario ────────────────────────────────────────────────────────
const dataDummie: Record<string, any> = {
  numero_interno: "CR-99201-PZ",
  numero_asociado: "ASC-2014-0012",
  nombre: "Juan",
  segundo_nombre: "Ignacio",
  primer_apellido: "Perez",
  segundo_apellido: "Lopez",
  fecha_nacimiento: "1992-04-15",
  lugar_nacimiento: "CDMX",
  id_nacionalidad: "Mexicana",
  sexo: "M",
  id_estado_civil: 2,
  id_grupo_sanguineo: "O+",
  curp: "PELJ920415HDFRRL02",
  telefono: "+52 55 1234 5678",
  correo: "juan.perez@redcross.org.mx",
  id_area: "Socorros / Operaciones Especiales",
  area_nombre: "Socorros",
  cargo_nombre: "Especialista en Respuesta a Desastres",
  id_estado: "Personal de Base",
  id_delegacion: "CDMX Central",
  fecha_ingreso_cr: "2014-03-15",
  fecha_ingreso_area: "2020-01-01",
  estatus: true,
  seguro_social: "IMSS 45871233",
  seguro_institucional: "Poliza CR-22019",
  capacidades_diferentes: false,
  alergias: "Penicilina",
  enfermedades: "Ninguna",
  direccion: "Av. Reforma 120",
  colonia: "Juarez",
  no_interno: "4B",
  no_externo: "120",
  cp: "06600",
  estado_domicilio: "CDMX",
  ciudad: "Cuauhtemoc",
  pasaporte: "G23456789",
  licencia: "CDMX-A99812",
  contacto_emergencia_nombre: "Ana Lopez",
  contacto_emergencia_parentesco: "Hermana",
  contacto_emergencia_telefono: "+52 55 9876 5432",
  grado_estudios: "Licenciatura",
  profesion: "Paramedico",
  ocupacion_actual: "Coordinador de brigada",
  empresa_institucion: "Cruz Roja Mexicana",
  idioma: "Ingles",
  idioma_escritura: "80%",
  idioma_hablado: "70%",
  medio_difusion: "Por recomendacion de un amigo",
  expectativas_cruz_roja: "Capacitacion continua y crecimiento profesional",
  voluntario_otra_institucion: true,
  disponibilidad_lunes: true,
  disponibilidad_martes: true,
  disponibilidad_miercoles: false,
  disponibilidad_jueves: true,
  disponibilidad_viernes: true,
  disponibilidad_sabado: false,
  disponibilidad_domingo: true,
  turno: "Vespertino",
  horario: "16:00 - 20:00",
  foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  formaciones: [
    {
      id: "form-1",
      tipo: "institucional",
      area: "Socorros",
      capacitacion: "Primeros Auxilios Avanzados",
      fecha: "2025-11-15",
      evidencia_nombre: "constancia-primeros-auxilios.pdf",
      evidencia_url:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      id: "form-2",
      tipo: "externo",
      nombre_taller: "Manejo de Estrés en Emergencias",
      institucion: "CENAPRED",
      fecha: "2026-01-20",
      evidencia_nombre: "diploma-estres-emergencias.pdf",
      evidencia_url:
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
  ],
  horas_registros: [
    {
      id: "hora-1",
      area: "Socorros",
      actividad: "Guardia de ambulancia",
      fecha_inicio: "2026-02-03",
      hora_inicio: "08:00",
      fecha_fin: "2026-02-03",
      hora_fin: "12:30",
      acumulado: 4.5,
    },
    {
      id: "hora-2",
      area: "Socorros",
      actividad: "Apoyo en simulacro delegacional",
      fecha_inicio: "2026-02-10",
      hora_inicio: "09:00",
      fecha_fin: "2026-02-10",
      hora_fin: "13:00",
      acumulado: 4,
    },
    {
      id: "hora-3",
      area: "Juventud",
      actividad: "Taller comunitario de prevención",
      fecha_inicio: "2026-02-17",
      hora_inicio: "16:00",
      fecha_fin: "2026-02-17",
      hora_fin: "19:15",
      acumulado: 3.25,
    },
  ],
};

const voluntarioData = ref<Record<string, any>>({
  ...dataDummie,
  ...(props.data ?? {}),
});

function handleUpdateData(val: Record<string, any>) {
  voluntarioData.value = { ...voluntarioData.value, ...val };
}
</script>

<template>
  <div class="perfil-shell">
    <!-- Cabecera -->
    <div class="perfil-header mb-4">
      <div class="d-flex align-center gap-2">
        <VBtn
          icon="mdi-arrow-left"
          variant="text"
          color="secondary"
          size="small"
          @click="emit('back')"
        />
        <div>
          <h1 class="perfil-title">{{ props.title }}</h1>
          <p class="perfil-subtitle">Gestión del expediente del voluntario</p>
        </div>
      </div>
    </div>

    <!-- Card principal -->
    <VCard class="perfil-card">
      <!-- Tabs -->
      <VTabs
        v-model="activeTab"
        color="primary"
        show-arrows
        class="perfil-tabs"
      >
        <VTab
          v-for="tab in TABS"
          :key="tab.key"
          :value="tab.key"
          class="perfil-tab"
        >
          <VIcon start :icon="tab.icon" size="18" />
          {{ tab.label }}
        </VTab>
      </VTabs>

      <VDivider />

      <VCardText class="perfil-content">
        <VWindow v-model="activeTab">
          <!-- Tab: Información del voluntario -->
          <VWindowItem value="infoVoluntario">
            <TabInfoVoluntario
              :data="voluntarioData"
              @update:data="handleUpdateData"
            />
          </VWindowItem>

          <!-- Tab: Información personal -->
          <VWindowItem value="infoPersonal">
            <TabInfoPersonal
              :data="voluntarioData"
              @update:data="handleUpdateData"
            />
          </VWindowItem>

          <!-- Tab: Expediente -->
          <VWindowItem value="expediente">
            <TabExpediente />
          </VWindowItem>

          <!-- Tab: Formación -->
          <VWindowItem value="formacion">
            <TabFormacion
              :data="voluntarioData"
              @update:data="handleUpdateData"
            />
          </VWindowItem>

          <!-- Tab: Horas -->
          <VWindowItem value="horas">
            <TabHoras :data="voluntarioData" @update:data="handleUpdateData" />
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.perfil-shell {
  max-width: 1120px;
  margin: 0 auto;
}

.perfil-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.perfil-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}

.perfil-subtitle {
  margin: 0.2rem 0 0;
  color: #5f6d7a;
  font-size: 0.875rem;
}

.perfil-card {
  border: 1px solid #e4e9ef;
  border-radius: 14px;
  overflow: hidden;
}

.perfil-tabs {
  background: #f8fafc;
}

.perfil-tab {
  text-transform: none;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0;
  min-height: 52px;
}

.perfil-content {
  padding: 1.5rem;
}

.tab-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}

@media (max-width: 600px) {
  .perfil-title {
    font-size: 1.25rem;
  }

  .perfil-content {
    padding: 1rem;
  }
}
</style>
