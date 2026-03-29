<script setup lang="ts">
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import imageDenegado from "@images/cr/denegadoImage.png";
import miscMaskDark from "@images/pages/misc-mask-dark.png";
import miscMaskLight from "@images/pages/misc-mask-light.png";

const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark);

definePage({
  alias: "/pages/misc/denegado", // Cambia el alias aquí
  meta: {
    layout: "blank",
    public: true,
  },
});
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      title="Acceso denegado⚠️"
      description="No tienes permiso para acceder a esta página."
    />

    <VBtn to="/" class="mb-11"> Ir a inicio </VBtn>

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="imageDenegado"
        alt="error 404"
        :max-height="$vuetify.display.smAndDown ? 350 : 500"
        class="mx-auto"
      />
    </div>

    <img
      class="misc-footer-img d-none d-md-block"
      :src="authThemeMask"
      alt="misc-footer-img"
      height="320"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
