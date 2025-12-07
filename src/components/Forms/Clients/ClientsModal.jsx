import { useState, useEffect } from "react";
import { Select, Input, ConfigProvider, theme } from "antd";
import styles from "./ClientsModal.module.css";

export default function ClientsModal({
    open = true,
    onClose,
    onSubmit,
    initialData = null,
}) {
    const [tab, setTab] = useState("cliente");

    // Obtén el color CSS personalizado
    const getCSSVariable = (variableName) => {
        return getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim();
    };

    // Configuración de tema personalizado
    const customTheme = {
        token: {
            colorBgContainer: getCSSVariable('--bg-secondary'),
            colorBorder: getCSSVariable('--border'),
            colorPrimary: getCSSVariable('--primary'),
            colorText: getCSSVariable('--text'),
            colorTextPlaceholder: getCSSVariable('--text-tertiary'),
            controlOutline: `${getCSSVariable('--primary-light')}40`, // 25% opacity
            borderRadius: 8,
        },
        components: {
            Input: {
                hoverBorderColor: getCSSVariable('--primary'),
                activeBorderColor: getCSSVariable('--primary'),
                activeShadow: `0 0 0 2px ${getCSSVariable('--primary-light')}`,
            },
            Select: {
                selectorBg: getCSSVariable('--bg-secondary'),
                hoverBorderColor: getCSSVariable('--primary'),
                activeBorderColor: getCSSVariable('--primary'),
                activeShadow: `0 0 0 2px ${getCSSVariable('--primary-light')}`,
            },
        },
    };

    // ================================
    // ⭐ FORM STATE (igual que antes)
    // ================================
    const [form, setForm] = useState({
        documentType: "",
        documentNumber: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        classification: "",
        businessName: "",
        socialReason: "",
    });

    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // ================================
    // ⭐ UPDATE FIELD
    // ================================
    const update = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: null }));
        setHasChanges(true);
    };

    // ================================
    // ⭐ CLOSE WITH CONFIRMATION
    // ================================
    const handleClose = () => {
        if (hasChanges) {
            if (!window.confirm("¿Seguro que deseas salir? Los cambios no se guardarán"))
                return;
        }
        onClose?.();
    };

    // ================================
    // ⭐ EFFECT
    // ================================

    useEffect(() => {
        if (!initialData) return;

        setHasChanges(false); // para que no aparezca el badge "sin guardar"

        setForm({
            documentType:
                initialData.tipo_documento === "01" ? "DNI" :
                initialData.tipo_documento === "06" ? "RUC" :
                initialData.tipo_documento === "07" ? "CE" : "",

            documentNumber: initialData.numero_documento || "",
            fullName: [initialData.first_name, initialData.last_name].filter(Boolean).join(" "),

            businessName: initialData.business_name || "",
            socialReason: initialData.trade_name || "",

            email: initialData.email || "",
            phone: initialData.phone || "",
            address: initialData.address || "",
            classification: initialData.classification || "",
        });

        setTab(initialData.type === "supplier" ? "proveedor" : "cliente");

    }, [initialData]);



    // ================================
    // ⭐ VALIDATION
    // ================================
    const validate = () => {
        const e = {};

        if (!form.documentType) e.documentType = "Selecciona un tipo de documento";
        if (!form.documentNumber) e.documentNumber = "Ingresa el número de documento";

        if (tab === "cliente" && form.documentType !== "RUC") {
            if (!form.fullName.trim()) {
                e.fullName = "Ingresa el nombre completo";
            } else {
                const parts = form.fullName.trim().split(" ");
                if (parts.length < 2) {
                    e.fullName = "Debes ingresar nombre y apellido";
                }
            }
        }

        if (tab === "cliente" && form.documentType === "RUC") {
            if (!form.businessName.trim()) e.businessName = "Ingresa el nombre comercial";
            if (!form.socialReason.trim()) e.socialReason = "Ingresa la razón social";
        }

        if (tab === "proveedor") {
            if (!form.businessName.trim()) e.businessName = "Ingresa el nombre comercial";
            if (!form.socialReason.trim()) e.socialReason = "Ingresa la razón social";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;

        onSubmit?.({
            ...form,
            type: tab,
            id: initialData?.id || null,
        });

        onClose?.();
    };

    return (
        <ConfigProvider theme={customTheme}>
            <div className={styles.container}>
                <div className={styles.modal}>

                    {/* ================= HEADER ================= */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.titleWrapper}>
                                <div className={styles.titleRow}>
                                    <h2 className={styles.title}>{initialData ? "Editar Registro" : "Crear Nuevo"}</h2>

                                    {/* 🔥 Badge "Sin guardar" */}
                                    {hasChanges && (
                                        <span className={styles.badge}>Sin guardar</span>
                                    )}
                                </div>

                                <p className={styles.subtitle}>
                                    Gestión de clientes y proveedores
                                </p>
                            </div>
                        </div>

                        <button className={styles.closeButton} onClick={handleClose}>
                            ✕
                        </button>
                    </div>

                    {/* ================= TABS ================= */}
                    <div className={styles.tabsWrapper}>
                        <div className={styles.tabsContainer}>
                            <button
                                type="button"
                                className={tab === "cliente" ? styles.activeTab : styles.inactiveTab}
                                onClick={() => setTab("cliente")}
                            >
                                Cliente
                            </button>

                            <button
                                type="button"
                                className={tab === "proveedor" ? styles.activeTab : styles.inactiveTab}
                                onClick={() => setTab("proveedor")}
                            >
                                Proveedor
                            </button>
                        </div>
                    </div>

                    {/* ================= FORM WRAPPER (SCROLL) ================= */}
                    <div className={styles.formWrapper}>
                        <div className={styles.form}>

                            {/* TIPOS DE DOC + NÚMERO (2 COLUMNAS) */}
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label>Tipo de documento *</label>
                                    <Select
                                        placeholder="Seleccione"
                                        size="large"
                                        value={form.documentType || undefined}
                                        onChange={(v) => update("documentType", v)}
                                        className="custom-select"
                                        getPopupContainer={trigger => trigger.parentNode}
                                        options={[
                                            { value: "DNI", label: "DNI" },
                                            { value: "RUC", label: "RUC" },
                                            { value: "CE", label: "Carnet Extranjería" },
                                        ]}
                                    />
                                    {errors.documentType && (
                                        <p className={styles.errorText}>{errors.documentType}</p>
                                    )}
                                </div>

                                <div className={styles.field}>
                                    <label>Número de Documento *</label>
                                    <Input
                                        placeholder="00000000"
                                        size="large"
                                        value={form.documentNumber}
                                        onChange={(e) => update("documentNumber", e.target.value)}
                                        className="custom-input"
                                    />
                                    {errors.documentNumber && (
                                        <p className={styles.errorText}>{errors.documentNumber}</p>
                                    )}
                                </div>
                            </div>

                            {/* ==================== CLIENTE - DNI ==================== */}
                            {tab === "cliente" && form.documentType !== "RUC" && (
                                <div className={styles.field} key="fullName">
                                    <label>Nombre Completo *</label>
                                    <Input
                                        placeholder="Ej: Juan Pérez García"
                                        size="large"
                                        value={form.fullName}
                                        onChange={(e) => update("fullName", e.target.value)}
                                        className="custom-input"
                                    />
                                    {errors.fullName && (
                                        <p className={styles.errorText}>{errors.fullName}</p>
                                    )}
                                </div>
                            )}

                            {/* ==================== CLIENTE - RUC ==================== */}
                            {tab === "cliente" && form.documentType === "RUC" && (
                                <>
                                    <div className={styles.field} key="businessName">
                                        <label>Nombre Comercial *</label>
                                        <Input
                                            placeholder="Ej: Comercial XYZ"
                                            size="large"
                                            value={form.businessName}
                                            onChange={(e) => update("businessName", e.target.value)}
                                            className="custom-input"
                                        />
                                        {errors.businessName && (
                                            <p className={styles.errorText}>{errors.businessName}</p>
                                        )}
                                    </div>

                                    <div className={styles.field} key="socialReason">
                                        <label>Razón Social *</label>
                                        <Input
                                            placeholder="Ej: EMPRESA SAC"
                                            size="large"
                                            value={form.socialReason}
                                            onChange={(e) => update("socialReason", e.target.value)}
                                            className="custom-input"
                                        />
                                        {errors.socialReason && (
                                            <p className={styles.errorText}>{errors.socialReason}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* ==================== PROVEEDOR ==================== */}
                            {tab === "proveedor" && (
                                <>
                                    <div className={styles.field} key="businessNameProv">
                                        <label>Nombre Comercial *</label>
                                        <Input
                                            placeholder="Ej: Comercial XYZ"
                                            size="large"
                                            value={form.businessName}
                                            onChange={(e) => update("businessName", e.target.value)}
                                            className="custom-input"
                                        />
                                        {errors.businessName && (
                                            <p className={styles.errorText}>{errors.businessName}</p>
                                        )}
                                    </div>

                                    <div className={styles.field} key="socialReasonProv">
                                        <label>Razón Social *</label>
                                        <Input
                                            placeholder="Ej: EMPRESA SAC"
                                            size="large"
                                            value={form.socialReason}
                                            onChange={(e) => update("socialReason", e.target.value)}
                                            className="custom-input"
                                        />
                                        {errors.socialReason && (
                                            <p className={styles.errorText}>{errors.socialReason}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* EMAIL + PHONE (2 COLUMNAS) */}
                            <div className={styles.fieldRow}>
                                <div className={styles.field}>
                                    <label>Email</label>
                                    <Input
                                        placeholder="cliente@email.com"
                                        size="large"
                                        value={form.email}
                                        onChange={(e) => update("email", e.target.value)}
                                        className="custom-input"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Teléfono</label>
                                    <Input
                                        placeholder="999 999 999"
                                        size="large"
                                        value={form.phone}
                                        onChange={(e) => update("phone", e.target.value)}
                                        className="custom-input"
                                    />
                                </div>
                            </div>

                            {/* DIRECCIÓN (Textarea) */}
                            <div className={styles.field}>
                                <label>Dirección</label>
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Dirección completa del cliente"
                                    value={form.address}
                                    onChange={(e) => update("address", e.target.value)}
                                    className="custom-textarea"
                                />
                            </div>

                            {/* CLASIFICACIÓN SOLO CLIENTE */}
                            {tab === "cliente" && (
                                <div className={styles.field}>
                                    <label>Clasificación</label>
                                    <Select
                                        placeholder="Seleccione"
                                        size="large"
                                        value={form.classification || undefined}
                                        onChange={(v) => update("classification", v)}
                                        className="custom-select"
                                        getPopupContainer={trigger => trigger.parentNode}
                                        options={[
                                            { value: "Nuevo", label: "Nuevo" },
                                            { value: "Recurrente", label: "Recurrente" },
                                            { value: "VIP", label: "VIP" },
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className={styles.formFooter}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={handleClose}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleSave}
                            >
                                {initialData ? "Guardar Cambios" : tab === "cliente" ? "Crear Cliente" : "Crear Proveedor"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
}