import { Menu, ConfigProvider } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Package, Warehouse, Users, FileText, 
    ShoppingCart, TrendingUp, BarChart3, Settings,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function MenuSidebar() {
    const location = useLocation();
    const [openSections, setOpenSections] = useState({
        gestion: false,
        ventas: false,
        analisis: false,
        sistema: false
    });

    // Función para toggle de secciones
    const toggleSection = (sectionKey) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const menuItems = [
        {
            key: 'dashboard',
            label: <Link to="/dashboard">Dashboard</Link>,
            icon: <Home size={18} />,
        },
        // Gestión - Con dropdown
        {
            key: 'gestion',
            label: (
                <div 
                    className="section-header"
                    onClick={() => toggleSection('gestion')}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 0',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>GESTIÓN</span>
                    {openSections.gestion ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            ),
            type: 'group',
            children: openSections.gestion ? [
                {
                    key: '/products',
                    label: <Link to="/products">Productos</Link>,
                    icon: <Package size={18} />,
                },
                {
                    key: '/categories',
                    label: <Link to="/categories">Categorías</Link>,
                    icon: <Warehouse size={18} />,
                },
                {
                    key: '/inventory',
                    label: <Link to="/inventory">Inventario</Link>,
                    icon: <Warehouse size={18} />,
                },
            ] : [],
        },
        
        // Ventas - Con dropdown
        {
            key: 'ventas',
            label: (
                <div 
                    className="section-header"
                    onClick={() => toggleSection('ventas')}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 0',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>VENTAS</span>
                    {openSections.ventas ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            ),
            type: 'group',
            children: openSections.ventas ? [
                {
                    key: '/quotes',
                    label: <Link to="/quotes">Cotizaciones</Link>,
                    icon: <FileText size={18} />,
                },
                {
                    key: '/sales',
                    label: <Link to="/sales">Ventas</Link>,
                    icon: <ShoppingCart size={18} />,
                },
                {
                    key: '/clients',
                    label: <Link to="/clients">Clientes & Proveedores</Link>,
                    icon: <Users size={18} />,
                },
            ] : [],
        },
        
        // Análisis - Con dropdown
        {
            key: 'analisis',
            label: (
                <div 
                    className="section-header"
                    onClick={() => toggleSection('analisis')}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 0',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>ANÁLISIS</span>
                    {openSections.analisis ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            ),
            type: 'group',
            children: openSections.analisis ? [
                {
                    key: '/purchases',
                    label: <Link to="/purchases">Compras</Link>,
                    icon: <TrendingUp size={18} />,
                },
                {
                    key: '/reports',
                    label: <Link to="/reports">Reportes</Link>,
                    icon: <BarChart3 size={18} />,
                },
            ] : [],
        },
        
        // Sistema - Con dropdown
        {
            key: 'sistema',
            label: (
                <div 
                    className="section-header"
                    onClick={() => toggleSection('sistema')}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: '8px 0',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}
                >
                    <span>SISTEMA</span>
                    {openSections.sistema ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
            ),
            type: 'group',
            children: openSections.sistema ? [
                {
                    key: '/settings',
                    label: <Link to="/settings">Configuración</Link>,
                    icon: <Settings size={18} />,
                },
            ] : [],
        },
    ];

    // Determinar la clave seleccionada basada en la ruta
    const getSelectedKeys = () => {
        const path = location.pathname;
        const routeToKey = {
            '/dashboard': 'dashboard',
            '/products': '/products',
            '/categories': '/categories',
            '/inventory': '/inventory',
            '/quotes': '/quotes',
            '/sales': '/sales',
            '/clients': '/clients',
            '/purchases': '/purchases',
            '/reports': '/reports',
            '/settings': '/settings',
        };
        
        const selectedKey = routeToKey[path] || 'dashboard';
        return [selectedKey];
    };

    const selectedKeys = getSelectedKeys();

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: 'var(--primary)',
                    colorText: 'var(--text)',
                    colorTextDescription: 'var(--text-muted)',
                    colorBgContainer: 'var(--bg)',
                    colorBgElevated: 'var(--card)',
                    colorBorder: 'var(--border)',
                    colorPrimaryBg: 'var(--primary-light)',
                    colorPrimaryBgHover: 'var(--primary-light)',
                    colorFillSecondary: 'var(--overlay-subtle)',
                    colorFillContent: 'var(--overlay-subtle)',
                    fontFamily: 'Inter, sans-serif',
                    borderRadius: 8,
                },
                components: {
                    Menu: {
                        // Usar variables CSS en lugar de colores fijos
                        itemSelectedBg: 'var(--primary-light)',
                        itemSelectedColor: 'var(--primary)',
                        itemHoverBg: 'var(--overlay-subtle)',
                        itemHoverColor: 'var(--primary)',
                        groupTitleColor: 'var(--text-muted)',
                        groupTitleFontSize: 12,
                        groupTitleLineHeight: 1.5,
                        groupTitleMarginBottom: 8,
                        itemHeight: 40,
                        itemMarginBlock: 4,
                        subMenuItemBg: 'transparent',
                        itemColor: 'var(--text)',
                        itemActiveBg: 'var(--primary-light)',
                        // Configuración específica para tema oscuro
                        darkItemBg: 'var(--bg)',
                        darkItemSelectedBg: 'var(--primary-light)',
                        darkItemSelectedColor: 'var(--primary)',
                        darkSubMenuItemBg: 'transparent',
                        darkItemColor: 'var(--text)',
                        darkItemHoverBg: 'var(--overlay-subtle)',
                        darkItemHoverColor: 'var(--primary)',
                        darkGroupTitleColor: 'var(--text-muted)',
                    }
                }
            }}
        >
            <Menu
                mode="inline"
                selectedKeys={selectedKeys}
                // REMOVER defaultOpenKeys para mantener dropdowns cerrados
                items={menuItems}
                style={{ 
                    border: 'none', 
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    fontWeight: '400',
                }}
                // Cambiar a "dark" para mejor compatibilidad con variables CSS
                theme="dark"
            />
        </ConfigProvider>
    );
}