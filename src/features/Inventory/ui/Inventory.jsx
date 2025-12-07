import React, { useState, useEffect } from 'react';
import { useHeader } from '../../../context/useHeader';
import { useInventory } from '../hook/inventoryHook';
import { useWarehousesContext } from '../../../context/WarehousesContext';
import { useCategoriesContext } from '../../../context/CategoriesContext';
import PageHeader from '../../../components/Header/PageHeader/PageHeader';
import InventoryTable from '../../../components/Table/InventoryTable';
import { StatsCardGrid } from '../../../components/StatsCards/StatCard';
import InventoryFilters from '../../../components/Filters/Inventory/InventoryFilters';
import MovementModal from '../../../components/Forms/Inventory/MovimientoStock/MovementModal';
import ProductSelectorModal from '../../../components/Forms/Inventory/TrasladarProducto/ProductSelectorModal';
import TransferModal from '../../../components/Forms/Inventory/TrasladarProducto/TransferModal';
import InventoryDetail from '../../../components/Forms/Inventory/InventoryDetail/InventoryDetail';
import MovementHistoryModal from '../../../components/Forms/Inventory/InventoryDetail/MovementHistoryModal';
import { message } from 'antd';

export default function InventoryList() {
    const { setPageTitle } = useHeader();
    const { warehouses, loading: loadingWarehouses } = useWarehousesContext();
    const { categoryTree, loading: loadingCategories } = useCategoriesContext();
    const {
        inventory,
        statistics,
        loading,
        pagination,
        fetchInventoryList,
        createInventory,
        fetchStatistics
    } = useInventory();

    const [searchTerm, setSearchTerm] = useState('');
    const [openMovement, setOpenMovement] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [openSelector, setOpenSelector] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [historyMovements, setHistoryMovements] = useState([]);

    const [filters, setFilters] = useState({
        sort: "recent",
        category: "all",
        stock: "all",
        warehouse: null,
        page: 1,
        per_page: 15
    });

    useEffect(() => {
        setPageTitle('Inventario');
    }, [setPageTitle]);

    // ✅ Establecer almacén principal cuando carguen los almacenes
    useEffect(() => {
        if (!loadingWarehouses && warehouses.length > 0 && !filters.warehouse) {
            const mainWarehouse = warehouses.find(w => w.is_main) || warehouses[0];

            console.log('🏢 Setting main warehouse:', mainWarehouse);

            setFilters(prev => ({
                ...prev,
                warehouse: mainWarehouse.id
            }));
        }
    }, [warehouses, loadingWarehouses, filters.warehouse]);

    // ✅ Cargar datos cuando se establezca el almacén Y las categorías estén listas
    useEffect(() => {
        if (filters.warehouse && !loadingCategories) {
            console.log('📊 Loading inventory with warehouse:', filters.warehouse);
            loadInitialData();
        }
    }, [filters.warehouse, loadingCategories]);

    const loadInitialData = async () => {
        if (!filters.warehouse) {
            console.log('⏳ Esperando a que se establezca el almacén...');
            return;
        }

        try {
            console.log('📊 Loading data for warehouse:', filters.warehouse);
            await fetchStatistics();
            await fetchInventoryList(transformFiltersForBackend(filters, searchTerm));
        } catch (err) {
            console.error('Error loading data:', err);
            message.error('Error al cargar los datos del inventario');
        }
    };

    const transformFiltersForBackend = (uiFilters, search = '') => {
        const backendFilters = {
            search: search.trim(),
            page: uiFilters.page,
            per_page: uiFilters.per_page
        };

        // Ordenamiento
        if (uiFilters.sort === 'az' || uiFilters.sort === 'za') {
            backendFilters.sort_by = 'last_movement_at';
            backendFilters.sort_order = uiFilters.sort === 'az' ? 'asc' : 'desc';
        } else if (uiFilters.sort === 'recent') {
            backendFilters.sort_by = 'last_movement_at';
            backendFilters.sort_order = 'desc';
        }

        // ✅ Categoría - enviar al backend para filtro con descendientes
        if (uiFilters.category && uiFilters.category !== 'all') {
            backendFilters.category_id = uiFilters.category;
        }

        // Stock
        if (uiFilters.stock === 'low') {
            backendFilters.low_stock = true;
        } else if (uiFilters.stock === 'available') {
            backendFilters.with_stock = true;
        } else if (uiFilters.stock === 'out') {
            backendFilters.out_of_stock = true;
        }

        // Almacén - SIEMPRE requerido
        if (uiFilters.warehouse) {
            backendFilters.warehouse_id = uiFilters.warehouse;
        }

        console.log('🔄 Transformed filters:', backendFilters);

        return backendFilters;
    };

    // ✅ Recargar cuando cambien los filtros (excepto warehouse que tiene su propio useEffect)
    useEffect(() => {
        if (!filters.warehouse || loadingCategories) return;

        const delayDebounceFn = setTimeout(() => {
            const backendFilters = transformFiltersForBackend(filters, searchTerm);
            fetchInventoryList(backendFilters);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [filters.sort, filters.category, filters.stock, filters.page, filters.per_page, searchTerm]);

    // ✅ Recargar inmediatamente cuando cambie el almacén (sin debounce)
    useEffect(() => {
        if (filters.warehouse && !loadingCategories) {
            const backendFilters = transformFiltersForBackend(filters, searchTerm);
            fetchInventoryList(backendFilters);
        }
    }, [filters.warehouse]);

    const handleSearch = (value) => {
        console.log('🔍 Search:', value);
        setSearchTerm(value);
        setFilters(prev => ({ ...prev, page: 1 })); // Resetear a página 1
    };

    const handleFilterUpdate = (updated) => {
        console.log('🎛️ Filter update:', updated);
        setFilters(prev => ({ ...prev, ...updated, page: 1 }));
    };

    const handlePageChange = (page, pageSize) => {
        console.log('📄 Page change:', { page, pageSize });

        const numPage = typeof page === 'number' ? page : 1;
        const numPageSize = typeof pageSize === 'number' ? pageSize : filters.per_page;

        setFilters(prev => ({
            ...prev,
            page: numPage,
            per_page: numPageSize
        }));
    };

    const displayData = inventory;

    const inventoryStats = [
        {
            title: 'Total Productos',
            value: statistics?.unique_products || 0,
            icon: 'Package',
            iconBgColor: 'var(--primary)'
        },
        {
            title: 'Stock Total',
            value: statistics?.total_available_stock || 0,
            icon: 'ChartSpline',
            iconBgColor: '#7bd707'
        },
        {
            title: 'Stock Bajo',
            value: statistics?.records_low_stock || 0,
            icon: 'TrendingDown',
            iconBgColor: '#fbb500'
        },
        {
            title: 'Agotados',
            value: statistics?.records_out_of_stock || 0,
            icon: 'PackageX',
            iconBgColor: '#E7000B'
        }
    ];

    const handleMovementSubmit = async (movementData) => {
        try {
            const payload = {
                product_id: movementData.product_id,
                warehouse_ids: [movementData.warehouse_id],
                sale_price: movementData.sale_price || null,
                profit_margin: movementData.profit_margin || null,
                min_sale_price: movementData.min_sale_price || null
            };

            console.log('📦 Submitting movement:', payload);

            await createInventory(payload);

            message.success('Movimiento registrado exitosamente');
            setOpenMovement(false);
            setSelectedRow(null);

            await fetchInventoryList(transformFiltersForBackend(filters, searchTerm));
            await fetchStatistics();
        } catch (err) {
            console.error('Error creating movement:', err);
            message.error(err.message || 'Error al registrar el movimiento');
        }
    };

    const handleMovementAction = (record, type) => {
        console.log('⚡ Movement action:', { record, type });

        setSelectedRow({
            product_id: record.product?.id,
            warehouse_id: record.warehouse?.id,
            type,
            quantity: "",
            note: "",
            productName: record.product?.primary_name,
            warehouseName: record.warehouse?.name,
            currentStock: record.available_stock
        });
        setOpenMovement(true);
    };

    const handleOpenDetail = (product) => {
        console.log('👁️ Opening detail for:', product);

        const transformedProduct = {
            id: product.product_id,
            product: product.product?.primary_name || 'Sin nombre',
            sku: product.product?.sku || 'Sin SKU',
            warehouse: product.warehouse?.name || 'Sin almacén',
            stock: product.total_stock || 0,
            reserved: product.reserved_stock || 0,
            available: product.available_stock || 0,
            image: product.product?.images?.[0]?.url || null,
            status: product.stock_status
        };

        setSelectedProductDetail(transformedProduct);
        setOpenDetail(true);
    };

    const handleTransferSubmit = async (transferData) => {
        try {
            console.log('🔄 Transfer data:', transferData);
            message.success('Traslado realizado exitosamente');
            setOpenTransfer(false);
            await fetchInventoryList(transformFiltersForBackend(filters, searchTerm));
            await fetchStatistics();
        } catch (err) {
            message.error('Error al realizar el traslado');
        }
    };

    return (
        <>
            <PageHeader
                title="Control de Inventario"
                subtitle="Gestión en tiempo real de stock y movimientos"
                actions={[
                    { label: "Exportar", icon: "Download" },
                    {
                        label: "Trasladar",
                        icon: "ArrowLeftRight",
                        onClick: () => setOpenSelector(true)
                    },
                    {
                        label: "Movimiento de Stock",
                        icon: "PackagePlus",
                        type: "primary",
                        onClick: () => setOpenMovement(true)
                    }
                ]}
            />

            <div style={{ marginBottom: '32px' }}>
                <StatsCardGrid stats={inventoryStats} columns={4} />
            </div>

            <InventoryFilters
                filters={filters}
                onChange={handleFilterUpdate}
                categories={categoryTree}  // ✅ CAMBIAR: era categories
                categoriesLoading={loadingCategories}
            />

            <InventoryTable
                data={displayData}
                onSearch={handleSearch}
                totalProducts={displayData.length}
                loading={loading}
                paginationData={pagination}
                filters={filters}
                onFilterChange={handlePageChange}
                onMovementAction={handleMovementAction}
                onOpenDetail={handleOpenDetail}
            />

            {openMovement && (
                <MovementModal
                    initialData={selectedRow}
                    products={Array.from(new Set(inventory.map(item => item.product))).filter(Boolean)} // ✅ Lista única de productos
                    warehouses={warehouses} // ✅ Lista de almacenes desde contexto
                    onClose={() => {
                        setOpenMovement(false);
                        setSelectedRow(null);
                    }}
                    onSubmit={handleMovementSubmit}
                />
            )}

            {openSelector && (
                <ProductSelectorModal
                    products={inventory.map(item => ({
                        id: item.product_id,
                        product: item.product?.primary_name || 'Sin nombre',
                        sku: item.product?.sku || 'Sin SKU',
                        warehouse: item.warehouse?.name || 'Sin almacén',
                        stock: item.available_stock || 0,
                        image: item.product?.images?.[0]?.url || null
                    }))}
                    onClose={() => setOpenSelector(false)}
                    onSelect={(product) => {
                        console.log('✅ Product selected:', product);
                        setSelectedProduct(product);
                        setOpenSelector(false);
                        setOpenTransfer(true);
                    }}
                />
            )}

            {openTransfer && selectedProduct && (
                <TransferModal
                    product={selectedProduct}
                    onClose={() => setOpenTransfer(false)}
                    onSubmit={handleTransferSubmit}
                />
            )}

            {openDetail && selectedProductDetail && (
                <InventoryDetail
                    product={selectedProductDetail}
                    onClose={() => setOpenDetail(false)}
                    onShowHistory={(movs) => {
                        setOpenDetail(false);
                        setHistoryMovements(movs);
                        setShowHistory(true);
                    }}
                />
            )}

            {showHistory && (
                <MovementHistoryModal
                    movements={historyMovements}
                    onClose={() => setShowHistory(false)}
                    onBack={() => {
                        setShowHistory(false);
                        setOpenDetail(true);
                    }}
                />
            )}
        </>
    );
}