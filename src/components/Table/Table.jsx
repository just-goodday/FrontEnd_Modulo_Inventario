import { useMemo } from 'react';
import { Table, Tag, Button, Space, ConfigProvider, Avatar, Input, Select, Image, Cascader } from 'antd';
import { Pencil, Trash2, Star, Search, Plus, ChevronLeft, ChevronRight, Eye, Package } from 'lucide-react';
import CustomPagination from './Pagination/Pagination';
import styles from './Table.module.css';

const ProductTable = ({
    products,
    paginationData,
    loading,
    currentImageIndex,
    onNextImage,
    onPrevImage,
    onGoToImage,
    onCreateProduct,
    onEditProduct,
    onDeleteProduct,
    onToggleFeatured,
    onFilterChange,
    filters,
    categories,
    categoriesLoading
}) => {
    // ✅ Función para transformar árbol a formato Cascader
    const transformTreeToCascader = (tree) => {
        if (!tree || !Array.isArray(tree)) return [];

        return tree.map(node => ({
            value: node.id,
            label: node.name,
            children: node.children && node.children.length > 0
                ? transformTreeToCascader(node.children)
                : []
        }));
    };

    // ✅ Función para obtener el path completo de una categoría por su ID
    const getCategoryPath = (options, targetId) => {
        if (!options || !targetId || targetId === 'all-categories') return undefined;

        const findPath = (items, target, currentPath = []) => {
            for (const item of items) {
                const newPath = [...currentPath, item.value];

                if (item.value === target) {
                    return newPath;
                }

                if (item.children) {
                    const found = findPath(item.children, target, newPath);
                    if (found) return found;
                }
            }
            return null;
        };

        return findPath(options, targetId);
    };

    const categoryOptions = useMemo(() => {
        if (!categories || categories.length === 0) return [
            { value: 'all-categories', label: 'Todas las categorías' },
        ];

        return [
            { value: 'all-categories', label: 'Todas las categorías' },
            ...transformTreeToCascader(categories),
        ];
    }, [categories]);

    const statusOptions = [
        { value: 'all-status', label: 'Todos los estados' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
    ];

    const renderProductImage = (product) => {
        const images = product.images || [];
        const currentIndex = currentImageIndex[product.id] || 0;
        const currentImage = images[currentIndex];

        // Función para corregir URLs
        const getCorrectImageUrl = (image) => {
            if (!image) return null;

            const url = image.original_url || image.medium_url || image.thumb_url || image.url;

            if (url && url.includes('localhost/storage')) {
                // Cambiar al puerto 8000 donde está Laravel
                return url.replace('http://localhost/', 'http://localhost:8000/');
            }

            return url;
        };

        if (images.length === 0) {
            return (
                <Avatar
                    shape="square"
                    size={48}
                    style={{
                        backgroundColor: 'var(--overlay-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}
                >
                    <Package size={20} color="var(--text-muted)" />
                </Avatar>
            );
        }

        return (
            <div className={styles.imageSlider}>
                <div className={styles.imageContainer}>
                    <Image
                        width={48}
                        height={48}
                        src={getCorrectImageUrl(currentImage)}
                        alt={product.primary_name || product.name}
                        style={{
                            borderRadius: '8px',
                            objectFit: 'cover'
                        }}
                        placeholder={
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'var(--overlay-subtle)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={20} color="var(--text-muted)" />
                            </div>
                        }
                        onError={(e) => {
                            console.error('Error cargando imagen:', e.target.src);
                            // Opcional: mostrar placeholder en error
                        }}
                    />

                    {images.length > 1 && (
                        <>
                            <button
                                className={`${styles.sliderButton} ${styles.prevButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPrevImage(product.id);
                                }}
                            >
                                <ChevronLeft size={12} />
                            </button>
                            <button
                                className={`${styles.sliderButton} ${styles.nextButton}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNextImage(product.id);
                                }}
                            >
                                <ChevronRight size={12} />
                            </button>

                            <div className={styles.dotsContainer}>
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onGoToImage(product.id, index);
                                        }}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const columns = [
        {
            title: <div style={{ textAlign: 'center' }}>Producto</div>,
            dataIndex: 'primary_name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {renderProductImage(record)}
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                            {text || record.nombre || record.primary_name}
                        </div>
                        {/* <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {record.category?.name || record.categoria || 'Sin categoría'}
                        </div>
                        {record.sku && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                SKU: {record.sku}
                            </div>
                        )} */}
                    </div>
                </Space>
            ),
            width: 300,
        },
        {
            title: <div style={{ textAlign: 'center' }}>SKU</div>,
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            align: 'center',
            render: (sku) => (
                <Tag
                    style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'monospace'
                    }}
                >
                    {sku}
                </Tag>
            )
        },
        {
            title: <div style={{ textAlign: 'center' }}>Categoría</div>,
            dataIndex: 'category',
            key: 'category',
            align: 'center',
            width: 180,
            render: (category) => {
                return (
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {category?.name || 'Sin categoría'}
                    </span>
                );
            }
        },
        {
            title: <div style={{ textAlign: 'center' }}>Precio</div>,
            dataIndex: 'sale_price',
            key: 'price',
            render: (price, record) => {
                const productPrice = price || record.precio || record.unit_price || 0;
                return (
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                        S/. {parseFloat(productPrice).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                );
            },
            align: 'center',
            width: 140,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Stock</div>,
            dataIndex: 'total_stock',
            key: 'stock',
            render: (stock, record) => {
                const productStock = record.total_stock || 0;
                const minStock = record.min_stock || 10;
                const isLowStock = productStock <= minStock && productStock > 0;

                return (
                    <div>
                        <span style={{
                            fontWeight: 500,
                            color: productStock === 0 ? 'var(--error)' :
                                isLowStock ? 'var(--warning)' : 'var(--text)'
                        }}>
                            {productStock}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                            {' '}(Mín: {minStock})
                        </span>
                    </div>
                );
            },
            align: 'center',
            width: 140,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Estado</div>,
            dataIndex: 'is_active',
            key: 'status',
            render: (isActive, record) => {
                let statusText = 'Activo';
                let statusColor = 'green';

                if (!isActive) {
                    statusText = 'Inactivo';
                    statusColor = 'gray';
                }

                return (
                    <Tag
                        color={statusColor}
                        style={{
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 500,
                            margin: 0
                        }}
                    >
                        {statusText}
                    </Tag>
                );
            },
            align: 'center',
            width: 130,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Acciones</div>,
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<Eye size={16} color="var(--primary)" />}
                        size="small"
                        title="Ver detalle"
                    />
                    <Button
                        type="text"
                        icon={<Pencil size={16} color="var(--warning)" />}
                        size="small"
                        title="Editar"
                        onClick={() => onEditProduct(record)}
                    />
                    <Button
                        type="text"
                        icon={<Trash2 size={16} color="var(--error)" />}
                        size="small"
                        title="Eliminar"
                        onClick={() => onDeleteProduct(record.id)}
                    />
                    <Button
                        type="text"
                        icon={
                            <Star
                                size={16}
                                color={record.is_featured ? "var(--warning)" : "var(--text-muted)"}
                                fill={record.is_featured ? "var(--warning)" : "transparent"}
                            />
                        }
                        size="small"
                        title={record.is_featured ? 'Quitar destacado' : 'Destacar'}
                        onClick={() => onToggleFeatured(record.id, record.is_featured)}
                    />
                </Space>
            ),
            align: 'center',
            width: 160,
        },
    ];

    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: 'var(--bg-secondary)',
                        headerColor: 'var(--text-secondary)',
                        colorBgContainer: 'var(--card)',
                        borderColor: 'var(--border)',
                        headerBorderRadius: 0,
                        rowHoverBg: 'var(--overlay-subtle)',
                    },
                    Input: {
                        colorBgContainer: 'var(--card)',
                        colorBorder: 'var(--border)',
                        colorText: 'var(--text)',
                    },
                    Select: {
                        colorBgContainer: 'var(--card)',
                        colorBorder: 'var(--border)',
                        colorText: 'var(--text)',
                    },
                },
            }}
        >
            <div className={styles.tableWrapper}>
                <div className={styles.searchBar}>
                    <Input
                        placeholder="Buscar productos..."
                        prefix={<Search size={16} color="var(--text-muted)" />}
                        className={styles.searchInput}
                        size="large"
                        value={filters.search}
                        onChange={(e) => {
                            onFilterChange({ search: e.target.value });
                        }}
                        allowClear
                    />

                    {/* ✅ Cascader con getCategoryPath */}
                    <Cascader
                        value={
                            filters.category === 'all-categories'
                                ? ['all-categories']
                                : getCategoryPath(categoryOptions, filters.category)
                        }
                        style={{ width: 250 }}
                        size="large"
                        options={categoryOptions}
                        onChange={(value) => {
                            if (!value || value.length === 0 || value.includes('all-categories')) {
                                onFilterChange({ category: 'all-categories' });
                                return;
                            }

                            const selectedValue = value[value.length - 1];
                            onFilterChange({ category: selectedValue });
                        }}
                        placeholder="Todas las categorías"
                        loading={categoriesLoading}
                        changeOnSelect
                        allowClear
                        showSearch={{
                            filter: (inputValue, path) =>
                                path.some(option =>
                                    option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                                ),
                        }}
                        displayRender={(labels) => labels.join(' / ')}
                    />

                    <Select
                        value={filters.status}
                        style={{ width: 180 }}
                        size="large"
                        onChange={(value) => onFilterChange({ status: value })}
                        options={statusOptions}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<Plus size={16} />}
                        className={styles.addButton}
                        onClick={onCreateProduct}
                    >
                        Nuevo Producto
                    </Button>
                </div>

                <div className={styles.tableHeader}>
                    Lista de Productos
                </div>

                <div className={styles.tableContainer}>
                    <Table
                        columns={columns}
                        dataSource={products.map(product => ({ ...product, key: product.id }))}
                        pagination={false}
                        loading={loading}
                        className={styles.table}
                        rowClassName={styles.tableRow}
                        scroll={{ x: 1000, y: 'calc(100vh - 400px)' }}
                        locale={{
                            emptyText: loading ? 'Cargando productos...' : 'No se encontraron productos'
                        }}
                    />
                </div>

                {paginationData && (
                    <CustomPagination
                        total={paginationData.total || 0}
                        currentPage={filters.page}
                        perPage={filters.perPage}
                        onPageChange={(page, pageSize) => onFilterChange({ page, perPage: pageSize })}
                    />
                )}
            </div>
        </ConfigProvider>
    );
};

export default ProductTable;