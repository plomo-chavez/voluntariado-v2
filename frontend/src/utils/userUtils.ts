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

export const getTypeUser = (): any => {
  const userRole = getUserData();
  // prettier-ignore
  switch(userRole.tipo_id){
      case 1:  return 'dev'; break;
      case 2:  return 'admin'; break;
      case 3:  return 'nacional'; break;
      case 4:  return 'nacional'; break;
      case 5:  return 'estatal'; break;
      case 6:  return 'estatal'; break;
      case 7:  return 'local'; break;
      case 8:  return 'local'; break;
    }
};

export const getDataDelegacion = (): any => {
  const userRole = getUserData();
  let data: any = {};

  if (userRole.estado && userRole.estado_id) {
    data.estado = { id: userRole.estado_id, label: userRole.estado };
  }

  if (userRole.delegacion && userRole.delegacion_id) {
    data.delegacion = {
      id: userRole.delegacion_id,
      label: userRole.delegacion,
    };
  }
  return data;
};
