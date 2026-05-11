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
