import { useState } from "react";
import styles from "./ProductSelectorModal.module.css";
import { Input, Avatar } from "antd";
import { Package } from "lucide-react";

export default function ProductSelectorModal({
    products = [],
    onClose,
    onSelect
}) {
    const [search, setSearch] = useState("");

    const filtered = products.filter(p =>
        p.product.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.modal}>

                {/* HEADER — IGUAL QUE MOVEMENTMODAL (sin badge) */}
                <div className={styles.header}>

                    <div className={styles.headerLeft}>
                        <div className={styles.titleWrapper}>

                            <div className={styles.titleRow}>
                                <h2 className={styles.title}>Seleccionar producto para trasladar</h2>
                                {/* NO badge aquí */}
                            </div>

                            <p className={styles.subtitle}>
                                Buscar un producto por nombre o SKU
                            </p>
                        </div>
                    </div>

                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>


                {/* SEARCH INPUT — SEPARADO DEL SCROLL */}
                <div className={styles.searchWrapper}>
                    <Input
                        placeholder="Buscar por nombre o SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* CONTENT SCROLLABLE */}
                <div className={styles.listContainer}>
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            className={styles.productCard}
                            onClick={() => onSelect(item)}
                        >
                            <Avatar
                                shape="square"
                                size={42}
                                src={item.image || null}
                                icon={<Package size={20} />}
                                className={styles.avatar}
                            />

                            <div>
                                <div className={styles.productInfoTitle}>{item.product}</div>
                                <div className={styles.productInfoSKU}>SKU: {item.sku}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}
