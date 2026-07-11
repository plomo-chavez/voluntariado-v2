<script setup lang="ts">
import NuevoElemento from "@/pagesComponents/voluntarios/nuevoElemento.vue";
import { useRouter } from "vue-router";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const router = useRouter();

const handleVisibilityChange = (isVisible: boolean) => {
  if (!isVisible) {
    router.push({ name: "login" });
  }
};
</script>

<template>
  <VContainer class="nuevo-elemento-page py-8 py-md-12">
    <div class="nuevo-elemento-page__content">
      <NuevoElemento
        :isDialogVisible="true"
        @update:isDialogVisible="handleVisibilityChange"
      />
    </div>
  </VContainer>
</template>

<style scoped>
.nuevo-elemento-page {
  min-height: 100vh;
}

.nuevo-elemento-page__content {
  max-width: 980px;
  margin-inline: auto;
}
</style>
