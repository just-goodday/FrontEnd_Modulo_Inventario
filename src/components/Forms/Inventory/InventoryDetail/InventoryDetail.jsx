import { useState } from "react";
import styles from "./InventoryDetail.module.css";
import { ConfigProvider, Button } from "antd";
import { History, Package, Eye } from "lucide-react";
import MovementHistoryModal from "./MovementHistoryModal";


export default function InventoryDetail({
    product,
    onClose,
    onShowHistory 
}) {
    // Datos mock de movimientos
    const movements = [
        {
            id: 1,
            type: "salida",
            title: "Intervención de la Sunat",
            date: "11 nov. 2025, 04:28 p. m.",
            quantity: -70,
            status: "Salida"
        },
        {
            id: 2,
            type: "entrada",
            title: "Compra",
            date: "7 nov. 2025, 05:29 p. m.",
            quantity: 45,
            status: "Entrada"
        },
        {
            id: 1,
            type: "salida",
            title: "Intervención de la Sunat",
            date: "11 nov. 2025, 04:28 p. m.",
            quantity: -70,
            status: "Salida"
        },
        {
            id: 2,
            type: "entrada",
            title: "Compra",
            date: "7 nov. 2025, 05:29 p. m.",
            quantity: 45,
            status: "Entrada"
        },
        {
            id: 1,
            type: "salida",
            title: "Intervención de la Sunat",
            date: "11 nov. 2025, 04:28 p. m.",
            quantity: -70,
            status: "Salida"
        },
        {
            id: 2,
            type: "entrada",
            title: "Compra",
            date: "7 nov. 2025, 05:29 p. m.",
            quantity: 45,
            status: "Entrada"
        },
        {
            id: 1,
            type: "salida",
            title: "Intervención de la Sunat",
            date: "11 nov. 2025, 04:28 p. m.",
            quantity: -70,
            status: "Salida"
        },
        {
            id: 2,
            type: "entrada",
            title: "Compra",
            date: "7 nov. 2025, 05:29 p. m.",
            quantity: 45,
            status: "Entrada"
        }
    ];

    const [showAllMovements, setShowAllMovements] = useState(false);
    const displayedMovements = showAllMovements ? movements : movements.slice(0, 2);
    const [showHistory, setShowHistory] = useState(false);


    return (
        <ConfigProvider
            theme={{
                components: {
                    Button: {
                        controlHeight: 36,
                        borderRadius: 8,
                        fontSize: 14,
                    }
                }
            }}
        >
            <div className={styles.container}>
                <div className={styles.modal}>

                    {/* HEADER */}
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.title}>Detalle de Inventario</h2>
                            <p className={styles.subtitle}>
                                Información completa del producto en inventario
                            </p>
                        </div>
                        <button className={styles.closeButton} onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    {/* CONTENT */}
                    <div className={styles.content}>

                        {/* Nombre del producto y SKU */}
                        <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{product.product}</h3>
                            <p className={styles.productSku}>{product.sku}</p>
                        </div>

                        {/* Grid: Imagen + Stats */}
                        <div className={styles.mainGrid}>

                            {/* Imagen del producto */}
                            <div className={styles.imageBox}>
                                {product.image ? (
                                    <img src={product.image} alt={product.product} />
                                ) : (
                                    <div className={styles.imagePlaceholder}>
                                        <Package size={48} color="var(--text-secondary)" />
                                    </div>
                                )}
                            </div>

                            {/* Stats del producto */}
                            <div className={styles.statsContainer}>
                                <div className={styles.warehouseLabel}>
                                    Almacén: {product.warehouse}
                                </div>

                                {/* Stock Disponible - destacado */}
                                <div className={styles.mainStat}>
                                    <span className={styles.mainStatLabel}>Stock Disponible</span>
                                    <span className={styles.mainStatValue}>{product.stock}</span>
                                </div>

                                {/* Reservado */}
                                <div className={styles.secondaryStat}>
                                    <span className={styles.statLabel}>Reservado</span>
                                    <span className={styles.statValue}>{product.reserved}</span>
                                </div>

                                {/* Disponible */}
                                <div className={styles.secondaryStat}>
                                    <span className={styles.statLabel}>Disponible</span>
                                    <span className={`${styles.statValue} ${styles.available}`}>
                                        {product.available}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sección de Movimientos */}
                        <div className={styles.movementsSection}>

                            <div className={styles.movementsHeader}>
                                <div className={styles.movementsTitle}>
                                    <History size={20} color="var(--primary)" />
                                    <span>Movimientos de Stock</span>
                                </div>

                                {/* Contador + Botón "Ver todos" */}
                                <div className={styles.movementsRight}>
                                    <span className={styles.movementsCounter}>
                                        {movements.length} movimientos
                                    </span>

                                    <button
                                        className={styles.viewAllInlineButton}
                                        onClick={() => onShowHistory(movements)}
                                    >
                                        <History size={16} className={styles.viewAllInlineIcon} />
                                        Ver todos
                                    </button>
                                </div>
                            </div>

                            {/* Lista */}
                            <div className={styles.movementsList}>
                                {displayedMovements.map((movement) => (
                                    <div key={movement.id} className={styles.movementCard}>
                                        <div className={styles.movementLeft}>
                                            <span className={`${styles.movementBadge} ${styles[movement.type]}`}>
                                                {movement.status}
                                            </span>
                                            <div className={styles.movementInfo}>
                                                <span className={styles.movementTitle}>
                                                    {movement.title}
                                                </span>
                                                <span className={styles.movementDate}>
                                                    {movement.date}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.movementRight}>
                                            <span
                                                className={`${styles.movementQuantity} ${movement.quantity > 0 ? styles.positive : styles.negative
                                                    }`}
                                            >
                                                {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                            </span>
                                            <span className={styles.movementUnit}>Unidades</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>


                    </div>

                </div>
            </div>
        </ConfigProvider>
    );
}