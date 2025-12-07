import axios from 'axios';

// ✅ Usa la variable de entorno según el ambiente
const BaseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000/api/';

const instance = axios.create({
    baseURL: BaseURL,
});

// Interceptor para agregar token
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Interceptor mejorado para manejar errores
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Error de red (sin respuesta del servidor)
        if (!error.response) {
            const networkError = {
                message: 'Error de conexión. Verifica tu internet.',
                type: 'network',
                originalError: error
            };
            
            // Solo disparar evento si no se ha configurado silencioso
            if (!error.config?.skipGlobalError) {
                window.dispatchEvent(new CustomEvent('api-error', {
                    detail: networkError
                }));
            }
            
            return Promise.reject(networkError);
        }

        // Error 401 - Token expirado/inválido
        if (error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            
            return Promise.reject({
                message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                type: 'auth',
                status: 401
            });
        }

        // Error 422 - Validación
        if (error.response.status === 422) {
            const validationErrors = error.response.data.errors || {};
            const firstError = Object.values(validationErrors)[0]?.[0] || 
                             error.response.data.message || 
                             'Error de validación';
            
            return Promise.reject({
                message: firstError,
                type: 'validation',
                status: 422,
                errors: validationErrors,
                originalError: error
            });
        }

        // Error 500 - Error del servidor
        if (error.response.status === 500) {
            return Promise.reject({
                message: 'Error interno del servidor. Intenta nuevamente.',
                type: 'server',
                status: 500,
                originalError: error
            });
        }

        // Otros errores
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Ocurrió un error inesperado';
        
        return Promise.reject({
            message: errorMessage,
            type: 'general',
            status: error.response.status,
            originalError: error
        });
    }
);

export default instance;