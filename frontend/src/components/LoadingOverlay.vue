<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isActivo?: boolean; // Propiedad para activar o desactivar el overlay
    fullscreen?: boolean; // Propiedad para definir si es pantalla completa o solo dentro de un div
    texto?: string; // Texto que se mostrará en el overlay
    mostrarImagen?: boolean; // Estado para mostrar o no una imagen
  }>(),
  {
    isActivo: false, // Por defecto, no es pantalla completa
    fullscreen: false, // Por defecto, no es pantalla completa
    texto: "Cargando...!!", // Texto por defecto
    mostrarImagen: false, // Por defecto, no se muestra imagen
  },
);

import iconoDelFaro from "@images/avatars/avatarCR.png";
</script>

<template>
  <div v-if="isActivo" :class="['loading-overlay', { fullscreen }]">
    <div class="loading-content">
      <div v-if="mostrarImagen" class="loading-image">
        <img
          :src="iconoDelFaro"
          class="auth-logo-img"
          alt="logo"
          height="200px"
        />
      </div>
      <div class="spinner"></div>
      <span class="loading-text">{{ texto }}</span>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(
    255,
    255,
    255,
    0.8
  ); /* Fondo blanco semitransparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* Asegúrate de que sea mayor que el z-index del navbar */
}

.loading-overlay.fullscreen {
  position: fixed; /* Cambia a pantalla completa */
  z-index: 10000; /* Asegúrate de que sea mayor que el z-index del navbar */
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid rgb(var(--v-theme-primary)); /* Usa el color primario del tema */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-image img {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.loading-text {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: rgb(var(--v-theme-primary)); /* Usa el color primario del tema */
}
</style>
