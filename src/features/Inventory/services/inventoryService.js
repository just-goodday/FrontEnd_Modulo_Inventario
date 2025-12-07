import { get, post, put, del } from '../../../services/MethodGeneral'

// Obtener inventario de un producto específico
export const getProductInventory = async(productId) => {
    try {
        const response = await get(`products/${productId}/inventory`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product inventory:', error);
        throw error;
    }
}

// Crear nuevo inventario
export const createProductInventory = async (inventoryData) => {
    try {
        console.log('📤 Enviando inventory data:', inventoryData);
        const response = await post('inventory', inventoryData);
        console.log('✅ Respuesta del inventory:', response);
        return response.data;
    } catch (error) {
        console.error('❌ Error creating product inventory:', error);
        throw error;
    }
}


// Obtener lista completa de inventario con filtros
export const getInventoryList = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Solo agregar parámetros que tengan valor
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                queryParams.append(key, filters[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const url = `inventory${queryString ? `?${queryString}` : ''}`;
        
        console.log('🌐 API Call:', url);
        
        const response = await get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory list:', error);
        throw error;
    }
}

// Actualizar inventario específico
export const updateInventory = async (productId, warehouseId, inventoryData) => {
    try {
        const response = await put(`inventory/${productId}/${warehouseId}`, inventoryData);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
    }
}

// Eliminar inventario
export const deleteInventory = async (productId, warehouseId) => {
    try {
        const response = await del(`inventory/${productId}/${warehouseId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting inventory:', error);
        throw error;
    }
}

// Obtener estadísticas globales
export const getGlobalStatistics = async () => {
    try {
        const response = await get('inventory/statistics/global');
        return response.data;
    } catch (error) {
        console.error('Error fetching global statistics:', error);
        throw error;
    }
}

// Obtener alertas de stock bajo
export const getLowStockAlerts = async () => {
    try {
        const response = await get('inventory/alerts/low-stock');
        return response.data;
    } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        throw error;
    }
}

// Obtener alertas de productos agotados
export const getOutOfStockAlerts = async () => {
    try {
        const response = await get('inventory/alerts/out-of-stock');
        return response.data;
    } catch (error) {
        console.error('Error fetching out of stock alerts:', error);
        throw error;
    }
}

// Asignación masiva de inventario
export const bulkAssignInventory = async (bulkData) => {
    try {
        const response = await post('inventory/bulk-assign', bulkData);
        return response.data;
    } catch (error) {
        console.error('Error in bulk assign:', error);
        throw error;
    }
}