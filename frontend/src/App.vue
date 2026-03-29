<script setup lang="ts">
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import TokenExpiringModal from "@/components/TokenExpiringModal.vue";
import { useLoadingOverlayStore } from "@/stores/loadingOverlayStore"; // Importa el store
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@core/utils/colorConverter";
import { useTheme } from "vuetify";

const { global } = useTheme();
initCore();
initConfigStore();
const configStore = useConfigStore();
// Usa el store del overlay
const loadingOverlayStore = useLoadingOverlayStore();
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary,
      )}`"
    >
      <LoadingOverlay
        :isActivo="loadingOverlayStore.isActivo"
        :fullscreen="loadingOverlayStore.fullscreen"
      />
      <RouterView />
      <ScrollToTop />
      <TokenExpiringModal />
    </VApp>
  </VLocaleProvider>
</template>
