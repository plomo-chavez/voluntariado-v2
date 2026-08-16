<script setup lang="ts">
import Counter from "@/components/apps/FormFactoryElements/Counter.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useCatalogo } from "@/hooks/useCatalogo";
import { formatValue } from "@/utils/formatterHelper";
import { computed, getCurrentInstance, ref, watch } from "vue";

// Opciones de inputs para el form
//    'label'
//    'separador'
//    'span'
//    'counter'
//    'text'
//    'textarea'
//    'number'
//    'date'
//    'time'
//    'rangeDate'
//    'select'
//    'switch'
//    'multiSelect'
//    'chips'

// Registrar la directiva manualmente
const instance = getCurrentInstance();
// instance?.appContext.app.directive("money", VMoney);

interface Field {
  label?: string;
  type?: string;
  model?: string;
  options?: {
    id?: string | number | boolean;
    value?: string | number | boolean;
    label?: string;
  }[];
  placeholder?: string;

  dependenciaQuery?: string; // Modelo del campo del que depende
  dependenciaCanSee?:
    | string
    | number
    | boolean
    | (string | number | boolean)[]
    | ((valorActual: any, valorDependencia: any, field?: any) => boolean);
  dependenciaCanSeeValidacion?: (
    valorActual: any,
    valorDependencia: any,
    field?: any,
  ) => boolean;
  dependenciaValor?: any; // Valor esperado para mostrarse
  valorDefault?: string | number | boolean;
}

const props = withDefaults(
  defineProps<{
    title?: any;
    schema: Field[];
    modelValue: any;
    formModal?: boolean;
    isDialogVisible?: boolean;
    formLive?: boolean;
    isDisabled?: boolean;
    showButtonsAction?: boolean;
    textButtonCancel?: string | null;
    textButtonSubmit?: string | null;
    showIconButtonSubmit?: boolean;
    showIconButtonCancel?: boolean;
    showButtonSubmit?: boolean;
    showButtonCancel?: boolean;
    iconButtonCancel?: string;
    iconButtonSubmit?: string;
    variantButtonCancel?:
      | "flat"
      | "text"
      | "elevated"
      | "tonal"
      | "outlined"
      | "plain";
    variantButtonSubmit?:
      | "flat"
      | "text"
      | "elevated"
      | "tonal"
      | "outlined"
      | "plain";
    colorButtonCancel?: string;
    colorButtonSubmit?: string;
    formRequired?: boolean;
    validarCambios?: boolean;
    showMessageRequired?: boolean;
  }>(),
  {
    title: null,
    formModal: false,
    formLive: false,
    formRequired: false,
    isDisabled: false,
    isDialogVisible: false,
    showButtonsAction: true,
    validarCambios: true,
    showIconButtonSubmit: true,
    showIconButtonCancel: true,
    showButtonSubmit: true,
    showButtonCancel: true,
    textButtonCancel: null,
    textButtonSubmit: null,
    variantButtonCancel: "elevated",
    variantButtonSubmit: "outlined",
    colorButtonCancel: "success",
    colorButtonSubmit: "secondary",
    iconButtonCancel: "tabler-x",
    iconButtonSubmit: "tabler-check",
    showMessageRequired: true,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: Record<string, any>): void;
  (event: "submit", value: Record<string, any>): void;
  (event: "cancel"): void;
  (event: "update:isDialogVisible", value: boolean): void; // Evento para actualizar la visibilidad del modal
}>();

defineExpose({
  validarFormulario,
});

// Crea un modelo local reactivo
const formKey = ref(0); // Clave reactiva para forzar la renderización del formulario
const formLocal: any = reactive(props.modelValue || {});
let schemaLocal: any = reactive({});
let itemsErrors: any = reactive({});
const showForm: any = ref(false);
const formOkay: any = ref(false);
const mensajeRef = ref<HTMLElement | null>(null);
const camposFaltantes = ref<string[]>([]);
const mostrarTodosFaltantes = ref(false);
const spanRequired = ref('<span style="color:red">*</span>');
// prettier-ignore
const tieneRequeridos = computed(() => props.schema?.some((field: any) => field.required));
// prettier-ignore
const schemaVisible = computed(() => (schemaLocal || []).filter((field: any) => esCampoVisible(field)));

// Lógica para cargar catálogos dinámicos
const { obtenerCatalogo } = useCatalogo();

// Sincroniza los cambios entre `props.modelValue` y `formLocal`
watch(
  () => props.modelValue,
  (newValue) => {
    Object.keys(formLocal).forEach((key) => delete formLocal[key]);
    Object.assign(formLocal, { ...newValue });
  },
);

// Ajustar el valor inicial de los campos de tipo 'time' en formLocal
watch(
  () => props.schema,
  (newSchema) => {
    newSchema.forEach((field: any) => {
      if (field.type === "time" && formLocal[field.model] === undefined) {
        formLocal[field.model] = ""; // Valor inicial compatible con flatpickr
      }
    });
  },
  { immediate: true },
);

function toggleFaltantes() {
  mostrarTodosFaltantes.value = !mostrarTodosFaltantes.value;
}

// Maneja los cambios en los inputs
function handleInputChange(field: string, value: any) {
  formLocal[field] = value;
  // Si `formLive` es true, emite los cambios en tiempo real
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios || tieneRequeridos.value) {
    validarCamposRequeridos();
  }
}

function handleSwitchChange(field: string) {
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios) {
    validarCamposRequeridos();
  }
}

function obtenerOpcionesSwitch(field: any) {
  return field.options?.length
    ? field.options
    : [
        { value: true, label: "Activo" },
        { value: false, label: "Inactivo" },
      ];
}

function normalizarValorSwitch(valor: any) {
  if (valor && typeof valor === "object") {
    return valor.value ?? valor.id ?? null;
  }

  return valor;
}

function obtenerLabelSwitch(field: any) {
  const opciones = obtenerOpcionesSwitch(field);
  const valorActual = normalizarValorSwitch(formLocal[field.model]);

  const opcionActual = opciones.find(
    (option: any) => normalizarValorSwitch(option.value) == valorActual,
  );

  return (opcionActual || opciones[0]).label;
}

async function handleSelectChange(field: any, selected: any) {
  let value = field.options.find((option: any) => option.label === selected);

  if (!(value === undefined)) {
    // Asegúrate de que el valor sea booleano
    formLocal[field.model] = value;
    // Si `formLive` es true, emite los cambios en tiempo real
    if (props.formLive) {
      emit("update:modelValue", { ...formLocal });
    }
  } else {
    formLocal[field.model] = null;
  }

  if (props.validarCambios || tieneRequeridos.value) {
    validarCamposRequeridos();
  }
  await limpiarDependencias(field);
  await obtenerCatalogoDependencia(field);
}

async function limpiarDependencias(field: any) {
  const tmp: any = [...schemaLocal];
  // Filtra los campos que necesitan limpiar dependencias
  tmp.forEach(async (f: any) => {
    if (f.dependenciaQuery === field.model) {
      formLocal[f.model] = null;
      f.options = [];
      await limpiarDependencias(f);
    }
  });

  schemaLocal = tmp;
}

async function obtenerCatalogoDependencia(field: any) {
  const tmp: any = [...schemaLocal];
  // Filtra los campos que necesitan cargar catálogos
  const catalogPromises = tmp.map(async (f: any) => {
    if (f.dependenciaQuery === field.model) {
      const fieldDependendica = toRaw(f);
      const dependenciaValor =
        formLocal[fieldDependendica.dependenciaQuery]?.id ??
        formLocal[fieldDependendica.dependenciaQuery]?.value;

      const catalogoData = await obtenerCatalogo(f, {
        [fieldDependendica.dependenciaQueryFiltro]: dependenciaValor,
      });

      f.options = toRaw(catalogoData);
    }
    if (f.dependencia === field.model) {
      const fieldDependendica = toRaw(f);
      console.log(fieldDependendica);
      const dependenciaValor =
        formLocal[fieldDependendica.dependencia]?.id ??
        formLocal[fieldDependendica.dependencia]?.value;

      const catalogoData = await obtenerCatalogo(f, {
        [fieldDependendica.dependenciaFiltro]: dependenciaValor,
      });

      console.log(dependenciaValor);
      console.log(fieldDependendica.dependenciaFiltro);
      f.options = toRaw(catalogoData);
    }
  });

  // Espera a que todas las promesas de carga de catálogos se resuelvan
  await Promise.all(catalogPromises);
  schemaLocal = tmp;

  // Incrementa la clave para forzar la renderización del formulario
  formKey.value++;
}

function validarFormulario(details: any = false) {
  const items: any = toRaw(validarCamposRequeridos());
  let response: any = {
    isValid: Object.keys(items).length === 0,
  };

  if (details) {
    response = {
      ...response,
      items,
    };
  }
  return response;
}

function validarCamposRequeridos() {
  const camposVisibles = schemaVisible.value;
  const modelosVisibles = new Set(
    camposVisibles
      .filter((field: any) => field?.model)
      .map((field: any) => field.model),
  );

  Object.keys(itemsErrors).forEach((model) => {
    if (!modelosVisibles.has(model)) {
      delete itemsErrors[model];
    }
  });

  const updatedSchema = camposVisibles.map((field: any) => {
    const ignorados = ["label", "separador", "switch"];
    const esRequerido = props.formRequired
      ? !ignorados.includes(field.type)
      : field.required;

    if (!field?.model || !esRequerido) {
      if (field?.model) {
        delete itemsErrors[field.model];
      }

      return field;
    }

    const valor = formLocal[field.model];
    const isEmpty =
      valor === undefined ||
      valor === null ||
      (typeof valor === "string" && valor.trim() === "") ||
      (Array.isArray(valor) && valor.length === 0);

    if (isEmpty) {
      itemsErrors[field.model] = `Este campo es requerido.`;
    } else {
      delete itemsErrors[field.model];
    }

    return field;
  });

  let tmpFaltantes = toRaw(itemsErrors);

  // Actualizo los campos faltantes y otros valores reactivos
  camposFaltantes.value = Object.keys(tmpFaltantes).map((key) => {
    const field = updatedSchema.find((f: any) => f.model === key);
    return field ? field.label.replace(/<[^>]*>?/gm, "") : "";
  });

  return itemsErrors;
}

function handleSubmit() {
  const faltantes = toRaw(validarCamposRequeridos());
  console.log("faltantes", faltantes);
  if (Object.keys(faltantes).length > 0) {
    // Muestra el mensaje y hace scroll al mensaje
    setTimeout(() => {
      mensajeRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return;
  }
  let tmp = { ...formLocal };

  const filteredForm = Object.fromEntries(
    schemaVisible.value.map((field: any) => [field.model, tmp[field.model]]),
  );

  if (props.modelValue) {
    tmp = {
      ...tmp,
      ...props.modelValue,
    };
  }
  tmp = {
    ...tmp,
    ...filteredForm,
  };
  emit("submit", tmp);
  emit("update:isDialogVisible", false);
}

// Maneja la cancelación del formulario
function handleCancel() {
  emit("cancel");
  emit("update:isDialogVisible", false); // Cerrar el modal
}

function obtenerPropiedad(obj: any, ruta: string): any {
  if (!ruta) {
    return ""; // Si la ruta está vacía, devuelve undefined
  }
  return ruta.split(".").reduce((acumulador, clave) => {
    return acumulador ? acumulador[clave] : undefined;
  }, obj);
}

function obtenerIndicacionNumber(field: any) {
  const tieneMin = field.min !== undefined && field.min !== null;
  const tieneMax = field.max !== undefined && field.max !== null;

  if (tieneMin && tieneMax) {
    return `Valor permitido entre ${field.min} y ${field.max}`;
  }

  if (tieneMin) {
    return `Valor minimo: ${field.min}`;
  }

  if (tieneMax) {
    return `Valor maximo: ${field.max}`;
  }

  return "";
}

function handleNumberInput(event: Event, field: any) {
  const input = event.target as HTMLInputElement;
  const model = field.model;

  let config = {
    decimal: ".",
    thousands: ",",
    prefix: "",
    sufijo: "",
    precision: 2,
  };

  config = {
    ...config,
    ...(field?.config || {}),
  };

  const min = field.min ?? null;
  const max = field.max ?? null;

  let rawValue = input.value.replace(/[^0-9]/g, "");
  let numericValue = parseInt(rawValue, 10);

  if (isNaN(numericValue)) {
    numericValue = 0;
  }

  numericValue = numericValue / Math.pow(10, config.precision);
  numericValue = parseFloat(numericValue.toFixed(config.precision));

  if (min !== null && numericValue < min) {
    numericValue = min;
  }

  if (max !== null && numericValue > max) {
    numericValue = max;
  }

  const formattedValue = `${config.prefix}${numericValue
    .toFixed(config.precision)
    .replace(".", config.decimal)
    .replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands)}${config.sufijo}`;

  formLocal[model] = formattedValue;
  input.value = formattedValue;

  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios) {
    validarCamposRequeridos();
  }
}

function handleRangeDateChange(field: any, modelKey: "minModel" | "maxModel") {
  // showForm.value = false;
  if (modelKey === "minModel" && formLocal[field.minModel]) {
    field.maxConfig.minDate = formLocal[field.minModel];
  }
  if (modelKey === "maxModel" && formLocal[field.maxModel]) {
    field.minConfig.maxDate = formLocal[field.maxModel];
  }
  field.refreshKey = Date.now(); // Genera un valor único
}

const formateadorValueLabel = (field: any, value: any) => {
  if (field.type === "label") {
    if (field.formatter && typeof field.formatter === "function") {
      return field.formatter(value);
    } else if (field.formatter && typeof field.formatter === "string") {
      // Si el formateador es una cadena, intenta usarlo como plantilla
      try {
        return formatValue(value, field);
      } catch (error) {
        console.error("Error al evaluar el formateador:", error);
        return value;
      }
    } else {
      return value;
    }
  }
  return value;
};

function normalizarValorDependencia(valor: any) {
  if (valor && typeof valor === "object") {
    return valor.value ?? valor.id ?? valor.label ?? null;
  }
  return valor;
}

function tieneValorDependencia(valor: any) {
  if (Array.isArray(valor)) {
    return valor.length > 0;
  }

  if (valor && typeof valor === "object") {
    const valorNormalizado = normalizarValorDependencia(valor);

    return (
      valorNormalizado !== undefined &&
      valorNormalizado !== null &&
      valorNormalizado !== ""
    );
  }

  return valor !== undefined && valor !== null && valor !== "";
}

function esCampoVisible(field: any) {
  const dependencia = field?.dependenciaCanSee;
  const validacion = field?.dependenciaCanSeeValidacion;

  const tieneDependencia =
    dependencia !== undefined && dependencia !== null && dependencia !== "";
  const tieneValidacion = validacion !== undefined && validacion !== null;

  if (!tieneDependencia && !tieneValidacion) return true;

  if (tieneDependencia && !tieneValidacion) {
    return !!formLocal[dependencia];
  }

  if (tieneDependencia && tieneValidacion) {
    if (typeof validacion === "function") {
      return !!validacion(formLocal[dependencia]);
    }
    return formLocal[dependencia] === validacion;
  }

  return true;
}

function handleChangeChips() {
  setTimeout(() => {
    validarCamposRequeridos();
  }, 1);
}

onMounted(async () => {
  let tmp: any = [...props.schema];

  // Filtra los campos que necesitan cargar catálogos
  const catalogPromises = tmp.map(async (field: any) => {
    if (
      field.type === "select" &&
      field.catalogo &&
      !field.dependenciaQuery &&
      !field.dependencia
    ) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = toRaw(catalogoData);
    } else if (field.type === "select" && !field.options) {
      field.options = field.options || [];
    }
    if (field.type === "chips" && field.catalogo) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = toRaw(catalogoData);
    }
  });

  // Espera a que todas las promesas de carga de catálogos se resuelvan
  await Promise.all(catalogPromises);

  tmp.forEach(async (field: any) => {
    if (field.type === "select" && field.options) {
      field.options = field.options;
    }

    if (field.type === "counter") {
      let valor = toRaw(formLocal[field.model]);
      // prettier-ignore
      formLocal[field.model] = valor || field.min || 0;
    }
    if (field.type === "date") {
      // prettier-ignore
      formLocal[field.model] = formLocal?.[field.model] ?? null;
    }

    // prettier-ignore
    if ( field.type === "select" && formLocal[field.model] && !field.dependenciaQuery ) {
      if (field.options) {
        let labelKey = field.config?.labelKey || "label";
        let valor = toRaw(formLocal[field.model][labelKey]);
        let options = toRaw(field.options);
        let option = options.find((option: any) => {
          return (String(option.label).toLowerCase() == String(valor).toLowerCase());
        });
        formLocal[field.model] = option ? toRaw(option) : null;
      } else {
        formLocal[field.model] = {
          label:formLocal[field.model].label || formLocal[field.model].nombre || "",
          ...formLocal[field.model], // Mantener otras propiedades si existen
        };
      }
    }

    if (field.type === "rangeDate") {
      field.minConfig = {
        ...(field?.minConfig || { dateFormat: "Y-m-d" }),
      };

      field.maxConfig = {
        ...(field?.maxConfig || { dateFormat: "Y-m-d" }),
      };
    }

    if (field.type === "switch") {
      const opciones = obtenerOpcionesSwitch(field);
      const primeraOpcion = opciones[0];

      const valorActualNormalizado = normalizarValorSwitch(
        formLocal[field.model],
      );
      const valorDefaultNormalizado = normalizarValorSwitch(field.valorDefault);

      const opcionActual = opciones.find(
        (option: any) =>
          normalizarValorSwitch(option.value) == valorActualNormalizado,
      );

      const opcionDefault = opciones.find(
        (option: any) =>
          normalizarValorSwitch(option.value) == valorDefaultNormalizado,
      );

      if (opcionActual) {
        formLocal[field.model] = opcionActual.value;
      } else if (opcionDefault) {
        formLocal[field.model] = opcionDefault.value;
      } else {
        formLocal[field.model] = primeraOpcion?.value ?? false;
      }
    }

    field.classElement = props.isDialogVisible
      ? "wModal"
      : field.classElement || "wDefault";
  });

  schemaLocal = tmp;
  setTimeout(() => {}, 500);
  showForm.value = true;
  formOkay.value = true;
});
</script>

<template>
  <div :key="formKey">
    <LoadingOverlay
      :isActivo="!showForm"
      :texto="'Cargando formulario ...!!'"
    />
    <!-- Inline Form -->
    <div v-if="showForm" class="w-full">
      <!-- Renderiza el formulario -->

      <div class="formWrapper">
        <!-- Render dynamic fields -->
        <!-- prettier-ignore -->
        <h6 v-if="tieneRequeridos" class="mb16 col-12" style="color: #535353; font-size: 0.80rem;">
          Este formulario cuenta con campos obligatorios, los puedes identificar porque tienen este símbolo <span style="color:red">*</span>
        </h6>
        <div v-if="props.showMessageRequired">
          <div
            v-if="camposFaltantes.length"
            ref="mensajeRef"
            class="mb14 faltantes-alert mx-auto"
          >
            <div class="faltantes-header">
              <span class="faltantes-icon">⚠️</span>
              <span class="faltantes-title"
                >Campos obligatorios pendientes</span
              >
            </div>
            <div class="faltantes-desc">
              Por favor completa los siguientes campos requeridos antes de
              continuar:
            </div>
            <div class="">
              <ul
                class="faltantes-list"
                :class="{
                  'faltantes-list-2col':
                    camposFaltantes.length > 10 && mostrarTodosFaltantes,
                }"
              >
                <li
                  v-for="campo in mostrarTodosFaltantes
                    ? camposFaltantes
                    : camposFaltantes.slice(0, 5)"
                  :key="campo"
                >
                  {{ campo }}
                </li>
              </ul>
            </div>
            <div
              v-if="camposFaltantes.length > 5"
              style="margin-top: 6px"
              class="text-center"
            >
              <button
                @click="toggleFaltantes"
                style="
                  background: none;
                  border: none;
                  color: #b85c00;
                  cursor: pointer;
                  font-size: 0.8rem;
                  text-decoration: underline;
                "
              >
                {{
                  mostrarTodosFaltantes
                    ? "Ocultar otros campos"
                    : `Ver otros campos (${camposFaltantes.length - 5})`
                }}
              </button>
            </div>
          </div>
        </div>
        <v-row style="margin-left: 0px; margin-right: 0px">
          <template v-for="field in schemaVisible" :key="field.model">
            <!-- Campo de texto -->
            <!-- prettier-ignore -->
            <div v-if="field.type === 'label'" :class="field.classElement">
               <label class="fontBold"> {{ field.label }} </label>
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
               <p class="ml-3 mb-0"> {{ formateadorValueLabel(field,(obtenerPropiedad(formLocal, field.model) || '')) }} </p>
            </div>

            <!-- prettier-ignore -->
            <div v-if="field.type === 'separador'" :class="field.classElement">
               <h3 class="titleForm"> {{ field.label }} </h3>
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
            </div>

            <!-- prettier-ignore -->
            <div v-if="field.type === 'span'" :class="field.classElement">
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
            </div>

            <div v-if="field.type === 'text'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />

              <VTextField
                variant="outlined"
                v-model="formLocal[field.model]"
                :disabled="props.isDisabled || field.disabled"
                :placeholder="
                  field.placeholder || `Introduce el dato requerido`
                "
                @input="handleInputChange(field.model, $event.target.value)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <div v-if="field.type === 'counter'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <Counter
                :max="field.max"
                :min="field.min"
                :valor="formLocal[field.model]"
                :class="field.classInput"
                :disabled="props.isDisabled || field.disabled"
                @update="handleInputChange(field.model, $event)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <!-- prettier-ignore -->
            <div v-if="field.type === 'textarea'" :class="field.classElement">
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <VTextarea
                variant="outlined"
                v-model="formLocal[field.model]"
                :disabled="props.isDisabled || field.disabled"
                :placeholder="field.placeholder || `Introduce el dato requerido`"
                :rows="field.rows || 3"
                @input="handleInputChange(field.model, $event.target.value)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <!-- Campo number -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'number'" :class="field.classElement">
              <label
                class="fontBold"
                :for="field.model"
                v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"
              />
              <div class="divSpan">
                <span>
                  {{ obtenerIndicacionNumber(field) }}
                </span>
              </div>

              <VTextField
                v-model="formLocal[field.model]"
                class="form-control"
                :disabled="props.isDisabled || field.disabled"
                :placeholder="field.placeholder || `Introduce el dato requerido`"
                @input="handleNumberInput($event, field)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <!-- Campo date -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'date'" :class="field.classElement">
              <!-- prettier-ignore -->   
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <!-- prettier-ignore -->
              <AppDateTimePicker
                :key="`${field.model}`"
                v-model="formLocal[field.model] "
                :placeholder="field?.placeholder ?? 'Ingresa un fecha'"
                :disabled="props.isDisabled"
                :config="{
                  ...(field?.config || { dateFormat: 'Y-m-d' }),
                  minDate: field.config?.minDate ? formLocal[field.config.minDate] : undefined,
                  maxDate: field.config?.maxDate ? formLocal[field.config.maxDate] : undefined,
                }"
                @input="handleInputChange(field.model, $event.target.value)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <div v-else-if="field.type === 'time'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <!-- prettier-ignore -->
              <AppDateTimePicker
                :key="`${field.model}`"
                v-model="formLocal[field.model]"
                :placeholder="field?.placeholder ?? 'Ingresa una hora'"
                :disabled="props.isDisabled"
                clearable
                :config="{
                  ...(field?.config || { dateFormat: 'H:i' }), // Cambia el formato a horas:minutos
                  enableTime: true, // Habilita el selector de tiempo
                  noCalendar: true, // Deshabilita el calendario si solo necesitas el tiempo
                }"
                @change="handleChangeChips"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <!-- Campo rangeDate -->
            <!-- prettier-ignore -->
            <template v-else-if="field.type === 'rangeDate'">
               <div :class="field.classElement">
                 <label  class="fontBold" :for="field.minModel"> {{ field.minLabel }} </label>

                 <!-- prettier-ignore -->
                  <AppDateTimePicker
                    :key="field.refreshKey" 
                    v-model="formLocal[field.minModel]"
                    :placeholder="field?.minPlaceholder ?? 'Ingresa un fecha'"
                    @change="handleRangeDateChange(field, 'minModel')"
                    :config="field.minConfig"
                    :disabled="props.isDisabled || field.minDisable"
                    clearable
                    @input="handleInputChange(field.minModel, $event.target.value)"
                  />
               </div>
               <div :class="field.classElement">
                 <label  class="fontBold" :for="field.maxModel"> {{ field.maxLabel }} </label>
                 <!-- prettier-ignore -->
                 <AppDateTimePicker
                 :key="field.refreshKey" 
                   v-model="formLocal[field.maxModel]"
                   :placeholder="field?.maxPlaceholder ?? 'Ingresa un fecha'"
                   @change="handleRangeDateChange(field, 'maxModel')"
                   :config="field.maxConfig"
                   :disabled="props.isDisabled || field.maxDisable"
                   clearable
                   @input="handleInputChange(field.maxModel, $event.target.value)"
                 />
               </div>
            </template>

            <!-- Campo select -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'select'" :class="field.classElement">
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <VSelect
                :items="field.options || []"
                :value="formLocal[field.model]?.label ?? ''"
                item-title="label"
                clearable
                :placeholder="field.placeholder || 'Selecciona una opción'"
                :disabled="props.isDisabled || field.disabled"
                @update:modelValue=" (selected) => handleSelectChange(field, selected) "
              >  
                <template #no-data>
                  <p v-if="field.options?.length === 0" class="text-center w-full p0 m0">No hay opciones disponibles</p>
                </template>
                <template v-for="(_, label) in $slots" v-slot:[label]="slotProps">
                  <slot :name="label" v-bind="slotProps || {}" />
                </template>
              </VSelect>
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
             </div>

            <!-- Campo switch -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'switch'" :class="field.classElement">
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <VSwitch
                v-model="formLocal[field.model]"
                :id="field.model"
                :disabled="props.isDisabled || field.disabled"
                :true-value="obtenerOpcionesSwitch(field)[0]?.value"
                :false-value="obtenerOpcionesSwitch(field)[1]?.value"
                :label="obtenerLabelSwitch(field)"
                @change="handleSwitchChange(field.model)"
              />
            </div>

            <!-- Campo multi selector -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'multiSelect'" :class="field.classElement">
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
              <MultiSelectForm
                :id="field.model"
                v-model="formLocal[field.model]"
                :key="field.model"
                :alignOptions="field.alignOptions"
                :columnsOption="field.columnsOption"
                :options="field.options"
                :disabled="field.disabled"
                :optionType="field.optionType"
                :max-selections="field?.maxSelections ?? Infinity"
                @change="handleChangeChips()"
                :layout="field?.layout ?? 'list'"

              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <!-- Campo multi selector -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'chips'" :class="field.classElement">
              <!-- prettier-ignore -->   
              <label class="fontBold" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
              <MultiSelectFormChips
                :id="field.model"
                v-model="formLocal[field.model]"
                :key="field.model"
                :alignOptions="field.alignOptions"
                :columnsOption="field.columnsOption"
                :options="field.options"
                :disabled="field.disabled"
                :optionType="field.optionType"
                :max-selections="field?.maxSelections ?? Infinity"
                @change="handleChangeChips()"
                :layout="field?.layout ?? 'list'"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>
          </template>
        </v-row>
      </div>
      <!-- prettier-ignore -->
      <div v-if="showButtonsAction" class="d-flex justify-end gap-3 mt-4">
        <VBtn v-if="showButtonCancel" :variant="props.variantButtonCancel ?? 'outlined'" :color="props.colorButtonCancel ?? 'secondary'" @click.prevent="handleCancel"  > 
          <VIcon v-if="showIconButtonCancel"  start :icon="props?.iconButtonCancel" />
          {{ props.textButtonCancel || "Cancelar" }} 
        </VBtn>

        <VBtn v-if="showButtonSubmit" :variant="props?.variantButtonSubmit ?? 'elevated' " :color="props.colorButtonSubmit ?? 'success'"  @click="handleSubmit" > 
          <VIcon v-if="showIconButtonSubmit" start :icon="props?.iconButtonSubmit"/>
          {{ props.textButtonSubmit || "Enviar" }}
        </VBtn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bgRed {
  background-color: red !important;
}
.wDefault {
  width: 25% !important;
  padding: 10px;
}

.wModal {
  width: 100% !important;
  padding: 10px;
}
.formWrapper {
  width: 100% !important;
  display: flex;
  flex-wrap: wrap;
}

.faltantes-alert {
  background: #fff7e6;
  border: 1.5px solid #ffd699;
  color: #b85c00;
  font-weight: 500;
  padding: 18px 18px 12px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px #ffd69944;
  margin-bottom: 16px;
  font-size: 0.95rem; // <--- tamaño de letra reducido
}

.faltantes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.faltantes-icon {
  font-size: 1.3rem; // <--- icono un poco más pequeño
}

.faltantes-title {
  font-size: 0.9rem; // <--- título más pequeño
  font-weight: 700;
}

.faltantes-desc {
  font-size: 0.8rem; // <--- descripción más pequeña
  margin-bottom: 8px;
}

.faltantes-list,
.faltantes-list-2col {
  padding-left: 18px;
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.6; // iguala el interlineado
}

.faltantes-list-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0px 24px; // aumenta el gap vertical para mejor lectura
}

.faltantes-list-icon {
  color: #b85c00;
  font-weight: bold;
  margin-right: 6px;
}

.divSpan {
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  color: #555;
}

@media (min-width: 1201px) {
  /* prettier-ignore */
  .wDefault { width: 25% !important; }
}

@media (max-width: 1200px) and (min-width: 801px) {
  /* prettier-ignore */
  .wDefault { width: 33% !important; }
}

@media (max-width: 800px) {
  /* prettier-ignore */
  .wDefault { width: 100% !important; }
}

.error-message {
  color: red;
  font-weight: bold;
  font-size: 0.8rem; /* Tamaño pequeño */
  margin-top: 4px; /* Espaciado mínimo */
}
</style>
