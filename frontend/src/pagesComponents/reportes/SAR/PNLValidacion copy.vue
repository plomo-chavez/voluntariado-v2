<script setup lang="ts">
const emit = defineEmits(["cancelar", "nextStep", "backStep"]);
const props = withDefaults(
  defineProps<{
    data?: any;
  }>(),
  {
    data: null,
  },
);

const saveReporte = async () => {
  // Lógica para guardar el reporte
  const payload = { ...props.data };

  await apiRequest({
    url: "/api/reportes/sar",
    payload,
    messageType: "toast",
    onSuccess: () => {
      emit("cancelar");
    },
  });
};
</script>

<template>
  <pre>{{ props.data }}</pre>
  <!-- prettier-iegnore -->
  <div class="container mb-6 mt-2">
    <!-- Nombre -->
    <div class="info-item infoCol3">
      <span class="info-label">Fecha:</span>
      <span class="info-value">{{ data.fecha }}</span>
    </div>
    <!-- Correo -->
    <div class="info-item infoCol3">
      <span class="info-label">Hora inicio:</span>
      <span class="info-value">{{ data.horaInicio }}</span>
    </div>
    <div class="info-item infoCol3">
      <span class="info-label">Hora fin:</span>
      <span class="info-value">{{ data.horaFin }}</span>
    </div>
    <!-- Nombre -->
    <div class="info-item infoCol3">
      <span class="info-label">Estado:</span>
      <span class="info-value">{{ data.fecha }}</span>
    </div>
    <!-- Correo -->
    <div class="info-item infoCol3">
      <span class="info-label">Municipio:</span>
      <span class="info-value">{{ data.municipio.label }}</span>
    </div>
    <div class="info-item infoCol3">
      <span class="info-label">Delegación:</span>
      <span class="info-value">{{ data.delegacion.label }}</span>
    </div>
    <div class="info-item">
      <div class="info-item infoCol12">
        <span class="info-label">Direccion:</span>
        <span class="info-value">{{ data.direccion }}</span>
      </div>
      <div class="container wFull mt-2">
        <div class="info-item">
          <span class="info-label">Latitud:</span>
          <span class="info-value">{{ data.horaFin }}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Longitud:</span>
          <span class="info-value">{{ data.horaFin }}</span>
        </div>
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Mapa:</span>
    </div>
    <div class="info-item">
      <span class="info-label">Tipo de servicio:</span>
      <div v-for="(item, index) in data.tipoServicio" class="chip chipPrimary">
        {{ item.label }}
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Servicio solicitado por:</span>
      <div v-for="(item, index) in data.tipoReporte" class="chip chipPrimary">
        {{ item.label }}
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Autorizades participantes:</span>
      <div
        v-for="(item, index) in data.autoridadesPublicas"
        class="chip chipPrimary"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Autoridades CR informadas:</span>
      <div
        v-for="(item, index) in data.autoridadesCRInformadas"
        class="chip chipPrimary"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Atención brindada:</span>

      <div class="container wFull mt-2">
        <div class="info-item">
          <span class="info-label infoCol25">Atención:</span>
          <span class="info-label infoCol75">Atención:</span>
        </div>
        <div class="info-item" v-for="item in data.pacientes">
          <span class="info-label infoCol25">{{
            item.cantidadPacientesAtendidos
          }}</span>
          <span class="info-label infoCol25">{{ item.atencionBrindada }}</span>
        </div>
      </div>
    </div>
    <div class="info-item">
      <span class="info-label">Traslados:</span>

      <div class="container wFull mt-2">
        <div class="info-item">
          <span class="info-label infoCol25">#:</span>
          <span class="info-label infoCol75">Hospital:</span>
        </div>
        <div class="info-item" v-for="item in data.traslados">
          <span class="info-label infoCol25">{{
            item.cantidadPacientesTrasladados
          }}</span>
          <span class="info-label infoCol25">{{ item.hospitalDestino }}</span>
        </div>
      </div>
    </div>
    <div class="info-item infoCol12">
      <span class="info-label">Descripcion del evento:</span>
      <span class="info-value">{{ data.descripcionEvento }}</span>
    </div>
    <div class="info-item infoCol12">
      <span class="info-label">Afectaciones sufridas:</span>
      <span class="info-value">{{ data.afectacionesSufridas }}</span>
    </div>
    <div class="info-item infoCol12">
      <span class="info-label">Observaciones:</span>
      <span class="info-value">{{ data.observacionesComentarios }}</span>
    </div>
    <div
      class="info-item infoCol12"
      v-for="item in JSON.parse(data.delegacion?.autoridades ?? '[]')"
    >
      <span class="info-value">{{ item.nombre }}</span>
      <span class="info-value">{{ item.Cargo }}</span>
      <span class="info-value">{{ item.telefono }}</span>
      <span class="info-value">{{ item.correo }}</span>
    </div>
  </div>

  <div class="d-flex justify-space-between g-3 mt-4 w-100">
    <div>
      <VBtn variant="outlined" color="secondary" @click="emit('cancelar')">
        <VIcon start icon="tabler-x" />
        Cancelar
      </VBtn>
    </div>
    <VBtn v-if="!props.data.id" @click="saveReporte" color="success">
      Guardar
      <VIcon end icon="tabler-device-floppy" />
    </VBtn>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-wrap: wrap; /* Permite que los elementos se ajusten en varias filas */
  /* Espaciado entre los elementos */
  gap: 10px;
  align-items: flex-start; /* Alinea los elementos al inicio verticalmente */
  background-color: #f9f9f9; /* Fondo claro para el contenedor */
  border-radius: 10px; /* Bordes redondeados para el contenedor */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Sombra para darle profundidad */
}

.info-item {
  display: flex;
  flex-direction: row; /* Alinea los elementos en columna */
  flex-wrap: wrap;
  width: calc(50% - 10px);
  padding: 10px;
  background-color: #ffffff; /* Fondo blanco para las tarjetas */
  border-radius: 8px; /* Bordes redondeados */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  border: 1px solid #e0e0e0; /* Borde sutil */
}

.infoCol3 {
  width: calc(33.33% - 10px);
}

.infoCol25 {
  width: 25% !important;
}
.infoCol75 {
  width: 75% !important;
}

.infoCol12 {
  width: calc(100% - 10px);
}

.info-item > span {
  line-height: 18px !important;
  padding: 0px !important;
  margin: 0px !important;
  color: #555; /* Color gris para las etiquetas */
}

.info-label {
  display: block; /* Asegura que el elemento sea un bloque */
  text-transform: uppercase;
  width: 100% !important;
  font-size: 12px;
  font-weight: bold;
  color: #7e7e7e !important;
  line-height: 1.4; /* Usa un valor relativo en lugar de porcentaje */
  margin-bottom: 5px; /* Agrega un margen inferior */
}

.info-value {
  font-size: 15px; /* Tamaño de fuente más grande para los valores */
  color: #000000 !important; /* Color negro para los valores */

  font-weight: bold; /* Texto normal para los valores */
}

@media (max-width: 768px) {
  .info-item {
    width: 100%; /* En pantallas pequeñas, cada tarjeta ocupa el 100% del ancho */
  }
}
</style>
