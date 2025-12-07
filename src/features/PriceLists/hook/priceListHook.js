import { useState, useCallback, useEffect } from "react";
import {
    getPriceLists,
    getActivePriceLists,
    getPriceListById,
    createPriceList,
    updatePriceList,
    deletePriceList,
    togglePriceListStatus,
    getPriceListStatistics,
    getPriceListProducts
} from "../services/priceListService";

export const usePriceLists = () => {
    const [priceLists, setPriceLists] = useState([]);
    const [activePriceLists, setActivePriceLists] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [selectedPriceList, setSelectedPriceList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statistics, setStatistics] = useState(null);

    // 1. Obtener todas las listas de precios con paginación
    const fetchPriceLists = useCallback(async (search = '', perPage = 15, page = 1, isActive = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPriceLists(search, perPage, page, isActive);

            if (response.success) {
                setPriceLists(response.data || []);
                setPaginationData(response.meta || null);
                return { success: true, data: response };
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching price lists:', err);
            const errorMessage = err.message || 'Error al obtener listas de precios';
            setError(errorMessage);
            setPriceLists([]);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Obtener solo listas activas (para selects)
    const fetchActivePriceLists = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getActivePriceLists();
            
            if (response.success && response.data) {
                setActivePriceLists(response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching active price lists:', err);
            const errorMessage = err.message || 'Error al obtener listas activas';
            setError(errorMessage);
            setActivePriceLists([]);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Obtener una lista específica por ID
    const fetchPriceListById = useCallback(async (priceListId) => {
        if (!priceListId) {
            const errorMsg = 'ID de lista de precios requerido';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getPriceListById(priceListId);
            
            if (response.success && response.data) {
                setSelectedPriceList(response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching price list by ID:', err);
            const errorMessage = err.message || 'Error al obtener lista de precios';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 4. Crear nueva lista de precios
    const createPriceListAction = useCallback(async (priceListData) => {
        if (!priceListData.name?.trim() || !priceListData.code?.trim()) {
            const errorMsg = 'Nombre y código son obligatorios';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await createPriceList(priceListData);

            if (response.success) {
                // Recargar listas
                await fetchPriceLists();
                await fetchActivePriceLists();

                return {
                    success: true,
                    data: response.data,
                    id: response.data?.id
                };
            } else {
                throw new Error('Error al crear lista de precios');
            }
        } catch (err) {
            console.error('❌ Error creating price list:', err);
            const errorMessage = err.message || 'Error al crear lista de precios';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchPriceLists, fetchActivePriceLists]);

    // 5. Actualizar lista de precios
    const updatePriceListAction = useCallback(async (priceListId, updateData) => {
        if (!priceListId) {
            const errorMsg = 'ID de lista de precios requerido';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await updatePriceList(priceListId, updateData);

            if (response.success) {
                // Recargar listas
                await fetchPriceLists();
                await fetchActivePriceLists();

                return {
                    success: true,
                    data: response.data,
                    id: priceListId
                };
            } else {
                throw new Error('Error al actualizar lista de precios');
            }
        } catch (err) {
            console.error('❌ Error updating price list:', err);
            const errorMessage = err.message || 'Error al actualizar lista de precios';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchPriceLists, fetchActivePriceLists]);

    // 6. Eliminar lista de precios
    const deletePriceListAction = useCallback(async (priceListId) => {
        if (!priceListId) {
            const errorMsg = 'ID de lista de precios requerido';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await deletePriceList(priceListId);

            if (response.success) {
                // Recargar listas
                await fetchPriceLists();
                await fetchActivePriceLists();

                return { success: true };
            } else {
                throw new Error('Error al eliminar lista de precios');
            }
        } catch (err) {
            console.error('❌ Error deleting price list:', err);
            const errorMessage = err.message || 'Error al eliminar lista de precios';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchPriceLists, fetchActivePriceLists]);

    // 7. Activar/Desactivar lista de precios
    const toggleStatusAction = useCallback(async (priceListId) => {
        if (!priceListId) {
            const errorMsg = 'ID de lista de precios requerido';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await togglePriceListStatus(priceListId);

            if (response.success) {
                // Recargar listas
                await fetchPriceLists();
                await fetchActivePriceLists();

                return { success: true, data: response.data };
            } else {
                throw new Error('Error al cambiar estado');
            }
        } catch (err) {
            console.error('❌ Error toggling status:', err);
            const errorMessage = err.message || 'Error al cambiar estado';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchPriceLists, fetchActivePriceLists]);

    // 8. Obtener estadísticas
    const fetchStatistics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPriceListStatistics();
            
            if (response.success && response.data) {
                setStatistics(response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching statistics:', err);
            const errorMessage = err.message || 'Error al obtener estadísticas';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 9. Obtener productos de una lista
    const fetchProducts = useCallback(async (priceListId, perPage = 15, page = 1) => {
        if (!priceListId) {
            const errorMsg = 'ID de lista de precios requerido';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getPriceListProducts(priceListId, perPage, page);
            
            if (response.success) {
                return { success: true, data: response };
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (err) {
            console.error('❌ Error fetching products:', err);
            const errorMessage = err.message || 'Error al obtener productos';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 10. Cargar listas activas automáticamente al montar
    useEffect(() => {
        fetchActivePriceLists();
    }, [fetchActivePriceLists]);

    // 11. Limpiar estados
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearSelectedPriceList = useCallback(() => {
        setSelectedPriceList(null);
    }, []);

    return {
        // Estados
        priceLists,
        activePriceLists,
        paginationData,
        selectedPriceList,
        loading,
        error,
        statistics,

        // Acciones
        fetchPriceLists,
        fetchActivePriceLists,
        fetchPriceListById,
        createPriceList: createPriceListAction,
        updatePriceList: updatePriceListAction,
        deletePriceList: deletePriceListAction,
        toggleStatus: toggleStatusAction,
        fetchStatistics,
        fetchProducts,

        // Limpiar
        clearError,
        clearSelectedPriceList
    };
};