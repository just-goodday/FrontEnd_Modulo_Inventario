import { useState } from "react";
import styles from "./MovementHistoryModal.module.css";
import { DatePicker, ConfigProvider, Empty } from "antd";
import { ArrowLeft, X, Calendar } from "lucide-react";

const { RangePicker } = DatePicker;

export default function MovementHistoryModal({
    movements = [],
    onClose,
    onBack
}) {
    const [dateRange, setDateRange] = useState(null);

    // Filtro por fecha
    const filteredMovements = dateRange
        ? movements.filter(mov => {
            // Aquí puedes implementar la lógica de filtrado por fecha
            return true;
        })
        : movements;

    return (
        <ConfigProvider
            theme={{
                components: {
                    DatePicker: {
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
                        <button className={styles.backButton} onClick={onBack}>
                            <ArrowLeft size={20} />
                        </button>

                        <div className={styles.headerCenter}>
                            <h2 className={styles.title}>Historial de Movimientos</h2>
                            <p className={styles.subtitle}>
                                Lista completa de movimientos del producto
                            </p>
                        </div>

                        <button className={styles.closeButton} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* FILTRO DE FECHA */}
                    <div className={styles.filterWrapper}>
                        <div className={styles.filterLabel}>
                            <Calendar size={16} />
                            <span>Filtrar por fecha</span>
                        </div>
                        <RangePicker
                            onChange={(value) => setDateRange(value)}
                            className={styles.datePicker}
                            allowClear
                            placeholder={["Fecha inicio", "Fecha fin"]}
                            format="DD/MM/YYYY"
                            getPopupContainer={(trigger) => document.body}
                        />
                    </div>

                    {/* LISTA SCROLLEABLE */}
                    <div className={styles.listContainer}>
                        {filteredMovements.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Empty
                                    description="No hay movimientos registrados"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </div>
                        ) : (
                            filteredMovements.map((mov) => (
                                <div key={mov.id} className={styles.movementCard}>
                                    
                                    <div className={styles.left}>
                                        <span
                                            className={`${styles.badge} ${
                                                styles[mov.type]
                                            }`}
                                        >
                                            {mov.status}
                                        </span>

                                        <div className={styles.info}>
                                            <span className={styles.movementTitle}>
                                                {mov.title}
                                            </span>
                                            <span className={styles.movementDate}>
                                                {mov.date}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.right}>
                                        <span
                                            className={`${styles.quantity} ${
                                                mov.quantity > 0 ? styles.positive : styles.negative
                                            }`}
                                        >
                                            {mov.quantity > 0 ? "+" : ""}
                                            {mov.quantity}
                                        </span>
                                        <span className={styles.unit}>Unidades</span>
                                    </div>

                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </ConfigProvider>
    );
}