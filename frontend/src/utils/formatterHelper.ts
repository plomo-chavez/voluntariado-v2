// Función para formatear la fecha en un formato legible
export function formatValue(value: any, field: any): string {
  switch (field?.formatter ?? field.format) {
    case "dateMoment":
      return formatDateMoment(value, field.format || "DD/MM/YYYY HH:mm");
    case "formatEstatus":
      return value === 1 ? "Activo" : "Inactivo";
    case "uppercase":
      return String(value).toUpperCase();
    case "lowercase":
      return String(value).toLowerCase();
    case "currency":
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(Number(value));
    case "date":
      return new Date(value).toLocaleDateString("es-ES");
    default:
      return value;
  }
}
// prettier-ignore
// Función para formatear la fecha en un formato legible
export function validatedValue() {
  return {
    curp: (value: any) => { value = (value || "").trim().toUpperCase();

      if (!value) { return "Este campo está vacío. Ejemplo: GARC800101HGRXXX01"; }

      const curpIsValid = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i.test(value);

      if (!curpIsValid) { return "Formato de CURP incorrecto. Ejemplo: GARC800101HGRXXX01";}

      return true;
    },

    noSpaces: (value: any) => {
      if (!value) { return "Este campo está vacío.";}

      if (/\s/.test(value)) { return "Este campo no puede contener espacios."; }

      return true;
    },

    onlyLetters: (value: any) => {
      if (!value) { return "Este campo está vacío."; }

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(value)) {
        return "Este campo solo puede contener letras.";
      }

      return true;
    },

    onlyNumbers: (value: any) => {
      if (!value) {
        return "Este campo está vacío.";
      }

      if (!/^[0-9]+$/.test(value)) { return "Este campo solo puede contener números.";}

      return true;
    },

    correo: (value: any) => {
      if (!value) { return "Este campo está vacío. Ejemplo: usuario@dominio.com"; }

      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!emailIsValid) { return "Formato de correo incorrecto. Ejemplo: usuario@dominio.com"; }

      return true;
    },

    telefono: (value: any) => {
      if (!value) { return "Este campo está vacío. Ejemplo: 7441234567"; }

      const phoneIsValid = /^[0-9]{10}$/.test(value);

      if (!phoneIsValid) { return "Formato de teléfono incorrecto. Debe contener 10 dígitos. Ejemplo: 7441234567";}

      return true;
    },
  };
}

export function validateChip(value: string): boolean {
  // Verifica si el valor es un número o si comienza con "NT" seguido de números
  const isNumber = /^\d+$/.test(value); // Solo números
  const isNTWithNumbers = /^NT\d+$/.test(value); // Comienza con "NT" seguido de números
  return isNumber || isNTWithNumbers;
}

export function handleFormatStatus(value: any): any {
  return value === 1 ? "Activo" : "Inactivo";
}

// "segundo_nombre": "Ramon",
//   "primer_apellido": "Chavez",
//   "segundo_apellido": "Quiroz",
export function nombreCompleto(value: any): string {
  return (
    (value?.nombre ?? "") +
    " " +
    (value?.segundoNombre ?? value?.segundo_nombre ?? "") +
    " " +
    (value?.primerApellido ?? value?.primer_apellido ?? "") +
    " " +
    (value?.segundoApellido ?? value?.segundo_apellido ?? "")
  );
}
