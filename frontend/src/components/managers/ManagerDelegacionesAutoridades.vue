<template>
  <!-- Contenido principal -->
  <div v-if="formAutoridad == null" class="content-container">
    <!-- prettier-ignore -->
    <div v-for="(item, key) in autoridades" :key="key" class="autoridad mb-6 mt-2">
      <!-- Cargo destacado -->
      <div class="info-item">
        <i class="tabler tabler-edit mr-3 textTonalYellowDark cursorPointer" @click="handleEditAutoridad(item)" size="50" />
        <h3 class="font-bold">{{ item.cargo }}</h3>
      </div>
      <!-- Nombre -->
      <div class="info-item">
        <i class="tabler tabler-user info-icon"></i>
        <span class="info-label">Nombre:</span>
        <span class="info-value">{{ item.nombre }}</span>
      </div>
      <!-- Teléfono -->
      <div class="info-item">
        <i class="tabler tabler-phone info-icon"></i>
        <span class="info-label">Teléfono:</span>
        <span class="info-value">{{ item.telefono }}</span>
      </div>
      <!-- Correo -->
      <div class="info-item">
        <i class="tabler tabler-mail info-icon"></i>
        <span class="info-label">Correo:</span>
        <span class="info-value">{{ item.correo }}</span>
      </div>
    </div>
  </div>
  <div v-else>
    <!-- Formulario de edición -->
    <ModuladorFormFactory
      class="col-6 mx-auto"
      :title="null"
      :isDialogVisible="false"
      :schema="schemaAutoridad"
      :showTitle="false"
      :modelValue="formAutoridad"
      @cancel="formAutoridad = null"
      @submit="handleSubmitAutoridad"
    />
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    delegacion?: any;
    fullscreen?: boolean; // Nueva propiedad para controlar el modo del overlay
  }>(),
  {
    delegacion: null,
    fullscreen: true, // Por defecto, el overlay será de pantalla completa
  },
);

// prettier-ignore
const schemaAutoridad : any = [
  { label: "Cargo", type: "label", model: "cargo", disabled:true,classElement:"col-12"},
  { label: "Nombre", type: "text", model: "nombre", classElement:"col-12"},
  { label: "Teléfono", type: "text", model: "telefono", classElement:"col-5"},
  { label: "Correo electrónico", type: "text", model: "correo",classElement:"col-7"},
];
const formAutoridad = ref<any>();
const autoridades: any = ref({});
const autoridadesDefecto: any = {
  socorros: {
    cargo: "Coordinador de socorros",
    nombre: "",
    telefono: "",
    correo: "",
  },
  seguridad: {
    cargo: "Referente de acceso mas seguro",
    nombre: "",
    telefono: "",
    correo: "",
  },
};

const handleEditAutoridad = (item: any) => {
  formAutoridad.value = item;
};
const handleSubmitAutoridad = async (item: any) => {
  const payload = {
    id: props.delegacion.id,
    autoridades: JSON.stringify(autoridades.value),
  };

  await apiRequest({
    url: "/api/catalogo/delegaciones",
    payload,
    messageType: "toast",
    onSuccess: () => {
      formAutoridad.value = null;
    },
  });
};

onBeforeMount(() => {
  if (props.delegacion) {
    let autoridadesData = props.delegacion.autoridades
      ? JSON.parse(props.delegacion.autoridades)
      : autoridadesDefecto;
    autoridades.value = autoridadesData;
  }
});
</script>

<style scoped>
/* Estilo para el ícono grande */
.icon-large {
  font-size: 2rem; /* Ajusta el tamaño del ícono */
}
/* Contenedor principal */
.content-container {
  position: relative;
  padding: 16px;
}

/* Elementos de información */
.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-label {
  font-weight: bold;
  color: #555;
  margin-right: 8px;
}

.info-value {
  color: #333;
}

.info-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  color: rgb(var(--v-theme-primary));
}
</style>
