import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingOverlayStore = defineStore("loadingOverlay", () => {
  const isActivo = ref(false); // Estado para activar o desactivar el overlay
  const fullscreen = ref(true); // Estado para definir si es pantalla completa o no
  const texto = ref("Cargando...!!"); // Texto que se mostrará en el overlay
  const mostrarImagen = ref(false); // Estado para mostrar o no una imagen
  const imagen = ref(""); // URL de la imagen opcional

  // Función para activar el overlay
  const showOverlay = (
    isFullscreen = true,
    customTexto = "Cargando...!!",
    imageUrl = "",
  ) => {
    isActivo.value = true;
    fullscreen.value = isFullscreen;
    texto.value = customTexto;
    if (imageUrl) {
      mostrarImagen.value = true;
      imagen.value = imageUrl;
    } else {
      mostrarImagen.value = false;
      imagen.value = "";
    }
  };

  // Función para desactivar el overlay
  const hideOverlay = () => {
    isActivo.value = false;
    texto.value = "Cargando...!!"; // Restablecer el texto por defecto
    mostrarImagen.value = false; // Ocultar la imagen
    imagen.value = ""; // Limpiar la URL de la imagen
  };

  return {
    isActivo,
    fullscreen,
    texto,
    mostrarImagen,
    imagen,
    showOverlay,
    hideOverlay,
  };
});
