<script lang="ts" setup>
import { ref } from "vue";
import { safeValue } from "./customFunctionsInfo";

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

const isEditing = ref(true);
const localData = ref(JSON.parse(JSON.stringify(props.data)));

onMounted(() => {
  isEditing.value = false;
});

watch(
  () => props.change,
  () => {
    isEditing.value = true;
    localData.value = JSON.parse(JSON.stringify(props.data));
    isEditing.value = false;
  },
);
</script>

<template>
  <div class="header-left">
    <VAvatar size="72" class="perfil-avatar" color="red-darken-2">
      <img v-if="localData.foto" :src="localData.foto" alt="Foto de perfil" />
      <span v-else class="avatar-text">{{ "-" }}</span>
    </VAvatar>

    <div class="header-user-meta">
      <h2 class="user-name">
        {{ nombreCompleto(localData) || "Voluntario sin nombre" }}
      </h2>
      <p class="user-role-line">
        {{ safeValue(localData?.area?.label) }} -
        {{ safeValue(localData?.cargo?.label) }}
      </p>
      <div class="user-badges">
        <p color="red-darken-2" variant="flat" size="small" label>
          {{ safeValue(localData.numero_asociado) }}
        </p>
        <VChip
          :color="true ? 'success' : 'grey-darken-1'"
          variant="tonal"
          size="small"
          label
        >
          {{ localData.estatus === 1 ? "Activo" : "Inactivo" }}
        </VChip>
      </div>
    </div>
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
  /* background: var(--accent-soft); */
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
