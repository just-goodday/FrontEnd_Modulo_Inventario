import { responsiveArray } from 'antd/es/_util/responsiveObserver';
import { get, post, patch, del, put } from '../../../services/MethodGeneral';

export const getProducts = async (search = '', perPage = 10, page = 1, categoryId = null, status = null) => {
    try {
        const params = new URLSearchParams();
        
        if (search && search.trim() && search !== 'null') {
            params.append('search', search.trim());
        }
        
        if (perPage) params.append('per_page', perPage);
        if (page) params.append('page', page);
        
        if (categoryId && 
            categoryId !== 'all-categories' && 
            categoryId !== null && 
            categoryId !== 'null' &&
            categoryId !== '' &&
            categoryId !== undefined) {
            params.append('category_id', categoryId);
        }
        
        if (status && 
            status !== 'all-status' && 
            status !== null && 
            status !== 'null' &&
            status !== '' &&
            status !== undefined) {
            if (status === 'active') {
                params.append('is_active', '1');
            } else if (status === 'inactive') {
                params.append('is_active', '0');
            }
        }

        const response = await get(`/products?${params}`);

        // 🔥 CORRECCIÓN: Extraer correctamente desde la respuesta de Laravel Resource
        let data = [];
        let meta = {};
        
        if (response.data) {
            // Laravel Resource devuelve { data: [...], meta: {...} }
            if (Array.isArray(response.data.data)) {
                data = response.data.data;
                meta = response.data.meta || {};
            } else if (Array.isArray(response.data)) {
                data = response.data;
            }
        }

        // 🔥 CORRECCIÓN: Retornar la estructura correcta
        return {
            data,
            total: meta.total || data.length || 0,
            current_page: meta.current_page || page,
            per_page: meta.per_page || perPage,
            last_page: meta.last_page || 1,
            from: meta.from || 0,
            to: meta.to || 0
        };
    } catch (error) {
        throw error;
    }
};

export const getProductById = async (productId) => {
    try {
        const response = await get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await post('/products', {
            ...productData,
        });
        
        console.log('📦 Respuesta completa de crear producto:', response);

        return response;
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async (productId, updateData) => {
    try {
        const response = await patch(`/products/${productId}`, updateData);
        
        console.log('📦 Respuesta completa de actualizar producto:', response);

        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (productId) => {
    try {
        const response = await del(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadProductImage = async (productId, imageFile) => {
    try {
        const formData = new FormData();
        formData.append('images[]', imageFile); // El backend espera array 'images[]'

        const response = await post(`/products/${productId}/images`, formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });
        
        console.log('📤 Respuesta subir imagen:', response);
        return response.data;
    } catch (error) {
        console.error('❌ Error subiendo imagen:', error);
        throw error;
    }
};;

export const deleteProductImage = async (productId, imageId) => {
    try {
        const response = await del(`/products/${productId}/images/${imageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const setPrimaryImage = async (productId, imageId) => {
    try {
        const response = await patch(`/products/${productId}/images/${imageId}/set-primary`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProductsStats = async () => {
    try {
        const response = await get('/products?per_page=1000'); // Traer muchos productos para estadísticas
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAtributosProducts = async (productId) => {
    try {
        const response = await get(`/products/${productId}/attributes`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getProductInventory = async(productId) => {
    try {
        const response = await get(`products/${productId}/inventory`);
        return response.data;
    } catch (error) {
        console.error('Error fetching product inventory:', error);
        throw error;
    }
}

export const updateProductAttributes = async (productId, attributesData) => {
    try {
        const response = await put(`/products/${productId}/attributes/bulk`, attributesData);
        return response.data;
    } catch (error) {
        throw error;
    }
};