import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../routes/AuthContext';
import ThreeCirclesLoading from '../components/Loading/CustomLoading';
import { getDefaultRoute } from '../config/routeConfig'; // ✅ Importar al inicio

const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
    const { isAuthenticated, loading, hasPermission, hasRole, user } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras verifica autenticación
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <ThreeCirclesLoading />
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ✅ Validación de permisos - Redirigir a ruta accesible
    if (requiredPermission && !hasPermission(requiredPermission)) {
        const defaultRoute = getDefaultRoute(user?.permissions || []);
        return <Navigate to={defaultRoute} replace />;
    }

    // ✅ Validación de roles
    if (requiredRole && !hasRole(requiredRole)) {
        const defaultRoute = getDefaultRoute(user?.permissions || []);
        return <Navigate to={defaultRoute} replace />;
    }

    return children;
};

export default ProtectedRoute;