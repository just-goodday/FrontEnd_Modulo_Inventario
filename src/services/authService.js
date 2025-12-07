import { post, get } from './MethodGeneral';

export const authService = {
    login: (credentials) => post('/login', credentials),
    
    // Validar token y obtener usuario actual
    validateToken: async () => {
        try {
            const response = await get('/user');
            return { 
                isValid: true, 
                user: response.data.user,
                entity: response.data.entity,
                addresses: response.data.addresses
            };
        } catch (error) {
            console.error('Error validando token:', error);
            return { isValid: false, user: null };
        }
    },
    
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    },
};