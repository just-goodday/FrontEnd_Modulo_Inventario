import { Select, Cascader } from "antd";
import { useMemo } from "react";
import { useWarehousesContext } from "../../../context/WarehousesContext";
import styles from "./InventoryFilters.module.css";

export default function InventoryFilters({
    filters,
    onChange,
    categories,  // ✅ NUEVO
    categoriesLoading  // ✅ NUEVO
}) {
    const { warehouses, loading: loadingWarehouses } = useWarehousesContext();

    // ✅ Transformar árbol de categorías a formato Cascader
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
        if (!options || !targetId || targetId === 'all') return undefined;

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

    // ✅ Opciones de categorías con loading
    const categoryOptions = useMemo(() => {
        if (categoriesLoading) {
            return [{ value: 'all', label: 'Cargando categorías...', disabled: true }];
        }

        if (!categories || categories.length === 0) {
            return [{ value: 'all', label: 'Todas las categorías' }];
        }

        return [
            { value: 'all', label: 'Todas las categorías' },
            ...transformTreeToCascader(categories),
        ];
    }, [categories, categoriesLoading]);

    // ✅ Opciones de almacenes con loading (SIN value: null)
    const warehouseOptions = useMemo(() => {
        if (loadingWarehouses) {
            return [];  // ✅ Array vacío mientras carga
        }

        if (!Array.isArray(warehouses) || warehouses.length === 0) {
            return [];  // ✅ Array vacío si no hay datos
        }

        return warehouses.map(warehouse => ({
            value: warehouse.id,
            label: warehouse.name,
        }));
    }, [warehouses, loadingWarehouses]);

    return (
        <div className={styles.wrapper}>

            {/* ORDENAR */}
            <div className={styles.filterItem}>
                <label className={styles.label}>Ordenar por</label>
                <Select
                    value={filters.sort}
                    onChange={(v) => onChange({ sort: v })}
                    size="large"
                    className={styles.select}
                    options={[
                        { value: "recent", label: "Más reciente" },
                        { value: "az", label: "Nombre A-Z" },
                        { value: "za", label: "Nombre Z-A" },
                    ]}
                />
            </div>

            {/* CATEGORIA - CASCADER CON ÁRBOL */}
            <div className={styles.filterItem}>
                <label className={styles.label}>Categoría</label>
                <Cascader
                    value={
                        filters.category === 'all'
                            ? ['all']
                            : getCategoryPath(categoryOptions, filters.category)
                    }
                    style={{ width: '100%' }}
                    size="large"
                    className={styles.select}
                    options={categoryOptions}
                    onChange={(value) => {
                        if (!value || value.length === 0 || value.includes('all')) {
                            onChange({ category: 'all' });
                            return;
                        }

                        const selectedValue = value[value.length - 1];
                        onChange({ category: selectedValue });
                    }}
                    placeholder={categoriesLoading ? "Cargando..." : "Todas las categorías"}
                    loading={categoriesLoading}
                    disabled={categoriesLoading}
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
            </div>

            {/* NIVEL DE STOCK */}
            <div className={styles.filterItem}>
                <label className={styles.label}>Nivel de Stock</label>
                <Select
                    value={filters.stock}
                    onChange={(v) => onChange({ stock: v })}
                    size="large"
                    className={styles.select}
                    options={[
                        { value: "all", label: "Todos los niveles" },
                        { value: "low", label: "Bajo" },
                        { value: "available", label: "Disponible" },
                        { value: "out", label: "Agotado" },
                    ]}
                />
            </div>

            {/* ALMACENES */}
            <div className={styles.filterItem}>
                <label className={styles.label}>Almacén</label>
                <Select
                    value={filters.warehouse}
                    onChange={(v) => onChange({ warehouse: v })}
                    size="large"
                    className={styles.select}
                    loading={loadingWarehouses}
                    options={warehouseOptions}
                    placeholder={loadingWarehouses ? "Cargando..." : "Seleccione almacén"}
                    disabled={loadingWarehouses}
                />
            </div>

        </div>
    );
}