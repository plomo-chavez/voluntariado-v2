<script lang="ts" setup>
import TabExpediente from "@/components/managers/tabs/TabExpediente.vue";
import TabFormacion from "@/components/managers/tabs/TabFormacion.vue";
import TabHoras from "@/components/managers/tabs/TabHoras.vue";
import TabInfoPersonal from "@/components/managers/tabs/TabInfoPersonal.vue";
import TabInfoVoluntario from "@/components/managers/tabs/TabInfoVoluntario.vue";
import { onBeforeMount, ref } from "vue";

// ─── Props / Emits ───────────────────────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    data?: any;
    title?: string | null;
  }>(),
  {
    title: "Perfil de Voluntario",
    data: () => null,
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
const voluntarioData = ref<any>(null);
const show = ref<boolean>(false);
const moodChange = ref<boolean>(false);

async function handleUpdateData(val: Record<string, any>) {
  // await getData();
}

async function getData() {
  await apiRequest({
    method: "GET",
    loader: true,
    url: "/api/elemento/" + props.data.id,
    messageType: "toast",
    onSuccess: (response: any) => {
      moodChange.value = !moodChange.value;
      voluntarioData.value = {
        ...deepToRaw(props.data),
        ...deepToRaw(response),
      };
      setTimeout(() => {
        show.value = true;
        moodChange.value = !moodChange.value;
      }, 100);
    },
  });
}
onBeforeMount(async () => {
  await getData();
});
</script>

<template v-if="show">
  <div class="perfil-shell">
    <button
      type="button"
      class="perfil-back"
      @click="emit('back')"
      aria-label="Volver al inicio"
    >
      <VIcon icon="tabler-arrow-left" start size="18" />
      <span class="perfil-subtitle">Volver al inicio</span>
    </button>
  </div>
  <div v-if="voluntarioData != null" class="perfil-shell">
    <!-- Cabecera -->
    <div class="perfil-header mb-4">
      <div class="d-flex align-center gap-2">
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
        <div class="tab-panel">
          <TabInfoVoluntario
            v-if="activeTab === 'infoVoluntario'"
            :data="voluntarioData"
            :change="moodChange"
            @update:data="handleUpdateData"
          />

          <TabInfoPersonal
            v-else-if="activeTab === 'infoPersonal'"
            :data="voluntarioData"
            @update:data="handleUpdateData"
          />

          <TabExpediente
            v-else-if="activeTab === 'expediente'"
            :data="voluntarioData"
          />

          <TabFormacion
            v-else-if="activeTab === 'formacion'"
            :data="voluntarioData"
            @update:data="handleUpdateData"
          />

          <TabHoras
            v-else-if="activeTab === 'horas'"
            :data="voluntarioData"
            @update:data="handleUpdateData"
          />
        </div>
      </VCardText>
    </VCard>
  </div>
  <div v-else>
    <div class="tab-placeholder">
      <VIcon size="48" color="primary" icon="mdi-account-card" />
      <p class="mt-2">No se encontraron datos del voluntario.</p>
    </div>
  </div>
</template>

<style scoped>
.perfil-shell {
  max-width: 1120px;
  margin: 0 auto;
}

.perfil-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border: none;
  background: transparent;
  color: #2f3b46;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.perfil-back:hover {
  opacity: 0.8;
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
