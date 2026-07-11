<script setup lang="ts">
import FormFactory from "@/components/apps/FormFactory.vue";
// prettier-ignore
import { VCard, VCardText, VDialog } from "vuetify/components";

interface Field {
  label: string;
  type: string;
  model: string;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  catalogo?: string;
  multiple?: boolean;
}

// prettier-ignore
const props = withDefaults(
  defineProps<{
    title?: any;
    showTitle?: boolean;
    divCard?: boolean;
    schema: any[];
    modelValue: Record<string, any>;
    formModal?: boolean;
    isDialogVisible?: boolean;
    isDisabled?: boolean;
    formLive?: boolean;
    showButtonsAction?: boolean;
    textButtonCancel?: string | null;
    titleClass?: string;
    textButtonSubmit?: string | null;
    customTitle?: boolean;
    showIconButtonSubmit?: boolean;
    showIconButtonCancel?: boolean;
    showMessageRequired?: boolean;
    showButtonSubmit?: boolean;
    showButtonCancel?: boolean;
    iconButtonCancel?: string;
    iconButtonSubmit?: string;
    classForm?: string | null;
    formRequired?: boolean;
    variantButtonCancel?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
    variantButtonSubmit?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
    colorButtonCancel?: string;
    colorButtonSubmit?: string;
  }>(),
  {
    title: null,
    formModal: false,
    classForm: null,
    showMessageRequired: true,
    divCard: false,
    formLive: false,
    isDisabled: false,
    formRequired: false,
    showButtonsAction: true,
    showIconButtonSubmit: true,
    isDialogVisible: false,
    customTitle: false,
    showIconButtonCancel: true,
    showButtonSubmit: true,
    showButtonCancel: true,
    textButtonCancel: null,
    textButtonSubmit: null,
    variantButtonCancel: "outlined",
    variantButtonSubmit: "elevated",
    colorButtonCancel: "secondary",
    colorButtonSubmit: "success",
    iconButtonCancel: "tabler-x",
    iconButtonSubmit: "tabler-check",
    titleClass: "",
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void;
}>();

// prettier-ignore
function handleSubmit(data: any) {
  emit("submit", data);
  emit("update:isDialogVisible", false);
} // prettier-ignore
function handleUpdate(data: any) {
  emit("update:modelValue", data);
}

function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false);
}
</script>

<template>
  <div>
    <!-- Modal Form -->
    <!-- prettier-ignore -->
    <VDialog v-if="formModal" :model-value="isDialogVisible" persistent class="v-dialog-sm" >
      <DialogCloseBtn @click="handleCancel" />
      <!-- prettier-ignore -->
      <VCard :title="title != null ? props.customTitle ? title : ('Formulario de ' + title.toLowerCase()) : ''" >
        <VCardText>
          <FormFactory
          :schema="props.schema"
          :modelValue="props.modelValue"
          :isDisabled="props.isDisabled"
          :formRequired="props.formRequired"
          :isDialogVisible="props.isDialogVisible"
          :showButtonsAction="props.showButtonsAction"
          @submit="handleSubmit"
          @cancel="handleCancel"
           />
        </VCardText>
      </VCard>
    </VDialog>

    <!-- Inline Form -->
    <div v-else>
      <component
        :is="props.divCard ? VCard : 'div'"
        :class="props.classForm && 'pa-6 mx-auto mb-4'"
      >
        <!-- prettier-ignore -->
        <h1 :class="props.titleClass">
          {{ title != null ? props.customTitle ? title : ('Formulario de ' + title.toLowerCase()) : '' }}
        </h1>
        <FormFactory
          :schema="props.schema"
          :formLive="props.formLive"
          :modelValue="props.modelValue"
          :isDisabled="props.isDisabled"
          @update:modelValue="handleUpdate"
          :formRequired="props.formRequired"
          :isDialogVisible="props.isDialogVisible"
          :showButtonsAction="props.showButtonsAction"
          :showIconButtonSubmit="props.showIconButtonSubmit"
          :showIconButtonCancel="props.showIconButtonCancel"
          :showButtonSubmit="props.showButtonSubmit"
          :showButtonCancel="props.showButtonCancel"
          :textButtonCancel="props.textButtonCancel"
          :textButtonSubmit="props.textButtonSubmit"
          :iconButtonCancel="props.iconButtonCancel"
          :iconButtonSubmit="props.iconButtonSubmit"
          :showMessageRequired="props.showMessageRequired"
          :variantButtonCancel="props.variantButtonCancel"
          :variantButtonSubmit="props.variantButtonSubmit"
          :colorButtonCancel="props.colorButtonCancel"
          :colorButtonSubmit="props.colorButtonSubmit"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </component>
    </div>
  </div>
</template>
