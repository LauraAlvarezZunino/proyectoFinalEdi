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

        console.log('Fetching reservations from URL:', url);
        const response = await api.get(url);

        let data = response.data;

        // manejo prefijo re del backend
        if (typeof data === 'string' && data.startsWith('re')) {
            data = data.substring(2);
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Error parsing JSON after removing "re":', data);
                throw new Error('Invalid JSON response from server');
            }
        }

        console.log('Raw response data:', data);
        return data;
    } catch (error) {
        console.error("Error fetching reservations:", error);
        throw new Error('Error al cargar las reservas desde el servidor.');
    }
};


export const createReservation = async (reservationData) => {
    try {
    
        const dataToSend = {
            fechaInicio: reservationData.fecha_inicio || reservationData.fechaInicio,
            fechaFin: reservationData.fecha_fin || reservationData.fechaFin,
            habitacionId: reservationData.habitacion_id || reservationData.habitacionId,
            usuarioId: reservationData.usuario_id || reservationData.usuarioId
        };
        console.log('Enviando datos de reserva:', dataToSend);
        const response = await api.post(RESERVAS_ENDPOINT, dataToSend);
        console.log('Respuesta cruda del backend:', response);

        let data = response.data;

        // manejo de prefijo re de back
        if (typeof data === 'string' && data.startsWith('re')) {
            data = data.substring(2);
            try {
                data = JSON.parse(data);
                console.log('Datos parseados después de remover "re":', data);
            } catch (e) {
                console.error('Error parsing JSON after removing "re":', data);
                throw new Error('Invalid JSON response from server');
            }
        }

        console.log('Reserva creada exitosamente:', data);
        return data;
    } catch (error) {
        console.error("Error creating reservation:", error);
        const errorMessage = error.response?.data?.error || error.message || 'Error al crear la reserva.';
        throw new Error(errorMessage);
    }
};


export const updateReservation = async (id, reservationData) => {
    try {
        const response = await api.put(`${RESERVAS_ENDPOINT}/${id}`, reservationData);
        return response.data; 
    } catch (error) {
        console.error("Error updating reservation:", error);
        throw new Error('Error al actualizar la reserva.');
    }
};


export const cancelReservation = async (id) => {
    try {
        await api.delete(`${RESERVAS_ENDPOINT}/${id}`); 
        return { message: 'Reserva cancelada exitosamente.' };
    } catch (error) {
        console.error("Error cancelling reservation:", error);
        throw new Error('Error al cancelar la reserva.');
    }
};