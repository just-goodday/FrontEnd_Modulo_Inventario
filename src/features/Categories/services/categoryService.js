/* eslint-disable no-useless-catch */
import {get, post, patch, del } from '../../../services/MethodGeneral';

/**
 * Obtener categorías con filtros
 * @param {string} search - Término de búsqueda
 * @param {number} perPage - Cantidad por página
 * @param {number} page - Número de página
 * @param {object} filters - Filtros adicionales: { level, is_active, parent_id }
 */
export const getCategories = async (search = '', perPage = 10, page = 1, filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        // Parámetros básicos
        if (search) params.append('search', search);
        if (perPage) params.append('per_page', perPage);
        if (page) params.append('page', page);

        // 🔥 FILTROS ADICIONALES
        if (filters.level !== undefined && filters.level !== null) {
            params.append('level', filters.level);
        }
        
        if (filters.is_active !== undefined && filters.is_active !== null) {
            params.append('is_active', filters.is_active);
        }
        
        if (filters.parent_id !== undefined) {
            // Si parent_id es null, enviamos 'null' como string o simplemente 0
            params.append('parent_id', filters.parent_id === null ? '0' : filters.parent_id);
        }

        console.log('🔍 Filtros enviados al backend:', {
            search,
            perPage,
            page,
            filters,
            url: `/categories?${params.toString()}`
        });

        const response = await get(`/categories?${params}`);

        // Normalizar respuesta
        let data = [];
        if (response.data) {
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (Array.isArray(response.data.data)) {
                data = response.data.data;
            } else if (Array.isArray(response.data.items)) {
                data = response.data.items;
            }
        }

        return {
            data,
            meta: {
                total: response.data?.pagination?.total ?? data.length ?? 0,
                current_page: response.data?.pagination?.current_page ?? page,
                per_page: response.data?.pagination?.per_page ?? perPage,
                last_page: response.data?.pagination?.last_page ?? 1
            }
        };
    } catch (error) {
        console.error('❌ Error en getCategories:', error);
        throw error;
    }
};

export const getCategoryById = async (categoryId) => {
    try {
        const response = await get(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener árbol de categorías
 * @param {boolean} onlyActive - Si es true, solo devuelve categorías activas
 */
export const getCategoryTree = async (onlyActive = true) => {
    try {
        const params = new URLSearchParams();
        if (onlyActive) {
            params.append('only_active', '1');
        }
        
        const url = params.toString() ? `/categories/tree?${params}` : '/categories/tree';
        const response = await get(url);
        
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await post('/categories', categoryData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateCategory = async (categoryId, updateData) => {
    try {
        const response = await patch(`/categories/${categoryId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const response = await del(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};