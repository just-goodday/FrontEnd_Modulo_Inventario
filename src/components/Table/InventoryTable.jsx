import React from "react";
import { Table, ConfigProvider, Input, Button, Tag } from "antd";
import { Search } from "lucide-react";
import { Plus, Minus } from "lucide-react";
import CustomPagination from './Pagination/Pagination';
import styles from './Table.module.css';

export default function InventoryTable({
    data,
    onSearch,
    totalProducts,
    loading,
    paginationData,
    filters,
    onFilterChange,
    onMovementAction,
    onOpenDetail
}) {
    // ✅ Función para obtener el path completo de una categoría
    const getCategoryFullPath = (category) => {
        if (!category) return 'Sin categoría';

        const path = [];
        let current = category;

        while (current) {
            path.unshift(current.name);
            current = current.parent; // Si tu backend devuelve el parent
        }

        return path.join(' / ');
    };

    const columns = [
        {
            title: "Producto",
            dataIndex: "product",
            key: "product",
            render: (product, record) => (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        cursor: "pointer"
                    }}
                    onClick={() => onOpenDetail(record)}
                >
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>
                        {product?.primary_name || 'Sin nombre'}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {product?.sku || 'Sin SKU'}
                    </span>
                </div>
            ),
            width: 300,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Categoría</div>,
            dataIndex: ["product", "category"],
            key: "category",
            render: (category) => (
                <span
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: '13px'
                    }}
                    title={getCategoryFullPath(category)} // ✅ Tooltip con path completo
                >
                    {category?.name || 'Sin categoría'}
                </span>
            ),
            align: 'center',
            width: 180,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Almacenes</div>,
            dataIndex: ["warehouse", "name"],
            key: "warehouse",
            render: (warehouseName) => (
                <span style={{ color: "var(--text-secondary)" }}>
                    {warehouseName || 'Sin almacén'}
                </span>
            ),
            align: 'center',
            width: 150,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Stock Actual</div>,
            dataIndex: "total_stock",
            key: "stock",
            align: "center",
            render: (totalStock) => (
                <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {totalStock || 0}
                </span>
            ),
            width: 140,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Reservado</div>,
            dataIndex: "reserved_stock",
            key: "reserved",
            align: "center",
            render: (reserved) => (
                <span style={{ color: "var(--error)", fontWeight: 600 }}>
                    {reserved || 0}
                </span>
            ),
            width: 140,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Disponible</div>,
            dataIndex: "available_stock",
            key: "available",
            align: "center",
            render: (available) => (
                <span style={{ color: "var(--success)", fontWeight: 600 }}>
                    {available || 0}
                </span>
            ),
            width: 140,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Estado</div>,
            dataIndex: "stock_status",
            key: "status",
            align: "center",
            render: (stockStatus) => {
                const statusConfig = {
                    "stock_normal": { color: "green", text: "Disponible" },
                    "stock_bajo": { color: "orange", text: "Bajo" },
                    "sin_stock": { color: "red", text: "Agotado" },
                };

                const config = statusConfig[stockStatus] || { color: "default", text: "Desconocido" };

                return (
                    <Tag
                        color={config.color}
                        style={{
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 500,
                            margin: 0
                        }}
                    >
                        {config.text}
                    </Tag>
                );
            },
            width: 130,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Acciones</div>,
            key: "actions",
            align: "center",
            render: (_, record) => (
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <Button
                        size="small"
                        style={{
                            background: "var(--primary-hover)",
                            border: "none",
                            color: "#fff",
                            borderRadius: 6,
                        }}
                        onClick={() => onMovementAction(record, "entrada")}
                    >
                        <Plus size={16} />
                    </Button>
                    <Button
                        size="small"
                        style={{
                            background: "var(--error)",
                            border: "none",
                            color: "#fff",
                            borderRadius: 6,
                        }}
                        onClick={() => onMovementAction(record, "salida")}
                    >
                        <Minus size={16} />
                    </Button>
                </div>
            ),
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
                },
            }}
        >
            <div className={styles.tableWrapper}>
                <div className={styles.searchBar}>
                    <Input
                        placeholder="Buscar por nombre, SKU o categoría..."
                        prefix={<Search size={16} color="var(--text-muted)" />}
                        className={styles.searchInput}
                        size="large"
                        onChange={(e) => onSearch(e.target.value)} // ✅ Ya está correcto
                        allowClear
                    />

                    <div className={styles.productCount}>
                        {/* ✅ CAMBIAR: mostrar total del backend, no displayData.length */}
                        {paginationData?.total || 0} productos
                    </div>
                </div>

                <div className={styles.tableHeader}>
                    Lista de Inventario
                </div>

                <div className={styles.tableContainer}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                        loading={loading}
                        className={styles.table}
                        rowClassName={styles.tableRow}
                        rowKey={(record) => `${record.product_id}-${record.warehouse_id}`}
                        scroll={{ x: 1000, y: 'calc(100vh - 400px)' }}
                        locale={{
                            emptyText: loading ? 'Cargando inventario...' : 'No se encontraron productos en inventario'
                        }}
                    />
                </div>

                {paginationData && (
                    <CustomPagination
                        total={paginationData.total || 0}
                        currentPage={filters.page}
                        perPage={filters.per_page}  // ✅ CAMBIAR: era filters.perPage
                        onPageChange={(page, pageSize) => onFilterChange(page, pageSize)}
                    />
                )}
            </div>
        </ConfigProvider>
    );
}