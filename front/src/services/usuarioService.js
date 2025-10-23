const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/usuarios';

// Función auxiliar para manejar las peticiones y errores
const fetchApi = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Incluir el token en todas las peticiones
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Manejar respuesta 204 (No Content), en PUT/DELETE exitosos
  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    // Intentar leer el mensaje de error del cuerpo de la respuesta
    let errorDetail = { message: `HTTP error! Status: ${response.status}` };
    try {
        errorDetail = await response.json();
    } catch (e) {
        // El error no tenía cuerpo JSON
    }
    throw new Error(errorDetail.message || `Error en la API: ${response.statusText}`);
  }

  const text = await response.text();
  if (text.startsWith('re')) {
    try {
      return JSON.parse(text.substring(2));
    } catch (e) {
      console.error('Error parsing JSON after removing "re":', text);
      throw new Error('Invalid JSON response from server');
    }
  }

  return JSON.parse(text);
};

// ===============================================
// LÓGICA DE NEGOCIO PARA LA API
// ===============================================

export const getAllUsers = async () => {
  return fetchApi(API_BASE_URL);
};

export const getUserById = async (userId) => {
  return fetchApi(`${API_BASE_URL}/${userId}`);
};

export const createUser = async (userData) => {

  return fetchApi(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};


export const updateUser = async (userId, userData) => {
  const dataToSend = {
    nombreApellido: userData.nombreApellido,
    telefono: userData.telefono,
    email: userData.email,
    ...(userData.clave && { clave: userData.clave }),
    ...(userData.esAdmin !== undefined && { esAdmin: userData.esAdmin })
  };

  // Si la contraseña está vacía, no la enviamos
  if (!dataToSend.clave) {
    delete dataToSend.clave;
  }

  return fetchApi(`${API_BASE_URL}/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(dataToSend),
  });
};

/** CAMBIAR ESTADO (Activo/Inactivo - Solo Admin) */
export const toggleUserStatus = async (userId, newStatus) => {
  // Asumiendo un endpoint PATCH para cambiar solo el estado
  return fetchApi(`${API_BASE_URL}/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: newStatus }),
  });
};