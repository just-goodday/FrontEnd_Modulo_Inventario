import { useState } from "react";
import styles from "./TransferModal.module.css";
import { Select, Input, ConfigProvider } from "antd";

export default function TransferModal({
    product,
    onClose,
    onSubmit
}) {

    const [form, setForm] = useState({
        warehouseFrom: product.warehouse,
        warehouseTo: null,
        quantity: "",
        reason: ""
    });

    const [hasChanges, setHasChanges] = useState(false);

    const handle = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleClose = () => {
        if (hasChanges) {
            if (!window.confirm("¿Seguro que deseas salir? Los cambios no se guardarán")) return;
        }
        onClose();
    };

    const submit = () => {
        onSubmit({
            ...form,
            product: product.product,
            sku: product.sku,
            stock: product.stock
        });
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Input: {
                        controlHeight: 42,
                        borderRadius: 10,
                        fontSize: 14,
                    },
                    Select: {
                        controlHeight: 42,
                        borderRadius: 10,
                        fontSize: 14,
                    }
                }
            }}
        >
            <div className={styles.container}>
                <div className={styles.modal}>

                    {/* HEADER */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.titleWrapper}>
                                <div className={styles.titleRow}>
                                    <h2 className={styles.title}>Trasladar Entre Almacenes</h2>
                                    {hasChanges && (
                                        <span className={styles.badge}>Sin guardar</span>
                                    )}
                                </div>
                                <p className={styles.subtitle}>
                                    Gestiona el traslado de productos entre almacenes
                                </p>
                            </div>
                        </div>
                        <button className={styles.closeButton} onClick={handleClose}>
                            ✕
                        </button>
                    </div>

                    {/* FORM */}
                    <div className={styles.formWrapper}>

                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Producto</label>
                                <div className={styles.infoBox}>{product.product}</div>
                            </div>

                            <div className={styles.col}>
                                <label>Cantidad Actual</label>
                                <div className={`${styles.infoBox} ${styles.infoGreen}`}>
                                    {product.stock}
                                </div>
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Almacén Inicial</label>
                                <Select
                                    value={form.warehouseFrom}
                                    onChange={(v) => handle("warehouseFrom", v)}
                                    style={{ width: "100%" }}
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    options={[
                                        { value: "Data Store Principal", label: "Data Store Principal" },
                                        { value: "Data Store Ciberplaza", label: "Data Store Ciberplaza" }
                                    ]}
                                />
                            </div>

                            <div className={styles.col}>
                                <label>Almacén Final</label>
                                <Select
                                    value={form.warehouseTo}
                                    onChange={(v) => handle("warehouseTo", v)}
                                    style={{ width: "100%" }}
                                    placeholder="Seleccionar almacén..."
                                    getPopupContainer={(trigger) => trigger.parentElement}
                                    options={[
                                        { value: "Data Store Principal", label: "Data Store Principal" },
                                        { value: "Data Store Ciberplaza", label: "Data Store Ciberplaza" }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label>Cantidad a trasladar *</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.quantity}
                                    onChange={(e) => handle("quantity", e.target.value)}
                                    placeholder="Ingrese cantidad..."
                                />
                            </div>

                            <div className={styles.col}>
                                <label>Motivo de traslado *</label>
                                <Input
                                    value={form.reason}
                                    onChange={(e) => handle("reason", e.target.value)}
                                    placeholder="Ej: Reposición..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className={styles.footer}>
                        <button className={styles.cancel} onClick={handleClose}>
                            Cancelar
                        </button>
                        <button className={styles.accept} onClick={submit}>
                            Aceptar
                        </button>
                    </div>

                </div>
            </div>
        </ConfigProvider>
    );
}