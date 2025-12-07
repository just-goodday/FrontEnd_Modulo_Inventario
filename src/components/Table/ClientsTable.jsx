import React from "react";
import { Table, ConfigProvider, Input, Button, Tag, Space } from "antd";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import CustomPagination from "./Pagination/Pagination";
import styles from "./Table.module.css";

export default function ClientsTable({
    mode = "clientes",
    data = [],
    totalCount = 0,
    loading = false,
    onSearch,

    // PAGINACIÓN EXACTAMENTE COMO INVENTARIO
    paginationData,
    filters,
    onFilterChange,

    // Acciones
    onView,
    onEdit,
    onDelete,
}) {


    const center = (text) => (
        <div style={{ textAlign: "center", width: "100%" }}>
            {text}
        </div>
    );


    // ====================================================
    // 1️⃣ COLUMNAS PARA CLIENTES
    // ====================================================
    const columnsClientes = [
        {
            title: "Nombre / Razón Social",
            dataIndex: "name",
            render: (text) => <strong>{text}</strong>,
            width: 300,
        },
        {
            title: "Documento",
            dataIndex: "document",
            width: 180,
        },
        {
            title: "Contacto",
            dataIndex: "email",
            render: (_, r) => (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {r.email ?? "-"}
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {r.phone ?? ""}
                    </span>
                </div>
            ),
            width: 150,
        },
        {
            title: "Clasificación",
            dataIndex: "status",
            align: "center",
            render: (s) => {
                const colors = {
                    Nuevo: "green",
                    Recurrente: "blue",
                    VIP: "gold",
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            },
            width: 140,
        },
        {
            title: "Monto total",
            dataIndex: "total",
            align: "center",
            width: 140,
        },
        {
            title: "Última compra",
            dataIndex: "lastPurchase",
            align: "center",
            width: 140,
        },
    ];

    // ====================================================
    // 2️⃣ COLUMNAS PARA PROVEEDORES
    // ====================================================
    const columnsProveedores = [
        {
            title: "Razón Social",
            dataIndex: "name",
            render: (text) => <strong>{text}</strong>,
            width: 240,
        },
        {
            title: "Documento",
            dataIndex: "document",
            width: 150,
        },
        {
            title: "Total de compra",
            dataIndex: "purchases",
            align: "center",
            width: 120,
        },
        {
            title: "Estado",
            dataIndex: "status",
            align: "center",
            render: (s) => {
                const colors = {
                    Pagado: "green",
                    Parcial: "gold",
                    Pendiente: "red",
                };
                return <Tag color={colors[s]}>{s}</Tag>;
            },
            width: 120,
        },
        {
            title: "Monto total",
            dataIndex: "total",
            align: "center",
            width: 120,
        },
        {
            title: "Última compra",
            dataIndex: "lastPurchase",
            align: "center",
            width: 130,
        },
    ];

    // ====================================================
    // 3️⃣ ACCIONES PARA AMBOS
    // ====================================================
    const actionsColumn = {
        title: <div style={{ textAlign: 'center' }}>Acciones</div>,
        key: 'actions',
        render: (_, record) => (
            <Space size="small">
                <Button
                    type="text"
                    icon={<Eye size={16} color="var(--primary)" />}
                    size="small"
                    title="Ver detalle"
                    onClick={() => onView?.(record)}
                />
                <Button
                    type="text"
                    icon={<Pencil size={16} color="var(--warning)" />}
                    size="small"
                    title="Editar"
                    onClick={() => onEdit?.(record)}
                />
                <Button
                    type="text"
                    icon={<Trash2 size={16} color="var(--error)" />}
                    size="small"
                    title="Eliminar"
                    onClick={() => onDelete?.(record)}
                />
            </Space>
        ),
        align: 'center',
        width: 160,
    };

    // ====================================================
    // 4️⃣ COLUMAN FINAL DINÁMICA
    // ====================================================
    const finalColumns =
        mode === "clientes"
            ? [...columnsClientes, actionsColumn]
            : [...columnsProveedores, actionsColumn];

    // Título dinámico
    const title =
        mode === "clientes" ? "Lista de Clientes" : "Lista de Proveedores";

    // ====================================================
    // 5️⃣ RENDER
    // ====================================================
    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        headerBg: "var(--bg-secondary)",
                        headerColor: "var(--text-secondary)",
                        colorBgContainer: "var(--card)",
                        borderColor: "var(--border)",
                        rowHoverBg: "var(--overlay-subtle)",
                    },
                },
            }}
        >
            <div className={styles.tableWrapper}>
                {/* SEARCH */}
                <div className={styles.searchBar}>
                    <Input
                        placeholder="Buscar..."
                        prefix={<Search size={16} color="var(--text-muted)" />}
                        className={styles.searchInput}
                        size="large"
                        onChange={(e) => onSearch?.(e.target.value)}
                        allowClear
                    />

                    <div className={styles.productCount}>
                        {totalCount} registros
                    </div>
                </div>

                {/* HEADER */}
                <div className={styles.tableHeader}>{title}</div>

                {/* TABLE */}
                <div className={styles.tableContainer}>
                    <Table
                        columns={finalColumns}
                        dataSource={data.map((item) => ({ ...item, key: item.id }))}
                        pagination={false}
                        loading={loading}
                        className={styles.table}
                        rowClassName={styles.tableRow}
                        scroll={{ x: 1000 }}
                    />
                </div>

                {/* PAGINACIÓN EXACTA INVENTARIO */}
                {paginationData && (
                    <CustomPagination
                        total={paginationData.total || 0}
                        currentPage={filters.page}
                        perPage={filters.per_page}
                        onPageChange={(page, pageSize) =>
                            onFilterChange(page, pageSize)
                        }
                    />
                )}
            </div>
        </ConfigProvider>
    );
}
