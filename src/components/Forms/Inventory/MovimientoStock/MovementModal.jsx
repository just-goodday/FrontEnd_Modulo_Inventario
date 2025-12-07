import { useState, useEffect } from "react";
import { Select, Input } from "antd";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import styles from "./MovementModal.module.css";

export default function MovementModal({
    mode = "create",
    initialData = null,
    products = [], // ✅ AGREGAR
    warehouses = [], // ✅ AGREGAR
    onSubmit,
    onClose
}) {

    const isEditMode = mode === "edit";

    const [form, setForm] = useState({
        product: initialData?.product || null,
        type: initialData?.type || null, // Cambiado a null
        warehouse: initialData?.warehouse || null,
        quantity: initialData?.quantity || "",
        note: initialData?.note || "",
    });

    const [errors, setErrors] = useState({});
    const [currentStock, setCurrentStock] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));
        setHasChanges(true);
    };

    const handleClose = () => {
        if (hasChanges) {
            if (!window.confirm("¿Seguro que deseas salir? Los cambios no se guardarán")) return;
        }
        onClose();
    };

    useEffect(() => {
        if (form.product && form.warehouse) {
            const mockStock = {
                "teclado-principal": 45,
                "laptop-principal": 8,
                "teclado-ciberplaza": 12,
                "laptop-ciberplaza": 22,
            };
            const key = `${form.product}-${form.warehouse}`;
            setCurrentStock(mockStock[key] || 0);
        } else {
            setCurrentStock(0);
        }
    }, [form.product, form.warehouse]);

    const validate = () => {
        const e = {};

        // ✅ Validar usando los IDs del initialData
        if (!initialData?.product_id && !form.product) {
            e.product = "Selecciona un producto";
        }

        if (!form.type) e.type = "Selecciona un tipo de movimiento";

        if (!initialData?.warehouse_id && !form.warehouse) {
            e.warehouse = "Selecciona un almacén";
        }

        if (!form.quantity || form.quantity <= 0) {
            e.quantity = "Cantidad no válida";
        } else if (form.type === "salida" && form.quantity > currentStock) {
            e.quantity = `Stock insuficiente (actual: ${currentStock})`;
        }

        if (!form.note.trim()) e.note = "Ingresa un motivo";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        onSubmit({
            product_id: initialData?.product_id || form.product, // ✅ Usar initialData si existe
            warehouse_id: initialData?.warehouse_id || form.warehouse, // ✅ Usar initialData si existe
            type: form.type,
            quantity: Number(form.quantity),
            note: form.note,
            sale_price: form.sale_price || null,
            profit_margin: form.profit_margin || null,
            min_sale_price: form.min_sale_price || null
        });
    };
    
    // Opciones para el select de tipo de movimiento
    const typeOptions = [
        {
            value: "entrada",
            label: (
                <div className={`${styles.option} ${styles.entrada}`}>
                    <ArrowUpRight size={16} className={styles.arrowEntrada} />
                    Entrada (Agregar Stock)
                </div>
            ),
        },
        {
            value: "salida",
            label: (
                <div className={`${styles.option} ${styles.salida}`}>
                    <ArrowDownLeft size={16} className={styles.arrowSalida} />
                    Salida (Reducir Stock)
                </div>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.modal}>

                {/* HEADER */}
                <div className={styles.header}>

                    <div className={styles.headerLeft}>
                        <div className={styles.titleWrapper}>
                            <div className={styles.titleRow}>
                                <h2 className={styles.title}>
                                    {isEditMode ? "Editar Movimiento de Stock" : "Registrar Movimiento de Stock"}
                                </h2>
                                {hasChanges && (
                                    <span className={styles.badge}>Sin guardar</span>
                                )}
                            </div>
                            <p className={styles.subtitle}>
                                Gestión en tiempo real de stock y movimientos
                            </p>
                        </div>
                    </div>

                    <button className={styles.closeButton} onClick={handleClose}>
                        ✕
                    </button>
                </div>

                {/* FORM CONTENT */}
                <div className={styles.formWrapper}>
                    <div className={styles.form}>

                        {/* PRODUCTO */}
                        <div className={styles.field}>
                            <label>Producto *</label>
                            <Select
                                placeholder="Seleccionar producto"
                                value={initialData?.productName || form.product} // ✅ Mostrar nombre si existe
                                onChange={v => handleChange("product", v)}
                                className={styles.select}
                                status={errors.product ? "error" : ""}
                                disabled={!!initialData?.product_id} // ✅ Deshabilitar si viene con datos
                                getPopupContainer={trigger => trigger.parentNode}
                                options={products.map(p => ({
                                    value: p.id,
                                    label: `${p.primary_name || p.name} (SKU: ${p.sku || 'N/A'})`
                                }))}
                                showSearch
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                            {errors.product && <p className={styles.errorText}>{errors.product}</p>}

                            {/* ✅ Mostrar info del producto si viene prellenado */}
                            {initialData?.productName && (
                                <p className={styles.infoText}>
                                    Producto seleccionado: <strong>{initialData.productName}</strong>
                                </p>
                            )}
                        </div>

                        {/* TIPO */}
                        <div className={styles.field}>
                            <label>Tipo de Movimiento *</label>
                            <Select
                                placeholder="Seleccionar tipo de movimiento"
                                value={form.type}
                                onChange={v => handleChange("type", v)}
                                className={styles.select}
                                status={errors.type ? "error" : ""}
                                getPopupContainer={trigger => trigger.parentNode}
                                options={typeOptions}
                            />
                            {errors.type && <p className={styles.errorText}>{errors.type}</p>}
                        </div>

                        {/* ALMACEN */}
                        <div className={styles.field}>
                            <label>Almacén *</label>
                            <Select
                                placeholder="Seleccionar almacén"
                                value={initialData?.warehouseName || form.warehouse} // ✅ Mostrar nombre si existe
                                onChange={v => handleChange("warehouse", v)}
                                className={styles.select}
                                status={errors.warehouse ? "error" : ""}
                                disabled={!!initialData?.warehouse_id} // ✅ Deshabilitar si viene con datos
                                getPopupContainer={trigger => trigger.parentNode}
                                options={warehouses.map(w => ({
                                    value: w.id,
                                    label: w.name
                                }))}
                            />
                            {errors.warehouse && <p className={styles.errorText}>{errors.warehouse}</p>}

                            {/* ✅ Mostrar info del almacén si viene prellenado */}
                            {initialData?.warehouseName && (
                                <p className={styles.infoText}>
                                    Almacén seleccionado: <strong>{initialData.warehouseName}</strong>
                                </p>
                            )}
                        </div>

                        {/* CANTIDAD */}
                        <div className={styles.field}>
                            <label>Cantidad *</label>
                            <Input
                                type="number"
                                min={1}
                                className={styles.full}
                                placeholder="0"
                                value={form.quantity}
                                onChange={e => handleChange("quantity", e.target.value)}
                                status={errors.quantity ? "error" : ""}
                            />
                            {errors.quantity && <p className={styles.errorText}>{errors.quantity}</p>}
                        </div>

                        <p className={styles.stockText}>
                            Stock actual: <strong>{currentStock}</strong> unidades
                        </p>

                        {/* MOTIVO */}
                        <div className={styles.field}>
                            <label>Motivo / Observación *</label>
                            <Input.TextArea
                                rows={5}
                                placeholder="Ej: Compra a proveedor..."
                                value={form.note}
                                onChange={e => handleChange("note", e.target.value)}
                                status={errors.note ? "error" : ""}
                            />
                            {errors.note && <p className={styles.errorText}>{errors.note}</p>}
                        </div>
                    </div>

                    {/* FOOTER */}
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
                            onClick={handleSubmit}
                        >
                            {isEditMode ? "Actualizar Movimiento" : "Registrar Movimiento"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}