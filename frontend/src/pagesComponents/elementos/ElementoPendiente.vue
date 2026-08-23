<script setup lang="ts">
import ModuladorFormFactory from "@/components/apps/ModuladorFormFactory.vue";

const props = withDefaults(
  defineProps<{
    data: any;
  }>(),
  {
    data: {},
  },
);

const emit = defineEmits<{
  (e: "cancelar"): void;
}>();
// prettier-ignore
const formSchema: any = [
  { type: "label", label: "Nombre",             model: "nombre"},
  { type: "label", label: "Segundo nombre",     model: "segundo_nombre",},
  { type: "label", label: "Primer apellido",    model: "primer_apellido",},
  { type: "label", label: "Segundo apellido",   model: "segundo_apellido",},
  { type: "label", label: "CURP",               model: "curp",},
  { type: "label", label: "Correo",             model: "correo",},
  { type: "label", label: "Teléfono",           model: "telefono",},
  { type: "label", label: "Estado",             model: "estado"},
  { type: "label", label: "Delegación",         model: "delegacion"},
  { type: "label", label: "Área",               model: "area"},
];

// prettier-ignore
const handleSubmit = async () => {
  await apiRequest({
    loader: true,
    showMessages: false,
    url: "/api/elemento",
    method: "POST",
    payload: {
        section:"estatus",
        id: props.data.id,
        estatusRegistro: 1,
    },
    onSuccess: (response: any) => { emit("cancelar");     },
  });
};
// prettier-ignore
onBeforeMount(() => {});
</script>

<!-- prettier-ignore -->
<template>
  <VCard class="mt-4">
    <VCardTitle class="d-flex justify-space-between align-center py-4 px-6">
      <span class="text-h5">Nuevo voluntario</span>
    </VCardTitle>
    <VDivider />
    <VCardText class="pt-6">
        <p class="text-body-1 mb-4">Primero valida la CURP antes de capturar datos del voluntario.</p>
        <ModuladorFormFactory
            :schema="formSchema"
            :modelValue="props.data"
            :showMessageRequired="false"
            :showIconButtonCancel="false"
            :showIconButtonSubmit="false"
            :variantButtonCancel="'tonal'"
            :variantButtonSubmit="'tonal'"
            :colorButtonCancel="'secondary'"
            :colorButtonSubmit="'primary'"
            :buttonAlignmentBetween="'between'"
            :textButtonCancel="'Cancelar'"
            :textButtonSubmit="'Validar CURP'"
            @submit="handleSubmit"
        />
    </VCardText>
  </VCard>
</template>
