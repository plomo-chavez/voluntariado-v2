<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    label?: string;
    accept?: string;
    multiple?: boolean;
    helperText?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    dragAndDrop?: boolean;
  }>(),
  {
    modelValue: null,
    label: "Seleccione un documento",
    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
    multiple: false,
    helperText: "Seleccione un documento",
    disabled: false,
    required: false,
    placeholder: "Sin archivo seleccionado",
    dragAndDrop: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: File | File[] | null): void;
  (event: "change", value: File | File[] | null): void;
  (event: "handleEmit", value: File | File[] | null): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const localFiles = ref<File[]>([]);
const isDragging = ref(false);
const fileIcon = ref("tabler-file-text");

const selectedFile = computed(() => {
  if (!localFiles.value.length) return null;
  return localFiles.value[0] ?? null;
});

const selectedNames = computed(() => {
  if (!localFiles.value.length) return props.placeholder;

  if (props.multiple) {
    return localFiles.value.map((file) => file.name).join(", ");
  }

  return localFiles.value[0]?.name ?? props.placeholder;
});

const selectedCount = computed(() => localFiles.value.length);

const fileType = computed(() => {
  if (!selectedFile.value) return "Sin tipo";
  const selectedType = selectedFile.value.type || "application/unknown";
  return (
    selectedType.split("/")[1]?.toUpperCase() || selectedType.toUpperCase()
  );
});

const fileSize = computed(() => {
  if (!selectedFile.value) return "0 KB";

  const size = selectedFile.value.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

function getFileIconByType(file: File | null) {
  if (!file) return "tabler-file-text";

  const type = file.type.toLowerCase();
  if (type.includes("pdf")) return "tabler-file-type-pdf";
  if (type.includes("word") || type.includes("doc"))
    return "tabler-file-type-doc";
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv"))
    return "tabler-file-type-xls";
  if (type.includes("image")) return "tabler-file-type-jpg";
  return "tabler-file-text";
}

function normalizeFiles(list: FileList | null): File[] {
  return list ? Array.from(list) : [];
}

function emitValue(value: File | File[] | null) {
  emit("update:modelValue", value);
  emit("change", value);
  emit("handleEmit", value);

  const hasSelectedDocument =
    value instanceof File || (Array.isArray(value) && value.length > 0);

  if (hasSelectedDocument) {
    console.log("Documento seleccionado:", value);
  } else {
    console.log("Documento removido:", value);
  }
}

function clearSelection() {
  localFiles.value = [];
  emitValue(props.multiple ? [] : null);
  fileIcon.value = "tabler-file-text";
}

function handleFiles(fileList: FileList | File[] | null) {
  const files = Array.isArray(fileList)
    ? fileList
    : normalizeFiles(fileList as FileList | null);

  if (!files.length) {
    clearSelection();
    return;
  }

  const nextValue = props.multiple ? files : (files[0] ?? null);
  localFiles.value = files;
  emitValue(nextValue);
  fileIcon.value = getFileIconByType(files[0] ?? null);
}

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function selectIcon(icon: string) {
  fileIcon.value = icon;
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  handleFiles(target.files);
  target.value = "";
}

function preventBrowserDefault(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function onDragOver(event: DragEvent) {
  if (!props.dragAndDrop || props.disabled) return;
  preventBrowserDefault(event);
  isDragging.value = true;
}

function onDragLeave(event: DragEvent) {
  if (!props.dragAndDrop || props.disabled) return;

  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget && (event.currentTarget as Node).contains(relatedTarget)) {
    return;
  }

  preventBrowserDefault(event);
  isDragging.value = false;
}

function onDrop(event: DragEvent) {
  if (!props.dragAndDrop || props.disabled) return;
  preventBrowserDefault(event);
  isDragging.value = false;
  handleFiles(event.dataTransfer?.files ?? null);
}

function onDragEnd() {
  isDragging.value = false;
}

function onGlobalDragOver(event: DragEvent) {
  if (!props.dragAndDrop || props.disabled) return;
  preventBrowserDefault(event);
}

function onGlobalDrop(event: DragEvent) {
  if (!props.dragAndDrop || props.disabled) return;
  preventBrowserDefault(event);
}

onMounted(() => {
  if (!props.dragAndDrop || props.disabled) return;
  document.addEventListener("dragover", onGlobalDragOver, { passive: false });
  document.addEventListener("drop", onGlobalDrop, { passive: false });
});

onBeforeUnmount(() => {
  document.removeEventListener("dragover", onGlobalDragOver);
  document.removeEventListener("drop", onGlobalDrop);
});

watch(
  () => props.modelValue,
  (value) => {
    if (Array.isArray(value)) {
      localFiles.value = value;
      fileIcon.value = getFileIconByType(value[0] ?? null);
      return;
    }

    if (value instanceof File) {
      localFiles.value = [value];
      fileIcon.value = getFileIconByType(value);
      return;
    }

    localFiles.value = [];
    fileIcon.value = "tabler-file-text";
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="w-full p-4 transition-all duration-200"
    :class="{
      '': isDragging && dragAndDrop,
      'cursor-not-allowed opacity-60': disabled,
      'cursor-pointer': !disabled,
    }"
    @dragenter="onDragOver"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="onDragEnd"
  >
    <label v-if="label" class="fontBold mb-0 block text-sm font-medium">
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500">*</span>
    </label>

    <p v-if="helperText" class="mt-0 mb-4 text-xs text-slate-500">
      {{ helperText }}
    </p>

    <template v-if="!selectedFile && !localFiles.length">
      <div v-if="dragAndDrop">
        <div
          @click="openPicker"
          class="flex flex-col items-center justify-center gap-3 rounded-lg border-dashed border-slate-300 bg-slate-50 border-2 py-6 text-center"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm"
          >
            <VIcon icon="tabler-cloud-upload" size="24" />
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium text-slate-700">
              {{
                isDragging && dragAndDrop
                  ? "Suelta aquí"
                  : "Arrastra y suelta tus archivos"
              }}
            </p>
            <p class="text-xs text-slate-500">o</p>
          </div>

          <VBtn
            type="button"
            :disabled="disabled"
            variant="outlined"
            color="primary"
            size="small"
            @click="openPicker"
          >
            <VIcon start icon="tabler-upload" />
            Seleccionar archivo
          </VBtn>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center">
        <VBtn
          type="button"
          :disabled="disabled"
          variant="outlined"
          color="primary"
          size="small"
          @click="openPicker"
        >
          <VIcon start icon="tabler-upload" />
          Seleccionar archivo
        </VBtn>
      </div>
    </template>

    <template v-else>
      <div
        class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
        >
          <VIcon :icon="fileIcon" size="24" />
        </div>

        <div class="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-800">
              {{
                props.multiple
                  ? `${selectedCount} archivos seleccionados`
                  : (selectedFile?.name ?? selectedNames)
              }}
            </p>

            <div
              v-if="!props.multiple"
              class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500"
            >
              <span>{{ fileType }}</span>
              <span>{{ fileSize }}</span>
            </div>

            <div v-else class="mt-1 text-xs text-slate-500">
              {{ selectedNames }}
            </div>
          </div>

          <VBtn
            v-if="localFiles.length"
            type="button"
            icon="tabler-x"
            variant="tonal"
            color="secondary"
            size="x-small"
            @click="clearSelection"
          />
        </div>
      </div>
    </template>

    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="onInputChange"
    />
  </div>
</template>
