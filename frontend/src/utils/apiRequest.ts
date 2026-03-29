import {
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import { toast } from "vue3-toastify";

export const apiRequest = async (params = {}) => {
  const {
    url = null,
    method = "POST",
    payload = {},
    headers = {}, // Agregar soporte para headers personalizados
    onSuccess = null,
    consoleResponse = false,
    responseFull = false,
    messageType = "sweet",
    onError = null,
    showMessages = true,
  }: any = params;

  try {
    if (!url) {
      console.log("Falta URL en la solicitud API");
      return;
    }
    const response = await customRequest({
      url,
      method: method,
      data: payload,
      headers: headers, // Pasar los headers personalizados
    });
    if (consoleResponse) {
      console.log("API Response:", response);
    }
    const dataResponse = response.data;

    if (dataResponse.result) {
      if (showMessages) {
        const message =
          dataResponse.message || "Operación realizada con éxito.";
        if (messageType === "sweet") {
          showSuccessMessage({
            title: "Proceso realizado con exito",
            message: message,
          });
        } else if (messageType === "toast") {
          toast.success(message, {
            theme: "dark", // Activa el tema oscuro
          });
        }
      }
      if (typeof onSuccess === "function") {
        onSuccess(responseFull ? dataResponse : dataResponse.data);
      }
    } else {
      if (showMessages) {
        const message =
          dataResponse.message || "Ocurrio un error en el proceso.";

        if (messageType === "sweet") {
          showErrorMessage({
            title: "Ups! Ocurrió un error",
            message: message,
          });
        } else if (messageType === "toast") {
          toast.error(message, {
            theme: "dark", // Activa el tema oscuro
          });
        }
      }

      if (typeof onError === "function") {
        onError(responseFull ? dataResponse : dataResponse.data);
      }
    }
  } catch (error: any) {
    showErrorMessage({
      title: "Error",
      message: error?.message || "Error de conexión",
    });
    if (onError) {
      onError(error);
    }
  }
};
