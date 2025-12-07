import { get, post, patch, del } from '../../../services/MethodGeneral';

// ==============================================
// ⭐ GET CUSTOMERS
// ==============================================

export const getCustomers = async ({
    search = '',
    per_page = 10,
    page = 1,
    tipo_documento = null,
    is_active = null,
    registered_from = null,
    registered_to = null
}) => {

    try {
        const params = new URLSearchParams();

        // Tipo fijo: customer
        params.append("type", "customer");

        // --- Filtros dinámicos ---
        if (search && search.trim()) params.append("search", search.trim());
        if (per_page) params.append("per_page", per_page);
        if (page) params.append("page", page);

        if (tipo_documento) params.append("tipo_documento", tipo_documento);

        if (is_active !== null && is_active !== "")
            params.append("is_active", is_active);

        // ⭐ Nuevo: filtro por fechas
        if (registered_from) params.append("registered_from", registered_from);
        if (registered_to) params.append("registered_to", registered_to);

        // Llamada API
        const response = await get(`/entities?${params.toString()}`);

        // --- Normalización ---
        let data = [];
        let meta = {};

        if (response.data) {
            if (Array.isArray(response.data.data)) {
                data = response.data.data;
                meta = response.data.meta || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }
        }

        return {
            data,
            total: meta.total || data.length || 0,
            current_page: meta.current_page || page,
            per_page: meta.per_page || per_page,
            last_page: meta.last_page || 1,
            from: meta.from || 0,
            to: meta.to || 0,
            meta,
            links: response.data?.links || {}
        };

    } catch (error) {
        console.error("❌ Error en getCustomers:", error);
        throw error;
    }
};

// =======================
// 📌 CREAR CLIENTE (natural o jurídico)
// =======================
export const createCustomer = async (payload) => {
    try {
        // Forzamos siempre type = 'customer' desde el servicio
        const body = {
            type: 'customer',
            ...payload
        };

        const response = await post('/entities', body);

        // La API te devuelve: { message, data: { ...cliente } }
        const { message, data } = response.data || {};

        return {
            message: message || 'Cliente creado exitosamente',
            customer: data || null
        };
    } catch (error) {
        console.error('❌ Error en createCustomer:', error);
        throw error;
    }
};

// =======================
// 📌 EDITAR CLIENTE (natural o jurídico)
// =======================
export const updateCustomer = async (id, payload) => {
    try {
        // Forzamos siempre type = 'customer'
        const body = {
            type: 'customer',
            ...payload
        };

        const response = await patch(`/entities/${id}`, body);

        const { message, data } = response.data || {};

        return {
            message: message || "Cliente actualizado correctamente",
            customer: data || null
        };

    } catch (error) {
        console.error("❌ Error en updateCustomer:", error);
        throw error;
    }
};

// ==============================================
// ⭐ GET SUPPLIERS
// ==============================================

export const getSuppliers = async ({
    search = '',
    per_page = 10,
    page = 1,
    tipo_documento = null,
    is_active = null,
    registered_from = null,
    registered_to = null
}) => {
    try {
        const params = new URLSearchParams();

        // Tipo fijo: supplier
        params.append('type', 'supplier');

        // --- Filtros dinámicos ---
        if (search && search.trim()) {
            params.append('search', search.trim());
        }

        if (per_page) params.append('per_page', per_page);
        if (page) params.append('page', page);

        if (tipo_documento) {
            params.append('tipo_documento', tipo_documento);
        }

        if (is_active !== null && is_active !== '') {
            params.append('is_active', is_active);
        }

        // ⭐ NUEVO: filtro por fechas
        if (registered_from) params.append('registered_from', registered_from);
        if (registered_to) params.append('registered_to', registered_to);

        const response = await get(`/entities?${params.toString()}`);

        let data = [];
        let meta = {};

        if (response.data) {
            if (Array.isArray(response.data.data)) {
                data = response.data.data;
                meta = response.data.meta || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }
        }

        return {
            data,
            total: meta.total || data.length || 0,
            current_page: meta.current_page || page,
            per_page: meta.per_page || per_page,
            last_page: meta.last_page || 1,
            from: meta.from || 0,
            to: meta.to || 0,
            meta,
            links: response.data?.links || {},
        };
    } catch (error) {
        console.error('❌ Error en getSuppliers:', error);
        throw error;
    }
};

// =======================
// 📌 CREAR PROVEEDOR (siempre jurídico)
// =======================
export const createSupplier = async (payload) => {
    try {
        // Forzamos siempre type = 'supplier'
        const body = {
            type: 'supplier',
            ...payload
        };

        const response = await post('/entities', body);

        const { message, data } = response.data || {};

        return {
            message: message || 'Proveedor creado exitosamente',
            supplier: data || null
        };

    } catch (error) {
        console.error('❌ Error en createSupplier:', error);
        throw error;
    }
};
