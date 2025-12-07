// hooks/useApiErrorToast.js
import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Hook para escuchar errores globales de API y mostrarlos como toasts
 * Este hook debe usarse en el componente raíz de la aplicación
 */
export const useApiErrorToast = () => {
    const { error: showError } = useToast();

    useEffect(() => {
        const handleApiError = (event) => {
            const errorData = event.detail;
            
            // No mostrar toast para errores 401 (ya redirige a login automáticamente)
            if (errorData.type === 'auth') {
                return;
            }
            
            // Mostrar el error como toast
            showError(errorData.message);
        };

        // Escuchar el evento personalizado que dispara axios
        window.addEventListener('api-error', handleApiError);

        return () => {
            window.removeEventListener('api-error', handleApiError);
        };
    }, [showError]);
};

export default useApiErrorToast;