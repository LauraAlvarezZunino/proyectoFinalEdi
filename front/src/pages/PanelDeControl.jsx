import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const PanelDeControl = () => {
    const { isAdmin } = useAuth();

    // Redirigir al dashboard correspondiente según el rol
    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default PanelDeControl;