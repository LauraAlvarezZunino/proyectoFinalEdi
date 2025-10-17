// src/services/reservaService.js (crear o modificar)

// Usaremos 'api' que asumo es una instancia de Axios o un wrapper de fetch con configuración base.
// Asegúrate de que esta instancia ya maneje las cabeceras como la autenticación.
import api from '../services/api'; 

const RESERVAS_ENDPOINT = '/reservas';

/**
 * Obtiene todas las reservas (Admin) o las reservas del usuario actual (User).
 * @param {number} userId - ID del usuario, si no es Admin.
 * @param {boolean} isAdmin - Indica si el usuario es Admin.
 */
export const fetchReservations = async (userId, isAdmin) => {
    try {
        const url = isAdmin
            ? RESERVAS_ENDPOINT // Admin: Todas las reservas
            : `${RESERVAS_ENDPOINT}?usuarioId=${userId}`; // User: Sus reservas

        const response = await api.get(url);

        let data = response.data;

        // Handle the "re" prefix issue from backend
        if (typeof data === 'string' && data.startsWith('re')) {
            data = data.substring(2);
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Error parsing JSON after removing "re":', data);
                throw new Error('Invalid JSON response from server');
            }
        }

        // Devolvemos la data que asumimos que es un array de reservas
        return data;
    } catch (error) {
        console.error("Error fetching reservations:", error);
        throw new Error('Error al cargar las reservas desde el servidor.');
    }
};

/**
 * Crea una nueva reserva.
 */
export const createReservation = async (reservationData) => {
    try {
        const response = await api.post(RESERVAS_ENDPOINT, reservationData);
        return response.data;
    } catch (error) {
        console.error("Error creating reservation:", error);
        throw new Error('Error al crear la reserva.');
    }
};

/**
 * Actualiza una reserva existente.
 */
export const updateReservation = async (id, reservationData) => {
    try {
        const response = await api.put(`${RESERVAS_ENDPOINT}/${id}`, reservationData);
        // PUTs a menudo devuelven 204 (No Content), asumiremos que el backend devuelve algo o lo manejamos
        return response.data; 
    } catch (error) {
        console.error("Error updating reservation:", error);
        throw new Error('Error al actualizar la reserva.');
    }
};

/**
 * Cancela (elimina) una reserva.
 */
export const cancelReservation = async (id) => {
    try {
        // En muchos sistemas, cancelar es un PATCH o PUT para cambiar el estado, 
        // pero seguiremos la lógica DELETE de tu código original.
        await api.delete(`${RESERVAS_ENDPOINT}/${id}`); 
        return { message: 'Reserva cancelada exitosamente.' };
    } catch (error) {
        console.error("Error cancelling reservation:", error);
        throw new Error('Error al cancelar la reserva.');
    }
};