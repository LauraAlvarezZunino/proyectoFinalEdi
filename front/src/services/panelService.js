// src/services/dashboardService.js

import api from '../services/api';

// Mapeo de colores/iconos para que el servicio pueda devolver el objeto completo
const baseStatTemplate = {
    totalRooms: { title: 'Habitaciones Totales', icon: 'HotelIcon', color: '#90caf9' },
    activeReservations: { title: 'Reservas Activas', icon: 'EventNoteIcon', color: '#f48fb1' },
    registeredUsers: { title: 'Usuarios Registrados', icon: 'PeopleIcon', color: '#81c784' },
    notifications: { title: 'Notificaciones', icon: 'NotificationsIcon', color: '#ffb74d' },
    myReservations: { title: 'Mis Reservas', icon: 'EventNoteIcon', color: '#f48fb1' },
};

/**
 * Función central para obtener todas las estadísticas requeridas.
 * La respuesta del backend debe ser: { totalRooms: N, activeReservations: M, ... }
 */
export const fetchDashboardStats = async (userId, isAdmin) => {
    try {
        let response;

        if (isAdmin) {
            // ⚠️ Recomendación: Crear un endpoint único para el dashboard de Admin
            const endpoint = '/dashboard/admin';
            response = await api.get(endpoint);

            let adminData = response.data;

            // Handle the "re" prefix issue from backend
            if (typeof adminData === 'string' && adminData.startsWith('re')) {
                adminData = adminData.substring(2);
                try {
                    adminData = JSON.parse(adminData);
                } catch (e) {
                    console.error('Error parsing JSON after removing "re":', adminData);
                    throw new Error('Invalid JSON response from server');
                }
            }

            // Ejemplo de la data que esperas del backend:
            // { habitaciones: 50, reservasActivas: 15, usuarios: 200, notificaciones: 5 }
            
            // Mapeamos y formateamos para el componente
            return [
                { ...baseStatTemplate.totalRooms, value: String(adminData.habitaciones || 0) },
                { ...baseStatTemplate.activeReservations, value: String(adminData.reservasActivas || 0) },
                { ...baseStatTemplate.registeredUsers, value: String(adminData.usuarios || 0) },
                { ...baseStatTemplate.notifications, value: String(adminData.notificaciones || 0) },
            ];

        } else {
            // ⚠️ Recomendación: Crear un endpoint único para el dashboard de Usuario
            const endpoint = `/dashboard/user/${userId}`;
            response = await api.get(endpoint);

            let userData = response.data;

            // Handle the "re" prefix issue from backend
            if (typeof userData === 'string' && userData.startsWith('re')) {
                userData = userData.substring(2);
                try {
                    userData = JSON.parse(userData);
                } catch (e) {
                    console.error('Error parsing JSON after removing "re":', userData);
                    throw new Error('Invalid JSON response from server');
                }
            }

            // Ejemplo de la data que esperas del backend:
            // { misReservas: 3, activas: 1 }

            // Mapeamos y formateamos para el componente
            return [
                { ...baseStatTemplate.myReservations, value: String(userData.misReservas || 0) },
                { ...baseStatTemplate.activeReservations, value: String(userData.activas || 0) },
            ];
        }

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Devolvemos un error, y el componente usará un fallback general o solo mostrará '0'
        throw new Error('No se pudieron cargar las estadísticas del panel.');
    }
};

// NOTA: Si no tienes endpoints únicos, tendrías que hacer múltiples llamadas 
// (ej: api.get('/habitaciones'), api.get('/reservas/activas'), etc.) 
// y combinar la data aquí, antes de devolverla.