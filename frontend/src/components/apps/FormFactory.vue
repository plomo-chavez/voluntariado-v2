<script setup lang="ts">
import Counter from "@/components/apps/FormFactoryElements/Counter.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { useCatalogo } from "@/hooks/useCatalogo";
import { formatValue, validatedValue } from "@/utils/formatterHelper";
import { computed, getCurrentInstance, ref, watch } from "vue";
const validators = validatedValue();
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
//    'checklist'

// Registrar la directiva manualmente
const instance = getCurrentInstance();
// instance?.appContext.app.directive("money", VMoney);

interface Field {
  label?: string;
  type?: string;
  model?: string;
  lblStyle?: any;
  validated?: any;
  notaText?: string;
  notaTextStyle?: "danger" | "warning" | "success" | "info" | string;
  options?:
    | {
        id?: string | number | boolean;
        value?: string | number | boolean;
        label?: string;
      }[]
    | string[]
    | Record<string, boolean | string[] | Record<string, boolean> | undefined>;
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
    buttonAlignmentBetween?: "start" | "end" | "between";
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
    iconButtonCancel: "tabler-x",
    iconButtonSubmit: "tabler-check",
    variantButtonCancel: "outlined",
    variantButtonSubmit: "elevated",
    colorButtonCancel: "secondary",
    colorButtonSubmit: "success",
    showMessageRequired: true,
    buttonAlignmentBetween: "start",
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
// Estado para controlar visibilidad de passwords por campo
const passwordVisible: any = reactive({});
const camposFaltantes = ref<string[]>([]);
const mostrarTodosFaltantes = ref(false);
const spanRequired = ref('<span style="color:red">*</span>');

// Lógica para cargar catálogos dinámicos
const { obtenerCatalogo } = useCatalogo();

function toggleFaltantes() {
  mostrarTodosFaltantes.value = !mostrarTodosFaltantes.value;
}

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

      // Inicializar multiField con defaultValue
      if (field.type === "multiField" && field.defaultValue !== undefined) {
        const items = getMultiFieldItems(field);
        items.forEach((item: any) => {
          if (item?.model && formLocal[item.model] === undefined) {
            formLocal[item.model] = field.defaultValue;
          }
        });
      }
    });
  },
  { immediate: true },
);
// Ajustar el valor inicial de los campos de tipo 'time' en formLocal
watch(
  () => formLocal,
  (data) => {
    if (formOkay.value) {
      handleValidarFormatos();
    }
  },
  { deep: true, immediate: true },
);

const tieneRequeridos = computed(() =>
  props.schema?.some((field: any) => field.required),
);

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

function normalizarOpcionesChecklistLista(options: any) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option: any, index: number) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: option,
      };
    }

    if (option && typeof option === "object") {
      const value =
        option.value ?? option.id ?? option.label ?? `opcion_${index}`;

      return {
        label: option.label ?? String(value),
        value: String(value),
      };
    }

    return {
      label: String(option),
      value: String(option),
    };
  });
}

function normalizarTextoOpcionValor(value: any) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizarOpcionesSelect(options: any) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option: any, index: number) => {
    if (typeof option === "string") {
      return {
        label: option,
        value: normalizarTextoOpcionValor(option),
      };
    }

    if (option && typeof option === "object") {
      const label =
        option.label ??
        String(option.nombre ?? option.value ?? option.id ?? `opcion_${index}`);
      const value =
        option.value ?? option.id ?? normalizarTextoOpcionValor(label);

      return {
        ...option,
        label,
        value,
      };
    }

    return {
      label: String(option),
      value: normalizarTextoOpcionValor(option),
    };
  });
}

function obtenerOpcionesSelect(field: any) {
  return normalizarOpcionesSelect(field?.options);
}

function normalizarChecklistGrupos(field: any) {
  const options = field?.options;

  if (Array.isArray(options)) {
    return [
      {
        key: "__default__",
        label: "",
        options: normalizarOpcionesChecklistLista(options),
      },
    ];
  }

  if (options && typeof options === "object") {
    const entries = Object.entries(options);

    const esPlano = entries.every(([, value]) => typeof value === "boolean");
    if (esPlano) {
      return [
        {
          key: "__default__",
          label: "",
          options: entries.map(([key]) => ({
            label: key,
            value: key,
          })),
        },
      ];
    }

    return entries
      .map(([groupKey, groupOptions]) => {
        if (Array.isArray(groupOptions)) {
          return {
            key: String(groupKey),
            label: String(groupKey),
            options: normalizarOpcionesChecklistLista(groupOptions),
          };
        }

        if (groupOptions && typeof groupOptions === "object") {
          return {
            key: String(groupKey),
            label: String(groupKey),
            options: Object.keys(groupOptions).map((optionKey) => ({
              label: optionKey,
              value: optionKey,
            })),
          };
        }

        return {
          key: String(groupKey),
          label: String(groupKey),
          options: [],
        };
      })
      .filter((group: any) => group.options.length > 0);
  }

  return [];
}

function checklistEsAgrupado(field: any) {
  const grupos = normalizarChecklistGrupos(field);
  return (
    grupos.length > 1 ||
    grupos.some((group: any) => !!group.label && group.key !== "__default__")
  );
}

function normalizarOpcionesChecklist(field: any) {
  const grupos = normalizarChecklistGrupos(field);
  return grupos.flatMap((group: any) => group.options);
}

function obtenerValorChecklist(
  field: any,
  groupKey: string,
  optionValue: string,
) {
  const valorActual = formLocal[field.model];

  if (!valorActual || typeof valorActual !== "object") {
    return false;
  }

  if (checklistEsAgrupado(field)) {
    return !!valorActual?.[groupKey]?.[optionValue];
  }

  return !!valorActual?.[optionValue];
}

function actualizarValorChecklist(
  field: any,
  groupKey: string,
  optionValue: string,
  value: boolean,
) {
  if (checklistEsAgrupado(field)) {
    if (!formLocal[field.model] || typeof formLocal[field.model] !== "object") {
      formLocal[field.model] = {};
    }

    if (
      !formLocal[field.model][groupKey] ||
      typeof formLocal[field.model][groupKey] !== "object"
    ) {
      formLocal[field.model][groupKey] = {};
    }

    formLocal[field.model][groupKey][optionValue] = !!value;
  } else {
    if (!formLocal[field.model] || typeof formLocal[field.model] !== "object") {
      formLocal[field.model] = {};
    }

    formLocal[field.model][optionValue] = !!value;
  }

  handleChecklistChange(field.model);
}

function inicializarChecklist(field: any) {
  if (!field?.model || field?.type !== "checklist") return;

  const grupos = normalizarChecklistGrupos(field);
  const opciones = grupos.flatMap((group: any) => group.options);
  const valorActual = toRaw(formLocal[field.model]);
  const esAgrupado = checklistEsAgrupado(field);
  const estadoInicial: Record<string, any> = {};

  if (esAgrupado) {
    grupos.forEach((group: any) => {
      estadoInicial[group.key] = {};
      group.options.forEach((option: any) => {
        estadoInicial[group.key][option.value] = false;
      });
    });
  } else {
    opciones.forEach((option: any) => {
      estadoInicial[option.value] = false;
    });
  }

  if (Array.isArray(valorActual)) {
    if (esAgrupado) {
      grupos.forEach((group: any) => {
        group.options.forEach((option: any) => {
          const activo =
            valorActual.includes(option.value) ||
            valorActual.includes(option.label);
          estadoInicial[group.key][option.value] = !!activo;
        });
      });
    } else {
      opciones.forEach((option: any) => {
        const activo =
          valorActual.includes(option.value) ||
          valorActual.includes(option.label);
        estadoInicial[option.value] = !!activo;
      });
    }
  } else if (
    valorActual &&
    typeof valorActual === "object" &&
    !Array.isArray(valorActual)
  ) {
    if (esAgrupado) {
      grupos.forEach((group: any) => {
        group.options.forEach((option: any) => {
          estadoInicial[group.key][option.value] = !!(
            valorActual?.[group.key]?.[option.value] ??
            valorActual?.[group.key]?.[option.label]
          );
        });
      });
    } else {
      opciones.forEach((option: any) => {
        estadoInicial[option.value] = !!(
          valorActual[option.value] ?? valorActual[option.label]
        );
      });
    }
  }

  formLocal[field.model] = estadoInicial;
}

function checklistSinSeleccion(field: any, valor: any) {
  if (field?.type !== "checklist") return false;

  const grupos = normalizarChecklistGrupos(field);
  if (!grupos.length) return true;

  if (!valor || typeof valor !== "object" || Array.isArray(valor)) {
    return true;
  }

  if (checklistEsAgrupado(field)) {
    return grupos.every((group: any) =>
      group.options.every(
        (option: any) =>
          !valor?.[group.key]?.[option.value] &&
          !valor?.[group.key]?.[option.label],
      ),
    );
  }

  const opciones = grupos.flatMap((group: any) => group.options);

  return opciones.every((option: any) => !valor[option.value]);
}

function obtenerEstiloChecklist(field: any) {
  const columnas =
    Number(field?.columnsOption) > 0 ? Number(field.columnsOption) : 1;
  const alignMap: Record<string, string> = {
    left: "start",
    center: "center",
    right: "end",
  };

  return {
    display: "grid",
    gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
    justifyItems: alignMap[field?.alignOptions] ?? "start",
  };
}

function handleChecklistChange(field: string) {
  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios || tieneRequeridos.value) {
    validarCamposRequeridos();
  }
}

function mostrarNotaChecklist(field: any) {
  const nota = field?.notaText;
  return typeof nota === "string" && nota.trim() !== "";
}

function obtenerNotaChecklistStyle(field: any) {
  const stylesPermitidos = ["danger", "warning", "success", "info"];
  const style = String(field?.notaTextStyle || "info").toLowerCase();

  return stylesPermitidos.includes(style) ? style : "info";
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
  const options = obtenerOpcionesSelect(field);
  const value =
    selected && typeof selected === "object"
      ? selected
      : options.find((option: any) => {
          return (
            option.value === selected ||
            option.label === selected ||
            option.id === selected
          );
        });

  const hasSelectedValue =
    selected !== null && selected !== undefined && selected !== "";
  const finalValue = hasSelectedValue ? (value ?? selected) : null;

  formLocal[field.model] = finalValue;

  if (props.formLive) {
    emit("update:modelValue", { ...formLocal });
  }

  if (props.validarCambios || tieneRequeridos.value) {
    validarCamposRequeridos();
  }
  await limpiarDependencias(field);
  await obtenerCatalogoDependencia(field);
}

async function limpiarDependencias(field: any) {
  const tmp: any = Array.isArray(schemaLocal)
    ? [...schemaLocal]
    : Array.isArray(props.schema)
      ? [...props.schema]
      : [];
  // Filtra los campos que necesitan limpiar dependencias
  for (const f of tmp) {
    if (!f || typeof f !== "object") continue;
    if (f.dependenciaQuery === field.model) {
      formLocal[f.model] = null;
      f.options = [];
      // limpiar recursivamente
      // eslint-disable-next-line no-await-in-loop
      await limpiarDependencias(f);
    }
  }

  schemaLocal = tmp;
}

// prettier-ignore
async function obtenerCatalogoDependencia(field: any) {
  const tmp: any = Array.isArray(schemaLocal) ? ([...schemaLocal]) : (Array.isArray(props.schema) ? [...props.schema] : []);
  // Filtra los campos que necesitan cargar catálogos
  const catalogPromises: Promise<any>[] = [];

    for (const f of tmp) {
    if (!f || typeof f !== "object") continue;
    if (f.dependenciaQuery === field.model) {
      const fieldDependendica = toRaw(f);
      const dependenciaValor =
        formLocal[fieldDependendica.dependenciaQuery]?.id ??
        formLocal[fieldDependendica.dependenciaQuery]?.value;

      catalogPromises.push( (async () => {
        const catalogoData = await obtenerCatalogo(f, { [fieldDependendica.dependenciaQueryFiltro]: dependenciaValor });
        f.options = normalizarOpcionesSelect(toRaw(catalogoData));
      })());
    }
    if (f.dependencia === field.model) {
      const fieldDependendica = toRaw(f);
      const dependenciaValor =
        formLocal[fieldDependendica.dependencia]?.id ??
        formLocal[fieldDependendica.dependencia]?.value;

      catalogPromises.push(
        (async () => {
          const catalogoData = await obtenerCatalogo(f, {
            [fieldDependendica.dependenciaFiltro]: dependenciaValor,
          });
          f.options = normalizarOpcionesSelect(toRaw(catalogoData));
        })(),
      );
    }
  }

  // Espera a que todas las promesas de carga de catálogos se resuelvan
  await Promise.all(catalogPromises);
  schemaLocal = tmp;

  // Incrementa la clave para forzar la renderización del formulario
  formKey.value++;
}

async function obtenerCatalogoDependencia_v2(field: any) {
  const f = field;
  const catalogoData = await obtenerCatalogo(f, {
    [f.dependenciaQueryFiltro]: formLocal[f.dependenciaQuery].id,
  });
  let options = normalizarOpcionesSelect(toRaw(catalogoData));
  formKey.value++;
  return options;
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
    camposVisibles.flatMap((field: any) => {
      const modelos: string[] = [];

      if (field?.model) {
        modelos.push(field.model);
      }

      if (isNumberMultiField(field)) {
        getMultiFieldItems(field).forEach((item: any) => {
          if (item?.model) {
            modelos.push(item.model);
          }
        });
      }

      return modelos;
    }),
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

    if (isNumberMultiField(field)) {
      const subItems = getMultiFieldItems(field);

      if (!esRequerido) {
        if (field?.model) {
          delete itemsErrors[field.model];
        }

        subItems.forEach((item: any) => {
          if (item?.model) {
            delete itemsErrors[item.model];
          }
        });

        return field;
      }

      subItems.forEach((item: any) => {
        if (!item?.model) {
          return;
        }

        const valor = formLocal[item.model];
        const isEmpty =
          valor === undefined ||
          valor === null ||
          (typeof valor === "string" && valor.trim() === "") ||
          (Array.isArray(valor) && valor.length === 0);

        if (isEmpty) {
          itemsErrors[item.model] = `Este campo es requerido.`;
        } else {
          delete itemsErrors[item.model];
        }
      });

      if (field?.model) {
        delete itemsErrors[field.model];
      }

      return field;
    }

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
      (Array.isArray(valor) && valor.length === 0) ||
      checklistSinSeleccion(field, valor);

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
    const fieldDirecto = updatedSchema.find((f: any) => f.model === key);
    if (fieldDirecto) {
      return fieldDirecto?.label
        ? fieldDirecto.label.replace(/<[^>]*>?/gm, "")
        : "";
    }

    const fieldPadre = updatedSchema.find((f: any) =>
      getMultiFieldItems(f).some((item: any) => item?.model === key),
    );

    if (!fieldPadre) {
      return "";
    }

    const item = getMultiFieldItems(fieldPadre).find(
      (it: any) => it?.model === key,
    );

    const labelPadre = fieldPadre?.label
      ? fieldPadre.label.replace(/<[^>]*>?/gm, "")
      : "";
    const labelItem = item?.label ? String(item.label) : "";

    return labelItem ? `${labelPadre} - ${labelItem}` : labelPadre;
  });

  return itemsErrors;
}

function handleSubmit() {
  const faltantes = toRaw(validarCamposRequeridos());
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

  const nextStep = handleValidarFormatos();

  if (nextStep) {
    emit("submit", tmp);
    emit("update:isDialogVisible", false);
  }
}

// prettier-ignore
// Maneja la cancelación del formulario
function handleValidarFormatos(): any {
  const validatedItems = props.schema.filter((item) => typeof item.validated === "function" || ( typeof item.validated === "string" && typeof validators[item.validated as keyof typeof validators] === "function"));
  const messagesError: any= {};
  // No hay campos que validar
  if (validatedItems.length === 0) { return true; }

  for (const item of validatedItems) {
    const value = formLocal[item?.model ?? ""];
    let resultado : any;

    // validated es directamente una función
    if (typeof item.validated === "function") {
      resultado = item.validated(value);
    } else if ( typeof item.validated === "string" && typeof validators[item.validated as keyof typeof validators] === "function" ) {
      // validated es el nombre de un validador
      const validator = validators[item.validated as keyof typeof validators];
      resultado = validator(value);
    } else {
      resultado = true;
    }

    // Si devuelve un string, detenernos y retornar el error
    if (resultado !== true) {
      messagesError[item?.model ?? ''] = resultado;
    }
  }

  const hayErrores = Object.keys(messagesError).length > 0

  if(hayErrores){
    Object.keys(itemsErrors).forEach((key) => delete itemsErrors[key]);
    setTimeout(() => { Object.assign(itemsErrors, messagesError); }, 1);
    return false
  } else {
    return true
  }
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

function getMultiFieldItems(field: any) {
  if (!field || typeof field !== "object") {
    return [];
  }

  if (Array.isArray(field.items) && field.items.length) {
    return field.items;
  }

  if (Array.isArray(field.elements) && field.elements.length) {
    return field.elements;
  }

  return [];
}

function isNumberMultiField(field: any) {
  const items = getMultiFieldItems(field);
  if (!items.length) {
    return false;
  }

  if (field?.type === "multiField") {
    return (field?.inputType || "number") === "number";
  }

  return field?.type === "number";
}

function handleNumberInputByModel(event: Event, field: any, model: string) {
  const input = event.target as HTMLInputElement;

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

function handleNumberInput(event: Event, field: any) {
  handleNumberInputByModel(event, field, field.model);
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
    emit("update:modelValue", { ...formLocal });
  }, 1);
  if (props.formLive) {
  }
}
const schemaVisible = computed(() =>
  (schemaLocal || []).filter((field: any) => esCampoVisible(field)),
);

const getAlignButtonActions = (): any => {
  switch (props.buttonAlignmentBetween) {
    case "start":
      return "justify-start";
      break;
    case "end":
      return "justify-end";
      break;
    case "between":
      return "justify-space-between";
      break;
  }
};

onMounted(async () => {
  let tmp: any = [...props.schema];

  // Filtra los campos que necesitan cargar catálogos
  const catalogPromises = tmp.map(async (field: any) => {
    if (
      field.type === "select" &&
      field.dependenciaQuery &&
      formLocal[field.dependenciaQuery]
    ) {
      const catalogoData = await obtenerCatalogoDependencia_v2(field);
      field.options = normalizarOpcionesSelect(toRaw(catalogoData));
    }
    if (field.type === "select" && field.catalogo && !field.dependenciaQuery) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = normalizarOpcionesSelect(toRaw(catalogoData));
    } else if (field.type === "select" && !field.options) {
      field.options = field.options || [];
    } else if (field.type === "select" && field.options) {
      field.options = normalizarOpcionesSelect(toRaw(field.options));
    }
    if (field.type === "chips" && field.catalogo) {
      const catalogoData = await obtenerCatalogo(field);
      field.options = toRaw(catalogoData);
    }
  });

  // Espera a que todas las promesas de carga de catálogos se resuelvan
  await Promise.all(catalogPromises);

  tmp.forEach(async (field: any) => {
    // Inicializa visibilidad para campos password
    if (field.type === "password") {
      passwordVisible[field.model] = false;
    }
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
        let options = obtenerOpcionesSelect(field);
        let option = options.find((option: any) => {
          return (
            String(option.label).toLowerCase() == String(valor).toLowerCase() ||
            String(option.value).toLowerCase() == String(valor).toLowerCase()
          );
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

      const valorActualNormalizado = normalizarValorSwitch(
        formLocal[field.model],
      );

      // Soporta tanto `defaultValue` (nueva) como `valorDefault` (legado)
      const rawDefault =
        field.defaultValue !== undefined
          ? field.defaultValue
          : field.valorDefault;
      const valorDefaultNormalizado = normalizarValorSwitch(rawDefault);

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
        // Si no hay valor actual ni default configurado, usa false
        formLocal[field.model] = false;
      }
    }

    if (field.type === "checklist") {
      inicializarChecklist(field);
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

      <!-- prettier-ignore -->
      <h6 v-if="tieneRequeridos && props.showMessageRequired" class="mb16" style="color: #535353; font-size: 0.80rem;">
        Este formulario cuenta con campos obligatorios, los puedes identificar porque tienen este símbolo <span style="color:red">*</span>
      </h6>
      <div v-if="props.showMessageRequired">
        <div
          v-if="camposFaltantes.length"
          ref="mensajeRef"
          class="wFull mb14 faltantes-alert mx-auto"
        >
          <div class="faltantes-header">
            <span class="faltantes-icon">⚠️</span>
            <span class="faltantes-title">Campos obligatorios pendientes</span>
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
      <div class="formWrapper">
        <!-- Render dynamic fields -->
        <v-row class="m0">
          <template v-for="field in schemaVisible" :key="field.model">
            <!-- Campo de texto -->
            <!-- prettier-ignore -->
            <div v-if="field.type === 'label'" :class="field.classElement">
               <label class="fontBold" :class="field.lblStyle"> {{ field.label }} </label>
               <!-- <p class="ml-3"> {{ formLocal[field.model] }} </p> -->
               <p class="ml-3 mb-0"> {{ formateadorValueLabel(field,(obtenerPropiedad(formLocal, field.model) || '')) }} </p>
            </div>

            <!-- prettier-ignore -->
            <div v-if="field.type === 'separador'" :class="field.classElement">
               <h3 class="titleForm"> {{ field.label }} </h3>
            </div>

            <!-- prettier-ignore -->
            <div v-if="field.type === 'span'" :class="field.classElement">
            </div>

            <div v-if="field.type === 'text'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />

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

            <!-- Campo password -->
            <div
              v-else-if="field.type === 'password'"
              :class="field.classElement"
            >
              <label
                class="fontBold"
                :class="field.lblStyle"
                :for="field.model"
                v-html="
                  props.formRequired
                    ? field.label + spanRequired
                    : field.required
                      ? field.label + spanRequired
                      : field.label
                "
              />

              <VTextField
                variant="outlined"
                :type="passwordVisible[field.model] ? 'text' : 'password'"
                v-model="formLocal[field.model]"
                :disabled="props.isDisabled || field.disabled"
                :placeholder="
                  field.placeholder || `Introduce el dato requerido`
                "
                :append-inner-icon="
                  passwordVisible[field.model] ? 'tabler-eye-off' : 'tabler-eye'
                "
                @click:append-inner="
                  passwordVisible[field.model] = !passwordVisible[field.model]
                "
                @input="handleInputChange(field.model, $event.target.value)"
              />
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>

            <div v-if="field.type === 'counter'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
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
            <div v-else-if="isNumberMultiField(field)" :class="field.classElement">
              <label
                :class="['fontBold', 'multi-field-main-label', field.lblStyle]"
                :for="field.model"
                v-html="field.label"
              />
              
              <div class="divSpan">
                <span>
                  {{ obtenerIndicacionNumber(field) }}
                </span>
              </div>

              <div
                class="multi-field-grid"
                :style="{
                  gridTemplateColumns: `repeat(${Math.max(getMultiFieldItems(field).length, 1)}, minmax(0, 1fr))`,
                }"
              >
                <div
                  v-for="item in getMultiFieldItems(field)"
                  :key="item.model"
                  class="multi-field-item"
                  :class="item.classItem || field.classItem"
                >
                <label class="fontBold multi-field-sub-label" :for="item.model"
                  v-html="props.formRequired ? (item.label + spanRequired) : (field.required ? item.label + spanRequired : item.label)"
                />
                  <VTextField
                    v-model="formLocal[item.model]"
                    class="form-control"
                    :class="' text-center ' + (item.classInput || field.classInput || '')"
                    :disabled="props.isDisabled || field.disabled || item.disabled"
                    :placeholder="item.placeholder || field.placeholder || `Introduce el dato requerido`"
                    @input="handleNumberInputByModel($event, field, item.model)"
                  />
                  <p class="error-message">{{ itemsErrors[item.model] }}</p>
                </div>
              </div>
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <VSelect
                :items="obtenerOpcionesSelect(field)"
                :model-value="formLocal[field.model] ?? null"
                item-title="label"
                item-value="value"
                return-object
                clearable
                :placeholder="field.placeholder || 'Selecciona una opción'"
                :disabled="props.isDisabled || field.disabled"
                @update:modelValue=" (selected) => handleSelectChange(field, selected) "
              >  
                <template #no-data>
                  <p v-if="obtenerOpcionesSelect(field).length === 0" class="text-center w-full p0 m0">No hay opciones disponibles</p>
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
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
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)"></label>
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

            <!-- Campo checklist -->
            <!-- prettier-ignore -->
            <div v-else-if="field.type === 'checklist'" :class="field.classElement">
              <!-- prettier-ignore -->
              <label class="fontBold" :class="field.lblStyle" :for="field.model" v-html="props.formRequired ? (field.label + spanRequired) : (field.required ? field.label + spanRequired : field.label)" />
              <p
                v-if="mostrarNotaChecklist(field)"
                class="checklist-note"
                :class="`checklist-note-${obtenerNotaChecklistStyle(field)}`"
              >
                {{ field.notaText }}
              </p>
              <div class="checklist-wrapper">
                <div
                  v-for="group in normalizarChecklistGrupos(field)"
                  :key="`${field.model}-${group.key}`"
                  class="checklist-group"
                >
                  <h6 v-if="group.label" class="checklist-group-title">{{ group.label }}</h6>
                  <div class="checklist-group-options" :style="obtenerEstiloChecklist(field)">
                    <VCheckbox
                      v-for="option in group.options"
                      :key="`${field.model}-${group.key}-${option.value}`"
                      :model-value="obtenerValorChecklist(field, group.key, option.value)"
                      :label="option.label"
                      :disabled="props.isDisabled || field.disabled"
                      density="comfortable"
                      hide-details
                      @update:modelValue="(value) => actualizarValorChecklist(field, group.key, option.value, !!value)"
                    />
                  </div>
                </div>
              </div>
              <p class="error-message">{{ itemsErrors[field.model] }}</p>
            </div>
          </template>
        </v-row>
      </div>
      <!-- prettier-ignore -->
      <div v-if="showButtonsAction" class="d-flex gap-3 mt-4" :class="getAlignButtonActions()">
        <VBtn v-if="showButtonCancel" :variant="props.variantButtonCancel" :color="props.colorButtonCancel"   @click.prevent="handleCancel"  > 
          <VIcon v-if="showIconButtonCancel"  start :icon="props?.iconButtonCancel" />
          {{ props.textButtonCancel || "Cancelar" }} 
        </VBtn>

        <VBtn v-if="showButtonSubmit" :variant="props.variantButtonSubmit" :color="props.colorButtonSubmit"  @click="handleSubmit" > 
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

.multi-field-grid {
  display: grid;
  gap: 10px;
  width: 100%;
  margin-top: 6px;
}

.multi-field-item {
  min-width: 0;
}

.multi-field-sub-label {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.multi-field-main-label {
  display: block;
  font-size: large;
  width: 100%;
}

.checklist-wrapper {
  row-gap: 2px;
}

.checklist-group {
  margin-bottom: 12px;
}

.checklist-group-title {
  margin-bottom: 8px;
  font-weight: 700;
  color: #374151;
}

.checklist-group-options {
  row-gap: 2px;
}

.checklist-note {
  margin: 6px 0 10px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  border: 1px solid transparent;
}

.checklist-note-danger {
  color: #b42318;
  background: #fef3f2;
  border-color: #fecdca;
}

.checklist-note-warning {
  color: #b54708;
  background: #fffaeb;
  border-color: #fedf89;
}

.checklist-note-success {
  color: #027a48;
  background: #ecfdf3;
  border-color: #a6f4c5;
}

.checklist-note-info {
  color: #175cd3;
  background: #eff8ff;
  border-color: #b2ddff;
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
  margin-top: 0px !important; /* Espaciado mínimo */
  margin-block-end: 0px !important; /* Espaciado mínimo */
}
</style>
