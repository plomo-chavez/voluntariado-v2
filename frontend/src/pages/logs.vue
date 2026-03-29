<script setup lang="ts">
import CrudManager from "@/components/apps/VistaUno.vue";

const showFormEdit = ref(false); // Referencia al componente FormFactory
const data: any = ref(null); // Referencia al componente FormFactory
const showDetailDialog = ref(false);
const selectedLog = ref<any>(null);
const selectedMeta = ref<any>(null);

function parseExtraData(extraData: any) {
  if (!extraData) return null;

  if (typeof extraData === "object") return extraData;

  if (typeof extraData === "string") {
    try {
      return JSON.parse(extraData);
    } catch (_error) {
      return null;
    }
  }

  return null;
}

function normalizeDetailItem(item: any) {
  const parsedMeta = parseExtraData(item?.extraData);

  selectedLog.value = item;
  selectedMeta.value = parsedMeta;
  showDetailDialog.value = true;
}

const detailRows = computed(() => {
  const meta = selectedMeta.value || {};

  return [
    { label: "Timestamp UTC", value: meta.timestamp_utc || "N/D" },
    { label: "User ID", value: meta.user_id ?? "N/D" },
    { label: "Usuario", value: meta.user_name || "N/D" },
    { label: "IP pública", value: meta.ip_publica || "N/D" },
    { label: "País", value: meta.pais || "N/D" },
    { label: "Región", value: meta.region || "N/D" },
    { label: "Ciudad", value: meta.ciudad || "N/D" },
    { label: "ASN", value: meta.asn || "N/D" },
    { label: "ISP", value: meta.isp || "N/D" },
    { label: "User Agent", value: meta.user_agent || "N/D" },
    { label: "Tipo de dispositivo", value: meta.device_type || "N/D" },
    { label: "Sistema operativo", value: meta.so || "N/D" },
    { label: "Navegador", value: meta.browser || "N/D" },
    { label: "Device ID", value: meta.device_id || "N/D" },
    { label: "Idioma", value: meta.idioma || "N/D" },
    { label: "Timezone", value: meta.timezone || "N/D" },
    {
      label: "Location",
      value: meta.location ? JSON.stringify(meta.location) : "N/D",
    },
    { label: "Resultado", value: meta.resultado_login || "N/D" },
    { label: "Motivo fallo", value: meta.motivo_fallo || "N/D" },
    {
      label: "Frase inicio sesión",
      value: meta.frase_inicio_sesion || selectedLog.value?.accion || "N/D",
    },
  ];
});

const prettyMeta = computed(() => {
  if (!selectedMeta.value) return "Sin extraData parseable";
  return JSON.stringify(selectedMeta.value, null, 2);
});

// prettier-ignore
const tableHeaders = [
  { title: "ID", key: "id" },
  { title: "Acción", key: "accion" },
  { title: "Usuario", key: "usuario.nombre" },
  { title: "Estatus", key: "estatus", format: (value : any) => (value === 1 ? "Activo" : "Inactivo"), },
  { title: "Creación", key: "created_at" },
];

const apiEndpoints = {
  // fetch: "/api/test", // Endpoint para obtener datos
  fetch: "/api/logs", // Endpoint para obtener datos
  create: "/api/logs", // Endpoint para crear un elemento
  update: "/api/logs", // Endpoint para actualizar un elemento
  delete: "/api/logs/eliminar", // Endpoint para eliminar un elemento
};
const configTable: any = ref({ actions: [] });

onMounted(() => {
  configTable.value = { actions: ["Editar"] };
});
</script>

<template>
  <div>
    <h1>Logs</h1>
    <CrudManager
      title="Logs"
      :emitEdit="true"
      :formModal="true"
      :show-title="false"
      :emitNew="false"
      :showBtnNuevo="false"
      :tableHeaders="tableHeaders"
      :apiEndpoints="apiEndpoints"
      :configTable="configTable"
      @customEdit="normalizeDetailItem"
    />

    <VDialog v-model="showDetailDialog" max-width="980">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Detalle del registro</span>
          <VChip
            size="small"
            :color="
              selectedMeta?.resultado_login === 'success' ? 'success' : 'error'
            "
            variant="tonal"
          >
            {{ selectedMeta?.resultado_login || "N/D" }}
          </VChip>
        </VCardTitle>

        <VCardText>
          <VRow>
            <VCol v-for="item in detailRows" :key="item.label" cols="12" md="6">
              <div class="detail-item">
                <div class="detail-item__label">{{ item.label }}</div>
                <div class="detail-item__value">{{ item.value }}</div>
              </div>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <div class="detail-item__label mb-2">JSON completo</div>
          <pre class="json-preview">{{ prettyMeta }}</pre>
        </VCardText>

        <VCardActions class="justify-end">
          <VBtn color="primary" @click="showDetailDialog = false">Cerrar</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.detail-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  height: 100%;
}

.detail-item__label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.6);
}

.detail-item__value {
  margin-top: 4px;
  font-size: 14px;
  word-break: break-word;
}

.json-preview {
  max-height: 320px;
  overflow: auto;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
}
</style>
