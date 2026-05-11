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

function handleUpdateData(val: Record<string, any>) {
  voluntarioData.value = { ...voluntarioData.value, ...val };
}
onBeforeMount(async () => {
  await apiRequest({
    method: "GET",
    url: "/api/elemento/" + props.data.id,
    messageType: "toast",
    onSuccess: (response: any) => {
      voluntarioData.value = {
        ...deepToRaw(props.data),
        ...deepToRaw(response),
      };
    },
  });
});
</script>

<template>
  <div v-if="voluntarioData != null" class="perfil-shell">
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
