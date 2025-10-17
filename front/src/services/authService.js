// src/services/authService.js (Actualización de loginUser)
import api from '../services/api'; 
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
            email: email, // Usamos el email de la solicitud
            esAdmin: isAdmin,
        };

        return { token: token, user: userData };

    } catch (error) {
        console.error("AuthService Login Error:", error.response?.data || error.message);
        // Si el error es una excepción de red o parseo, usa el mensaje de error.
        throw new Error(error.message || error.response?.data?.error || 'Error de conexión o credenciales inválidas.');
    }
};