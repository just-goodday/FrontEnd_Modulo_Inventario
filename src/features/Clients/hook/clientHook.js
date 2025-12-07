// 📁 hooks/useCustomers.js
import { useState, useCallback } from "react";
import {
    getCustomers,
    getSuppliers,
    createCustomer,
    createSupplier,
    updateCustomer
} from "../service/clientService";

export const useCustomers = () => {

    const [customers, setCustomers] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState("");

    // ============================================
    // ⭐ FETCH PRINCIPAL (recibe OBJETO DE FILTROS)
    // ============================================
    const fetchCustomers = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getCustomers({
                search: filters.search || "",
                per_page: filters.per_page || 10,
                page: filters.page || 1,
                tipo_documento: filters.tipo_documento || null,
                is_active: filters.is_active ?? null,
                registered_from: filters.registered_from || null,
                registered_to: filters.registered_to || null
            });

            const customersData = response.data || [];

            setCustomers(customersData);
            setPaginationData(response);

            setResult(`✅ ${customersData.length} clientes cargados`);

            return { success: true, data: response };

        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            setResult("❌ Error: " + msg);

            return { success: false, error: msg };

        } finally {
            setLoading(false);
        }
    }, []);


    // ============================================
    // ⭐ CREAR CLIENTE (NATURAL O JURÍDICO)
    // ============================================
    const addCustomer = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        setResult("");

        try {
            // 🔥 Creamos el cliente
            const response = await createCustomer(payload);

            setResult("✅ Cliente creado exitosamente");

            // 🔄 Volvemos a cargar la tabla (página 1)
            await fetchCustomers({
                search: "",
                per_page: paginationData?.per_page || 10,
                page: 1,
                tipo_documento: null,
                is_active: null,
                registered_from: null,
                registered_to: null
            });

            return { success: true, data: response.customer };

        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            setResult("❌ Error creando cliente: " + msg);

            return { success: false, error: msg };

        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, paginationData]);

    // ============================================
    // ⭐ EDITAR CLIENTE (NATURAL O JURÍDICO)
    // ============================================
    const editCustomer = useCallback(async (id, payload) => {
        setLoading(true);
        setError(null);
        setResult("");

        try {
            // 🔥 Actualizamos el cliente
            const response = await updateCustomer(id, payload);

            setResult("✅ Cliente actualizado exitosamente");

            // 🔄 Volvemos a cargar la tabla en la página actual
            await fetchCustomers({
                search: "",
                per_page: paginationData?.per_page || 10,
                page: paginationData?.current_page || 1,
                tipo_documento: null,
                is_active: null,
                registered_from: null,
                registered_to: null
            });

            return { success: true, data: response.customer };

        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            setResult("❌ Error actualizando cliente: " + msg);

            return { success: false, error: msg };

        } finally {
            setLoading(false);
        }
    }, [fetchCustomers, paginationData]);

    // ============================================
    // ⭐ CAMBIAR PÁGINA
    // ============================================
    const changePage = useCallback(async (page) => {
        if (!paginationData) return;

        return await fetchCustomers({
            ...paginationData.meta,
            page
        });
    }, [fetchCustomers, paginationData]);



    // ============================================
    // ⭐ UTILIDADES
    // ============================================
    const clearResult = useCallback(() => {
        setResult("");
        setError(null);
    }, []);

    const clearData = useCallback(() => {
        setCustomers([]);
        setPaginationData(null);
        setResult("");
        setError(null);
    }, []);



    // ============================================
    // ⭐ RETORNO
    // ============================================
    return {
        customers,
        paginationData,
        loading,
        error,
        result,

        fetchCustomers,
        addCustomer,
        editCustomer,
        changePage,

        clearResult,
        clearData
    };
};




export const useSuppliers = () => {

    const [suppliers, setSuppliers] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState("");

    // ============================================
    // ⭐ FETCH PRINCIPAL — recibe OBJETO DE FILTROS
    // ============================================
    const fetchSuppliers = useCallback(async (filters = {}) => {

        setLoading(true);
        setError(null);

        try {
            const response = await getSuppliers({
                search: filters.search || "",
                per_page: filters.per_page || 10,
                page: filters.page || 1,
                tipo_documento: filters.tipo_documento || null,
                is_active: filters.is_active ?? null,
                registered_from: filters.registered_from || null,
                registered_to: filters.registered_to || null
            });

            const suppliersData = response.data || [];

            setSuppliers(suppliersData);
            setPaginationData(response);

            setResult(`✅ ${suppliersData.length} proveedores cargados`);

            return { success: true, data: response };

        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            setResult("❌ Error: " + msg);

            return { success: false, error: msg };
        }

        finally {
            setLoading(false);
        }

    }, []);


    // ============================================
    // ⭐ CREAR PROVEEDOR (NATURAL O JURÍDICO)
    // ============================================
    const addSupplier = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        setResult("");

        try {
            // Crear proveedor
            const response = await createSupplier(payload);

            setResult("✅ Proveedor creado exitosamente");

            // Recargar tabla, volver a página 1
            await fetchSuppliers({
                search: "",
                per_page: paginationData?.per_page || 10,
                page: 1,
                tipo_documento: null,
                is_active: null,
                registered_from: null,
                registered_to: null
            });

            return { success: true, data: response.supplier };

        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            setResult("❌ Error creando proveedor: " + msg);

            return { success: false, error: msg };

        } finally {
            setLoading(false);
        }
    }, [fetchSuppliers, paginationData]);


    // ============================================
    // ⭐ CAMBIAR PÁGINA
    // ============================================
    const changePage = useCallback(async (page) => {
        if (!paginationData) return;

        return await fetchSuppliers({
            ...paginationData.meta,
            page
        });
    }, [fetchSuppliers, paginationData]);


    // ============================================
    // ⭐ UTILIDADES
    // ============================================
    const clearResult = useCallback(() => {
        setResult("");
        setError(null);
    }, []);

    const clearData = useCallback(() => {
        setSuppliers([]);
        setPaginationData(null);
        setResult("");
        setError(null);
    }, []);


    // ============================================
    // ⭐ RETORNO FINAL
    // ============================================
    return {
        suppliers,
        paginationData,
        loading,
        error,
        result,

        fetchSuppliers,
        addSupplier,   // 👈 NUEVO
        changePage,

        clearResult,
        clearData
    };
};

