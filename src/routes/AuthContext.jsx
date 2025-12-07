import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar y validar token al cargar la app
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                return;
            }

            // Validar token con el backend
            const { isValid, user: userData } = await authService.validateToken();

            if (isValid && userData) {
                // Token válido - mantener sesión
                setIsAuthenticated(true);
                setUser(userData);
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                // Token inválido - limpiar sesión
                console.warn('Token inválido o expirado');
                authService.logout();
                setIsAuthenticated(false);
                setUser(null);
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Función de login
    const login = async (credentials) => {
        try {
            setLoading(true);

            const response = await authService.login(credentials);
            const { token, user: userData } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));
            
            setIsAuthenticated(true);
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error de conexión';
            console.error('Error en login:', error);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Función de logout
    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    // Funciones de permisos
    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
    };

    const hasAnyPermission = (permissions) => {
        if (!user || !user.permissions) return false;
        return permissions.some(permission => user.permissions.includes(permission));
    };

    const hasAllPermissions = (permissions) => {
        if (!user || !user.permissions) return false;
        return permissions.every(permission => user.permissions.includes(permission));
    };

    const value = {
        isAuthenticated,
        user,
        login,
        logout,
        loading,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};