import { useState, useCallback, useRef } from "react";
import {
    getCategories,
    getCategoryById,
    getCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory
} from "../services/categoryService";

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryTree, setCategoryTree] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState("");

    // Guardar últimos filtros para re-fetch
    const lastQueryRef = useRef({
        search: "",
        perPage: 10,
        page: 1,
        filters: {}
    });

    /**
     * 🔥 Fetch con soporte completo de filtros
     */
    const fetchCategories = useCallback(async (
        search = "",
        perPage = 10,
        page = 1,
        filters = {}
    ) => {
        setLoading(true);
        setError(null);

        // Guardar para re-fetch posterior
        lastQueryRef.current = { search, perPage, page, filters };

        console.log('📦 fetchCategories llamado con:', { search, perPage, page, filters });

        try {
            const response = await getCategories(search, perPage, page, filters);
            const data = response?.data ?? response?.items ?? [];
            const meta = response?.meta ?? response?.pagination ?? null;

            setCategories(Array.isArray(data) ? data : []);
            setPagination(meta);
            setResult(`✅ ${Array.isArray(data) ? data.length : 0} categorías cargadas`);

            console.log('✅ Categorías cargadas:', data);

            return { success: true, data: response };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error: " + errorMessage);
            console.error('❌ Error en fetchCategories:', err);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategoryById = useCallback(async (categoryId) => {
        if (!categoryId) {
            const msg = "❌ Ingresa un ID de categoría";
            setError(msg);
            setResult(msg);
            return { success: false, error: msg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getCategoryById(categoryId);
            const data = response?.data ?? response;
            setSelectedCategory(data || null);
            setResult("✅ Categoría obtenida correctamente");
            return { success: true, data };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error obteniendo categoría: " + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * 🔥 Fetch árbol con opción de solo activas
     */
    const fetchCategoryTree = useCallback(async (onlyActive = true) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCategoryTree(onlyActive);
            const data = response?.data ?? response;
            setCategoryTree(data || null);
            setResult("✅ Árbol de categorías obtenido correctamente");
            console.log('🌳 Árbol cargado:', data);
            return { success: true, data };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error obteniendo árbol de categorías: " + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategoryAction = useCallback(async (categoryData) => {
        if (!categoryData?.name?.trim()) {
            const msg = "❌ El nombre es obligatorio";
            setError(msg);
            setResult(msg);
            return { success: false, error: msg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await createCategory(categoryData);
            setResult("✅ Categoría creada correctamente");

            // Re-fetch con los últimos filtros
            const { search, perPage, page, filters } = lastQueryRef.current;
            await fetchCategories(search, perPage, page, filters);

            // Re-cargar árbol
            await fetchCategoryTree(true);

            return { success: true, data: response?.data ?? response };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error creando categoría: " + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories, fetchCategoryTree]);

    const updateCategoryAction = useCallback(async (categoryId, updateData) => {
        if (!categoryId) {
            const msg = "❌ Ingresa un ID para actualizar";
            setError(msg);
            setResult(msg);
            return { success: false, error: msg };
        }

        // 🔥 NUEVO: Log de datos enviados
        console.log('🔄 Actualizando categoría:', {
            id: categoryId,
            fieldsChanged: Object.keys(updateData),
            data: updateData
        });

        setLoading(true);
        setError(null);
        try {
            const response = await updateCategory(categoryId, updateData);
            setResult("✅ Categoría actualizada correctamente");

            const { search, perPage, page, filters } = lastQueryRef.current;
            await fetchCategories(search, perPage, page, filters);
            await fetchCategoryTree(true);

            if (selectedCategory?.id === categoryId) {
                const refreshed = await getCategoryById(categoryId);
                setSelectedCategory(refreshed?.data ?? refreshed ?? null);
            }

            return { success: true, data: response?.data ?? response };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error actualizando categoría: " + errorMessage);
            console.error('❌ Error al actualizar:', err);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories, fetchCategoryTree, selectedCategory?.id]);
    const deleteCategoryAction = useCallback(async (categoryId) => {
        if (!categoryId) {
            const msg = "❌ Ingresa un ID para eliminar";
            setError(msg);
            setResult(msg);
            return { success: false, error: msg };
        }

        setLoading(true);
        setError(null);
        try {
            await deleteCategory(categoryId);
            setResult("✅ Categoría eliminada correctamente");

            // Re-fetch con los últimos filtros
            const { search, perPage, page, filters } = lastQueryRef.current;
            await fetchCategories(search, perPage, page, filters);

            // Re-cargar árbol
            await fetchCategoryTree(true);

            if (selectedCategory?.id === categoryId) setSelectedCategory(null);

            return { success: true };
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err.message;
            setError(errorMessage);
            setResult("❌ Error eliminando categoría: " + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchCategories, fetchCategoryTree, selectedCategory?.id]);

    return {
        // Estados
        categories,
        pagination,
        selectedCategory,
        categoryTree,
        loading,
        error,
        result,

        // Acciones
        fetchCategories,
        fetchCategoryById,
        fetchCategoryTree,
        createCategory: createCategoryAction,
        updateCategory: updateCategoryAction,
        deleteCategory: deleteCategoryAction,
        setSelectedCategory,
    };
};