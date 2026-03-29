// frontend/src/stores/auth.ts
import { fallbackMenu, fetchMenuItems } from "@/navigation/vertical/menuItems";
import { router } from "@/plugins/1.router";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // --- STATE ---
  const user: any = ref(null);
  const token: any = ref(null);
  const menuItems: any = ref<any[]>([]);

  // Rehidrata el estado desde sessionStorage al cargar la app
  const storedUser = sessionStorage.getItem("userData");
  const storedToken = sessionStorage.getItem("token");

  if (storedUser && storedToken) {
    user.value = JSON.parse(storedUser);
    token.value = storedToken;
  }

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userType = computed(() => user.value?.tipo_id ?? 0);

  const navItems = computed(() => {
    if (menuItems.value.length > 0) return menuItems.value;
    return fallbackMenu;
  });

  // --- ACTIONS ---
  async function fetchMenu() {
    menuItems.value = await fetchMenuItems();
  }

  function login(userData: any, authToken: any) {
    user.value = userData;
    token.value = authToken;
    sessionStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("token", authToken);
    fetchMenu();
  }

  function logout() {
    user.value = null;
    token.value = null;
    menuItems.value = [];
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("token");
    router.push({ name: "login" });
  }

  // Si se rehidrató sesión, cargar el menú también
  if (storedUser && storedToken) {
    fetchMenu();
  }

  return {
    user,
    token,
    isAuthenticated,
    navItems,
    userType,
    fetchMenu,
    login,
    logout,
  };
});
