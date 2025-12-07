import { useState, useCallback } from "react";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    setPrimaryImage,
    deleteProductImage,
    getProductsStats,
    getAtributosProducts,
    updateProductAttributes
} from "../services/productService";

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [paginationData, setPaginationData] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [statsProducts, setStatsProducts] = useState([]);

    // 1. Obtener productos
    const fetchProducts = useCallback(async (search = '', perPage = 10, page = 1, categoryId = null, status = null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getProducts(search, perPage, page, categoryId, status);

            const productsData = response.data || [];
            setProducts(productsData);
            setPaginationData(response);

            // Inicializar índices del slider para cada producto
            const initialIndices = {};
            productsData.forEach(product => {
                if (product.images && product.images.length > 0) {
                    initialIndices[product.id] = 0;
                }
            });
            setCurrentImageIndex(initialIndices);

            setResult(`✅ ${productsData.length} productos cargados`);
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Obtener producto por ID
    const fetchProductById = useCallback(async (productId) => {
        if (!productId) {
            const errorMsg = '❌ Ingresa un ID de producto';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getProductById(productId);
            setSelectedProduct(response.data || response);
            setResult('✅ Producto obtenido correctamente');
            return { success: true, data: response.data || response };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error obteniendo producto: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 2.5 Obtener atributos de un producto
    const fetchProductAttributes = useCallback(async (productId) => {
        if (!productId) {
            const errorMsg = '❌ Ingresa un ID de producto';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await getAtributosProducts(productId);
            setResult('✅ Atributos obtenidos correctamente');
            return {
                success: true,
                data: response.data || response
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error obteniendo atributos: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // 2.5 Crear y actualizar atributos de un producto
    const updateProductAttributesAction = useCallback(async (productId, attributesData) => {
        if (!productId) {
            const errorMsg = '❌ Ingresa un ID de producto';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await updateProductAttributes(productId, { attributes: attributesData });
            setResult('✅ Atributos actualizados correctamente');
            return { success: true, data: response };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error actualizando atributos: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);


    // 3. Crear producto
    const createProductAction = useCallback(async (productData, options = {}) => {
        if (!productData.primary_name?.trim()) {
            const errorMsg = '❌ El nombre principal es obligatorio';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await createProduct(productData);
            console.log('🆔 Respuesta del producto creado:', response);

            setResult('✅ Producto creado correctamente');

            // Recargar productos después de crear (en segundo plano),
            // a menos que se indique lo contrario con options.skipRefresh
            if (!options.skipRefresh) {
                fetchProducts();
            }

            // ✅ Retornar la respuesta COMPLETA con el ID del producto
            return {
                success: true,
                data: response.data,
                // Asegurarnos de que el ID esté disponible
                id: response.data?.id || response.data?.data?.id
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error creando producto: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    // 4. Actualizar producto
    const updateProductAction = useCallback(async (productId, updateData, options = {}) => {
        if (!productId) {
            const errorMsg = '❌ Ingresa un ID para actualizar';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            const response = await updateProduct(productId, updateData);
            console.log('🆔 Respuesta del producto actualizado:', response);

            setResult('✅ Producto actualizado correctamente');

            // Recargar productos después de actualizar sólo si no se pide omitir
            if (!options.skipRefresh) {
                await fetchProducts();
            }

            // ✅ Retornar la respuesta COMPLETA
            return {
                success: true,
                data: response.data,
                id: productId // En update ya tenemos el ID
            };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error actualizando producto: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);



    // 5. Eliminar producto
    const deleteProductAction = useCallback(async (productId) => {
        if (!productId) {
            const errorMsg = '❌ Ingresa un ID para eliminar';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            await deleteProduct(productId);
            setResult('✅ Producto eliminado correctamente');

            // Recargar productos después de eliminar
            await fetchProducts();

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error eliminando producto: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    // 6. Subir imagen
    const uploadImageAction = useCallback(async (productId, imageFile, options = {}) => {
        if (!productId || !imageFile) {
            return {
                success: false,
                error: "ID e imagen requeridos"
            };
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`📤 Subiendo imagen: ${imageFile.name} (${(imageFile.size / 1024 / 1024).toFixed(2)}MB)`);

            const response = await uploadProductImage(productId, imageFile);

            console.log('✅ Respuesta del servidor:', response);

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error en uploadImageAction:', error);

            // 🔍 EXTRAER EL MENSAJE DE ERROR DEL SERVIDOR
            let errorMessage = 'Error desconocido al subir imagen';

            // Laravel envía errores en diferentes formatos
            if (error.response?.data) {
                const data = error.response.data;

                // Formato 1: { message: "...", errors: {...} }
                if (data.message) {
                    errorMessage = data.message;
                }
                // Formato 2: { errors: { "images.0": ["..."] } }
                else if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0];
                    }
                }
                // Formato 3: { error: "..." }
                else if (data.error) {
                    errorMessage = data.error;
                }
            }
            // Error de axios/red
            else if (error.message) {
                errorMessage = error.message;
            }

            console.error('❌ Error final:', errorMessage);
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage,
                details: error.response?.data
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // 6.5. Asignar imagen como principal
    const setPrimaryImageAction = useCallback(async (productId, imageId) => {
        if (!productId || !imageId) {
            return {
                success: false,
                error: "ID de producto e imagen requeridos"
            };
        }

        try {
            console.log(`⭐ Estableciendo imagen ${imageId} como principal...`);

            const response = await setPrimaryImage(productId, imageId);

            console.log('✅ Imagen principal establecida');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ Error en setPrimaryImageAction:', error);

            // 🔍 EXTRAER EL MENSAJE DE ERROR DEL SERVIDOR
            let errorMessage = 'Error estableciendo imagen principal';

            if (error.response?.data) {
                const data = error.response.data;

                if (data.message) {
                    errorMessage = data.message;
                } else if (data.error) {
                    errorMessage = data.error;
                } else if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMessage = firstError[0];
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.error('❌ Error final:', errorMessage);

            return {
                success: false,
                error: errorMessage,
                details: error.response?.data
            };
        }
    }, []);


    // 7. Eliminar imagen
    const deleteImageAction = useCallback(async (productId, imageId, options = {}) => {
        if (!productId || !imageId) {
            const errorMsg = '❌ Producto e imagen son requeridos';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);
        try {
            await deleteProductImage(productId, imageId);
            setResult('✅ Imagen eliminada correctamente');

            // Recargar productos después de eliminar imagen sólo si no se pide omitir
            if (!options.skipRefresh) {
                await fetchProducts();
            }

            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error eliminando imagen: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [fetchProducts]);

    // 8. Funciones para el slider de imágenes
    const nextImage = useCallback((productId) => {
        const product = products.find(p => p.id === productId);
        if (!product?.images) return;

        setCurrentImageIndex(prev => ({
            ...prev,
            [productId]: (prev[productId] + 1) % product.images.length
        }));
    }, [products]);

    const prevImage = useCallback((productId) => {
        const product = products.find(p => p.id === productId);
        if (!product?.images) return;

        setCurrentImageIndex(prev => ({
            ...prev,
            [productId]: prev[productId] === 0 ? product.images.length - 1 : prev[productId] - 1
        }));
    }, [products]);

    const goToImage = useCallback((productId, index) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [productId]: index
        }));
    }, []);

    // 9. Función para cargar estadisticas (sin filtro)
    const fetchProductsStats = useCallback(async () => {
        try {
            const response = await getProductsStats();
            const productsData = response.data || [];
            setStatsProducts(productsData);
            return { success: true, data: response };
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            return { success: false, error: error.message };
        }
    }, []);

    // 10. Limpiar estados
    const clearResult = useCallback(() => {
        setResult('');
        setError(null);
    }, []);

    const clearData = useCallback(() => {
        setProducts([]);
        setPaginationData(null);
        setSelectedProduct(null);
        setResult('');
        setError(null);
        setCurrentImageIndex({});
    }, []);

    const clearSelectedProduct = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    return {
        // Estados
        products,
        paginationData,
        selectedProduct,
        loading,
        error,
        result,
        currentImageIndex,
        statsProducts,

        // Acciones
        fetchProducts,
        fetchProductById,
        fetchProductAttributes,
        updateProductAttributes: updateProductAttributesAction,
        createProduct: createProductAction,
        updateProduct: updateProductAction,
        setPrimaryImage: setPrimaryImageAction,
        deleteProduct: deleteProductAction,
        uploadImage: uploadImageAction,
        deleteImage: deleteImageAction,
        fetchProductsStats,

        // Funciones del slider
        nextImage,
        prevImage,
        goToImage,

        // Limpiar
        clearResult,
        clearData,
        clearSelectedProduct
    };
};