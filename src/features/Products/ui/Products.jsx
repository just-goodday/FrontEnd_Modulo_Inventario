import React, { useState, useRef, useEffect } from 'react';
import { StatsCardGrid } from '../../../components/StatsCards/StatCard';
import { useCategoriesContext } from '../../../context/CategoriesContext';
import { useToast } from '../../../context/ToastContext';
import { useHeader } from '../../../context/useHeader';
import { useProducts } from '../hook/productHook';
import PageHeader from '../../../components/Header/PageHeader/PageHeader';
import ProductForm from '../../../components/Forms/Products/ProductForm';
import ProductTable from '../../../components/Table/Table';
import ConfirmModal from '../../../components/ConfirmMessage/ConfirmModal';

export default function ProductsList() {
    const { setPageTitle } = useHeader();
    const { success, error: toastError, loading: toastLoading, product: toastProduct, delete: toastDelete } = useToast();

    const {
        products,
        paginationData,
        loading,
        fetchProducts,
        fetchProductById,
        currentImageIndex,
        nextImage,
        prevImage,
        goToImage,
        statsProducts,
        fetchProductsStats,
        createProduct,
        updateProduct,
        deleteProduct
    } = useProducts();

    const { categoryTree, loading: categoriesLoading } = useCategoriesContext();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const initialLoadDone = useRef(false);

    const [filters, setFilters] = useState({
        search: '',
        category: 'all-categories',
        status: 'all-status',
        page: 1,
        perPage: 10
    });

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);


    useEffect(() => {
        setPageTitle('Productos');

        const loadInitialData = async () => {
            if (initialLoadDone.current) return;

            initialLoadDone.current = true;
            console.log('🚀 Iniciando carga de productos...');

            try {
                const { search, category, status, page, perPage } = filters;
                await fetchProducts(
                    search,
                    perPage,
                    page,
                    category === 'all-categories' ? null : category,
                    status === 'all-status' ? null : status
                );

                await fetchProductsStats();

                console.log('✅ Carga inicial completa');
            } catch (error) {
                console.error('❌ Error en carga inicial:', error);
                toastError('Error al cargar productos');
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (!initialLoadDone.current) return;

        const timeoutId = setTimeout(() => {
            console.log('🔄 Aplicando filtros...', filters);
            const { search, category, status, page, perPage } = filters;

            fetchProducts(
                search,
                perPage,
                page,
                category === 'all-categories' ? null : category,
                status === 'all-status' ? null : status
            );
        }, filters.search ? 500 : 0);

        return () => clearTimeout(timeoutId);
    }, [filters]);

    // En Products.jsx, dentro del componente principal, agrega:
    useEffect(() => {
        const handleProductsReload = async (event) => {
            console.log('🔄 Recargando productos por evento...', event.detail);

            const { productId } = event.detail;
            const { search, category, status, page, perPage } = filters;

            // 1) Recargar listado principal
            await fetchProducts(
                search,
                perPage,
                page,
                category === 'all-categories' ? null : category,
                status === 'all-status' ? null : status
            );

            // 2) Recargar producto individual (para obtener imágenes nuevas)
            if (productId) {
                console.log("🔍 Recargando producto individual con imágenes nuevas...");
                const updated = await fetchProductById(productId);

                if (updated.success && updated.data) {
                    // Reemplazar la lista completa para asegurar consistencia
                    await fetchProducts(
                        search,
                        perPage,
                        page,
                        category === 'all-categories' ? null : category,
                        status === 'all-status' ? null : status
                    );
                }
            }

            // 3) Recargar estadísticas
            await fetchProductsStats();
        };

        window.addEventListener('products-reload', handleProductsReload);

        return () => {
            window.removeEventListener('products-reload', handleProductsReload);
        };
    }, [filters, fetchProducts, fetchProductById, fetchProductsStats]);


    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page !== undefined ? newFilters.page : 1
        }));
    };

    const handleCreateProduct = () => {
        console.log('➕ Creando nuevo producto');
        setFormMode('create');
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const handleEditProduct = (product) => {
        console.log('✏️ Editando producto:', product);
        setFormMode('edit');
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        console.log('❌ Cerrando formulario');
        setIsFormOpen(false);
        setSelectedProduct(null);
    };

    const handleSubmitForm = async (formData) => {
        try {
            console.log('📤 Enviando formulario:', {
                mode: formMode,
                productId: selectedProduct?.id,
                formData: formData
            });

            let result;

            if (formMode === 'create') {
                console.log('➕ Creando producto...');
                result = await createProduct(formData, { skipRefresh: true });
            } else {
                console.log('✏️ Actualizando producto:', selectedProduct.id);
                result = await updateProduct(selectedProduct.id, formData, { skipRefresh: true });
            }

            // ✅ VERIFICAR RESULTADO
            if (result.success) {
                console.log('✅ Operación exitosa', result);

                // 👈 NUEVO: TOAST DE PRODUCTO CON ÍCONO ESPECIAL
                toastProduct(formMode === 'create'
                    ? 'Producto creado exitosamente'
                    : 'Producto actualizado exitosamente'
                );

                // Obtener el ID del producto
                const productId = result.id || result.data?.id || result.data?.data?.id;
                console.log('🆔 ID del producto creado:', productId);

                // ✅ RETORNAR la respuesta con el ID para que ProductForm continúe
                return {
                    id: productId,
                    ...result
                };

            } else {
                console.error('❌ Error en operación:', result.error);
                // 👈 TOAST DE ERROR (NO cierra el modal)
                toastError(`${result.error}`);
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error al guardar producto:', error);
            // 👈 TOAST DE ERROR (NO cierra el modal)
            toastError('Error al guardar producto');
            throw error;
        }
    };

    const handleDeleteProduct = (productId) => {
        setProductToDelete(productId);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            console.log('🗑️ Eliminando producto:', productToDelete);

            const result = await deleteProduct(productToDelete);

            if (result.success) {
                toastDelete('Producto eliminado correctamente');

                const { search, category, status, page, perPage } = filters;

                await fetchProducts(
                    search,
                    perPage,
                    page,
                    category === 'all-categories' ? null : category,
                    status === 'all-status' ? null : status
                );

                await fetchProductsStats();
            } else {
                toastError(`${result.error}`);
            }
        } catch (err) {
            toastError('Error eliminando producto');
        } finally {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
        }
    };


    const handleToggleFeatured = async (productId, currentFeaturedStatus) => {
        if (!productId) return;

        try {
            console.log('⭐ Cambiando estado destacado:', { productId, currentFeaturedStatus });

            // Preparar datos para actualizar solo el campo is_featured
            const updateData = {
                is_featured: !currentFeaturedStatus
            };

            const result = await updateProduct(productId, updateData, { skipRefresh: true });

            if (result.success) {
                // 👈 TOAST DE ÉXITO
                toastProduct(`Producto ${!currentFeaturedStatus ? 'destacado' : 'quitado de destacados'} correctamente`);

                // Recargar datos
                const { search, category, status, page, perPage } = filters;
                await fetchProducts(
                    search,
                    perPage,
                    page,
                    category === 'all-categories' ? null : category,
                    status === 'all-status' ? null : status
                );
                await fetchProductsStats();
            } else {
                toastError(`${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error cambiando estado destacado:', error);
            toastError('Error al cambiar estado destacado');
        }
    };

    const productStats = [
        {
            title: 'Total Productos',
            value: statsProducts.length.toLocaleString() || '0',
            icon: 'Package',
            iconBgColor: 'var(--primary)',
        },
        {
            title: 'Activos',
            value: statsProducts.filter(p => p.is_active === true || p.is_active === 1).length.toLocaleString(),
            icon: 'CheckCircle',
            iconBgColor: 'var(--success)',
        },
        {
            title: 'Inactivos',
            value: statsProducts.filter(p => !p.is_active).length.toLocaleString(),
            icon: 'XCircle',
            iconBgColor: 'var(--error)',
        },
        {
            title: 'Destacados',
            value: statsProducts.filter(p => p.is_featured === true || p.is_featured === 1).length.toLocaleString(),
            icon: 'Star',
            iconBgColor: '#a855f7',
        }
    ];

    return (
        <>
            <PageHeader
                title="Gestión de Productos"
                subtitle="Administra el catálogo completo de productos"
            // actions={[
            //     { label: "Exportar", icon: "Download" },
            //     { label: "Trasladar", icon: "ArrowLeftRight" },
            //     { label: "Movimiento de Stock", icon: "PackagePlus", type: "primary" }
            // ]}
            />

            <div style={{ marginBottom: '32px' }}>
                <StatsCardGrid stats={productStats} columns={4} />
            </div>

            <ProductTable
                products={products}
                paginationData={paginationData}
                loading={loading}
                currentImageIndex={currentImageIndex}
                onNextImage={nextImage}
                onPrevImage={prevImage}
                onGoToImage={goToImage}
                onCreateProduct={handleCreateProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleFeatured={handleToggleFeatured}
                onFilterChange={handleFilterChange}
                filters={filters}
                categories={categoryTree}
                categoriesLoading={categoriesLoading}
            />

            {isFormOpen && (
                <ProductForm
                    mode={formMode}
                    initialData={selectedProduct}
                    onSubmit={handleSubmitForm}
                    onClose={handleCloseForm}
                    categories={categoryTree}
                />
            )}

            <ConfirmModal
                open={showDeleteConfirm}
                message="¿Seguro que deseas eliminar este producto?"
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
            />
        </>
    );
}