// services/priceListService.js

import { get, post, put, del, patch } from '../../../services/MethodGeneral';

/**
 * Obtener todas las listas de precios con paginación
 */
export const getPriceLists = async (search = '', perPage = 15, page = 1, isActive = null) => {
    try {
        const params = {
            per_page: perPage,
            page,
            ...(search && { search }),
            ...(isActive !== null && { is_active: isActive }),
        };

        const response = await get('price-lists', params);
        return response.data;
    } catch (error) {
        console.error('❌ Error en getPriceLists:', error);
        throw error;
    }
};

/**
 * Obtener solo listas de precios activas (para selects)
 */
export const getActivePriceLists = async () => {
    try {
        const response = await get('price-lists/active');
        return response.data;
    } catch (error) {
        console.error('❌ Error en getActivePriceLists:', error);
        throw error;
    }
};

/**
 * Obtener una lista de precios por ID
 */
export const getPriceListById = async (priceListId) => {
    try {
        const response = await get(`price-lists/${priceListId}`);
        return response.data;
    } catch (error) {
        console.error('❌ Error en getPriceListById:', error);
        throw error;
    }
};

/**
 * Crear una nueva lista de precios
 */
export const createPriceList = async (priceListData) => {
    try {
        const response = await post('price-lists', priceListData);
        return response.data;
    } catch (error) {
        console.error('❌ Error en createPriceList:', error);
        throw error;
    }
};

/**
 * Actualizar una lista de precios
 */
export const updatePriceList = async (priceListId, updateData) => {
    try {
        const response = await put(`price-lists/${priceListId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('❌ Error en updatePriceList:', error);
        throw error;
    }
};

/**
 * Eliminar una lista de precios
 */
export const deletePriceList = async (priceListId) => {
    try {
        const response = await del(`price-lists/${priceListId}`);
        return response.data;
    } catch (error) {
        console.error('❌ Error en deletePriceList:', error);
        throw error;
    }
};

/**
 * Activar/Desactivar lista de precios
 */
export const togglePriceListStatus = async (priceListId) => {
    try {
        const response = await patch(`price-lists/${priceListId}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error('❌ Error en togglePriceListStatus:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas de listas de precios
 */
export const getPriceListStatistics = async () => {
    try {
        const response = await get('price-lists/statistics');
        return response.data;
    } catch (error) {
        console.error('❌ Error en getPriceListStatistics:', error);
        throw error;
    }
};

/**
 * Obtener productos de una lista específica
 */
export const getPriceListProducts = async (priceListId, perPage = 15, page = 1) => {
    try {
        const params = {
            per_page: perPage,
            page,
        };

        const response = await get(`price-lists/${priceListId}/products`, params);
        return response.data;
    } catch (error) {
        console.error('❌ Error en getPriceListProducts:', error);
        throw error;
    }
};