import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tooltip, Table, Tag, Button, Space, ConfigProvider, Avatar, Input, Select, Image, Spin, Dropdown, message, Breadcrumb } from 'antd';
import { Pencil, Trash2, Star, Search, Plus, Eye, FolderTree, Download, FileSpreadsheet, FileText, Home, ChevronRight } from 'lucide-react';
import CustomPagination from './Pagination/Pagination';
import styles from './Table.module.css';

const CategoryTable = ({
    categories,
    categoryTree,
    paginationData,
    loading,
    onFetchCategories,
    onCreateCategory,
    onEditCategory,
    onDeleteCategory
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all-status');
    const [selectedLevel, setSelectedLevel] = useState('1');

    // 🔥 NUEVO: Estado para navegación jerárquica
    const [navigationPath, setNavigationPath] = useState([]); // Array de { id, name }
    const [currentParentId, setCurrentParentId] = useState(undefined);

    const keyCountRef = useRef(new Map());

    const normalizedCategories = useMemo(() => {
        keyCountRef.current.clear();

        const makeBaseKey = (c) => {
            if (c.id != null) return `id:${String(c.id)}`;
            if (c.slug) return `slug:${String(c.slug)}`;
            const name = c.name || c.nombre || 'cat';
            const lvl = c.level ?? 'L?';
            const pid = c.parent_id ?? 'root';
            return `gen:${name}-${lvl}-${pid}`;
        };

        return categories.map((c) => {
            const { key: _ignoredKey, ...rest } = c;
            const base = makeBaseKey(rest);
            const seen = keyCountRef.current.get(base) ?? 0;
            keyCountRef.current.set(base, seen + 1);
            return { ...rest, _rowKey: seen === 0 ? base : `${base}#${seen}` };
        });
    }, [categories]);

    const dedupedRows = useMemo(() => {
        const seen = new Set();
        const dups = [];
        const out = [];
        for (const r of normalizedCategories) {
            if (seen.has(r._rowKey)) {
                dups.push(r._rowKey);
            } else {
                seen.add(r._rowKey);
                out.push(r);
            }
        }
        if (dups.length) {
            console.warn('Duplicate _rowKey detected:', dups);
        }
        return out;
    }, [normalizedCategories]);

    useEffect(() => {
        const filters = {};

        console.log('🔧 Construyendo filtros...', {
            selectedLevel,
            selectedStatus,
            currentParentId,
            hasNavigation: currentParentId !== undefined
        });

        // 🔥 CASO 1: Navegación jerárquica activa (estamos viendo hijos de una categoría)
        if (currentParentId !== undefined) {
            filters.parent_id = currentParentId === null ? null : currentParentId;
            // No aplicar filtro de nivel cuando navegamos por jerarquía
            console.log('📂 Modo navegación: mostrando hijos de parent_id =', currentParentId);
        }
        // 🔥 CASO 2: Vista raíz con filtro de nivel
        else {
            if (selectedLevel !== 'all-levels') {
                filters.level = parseInt(selectedLevel);

                // 👇 CRÍTICO: Si es nivel 1, asegurar que solo sean categorías principales
                if (selectedLevel === '1') {
                    filters.parent_id = null;
                    console.log('🏠 Mostrando solo categorías principales (nivel 1, sin padre)');
                }
            } else {
                console.log('🌍 Mostrando todos los niveles');
            }
        }

        // Filtro de estado
        if (selectedStatus !== 'all-status') {
            filters.is_active = selectedStatus === 'active' ? 1 : 0;
        }

        console.log('✅ Filtros finales:', JSON.stringify(filters, null, 2));

        onFetchCategories(searchTerm, perPage, currentPage, filters);
    }, [searchTerm, perPage, currentPage, selectedLevel, selectedStatus, currentParentId, onFetchCategories]);


    const handleSearch = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPerPage(pageSize);
    };

    const handleLevelChange = (value) => {
        setSelectedLevel(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value) => {
        setSelectedStatus(value);
        setCurrentPage(1);
    };

    // 🔥 NUEVO: Navegar hacia los hijos de una categoría
    const navigateToChildren = (category) => {
        const newPath = [...navigationPath, { id: category.id, name: category.name || category.nombre }];
        setNavigationPath(newPath);
        setCurrentParentId(category.id);
        setCurrentPage(1);

        // 🔥 Limpiar el filtro de nivel al navegar
        setSelectedLevel('all-levels');

        console.log('🔍 Navegando a hijos de:', category.name, 'ID:', category.id);

        // 🔥 Opcional: Mostrar cuántos hijos tiene
        const children = getAllChildrenFromTree(category.id);
        console.log('👶 Hijos encontrados:', children.length);
    };
    // 🔥 NUEVO: Navegar hacia atrás en el breadcrumb
    const navigateToLevel = (index) => {
        if (index === -1) {
            // Volver a la raíz
            setNavigationPath([]);
            setCurrentParentId(undefined);
            setSelectedLevel('1'); // 👈 Restaurar a nivel 1 por defecto
            console.log('🏠 Volviendo a vista raíz - nivel 1');
        } else {
            // Navegar a un nivel específico
            const newPath = navigationPath.slice(0, index + 1);
            setNavigationPath(newPath);
            setCurrentParentId(newPath[newPath.length - 1].id);
            setSelectedLevel('all-levels');
            console.log('📂 Navegando a nivel intermedio');
        }
        setCurrentPage(1);
    };

    // 🔥 NUEVO: Verificar si una categoría tiene hijos
    const hasChildren = (categoryId) => {
        // Buscar en categories (lista plana)
        const directChildren = categories.some(cat => cat.parent_id === categoryId);
        if (directChildren) return true;

        // Si no hay en categories, buscar en categoryTree (recursivo)
        const findInTree = (nodes) => {
            if (!nodes || !Array.isArray(nodes)) return false;

            for (const node of nodes) {
                if (node.id === categoryId) {
                    return node.children && node.children.length > 0;
                }
                if (node.children && node.children.length > 0) {
                    const found = findInTree(node.children);
                    if (found) return true;
                }
            }
            return false;
        };

        return categoryTree ? findInTree(categoryTree) : false;
    };

    // 🔥 CAMBIO 3: Función para obtener todos los hijos recursivamente de una categoría
    const getAllChildrenFromTree = (categoryId) => {
        const findInTree = (nodes, targetId) => {
            if (!nodes || !Array.isArray(nodes)) return null;

            for (const node of nodes) {
                if (node.id === targetId) {
                    return node;
                }
                if (node.children && node.children.length > 0) {
                    const found = findInTree(node.children, targetId);
                    if (found) return found;
                }
            }
            return null;
        };

        const categoryNode = categoryTree ? findInTree(categoryTree, categoryId) : null;
        return categoryNode?.children || [];
    };

    const buildTreeOptions = (tree, level = 0) => {
        if (!tree || !Array.isArray(tree)) return [];

        const options = [];
        tree.forEach(node => {
            const indent = '　'.repeat(level);
            options.push({
                value: node.id,
                label: `${indent}${node.name || node.nombre}`,
                level: level + 1
            });

            if (node.children && node.children.length > 0) {
                options.push(...buildTreeOptions(node.children, level + 1));
            }
        });

        return options;
    };

    const getParentName = (category) => {
        if (!category.parent_id) return '-';

        const parent = categories.find(c => c.id === category.parent_id);
        if (parent) return parent.name || parent.nombre;

        const findInTree = (nodes) => {
            if (!nodes) return null;
            for (const node of nodes) {
                if (node.id === category.parent_id) {
                    return node.name || node.nombre;
                }
                if (node.children && node.children.length > 0) {
                    const found = findInTree(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const parentFromTree = categoryTree ? findInTree(categoryTree) : null;
        if (parentFromTree) return parentFromTree;

        if (category.parent) {
            return category.parent.name || category.parent.nombre;
        }

        if (category.parent_name) return category.parent_name;

        return '-';
    };

    const exportToCSV = () => {
        try {
            let dataToExport = categories;

            if (selectedStatus !== 'all-status') {
                dataToExport = dataToExport.filter(cat => {
                    if (selectedStatus === 'active') return cat.is_active || cat.activo;
                    if (selectedStatus === 'inactive') return !cat.is_active && !cat.activo;
                    return true;
                });
            }

            if (selectedLevel !== 'all-levels') {
                const level = parseInt(selectedLevel);
                dataToExport = dataToExport.filter(cat => cat.level === level);
            }

            const headers = ['ID', 'Nombre', 'Slug', 'Nivel', 'Categoría Padre', 'Productos', 'Orden', 'Estado'];
            const rows = dataToExport.map(cat => [
                cat.id,
                `"${cat.name || cat.nombre || ''}"`,
                cat.slug || '',
                getLevelLabel(cat.level),
                `"${getParentName(cat)}"`,
                cat.product_count || cat.products_count || 0,
                cat.order || cat.orden || 0,
                (cat.is_active || cat.activo) ? 'Activa' : 'Inactiva',
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `categorias_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success(`${dataToExport.length} categorías exportadas a CSV`);
        } catch (error) {
            console.error('Error al exportar CSV:', error);
            message.error('Error al exportar CSV');
        }
    };

    const exportToJSON = () => {
        try {
            let dataToExport = categories;

            if (selectedStatus !== 'all-status') {
                dataToExport = dataToExport.filter(cat => {
                    if (selectedStatus === 'active') return cat.is_active || cat.activo;
                    if (selectedStatus === 'inactive') return !cat.is_active && !cat.activo;
                    return true;
                });
            }

            if (selectedLevel !== 'all-levels') {
                const level = parseInt(selectedLevel);
                dataToExport = dataToExport.filter(cat => cat.level === level);
            }

            const jsonData = dataToExport.map(cat => ({
                id: cat.id,
                name: cat.name || cat.nombre,
                slug: cat.slug,
                level: cat.level,
                level_name: getLevelLabel(cat.level),
                parent_id: cat.parent_id || null,
                parent_name: getParentName(cat),
                description: cat.description || cat.descripcion || null,
                product_count: cat.product_count || cat.products_count || 0,
                order: cat.order || cat.orden || 0,
                is_active: cat.is_active || cat.activo || false,
                created_at: cat.created_at || null,
                updated_at: cat.updated_at || null
            }));

            const jsonString = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `categorias_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success(`${dataToExport.length} categorías exportadas a JSON`);
        } catch (error) {
            console.error('Error al exportar JSON:', error);
            message.error('Error al exportar JSON');
        }
    };

    const exportToExcel = () => {
        exportToCSV();
        message.info('Archivo CSV compatible con Excel exportado');
    };

    const exportMenuItems = [
        {
            key: 'csv',
            label: 'Exportar como CSV',
            icon: <FileText size={16} />,
            onClick: exportToCSV,
        },
        {
            key: 'excel',
            label: 'Exportar a Excel',
            icon: <FileSpreadsheet size={16} />,
            onClick: exportToExcel,
        },
        {
            key: 'json',
            label: 'Exportar como JSON',
            icon: <Download size={16} />,
            onClick: exportToJSON,
        },
    ];

    const getLevelLabel = (level) => {
        switch (level) {
            case 1: return 'Categoría';
            case 2: return 'Familia';
            case 3: return 'Subfamilia';
            default: return 'N/A';
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'purple';
            default: return 'default';
        }
    };

    const renderCategoryImage = (category) => {
        const imageUrl = category.image || category.imagen || category.icon;

        if (!imageUrl) {
            return (
                <Avatar
                    shape="square"
                    size={48}
                    style={{
                        backgroundColor: 'var(--overlay-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                    }}
                >
                    <FolderTree size={24} color="var(--text-muted)" />
                </Avatar>
            );
        }

        return (
            <Image
                width={48}
                height={48}
                src={imageUrl}
                alt={category.name || category.nombre}
                style={{
                    borderRadius: '8px',
                    objectFit: 'cover'
                }}
                placeholder={
                    <div style={{
                        width: 48,
                        height: 48,
                        background: 'var(--overlay-subtle)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FolderTree size={24} color="var(--text-muted)" />
                    </div>
                }
            />
        );
    };

    const columns = [
        {
            title: <div style={{ textAlign: 'center' }}>Categoría</div>,
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {renderCategoryImage(record)}
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>
                            {text || record.nombre || record.primary_name}
                        </div>
                        {record.description && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {record.description.substring(0, 50)}
                                {record.description.length > 50 ? '...' : ''}
                            </div>
                        )}
                        {record.slug && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                slug: {record.slug}
                            </div>
                        )}
                    </div>
                </Space>
            ),
            width: 320,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Nivel</div>,
            dataIndex: 'level',
            key: 'level',
            render: (level) => (
                <Tag
                    color={getLevelColor(level)}
                    style={{
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 500,
                    }}
                >
                    {getLevelLabel(level)}
                </Tag>
            ),
            align: 'center',
            width: 130,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Productos</div>,
            dataIndex: 'product_count',
            key: 'product_count',
            render: (count, record) => {
                // 👇 Total recursivo vs propios
                const totalProducts = record.total_products ?? 0;
                const ownProducts = record.products_count ?? 0;
                const childrenProducts = totalProducts - ownProducts;

                // 👇 Construir mensaje del tooltip
                let tooltipContent = '';
                if (totalProducts === 0) {
                    tooltipContent = 'Sin productos en esta categoría';
                } else if (ownProducts === totalProducts) {
                    tooltipContent = `${ownProducts} producto(s) propio(s)`;
                } else {
                    tooltipContent = `${ownProducts} producto(s) propio(s)\n+ ${childrenProducts} de subcategorías\n= ${totalProducts} total`;
                }

                return (
                    <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</div>}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'help' // 👈 Cursor de ayuda
                        }}>
                            <Tag
                                style={{
                                    background: totalProducts > 0 ? 'var(--primary-light)' : 'var(--bg-secondary)',
                                    color: totalProducts > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                }}
                            >
                                {totalProducts}
                            </Tag>
                            {/* 👇 Mostrar detalle solo si hay productos de hijos */}
                            {childrenProducts > 0 && (
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-muted)',
                                    fontWeight: 500
                                }}>
                                    {ownProducts} + {childrenProducts}
                                </span>
                            )}
                        </div>
                    </Tooltip>
                );
            },
            align: 'center',
            width: 120,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Categoría Padre</div>,
            dataIndex: 'parent',
            key: 'parent',
            align: 'center',
            width: 180,
            render: (parent, record) => {
                const parentName = getParentName(record);
                return (
                    <span style={{ color: 'var(--text-secondary)' }}>
                        {parentName}
                    </span>
                );
            }
        },
        {
            title: <div style={{ textAlign: 'center' }}>Márgenes</div>,
            key: 'margins',
            align: 'center',
            width: 180,
            render: (_, record) => {
                // 👇 Valores propios (pueden ser 0)
                const ownMin = record.min_margin_percentage ?? 0;
                const ownNormal = record.normal_margin_percentage ?? 0;

                // 👇 Valores efectivos (heredados o del sistema)
                const effectiveMin = record.effective_min_margin ?? 0;
                const effectiveNormal = record.effective_normal_margin ?? 0;

                const inherits = record.inherits_margins ?? (ownMin === 0 && ownNormal === 0);
                const usesSystemDefault = record.uses_system_default ?? false;

                // ✅ NO MOSTRAR NADA SI NO TIENE MÁRGENES PROPIOS Y USA DEFAULT DEL SISTEMA
                // Solo mostrar si tiene valores propios O hereda del padre (no del sistema)
                const shouldShow = (ownMin > 0 || ownNormal > 0) || (inherits && !usesSystemDefault);

                if (!shouldShow) {
                    return (
                        <Tooltip title="Sin márgenes configurados. Usar settings del sistema.">
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                alignItems: 'center',
                                cursor: 'help'
                            }}>
                                <Tag
                                    color="default"
                                    style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        margin: 0,
                                        borderRadius: '4px',
                                        color: 'var(--text-muted)'
                                    }}
                                >
                                    Sin configurar
                                </Tag>
                            </div>
                        </Tooltip>
                    );
                }

                // 👇 Construir mensaje del tooltip
                let tooltipContent = '';
                if (ownMin > 0 || ownNormal > 0) {
                    tooltipContent = `Márgenes propios\nMín: ${ownMin.toFixed(1)}%\nNormal: ${ownNormal.toFixed(1)}%`;
                } else if (inherits && !usesSystemDefault) {
                    tooltipContent = `Heredado del padre\nMín: ${effectiveMin.toFixed(1)}%\nNormal: ${effectiveNormal.toFixed(1)}%`;
                }

                return (
                    <Tooltip title={<div style={{ whiteSpace: 'pre-line' }}>{tooltipContent}</div>}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            alignItems: 'center',
                            cursor: 'help'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: (ownMin > 0) ? 'var(--text)' : 'var(--text-muted)',
                                fontWeight: 500
                            }}>
                                Mín: {(ownMin > 0 ? ownMin : effectiveMin).toFixed(1)}%
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: (ownNormal > 0) ? 'var(--text)' : 'var(--text-muted)',
                                fontWeight: 500
                            }}>
                                Normal: {(ownNormal > 0 ? ownNormal : effectiveNormal).toFixed(1)}%
                            </div>
                            {inherits && !usesSystemDefault && (
                                <Tag
                                    color="blue"
                                    style={{
                                        fontSize: '10px',
                                        padding: '0 6px',
                                        margin: 0,
                                        borderRadius: '4px'
                                    }}
                                >
                                    Heredado
                                </Tag>
                            )}
                        </div>
                    </Tooltip>
                );
            }
        },
        {
            title: <div style={{ textAlign: 'center' }}>Orden</div>,
            dataIndex: 'order',
            key: 'order',
            render: (order, record) => {
                const orderValue = order || record.orden || 0;
                return (
                    <span style={{ fontWeight: 500, color: 'var(--text)' }}>
                        {orderValue}
                    </span>
                );
            },
            align: 'center',
            width: 100,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Estado</div>,
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive, record) => {
                const active = isActive || record.estado === 'activo' || record.activo === true;

                return (
                    <Tag
                        color={active ? 'green' : 'gray'}
                        style={{
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: 500,
                            margin: 0
                        }}
                    >
                        {active ? 'Activa' : 'Inactiva'}
                    </Tag>
                );
            },
            align: 'center',
            width: 120,
        },
        {
            title: <div style={{ textAlign: 'center' }}>Acciones</div>,
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    {/* 🔥 Botón para ver hijos si los tiene */}
                    {hasChildren(record.id) && (
                        <Button
                            type="text"
                            icon={<ChevronRight size={16} color="var(--primary)" />}
                            size="small"
                            title="Ver siguiente nivel"
                            onClick={() => navigateToChildren(record)}
                        />
                    )}
                    <Button
                        type="text"
                        icon={<Eye size={16} color="var(--primary)" />}
                        size="small"
                        title="Ver detalle"
                    />
                    <Button
                        type="text"
                        icon={<Pencil size={16} color="var(--warning)" />}
                        size="small"
                        title="Editar"
                        onClick={() => onEditCategory(record)}
                    />
                    <Button
                        type="text"
                        icon={<Trash2 size={16} color="var(--error)" />}
                        size="small"
                        title="Eliminar"
                        onClick={() => onDeleteCategory(record)}
                    />
                </Space>
            ),
            align: 'center',
            width: 180,
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
                    Select: {
                        colorBgContainer: 'var(--card)',
                        colorBorder: 'var(--border)',
                        colorText: 'var(--text)',
                    },
                    Breadcrumb: {
                        itemColor: 'var(--text-secondary)',
                        lastItemColor: 'var(--text)',
                        linkColor: 'var(--primary)',
                        linkHoverColor: 'var(--primary-hover)',
                        separatorColor: 'var(--text-muted)',
                    },
                },
            }}
        >
            <div className={styles.tableWrapper}>
                {/* 🔥 BREADCRUMB DE NAVEGACIÓN */}
                {navigationPath.length > 0 && (
                    <div style={{
                        padding: '12px 16px',
                        background: 'var(--card)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Breadcrumb
                            separator={<ChevronRight size={14} />}
                            items={[
                                {
                                    title: (
                                        <Button
                                            type="link"
                                            icon={<Home size={14} />}
                                            onClick={() => navigateToLevel(-1)}
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            Todas las categorías
                                        </Button>
                                    ),
                                },
                                ...navigationPath.map((item, index) => ({
                                    title: index === navigationPath.length - 1 ? (
                                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                                            {item.name}
                                        </span>
                                    ) : (
                                        <Button
                                            type="link"
                                            onClick={() => navigateToLevel(index)}
                                            style={{ padding: 0, height: 'auto' }}
                                        >
                                            {item.name}
                                        </Button>
                                    ),
                                })),
                            ]}
                        />
                    </div>
                )}

                <div className={styles.searchBar}>
                    <Input
                        placeholder="Buscar categorías..."
                        prefix={<Search size={16} color="var(--text-muted)" />}
                        className={styles.searchInput}
                        size="large"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onPressEnter={handleSearch}
                        onClear={handleClearSearch}
                        allowClear
                    />

                    <Button
                        size="large"
                        icon={<Search size={16} />}
                        onClick={handleSearch}
                        style={{
                            borderColor: 'var(--border)',
                            color: 'var(--text)',
                        }}
                    >
                        Buscar
                    </Button>

                    <Select
                        value={selectedLevel}
                        style={{ width: 160 }}
                        size="large"
                        onChange={handleLevelChange}
                        options={[
                            { value: 'all-levels', label: 'Todos los niveles' },
                            { value: '1', label: 'Categorías' },
                            { value: '2', label: 'Familias' },
                            { value: '3', label: 'Subfamilias' },
                        ]}
                    />

                    <Select
                        value={selectedStatus}
                        style={{ width: 160 }}
                        size="large"
                        onChange={handleStatusChange}
                        options={[
                            { value: 'all-status', label: 'Todos los estados' },
                            { value: 'active', label: 'Activas' },
                            { value: 'inactive', label: 'Inactivas' },
                        ]}
                    />

                    <Dropdown
                        menu={{ items: exportMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Button
                            size="large"
                            icon={<Download size={16} />}
                            style={{
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                            }}
                        >
                            Exportar
                        </Button>
                    </Dropdown>

                    <Button
                        type="primary"
                        size="large"
                        icon={<Plus size={16} />}
                        className={styles.addButton}
                        onClick={onCreateCategory}
                    >
                        Nueva Categoría
                    </Button>
                </div>

                <div className={styles.tableHeader}>
                    Lista de Categorías
                    {loading && <Spin size="small" style={{ marginLeft: '10px' }} />}
                </div>

                <div className={styles.tableContainer}>
                    <Table
                        columns={columns}
                        dataSource={dedupedRows}
                        rowKey="_rowKey"
                        pagination={false}
                        loading={loading}
                        className={styles.table}
                        rowClassName={styles.tableRow}
                        scroll={{ x: 1200, y: 'calc(100vh - 450px)' }}
                        locale={{
                            emptyText: loading ? 'Cargando categorías...' : 'No se encontraron categorías'
                        }}
                        expandable={{
                            showExpandColumn: false, // Ocultar la columna de expansión
                        }}
                    />
                </div>

                {paginationData && (
                    <CustomPagination
                        total={paginationData.total || 0}
                        currentPage={currentPage}
                        perPage={perPage}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </ConfigProvider>
    );
};

export default CategoryTable;