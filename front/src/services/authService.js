// src/services/authService.js (Actualización de loginUser)
import api from '../services/api';

// Función para registrar usuario
export const registerUser = async (userData) => {
    try {
        console.log('Enviando datos de registro:', userData);
        const response = await api.post('/autenticacion/registro', userData);
        console.log('Respuesta del registro:', response);

        let data = response.data;

        // El backend está enviando "re" al inicio de la respuesta JSON
        if (typeof data === 'string' && data.startsWith('re')) {
            data = data.substring(2); // Remover "re" del inicio
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Error parseando JSON después de remover "re":', data);
                throw new Error('Formato de respuesta JSON incorrecto.');
            }
        }

        // Verificar que la respuesta sea un objeto válido
        if (typeof data !== 'object' || data === null) {
            console.error('Respuesta del servidor:', data);
            throw new Error('Formato de respuesta JSON incorrecto.');
        }

        // Verificar si hay error
        if (data.error) {
            console.error('Error del servidor:', data.error);
            throw new Error(data.error);
        }

        console.log('Registro exitoso:', data);
        return data;

    } catch (error) {
        console.error("AuthService Register Error:", error.response?.data || error.message);
        // Extraer mensaje de error del servidor
        let errorMessage = 'Error al registrar usuario.';

        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.response?.data && typeof error.response.data === 'string' && error.response.data.startsWith('re')) {
            // Handle the "re" prefix issue for error responses
            try {
                const parsedError = JSON.parse(error.response.data.substring(2));
                errorMessage = parsedError.error || parsedError.message || errorMessage;
            } catch (e) {
                errorMessage = error.response.data.substring(2);
            }
        } else if (error.message && error.message !== 'Network Error') {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/autenticacion/inicio-sesion', {
            email: email,
            clave: password 
        });

        let data = response.data;

        // El backend está enviando "re" al inicio de la respuesta JSON
        if (typeof data === 'string' && data.startsWith('re')) {
            data = data.substring(2); // Remover "re" del inicio
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Error parseando JSON después de remover "re":', data);
                throw new Error('Formato de respuesta JSON incorrecto.');
            }
        }

        // Verificar que la respuesta sea un objeto válido
        if (typeof data !== 'object' || data === null) {
            console.error('Respuesta del servidor:', data);
            throw new Error('Formato de respuesta JSON incorrecto.');
        }

        // Verificar que tenga los campos requeridos
        if (!data.token || !data.user_id) {
            console.error('Campos faltantes en respuesta:', data);
            throw new Error('Respuesta del servidor incompleta.');
        }


        // 🛑 Lógica de Validación de Datos (Revisar nombres de propiedades)
        // Asegúrate de que tu backend usa 'token' y 'user_id'
        const token = data.token;
        const userId = data.user_id;
        const isAdmin = data.is_admin;
        const nombreApellido = data.nombre_apellido;

        if (!token || !userId) {
            // Revisa qué propiedad usa el backend para el mensaje de error si el login falla.
            const serverError = data.error || data.message || 'Respuesta inválida del servidor.';
            throw new Error(serverError);
        }
        
        // Mapeo de datos final
        const userData = {
            id: userId,
            nombreApellido: nombreApellido,
            email: data.email || email, // Usamos el email de la respuesta del servidor
            dni: data.dni,
            telefono: data.telefono,
            esAdmin: isAdmin,
        };

        return { token: token, user: userData };

    } catch (error) {
        console.error("AuthService Login Error:", error.response?.data || error.message);
        // Si el error es una excepción de red o parseo, usa el mensaje de error.
        let errorMessage = 'Usuario o contraseña incorrectos.';

        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.response?.data && typeof error.response.data === 'object') {
            // Handle case where error is in the data object
            errorMessage = error.response.data.error || error.response.data.message || errorMessage;
        } else if (error.message && error.message !== 'Network Error') {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};