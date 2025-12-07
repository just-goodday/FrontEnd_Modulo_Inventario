import { useState, useCallback } from "react";
import { 
    getProductInventory, 
    createProductInventory,
    getInventoryList,
    updateInventory,
    deleteInventory,
    getGlobalStatistics,
    getLowStockAlerts,
    getOutOfStockAlerts
} from "../services/inventoryService";

export const useInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);
    
    // ✅ Estado de paginación
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0
    });

    // ✅ Obtener lista completa de inventario
    const fetchInventoryList = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching inventory with filters:', filters);
            
            const response = await getInventoryList(filters);
            
            console.log('✅ Inventory response:', response);
            
            if (response.success) {
                setInventory(response.data || []);
                
                // ✅ Actualizar paginación desde el backend
                if (response.meta) {
                    setPagination({
                        current: response.meta.current_page || 1,
                        pageSize: response.meta.per_page || 15,
                        total: response.meta.total || 0
                    });
                    console.log('📊 Pagination updated:', {
                        current: response.meta.current_page,
                        pageSize: response.meta.per_page,
                        total: response.meta.total
                    });
                }
                
                return response.data;
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching inventory list:', err);
            setError(err.message);
            setInventory([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Obtener inventario de un producto específico
    const fetchProductInventory = useCallback(async (productId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProductInventory(productId);
            
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('Error fetching product inventory:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Crear nuevo inventario
    const createInventory = useCallback(async (inventoryData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📦 Creating inventory:', inventoryData);
            
            const response = await createProductInventory(inventoryData);
            
            console.log('✅ Inventory created:', response);
            
            return response;
        } catch (err) {
            console.error('❌ Error creating inventory:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Actualizar inventario
    const updateInventoryItem = useCallback(async (productId, warehouseId, inventoryData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateInventory(productId, warehouseId, inventoryData);
            
            return response;
        } catch (err) {
            console.error('Error updating inventory:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Eliminar inventario
    const deleteInventoryItem = useCallback(async (productId, warehouseId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deleteInventory(productId, warehouseId);
            
            return response;
        } catch (err) {
            console.error('Error deleting inventory:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Obtener estadísticas globales
    const fetchStatistics = useCallback(async () => {
        try {
            console.log('📊 Fetching statistics...');
            
            const response = await getGlobalStatistics();
            
            console.log('✅ Statistics response:', response);
            
            if (response.success && response.data) {
                setStatistics(response.data);
                return response.data;
            }
        } catch (err) {
            console.error('❌ Error fetching statistics:', err);
            throw err;
        }
    }, []);

    // ✅ Obtener alertas de stock bajo
    const fetchLowStockAlerts = useCallback(async () => {
        try {
            const response = await getLowStockAlerts();
            return response;
        } catch (err) {
            console.error('Error fetching low stock alerts:', err);
            throw err;
        }
    }, []);

    // ✅ Obtener alertas de stock agotado
    const fetchOutOfStockAlerts = useCallback(async () => {
        try {
            const response = await getOutOfStockAlerts();
            return response;
        } catch (err) {
            console.error('Error fetching out of stock alerts:', err);
            throw err;
        }
    }, []);

    return { 
        inventory,
        statistics,
        loading,
        error,
        pagination, // ✅ Ahora sí está definido
        fetchInventoryList,
        fetchProductInventory,
        createInventory,
        updateInventoryItem,
        deleteInventoryItem,
        fetchStatistics,
        fetchLowStockAlerts,
        fetchOutOfStockAlerts
    };
};