import { get } from '../../../services/MethodGeneral';

export const getWarehouses = async () => {
    try {
        const response = await get('warehouses');
        // ✅ Retornar directamente la respuesta de axios
        return response.data;
    } catch (error) {
        console.error('❌ Error en getWarehouses:', error);
        throw error;
    }
};