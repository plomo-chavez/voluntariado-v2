// Función para verificar si hay un usuario guardado en localStorage y si tiene tipo_id
export const isUserLoggedIn = (): boolean => {
  // Verifica si getUserData devuelve un usuario válido
  return !!getUserData();
};

export const isUserAdmin = (): boolean => {
  const user = getUserData();
  if (!user) return false;

  try {
    // Verifica si el tipo_id es 1 o 2 para determinar si es administrador
    return user.tipo_id === 1 || user.tipo_id === 2;
  } catch (error) {
    // prettier-ignore
    console.log("isUserAdmin: Error al analizar el usuario desde localStorage:", error);
    return false;
  }
};

export const getUserData = (): any => {
  const user =
    localStorage.getItem("userData") || sessionStorage.getItem("userData"); // Intenta obtener el usuario de localStorage o sessionStorage
  if (!user) {
    // prettier-ignore
    console.log("getUserData: No hay datos de usuario en localStorage.");
    return null;
  }

  try {
    return JSON.parse(user); // Intenta analizar el JSON del usuario
  } catch (error) {
    // prettier-ignore
    console.log("getUserData: Error al analizar el usuario desde localStorage:", error);
    return null;
  }
};
