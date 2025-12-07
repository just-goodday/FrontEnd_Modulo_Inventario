import React, { useState, useEffect, useRef } from "react";
import PageHeader from "../../../components/Header/PageHeader/PageHeader";
import { StatsCardGrid } from "../../../components/StatsCards/StatCard";
import { Tabs, Select, DatePicker } from "antd";
import ClientTable from "../../../components/Table/ClientsTable";
import ClientsModal from "../../../components/Forms/Clients/ClientsModal";
import { useCustomers, useSuppliers } from "../hook/clientHook";
import styles from "./ClientsList.module.css";

export default function ClientsList() {

    const [tab, setTab] = useState("clientes");
    const [openClientModal, setOpenClientModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    // HOOK CLIENTES
    const {
        customers,
        paginationData: customerPagination,
        loading: loadingCustomers,
        fetchCustomers,
        addCustomer,
    } = useCustomers();

    // HOOK PROVEEDORES
    const {
        suppliers,
        paginationData: supplierPagination,
        loading: loadingSuppliers,
        fetchSuppliers,
        addSupplier
    } = useSuppliers();

    // QUÉ TAB ESTÁ ACTIVO
    const isCustomerTab = tab === "clientes";
    const activeData = isCustomerTab ? customers : suppliers;
    const activePagination = isCustomerTab ? customerPagination : supplierPagination;
    const activeLoading = isCustomerTab ? loadingCustomers : loadingSuppliers;
    const fetchData = isCustomerTab ? fetchCustomers : fetchSuppliers;

    const didInit = useRef(false);
    const searchTimeout = useRef(null);

    // FILTROS
    const [filters, setFilters] = useState({
        page: 1,
        per_page: 10,
        tipo_documento: null,
        is_active: null,
        search: "",
        registered_from: null,
        registered_to: null
    });

    // FUNCIÓN CENTRAL DE FETCH
    const loadData = async () => {
        try {
            await fetchData({
                search: filters.search,
                per_page: filters.per_page,
                page: filters.page,
                tipo_documento: filters.tipo_documento,
                is_active: filters.is_active,
                registered_from: filters.registered_from,
                registered_to: filters.registered_to
            });
        } catch (error) {
            console.error("❌ Error cargando datos:", error);
        }
    };

    // 1) PRIMERA CARGA (solo clientes)
    useEffect(() => {
        const init = async () => {
            await loadData();       // 1️⃣ Primero carga
            didInit.current = true; // 2️⃣ Luego activa didInit
        };

        init();
    }, []);

    // 2) CAMBIO DE TAB o FILTROS
    useEffect(() => {
        if (!didInit.current) return;

        const delay = filters.search ? 300 : 0;
        const timer = setTimeout(() => loadData(), delay);

        return () => clearTimeout(timer);

    }, [
        tab,
        filters.page,
        filters.per_page,
        filters.search,
        filters.tipo_documento,
        filters.is_active,
        filters.registered_from,
        filters.registered_to
    ]);

    // HANDLERS DE FILTROS
    const handleSearch = (text) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                search: text,
                page: 1
            }));
        }, 500); // 400–500ms es estándar
    };

    const handlePageChange = (page, pageSize) =>
        setFilters(prev => ({ ...prev, page, per_page: pageSize }));

    const handleDocumentTypeFilter = (value) =>
        setFilters(prev => ({ ...prev, tipo_documento: value, page: 1 }));

    const handleStatusFilter = (value) =>
        setFilters(prev => ({
            ...prev,
            is_active: value,
            page: 1
        }));

    const handleEdit = (row) => {
        // row.id viene del map de tabla
        const original = isCustomerTab
            ? customers.find(c => c.id === row.id)
            : suppliers.find(s => s.id === row.id);

        setSelectedClient(original);
        setOpenClientModal(true);
    };



    // FORMATO DE TABLA
    const formatCustomers = () =>
        customers.map(c => ({
            id: c.id,
            name: c.full_name ||
                c.business_name ||
                `${c.first_name || ""} ${c.last_name || ""}`.trim() ||
                "Sin nombre",
            document: c.numero_documento || "",
            email: c.email || "-",
            phone: c.phone || "-",
            status: c.is_active ? "Activo" : "Inactivo",
            classification: "Cliente",
            total: "S/. 0",
            lastPurchase: "-"
        }));

    const formatSuppliers = () =>
        suppliers.map(s => ({
            id: s.id,
            name: s.full_name || s.trade_name || s.business_name || "Sin nombre",
            document: s.numero_documento || "",
            email: s.email || "-",
            phone: s.phone || "-",
            status: s.is_active ? "Activo" : "Inactivo",
            classification: "Proveedor",
            total: "S/. 0",
            lastPurchase: "-"
        }));

    // ESTADISTICAS
    const clientStats = [
        {
            title: "Total Registros",
            value: activePagination?.total || 0,
            icon: "Users",
            iconBgColor: "var(--primary)"
        },
        {
            title: "Activos",
            value: activeData.filter(x => x.is_active).length,
            icon: "Activity",
            iconBgColor: "#7bd707"
        },
        {
            title: "Inactivos",
            value: activeData.filter(x => !x.is_active).length,
            icon: "XCircle",
            iconBgColor: "var(--error)"
        },
        {
            title: isCustomerTab ? "Proveedores" : "Clientes",
            value: isCustomerTab ? suppliers.length : customers.length,
            icon: "Truck",
            iconBgColor: "#fbb500"
        }
    ];

    // OPCIONES:
    const statusOptions = isCustomerTab
        ? [
            { value: "nuevo", label: "Nuevo" },
            { value: "recurrente", label: "Recurrente" },
            { value: "vip", label: "VIP" }
        ]
        : [
            { value: "pagado", label: "Pagado" },
            { value: "pendiente", label: "Pendiente" },
            { value: "parcial", label: "Parcial" }
        ];



    return (
        <>
            <PageHeader
                title="Control de Clientes y Proveedores"
                subtitle="Gestiona tu cartera de clientes"
                actions={[
                    { label: "Sincronizar ERP", icon: "RefreshCw" },
                    { label: "Exportar", icon: "Download" },
                    {
                        label: "Nuevo",
                        icon: "Plus",
                        type: "primary",
                        onClick: () => setOpenClientModal(true)
                    }
                ]}
            />

            <StatsCardGrid stats={clientStats} columns={4} />

            {/* TABS + FILTROS */}
            <div style={{ marginTop: 20 }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: 0
                }}>
                    <Tabs
                        activeKey={tab}
                        onChange={setTab}
                        items={[
                            { key: "clientes", label: "Clientes" },
                            { key: "proveedores", label: "Proveedores" }
                        ]}
                        className={styles.customTabs}
                    />

                    <div style={{ display: "flex", gap: 12, paddingBottom: 8 }}>
                        <Select
                            placeholder="Tipo documento"
                            style={{ width: 160 }}
                            allowClear
                            value={filters.tipo_documento}
                            onChange={handleDocumentTypeFilter}
                            options={[
                                { value: "01", label: "DNI" },
                                { value: "06", label: "RUC" },
                                { value: "07", label: "Carnet Extranjería" }
                            ]}
                        />

                        <Select
                            placeholder={isCustomerTab ? "Clasificación" : "Estado de Pago"}
                            style={{ width: 160 }}
                            allowClear
                            value={filters.status}
                            onChange={(value) => {
                                setFilters(prev => ({
                                    ...prev,
                                    status: value,
                                    page: 1
                                }));
                            }}
                            options={statusOptions}
                        />

                        <DatePicker
                            placeholder="Fecha"
                            style={{ width: 150 }}
                            format="DD/MM/YYYY"
                            onChange={(date) => {
                                setFilters(prev => ({
                                    ...prev,
                                    registered_from: date ? date.format("YYYY-MM-DD") : null,
                                    registered_to: date ? date.format("YYYY-MM-DD") : null,
                                    page: 1
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* TABLA */}
            <div style={{ marginTop: 24 }}>
                <ClientTable
                    mode={tab}
                    data={isCustomerTab ? formatCustomers() : formatSuppliers()}
                    totalCount={activePagination?.total || 0}
                    loading={activeLoading}
                    onSearch={handleSearch}
                    paginationData={activePagination}
                    filters={filters}
                    onFilterChange={handlePageChange}
                    onEdit={handleEdit}
                />
            </div>

            {/* MODAL */}
            {openClientModal && (
                <ClientsModal
                    initialData={selectedClient}
                    onClose={() => {
                        setOpenClientModal(false);
                        setSelectedClient(null);
                    }}
                    onSubmit={async (data) => {

                        console.log("DATA RECIBIDA DEL MODAL:", data);

                        const tipoDocumentoMap = {
                            DNI: "01",
                            RUC: "06",
                            CE: "07",
                        };

                        // ================================
                        // ⭐ BASE DEL PAYLOAD
                        // ================================
                        const basePayload = {
                            tipo_documento: tipoDocumentoMap[data.documentType] || null,
                            numero_documento: data.documentNumber,
                            email: data.email || null,
                            phone: data.phone || null,
                            address: data.address || null,
                            is_active: true,
                            registered_at: new Date().toISOString().slice(0, 19).replace("T", " "),
                            default_address: null,
                            user_id: null,
                        };

                        // ============================================================
                        // 🚀 SI ES CLIENTE → payload tipo "customer"
                        // ============================================================
                        if (data.type === "cliente") {

                            const payload = {
                                ...basePayload,
                                type: "customer",
                            };

                            if (data.documentType !== "RUC") {
                                payload.tipo_persona = "natural";
                                const parts = data.fullName.trim().split(" ");
                                payload.first_name = parts.shift();
                                payload.last_name = parts.join(" ") || "";
                            } else {
                                payload.tipo_persona = "juridica";
                                payload.business_name = data.businessName;
                                payload.trade_name = data.socialReason;
                            }

                            console.log("PAYLOAD CUSTOMER:", payload);

                            // 🚀 AQUI CAMBIA
                            if (data.id) {
                                await updateCustomer(data.id, payload);  // EDITAR
                            } else {
                                await addCustomer(payload);               // CREAR
                            }

                            return;
                        }

                        // ============================================================
                        // 🚀 SI ES PROVEEDOR → payload tipo "supplier"
                        // ============================================================
                        if (data.type === "proveedor") {

                            const payload = {
                                ...basePayload,
                                type: "supplier",
                                tipo_persona: "juridica",
                                business_name: data.businessName,
                                trade_name: data.socialReason,
                                first_name: data.businessName,
                                last_name: data.socialReason || data.businessName,
                            };

                            console.log("PAYLOAD SUPPLIER FINAL:", payload);

                            // 🚀 AQUI CAMBIA
                            if (data.id) {
                                await updateSupplier(data.id, payload);  // EDITAR
                            } else {
                                await addSupplier(payload);              // CREAR
                            }

                            return;
                        }

                    }}
                />


            )}
        </>
    );
}
