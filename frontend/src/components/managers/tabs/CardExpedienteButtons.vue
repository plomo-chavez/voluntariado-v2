<script setup lang="ts">
const props = defineProps<{
  dataLocal?: any;
  fileCargado?: boolean;
  status?: any;
}>();

const emit = defineEmits([
  "open-file",
  "upload-document",
  "clear-input",
  "view-evidence",
]);

function onOpenFile() {
  emit("open-file");
}
function onUploadDocument() {
  emit("upload-document");
}
function onClearInput() {
  emit("clear-input");
}
function onViewEvidence() {
  emit("view-evidence");
}
</script>

<template>
  <div class="flex flex-row gap-2">
    <div v-if="!(dataLocal?.fecha_registro ?? false) && !fileCargado">
      <VBtn size="small" variant="tonal" color="primary" @click="onOpenFile">
        <VIcon icon="tabler-paperclip" class="font-weight-medium" />
      </VBtn>
    </div>

    <div v-else>
      <div v-if="fileCargado" class="flex flex-row gap-2">
        <VBtn
          size="small"
          variant="tonal"
          color="primary"
          @click="onUploadDocument"
        >
          <VIcon icon="tabler-upload" class="font-weight-medium" />
        </VBtn>
        <VBtn
          size="small"
          variant="tonal"
          color="secondary"
          @click="onClearInput"
        >
          <VIcon icon="tabler-cancel" class="font-weight-medium" />
        </VBtn>
      </div>

      <div v-else class="flex flex-row gap-2">
        <VBtn
          size="small"
          variant="tonal"
          color="secondary"
          @click="onViewEvidence"
        >
          <VIcon icon="tabler-eye" class="font-weight-medium" />
        </VBtn>
        <VBtn
          size="small"
          variant="tonal"
          color="secondary"
          @click="onOpenFile"
        >
          <VIcon icon="tabler-refresh" class="font-weight-medium" />
        </VBtn>
      </div>
    </div>
  </div>
</template>
