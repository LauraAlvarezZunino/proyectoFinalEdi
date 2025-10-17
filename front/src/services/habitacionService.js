import api from '../services/api';

const ROOMS_ENDPOINT = '/habitaciones';

// --- Lógica de Transformación (Interna del servicio) ---

// Auxiliar para calcular la capacidad basada en el tipo (ENUM)
const getCapacidad = (tipo) => {
    switch (tipo ? tipo.toLowerCase() : '') {
        case 'simple': return 1;
        case 'doble': return 2;
        case 'familiar': return 4;
        default: return 2;
    }
};

// Normaliza y completa los datos de la habitación (propiedades consistentes)
const transformRoomData = (room) => {
    const tipoCapitalizado = room.tipo ? room.tipo.charAt(0).toUpperCase() + room.tipo.slice(1) : 'Genérica';

    return {
        id: room.id,
        numero: String(room.numero || ''),
        tipo: tipoCapitalizado,
        estado: room.estado || 'Disponible',
        
        // Propiedades estandarizadas:
        capacidad: getCapacidad(room.tipo),
        nombre: `${tipoCapitalizado} (Hab. ${room.numero})`, 
        precioNoche: parseFloat(room.precio || 0),
        descripcion: room.descripcion || 'Detalle de la habitación no disponible.',
    };
};


// --- Funciones de Llamada a la API ---

/** Obtiene todas las habitaciones. (Usado por ListadoHabitaciones.js y Habitaciones.js) */
export const fetchRooms = async () => {
    try {
        const response = await api.get(ROOMS_ENDPOINT);
        let roomsData = response.data;

        // Manejo de respuesta string incorrecta del backend (manteniendo el parche temporal)
        if (typeof roomsData === 'string' && roomsData.startsWith('{')) {
             try {
                 roomsData = JSON.parse(roomsData.replace(/^re/, ''));
             } catch(e) {
                 console.warn("Backend returned invalid string, attempting cleanup failed.");
             }
        }
        
        if (!Array.isArray(roomsData)) return []; 

        return roomsData.map(transformRoomData);
    } catch (error) {
        console.error("Error fetching rooms:", error.response || error);
        throw new Error('Error al cargar la lista de habitaciones.');
    }
};

/** Obtiene el detalle de una sola habitación. (Usado por DetalleHabitacion.js) */
export const fetchRoomDetail = async (id) => {
    try {
        const response = await api.get(`${ROOMS_ENDPOINT}/${id}`);
        // El detalle también se transforma para asegurar consistencia
        return transformRoomData(response.data); 
    } catch (error) {
        console.error("Error fetching room detail:", error.response || error);
        throw new Error('Error al cargar el detalle de la habitación.');
    }
};


/** Guarda o actualiza una habitación. (Usado por Habitaciones.js) */
export const saveRoom = async (roomData, isEdit) => {
    const dataToSend = {
        // Enviar al backend los datos en el formato que espera (ej: tipo en minúsculas)
        numero: roomData.numero,
        tipo: roomData.tipo.toLowerCase(), 
        precio: roomData.precioNoche, // Usamos 'precioNoche' ya estandarizado
        estado: roomData.estado,
        // Si hay otros campos (descripción, etc.) deben incluirse aquí
        descripcion: roomData.descripcion || '',
    };
    
    try {
        if (isEdit) {
            await api.put(`${ROOMS_ENDPOINT}/${roomData.id}`, dataToSend);
        } else {
            const response = await api.post(ROOMS_ENDPOINT, dataToSend);
            return transformRoomData(response.data); 
        }
    } catch (error) {
        console.error("Error saving room:", error.response || error);
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'agregar'} la habitación.`);
    }
};

/** Elimina una habitación. (Usado por Habitaciones.js) */
export const deleteRoom = async (roomId) => {
    try {
        await api.delete(`${ROOMS_ENDPOINT}/${roomId}`);
    } catch (error) {
        console.error("Error deleting room:", error.response || error);
        throw new Error('Error al eliminar la habitación.');
    }
};