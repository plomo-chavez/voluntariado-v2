<script setup lang="ts">
import {
  showDeleteItem,
  showErrorMessage,
  showSuccessMessage,
} from "@/components/apps/sweetAlerts/SweetAlets";
import { customRequest } from "@/utils/axiosInstance";
import { computed, onMounted, ref } from "vue";

// ── tipos ─────────────────────────────────────────────────────────────────────
interface Page {
  id?: number;
  title: string;
  route_name: string | null;
  icon: string | null;
  parent_id: number | null;
  orden: number;
  estatus: number;
}

interface TipoUsuario {
  id: number;
  label: string;
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
}

// ── state ────────────────────────────────────────────────────────────────────
const tab = ref("paginas");

// páginas
const pages = ref<Page[]>([]);
const loadingPages = ref(false);
const dialogPage = ref(false);
const formPage = ref<Page>({
  title: "",
  route_name: null,
  icon: null,
  parent_id: null,
  orden: 0,
  estatus: 1,
});
const savingPage = ref(false);

// permisos
const modoPermisos = ref<"tipo" | "usuario">("tipo");
const tiposUsuario = ref<TipoUsuario[]>([]);
const usuarios = ref<Usuario[]>([]);
const selectedTarget = ref<number | null>(null);
const selectedPageIds = ref<number[]>([]);
const loadingPermisos = ref(false);
const savingPermisos = ref(false);
const ALWAYS_VISIBLE_ROUTE_NAMES = new Set(["root"]);
const hasConfiguredUserPermissions = ref(false);
const showUserPermissionEditor = ref(false);

// ── tabla de páginas ──────────────────────────────────────────────────────────
const headersPages = [
  { title: "ID", key: "id", width: "70px" },
  { title: "Título", key: "title" },
  { title: "Ruta", key: "route_name" },
  { title: "Ícono", key: "icon" },
  { title: "Parent ID", key: "parent_id" },
  { title: "Orden", key: "orden", width: "80px" },
  { title: "Estatus", key: "estatus", width: "100px" },
  { title: "Acciones", key: "actions", sortable: false, width: "120px" },
];

// páginas disponibles como padre (excluyendo la actual y sus propios hijos)
const pagesAsParent = computed(() =>
  pages.value.filter((p) => !formPage.value.id || p.id !== formPage.value.id),
);

// ── carga inicial ─────────────────────────────────────────────────────────────
async function loadPages() {
  loadingPages.value = true;
  try {
    const res: any = await customRequest({
      url: "/api/config-pages/list",
      method: "GET",
    });
    if (res.data?.result) pages.value = res.data.data;
  } finally {
    loadingPages.value = false;
  }
}

async function loadTiposUsuario() {
  const res: any = await customRequest({
    url: "/api/catalogo/tipos-usuarios/get",
    method: "POST",
    data: {},
  });
  if (res.data?.result)
    tiposUsuario.value = res.data.data ?? res.data.registros ?? [];
}

async function loadUsuarios() {
  const res: any = await customRequest({
    url: "/api/usuarios",
    method: "POST",
    data: {},
  });
  if (res.data?.result)
    usuarios.value = res.data.data ?? res.data.registros ?? [];
}

onMounted(async () => {
  await loadPages();
  await Promise.all([loadTiposUsuario(), loadUsuarios()]);
});

// ── CRUD páginas ──────────────────────────────────────────────────────────────
function openCreate() {
  formPage.value = {
    title: "",
    route_name: null,
    icon: null,
    parent_id: null,
    orden: 0,
    estatus: 1,
  };
  dialogPage.value = true;
}

function openEdit(item: Page) {
  formPage.value = { ...item };
  dialogPage.value = true;
}

async function savePage() {
  if (!formPage.value.title) return;
  savingPage.value = true;
  try {
    const res: any = await customRequest({
      url: "/api/config-pages/guardar",
      method: "POST",
      data: formPage.value,
    });
    if (res.data?.result) {
      showSuccessMessage({ message: res.data.message });
      dialogPage.value = false;
      await loadPages();
    } else {
      showErrorMessage({
        title: "Error",
        message: res.data?.message ?? "Error al guardar",
      });
    }
  } finally {
    savingPage.value = false;
  }
}

async function deletePage(item: Page) {
  showDeleteItem({
    title: "¿Eliminar página?",
    message: `Se eliminará "${item.title}". Esta acción no se puede deshacer.`,
    onConfirm: async () => {
      const res: any = await customRequest({
        url: "/api/config-pages/eliminar",
        method: "POST",
        data: { id: item.id },
      });
      if (res.data?.result) {
        showSuccessMessage({
          title: "Eliminada",
          message: "Página eliminada correctamente",
        });
        await loadPages();
      } else {
        showErrorMessage({
          title: "Error",
          message: res.data?.message ?? "Error al eliminar",
        });
      }
    },
  });
}

// ── permisos ──────────────────────────────────────────────────────────────────
async function onSelectTarget(id: number) {
  selectedTarget.value = id;
  loadingPermisos.value = true;
  selectedPageIds.value = [];
  hasConfiguredUserPermissions.value = false;
  showUserPermissionEditor.value = false;
  try {
    const url =
      modoPermisos.value === "tipo"
        ? `/api/config-pages/permisos/tipo/${id}`
        : `/api/config-pages/permisos/usuario/${id}`;
    const res: any = await customRequest({ url, method: "GET" });
    if (res.data?.result) {
      if (modoPermisos.value === "usuario") {
        const payload = res.data.data ?? {};
        selectedPageIds.value = payload.pageIds ?? [];
        hasConfiguredUserPermissions.value = !!payload.hasConfiguredPermissions;
        showUserPermissionEditor.value = hasConfiguredUserPermissions.value;
      } else {
        selectedPageIds.value = res.data.data ?? [];
      }
    }
  } finally {
    loadingPermisos.value = false;
  }
}

function startUserPermissionCustomization() {
  showUserPermissionEditor.value = true;
}

async function savePermisos() {
  if (!selectedTarget.value) return;
  savingPermisos.value = true;
  try {
    const url =
      modoPermisos.value === "tipo"
        ? `/api/config-pages/permisos/tipo/${selectedTarget.value}`
        : `/api/config-pages/permisos/usuario/${selectedTarget.value}`;
    const res: any = await customRequest({
      url,
      method: "POST",
      data: { pageIds: persistableSelectedPageIds.value },
    });
    if (res.data?.result) {
      showSuccessMessage({ message: "Permisos guardados correctamente" });
    } else {
      showErrorMessage({
        title: "Error",
        message: res.data?.message ?? "Error al guardar",
      });
    }
  } finally {
    savingPermisos.value = false;
  }
}

function togglePage(id: number, managedBySystem = false) {
  if (managedBySystem) return;

  // Buscar si es padre
  const parent = pagesTree.value.find((p) => p.id === id);
  if (parent) {
    // Es padre, alternar el padre y todos los hijos
    const isParentChecked = isChecked(parent.id!);
    if (isParentChecked) {
      // Deseleccionar padre e hijos
      selectedPageIds.value = selectedPageIds.value.filter(
        (pid) =>
          pid !== parent.id && !parent.children.some((c) => c.id === pid),
      );
    } else {
      // Seleccionar padre e hijos (solo los que no estén ya seleccionados)
      if (selectedPageIds.value.indexOf(parent.id!) === -1)
        selectedPageIds.value.push(parent.id!);
      parent.children.forEach((child) => {
        if (selectedPageIds.value.indexOf(child.id!) === -1)
          selectedPageIds.value.push(child.id!);
      });
    }
    return;
  }

  // Si es hijo, alternar hijo y actualizar padre
  const childParent = pagesTree.value.find((p) =>
    p.children.some((c) => c.id === id),
  );
  if (childParent) {
    const idx = selectedPageIds.value.indexOf(id);
    if (idx === -1) selectedPageIds.value.push(id);
    else selectedPageIds.value.splice(idx, 1);

    // Si todos los hijos están seleccionados, seleccionar el padre
    const allChildrenChecked = childParent.children.every((child) =>
      selectedPageIds.value.includes(child.id!),
    );
    if (allChildrenChecked) {
      if (!selectedPageIds.value.includes(childParent.id!))
        selectedPageIds.value.push(childParent.id!);
    } else {
      // Si se deselecciona algún hijo, deseleccionar el padre
      const pidx = selectedPageIds.value.indexOf(childParent.id!);
      if (pidx !== -1) selectedPageIds.value.splice(pidx, 1);
    }
    return;
  }

  // Si no es padre ni hijo, alternar normal
  const idx = selectedPageIds.value.indexOf(id);
  if (idx === -1) selectedPageIds.value.push(id);
  else selectedPageIds.value.splice(idx, 1);
}

function isChecked(id: number) {
  return effectiveSelectedPageIds.value.includes(id);
}

function isAlwaysVisiblePage(page: Page) {
  return ALWAYS_VISIBLE_ROUTE_NAMES.has(String(page.route_name || ""));
}

function isSystemManagedParent(parent: { children?: Page[] }) {
  return false;
}

// Árbol plano agrupado por parent para mostrar en la lista de permisos
const pagesTree = computed(() => {
  const parents = pages.value.filter((p) => !p.parent_id);
  return parents.map((parent) => ({
    ...parent,
    children: pages.value.filter((p) => p.parent_id === parent.id),
  }));
});

const effectiveSelectedPageIds = computed<number[]>(() => {
  const effective = new Set<number>(selectedPageIds.value);

  for (const parent of pagesTree.value) {
    const children = parent.children ?? [];
    if (children.length === 0 || !parent.id) continue;

    const hasAnyChildEnabled = children.some((child) =>
      effective.has(child.id as number),
    );

    if (hasAnyChildEnabled) effective.add(parent.id);
    else effective.delete(parent.id);
  }

  return Array.from(effective);
});

const persistableSelectedPageIds = computed<number[]>(() => {
  return effectiveSelectedPageIds.value.filter((id) => {
    const page = pages.value.find((p) => p.id === id);
    return page ? !isAlwaysVisiblePage(page) : true;
  });
});

// Al cambiar de modo, limpiar selección
function onChangeModo() {
  selectedTarget.value = null;
  selectedPageIds.value = [];
  hasConfiguredUserPermissions.value = false;
  showUserPermissionEditor.value = false;
}
</script>

<template>
  <div>
    <h1 class="mb-4">Configuración de Páginas</h1>

    <VTabs v-model="tab" class="mb-4">
      <VTab value="paginas">Páginas</VTab>
      <VTab value="permisos">Permisos</VTab>
    </VTabs>

    <!-- ── TAB: PÁGINAS ──────────────────────────────────────────────────────── -->
    <VWindow v-model="tab">
      <VWindowItem value="paginas">
        <VCard>
          <VCardTitle class="d-flex align-center justify-space-between pa-4">
            <span>Páginas del menú</span>
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="openCreate"
            >
              Nueva página
            </VBtn>
          </VCardTitle>

          <VDataTable
            :headers="headersPages"
            :items="pages"
            :loading="loadingPages"
            items-per-page="25"
            class="text-no-wrap"
          >
            <template #item.estatus="{ item }">
              <VChip
                :color="item.estatus === 1 ? 'success' : 'error'"
                size="small"
              >
                {{ item.estatus === 1 ? "Activo" : "Inactivo" }}
              </VChip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEdit(item)"
                >
                  <VIcon icon="tabler-edit" />
                </VBtn>
                <VBtn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deletePage(item)"
                >
                  <VIcon icon="tabler-trash" />
                </VBtn>
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VWindowItem>

      <!-- ── TAB: PERMISOS ──────────────────────────────────────────────────── -->
      <VWindowItem value="permisos">
        <VCard>
          <VCardTitle class="pa-4">Permisos de acceso a páginas</VCardTitle>
          <VCardText>
            <!-- Selector de modo -->
            <VBtnToggle
              v-model="modoPermisos"
              mandatory
              color="primary"
              class="mb-4"
              @update:modelValue="onChangeModo"
            >
              <VBtn value="tipo">Por tipo de usuario</VBtn>
              <VBtn value="usuario">Por usuario individual</VBtn>
            </VBtnToggle>

            <VRow>
              <!-- Lista de tipos / usuarios -->
              <VCol cols="12" md="4">
                <VCard variant="outlined">
                  <VCardTitle class="text-subtitle-1 pa-3">
                    {{
                      modoPermisos === "tipo" ? "Tipos de usuario" : "Usuarios"
                    }}
                  </VCardTitle>
                  <VList density="compact" nav>
                    <template v-if="modoPermisos === 'tipo'">
                      <VListItem
                        v-for="tipo in tiposUsuario"
                        :key="tipo.id"
                        :active="selectedTarget === tipo.id"
                        active-color="primary"
                        :title="tipo.label"
                        :value="tipo.id"
                        @click="onSelectTarget(tipo.id)"
                      />
                    </template>
                    <template v-else>
                      <VListItem
                        v-for="u in usuarios"
                        :key="u.id"
                        :active="selectedTarget === u.id"
                        active-color="primary"
                        :title="u.nombre"
                        :subtitle="u.correo"
                        :value="u.id"
                        @click="onSelectTarget(u.id)"
                      />
                    </template>
                  </VList>
                </VCard>
              </VCol>

              <!-- Árbol de páginas con checkboxes -->
              <VCol cols="12" md="8">
                <VCard variant="outlined" min-height="300">
                  <VCardTitle
                    class="text-subtitle-1 pa-3 d-flex justify-space-between align-center"
                  >
                    <span>Páginas con acceso</span>
                    <VBtn
                      v-if="
                        selectedTarget &&
                        (modoPermisos === 'tipo' || showUserPermissionEditor)
                      "
                      color="primary"
                      size="small"
                      :loading="savingPermisos"
                      @click="savePermisos"
                    >
                      Guardar permisos
                    </VBtn>
                  </VCardTitle>

                  <VCardText
                    v-if="!selectedTarget"
                    class="text-medium-emphasis"
                  >
                    Selecciona un
                    {{
                      modoPermisos === "tipo" ? "tipo de usuario" : "usuario"
                    }}
                    para configurar sus permisos. <br /><br />
                    <strong>Nota:</strong> las páginas sin restricciones son
                    visibles para todos los usuarios. Los permisos aquí
                    definidos restringen el acceso solo a quienes estén en la
                    lista.
                  </VCardText>

                  <VProgressCircular
                    v-else-if="loadingPermisos"
                    indeterminate
                    class="ma-4"
                  />

                  <VCardText
                    v-else-if="
                      modoPermisos === 'usuario' &&
                      selectedTarget &&
                      !showUserPermissionEditor
                    "
                    class="text-medium-emphasis"
                  >
                    <div class="mb-3">
                      Este usuario no tiene permisos personalizados registrados.
                    </div>
                    <div class="mb-4">
                      Actualmente heredará acceso según su tipo de usuario. Si
                      deseas definir permisos específicos, inicia una
                      personalización.
                    </div>
                    <VBtn
                      color="primary"
                      @click="startUserPermissionCustomization"
                    >
                      Personalizar acceso
                    </VBtn>
                  </VCardText>

                  <VList v-else density="compact">
                    <template v-for="parent in pagesTree" :key="parent.id">
                      <!-- Página raíz -->
                      <VListItem>
                        <template #prepend>
                          <VIcon
                            v-if="isAlwaysVisiblePage(parent)"
                            icon="tabler-shield-check"
                            size="18"
                            color="success"
                          />
                          <VCheckbox
                            v-else
                            :model-value="isChecked(parent.id!)"
                            :disabled="isSystemManagedParent(parent)"
                            hide-details
                            density="compact"
                            @click="
                              togglePage(
                                parent.id!,
                                isSystemManagedParent(parent),
                              )
                            "
                          />
                        </template>
                        <VListItemTitle>
                          <VIcon
                            v-if="parent.icon"
                            :icon="parent.icon"
                            size="16"
                            class="mr-1"
                          />
                          {{ parent.title }}
                          <VChip
                            v-if="isAlwaysVisiblePage(parent)"
                            size="x-small"
                            color="success"
                            class="ml-1"
                            >Siempre visible</VChip
                          >
                          <VChip
                            v-if="parent.route_name"
                            size="x-small"
                            class="ml-1"
                            >{{ parent.route_name }}</VChip
                          >
                        </VListItemTitle>
                      </VListItem>

                      <!-- Hijos -->
                      <VListItem
                        v-for="child in parent.children"
                        :key="child.id"
                        class="pl-8"
                      >
                        <template #prepend>
                          <VCheckbox
                            :model-value="isChecked(child.id!)"
                            hide-details
                            density="compact"
                            @click="togglePage(child.id!, false)"
                          />
                        </template>
                        <VListItemTitle>
                          <VIcon
                            v-if="child.icon"
                            :icon="child.icon"
                            size="16"
                            class="mr-1"
                          />
                          {{ child.title }}
                          <VChip
                            v-if="child.route_name"
                            size="x-small"
                            class="ml-1"
                            >{{ child.route_name }}</VChip
                          >
                        </VListItemTitle>
                      </VListItem>
                    </template>
                  </VList>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VWindowItem>
    </VWindow>

    <!-- ── DIALOG: CREAR / EDITAR PÁGINA ─────────────────────────────────────── -->
    <VDialog v-model="dialogPage" max-width="560" persistent>
      <VCard>
        <VCardTitle class="pa-4">
          {{ formPage.id ? "Editar página" : "Nueva página" }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-4">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="formPage.title"
                label="Título *"
                placeholder="Ej. Administrador"
                :rules="[(v: string) => !!v || 'Requerido']"
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField
                v-model="formPage.route_name"
                label="Nombre de ruta"
                placeholder="Ej. usuarios"
                hint="Nombre de la ruta Vue (to.name)"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField
                v-model="formPage.icon"
                label="Ícono"
                placeholder="tabler-home"
                hint="Nombre del ícono Tabler"
                persistent-hint
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VSelect
                v-model="formPage.parent_id"
                :items="pagesAsParent"
                item-title="title"
                item-value="id"
                label="Página padre"
                clearable
                placeholder="Ninguna (nivel raíz)"
              />
            </VCol>
            <VCol cols="12" sm="3">
              <VTextField
                v-model.number="formPage.orden"
                label="Orden"
                type="number"
                min="0"
              />
            </VCol>
            <VCol cols="12" sm="3" class="d-flex align-center">
              <VSwitch
                v-model="formPage.estatus"
                :true-value="1"
                :false-value="0"
                label="Activo"
                color="success"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4 justify-end gap-2">
          <VBtn variant="outlined" @click="dialogPage = false">Cancelar</VBtn>
          <VBtn color="primary" :loading="savingPage" @click="savePage"
            >Guardar</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
