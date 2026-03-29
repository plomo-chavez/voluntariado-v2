// frontend/src/stores/auth.ts
import { getMenuItemsForUserType } from "@/navigation/vertical/menuItems";
import { router } from "@/plugins/1.router";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  // --- STATE ---
  const user: any = ref(null);
  const token: any = ref(null);

  // Rehidrata el estado desde sessionStorage al cargar la app
  const storedUser = sessionStorage.getItem("userData"); // Asegúrate que la key sea la correcta
  const storedToken = sessionStorage.getItem("token");

  if (storedUser && storedToken) {
    user.value = JSON.parse(storedUser);
    token.value = storedToken;
  }

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const userType = computed(() => user.value?.tipo_id ?? 0);

  const navItems = computed(() => {
    if (!isAuthenticated.value) {
      logout;
    }

    // Filtra la estructura base del menú según el tipo de usuario
    const items = getMenuItemsForUserType(userType.value);

    // Se usa JSON.parse/stringify para crear una copia profunda y evitar mutar el import original
    return items;
  });

  // --- ACTIONS ---
  function login(userData: any, authToken: any) {
    user.value = userData;
    token.value = authToken;
    sessionStorage.setItem("userData", JSON.stringify(userData));
    sessionStorage.setItem("token", authToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("token");
    router.push({ name: "login" });
  }

  return {
    user,
    token,
    isAuthenticated,
    navItems,
    login,
    logout,
  };
});
