export async function getFechaAMPM() {
  const ahora = new Date();
  let horas = ahora.getHours();
  const minutos = ahora.getMinutes().toString().padStart(2, "0");
  const segundos = ahora.getSeconds().toString().padStart(2, "0");
  const ampm = horas >= 12 ? "PM" : "AM";
  horas = horas % 12;
  horas = horas ? horas : 12; // El 0 se muestra como 12

  const dia = ahora.getDate().toString().padStart(2, "0");
  const mes = (ahora.getMonth() + 1).toString().padStart(2, "0");
  const anio = ahora.getFullYear();

  return `${dia}-${mes}-${anio} / ${horas}:${minutos}:${segundos} ${ampm}`;
}

export function getYearsSince(startDate: any) {
  if (!startDate) return null;

  const fechaInicio = new Date(startDate);
  if (Number.isNaN(fechaInicio.getTime())) return null;

  const hoy = new Date();
  let years = hoy.getFullYear() - fechaInicio.getFullYear();
  const monthDiff = hoy.getMonth() - fechaInicio.getMonth();
  const dayDiff = hoy.getDate() - fechaInicio.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  return years >= 0 ? years : 0;
}
