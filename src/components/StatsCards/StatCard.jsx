import React from 'react';
import { Card } from 'antd';
import * as LucideIcons from 'lucide-react';
import styles from './StatCard.module.css';

/**
 * StatsCard - Componente reutilizable para mostrar estadísticas
 * 
 * @param {string} title - Título de la tarjeta
 * @param {number|string} value - Valor principal a mostrar
 * @param {string} icon - Nombre del icono de Lucide React (ej: 'Package', 'CheckCircle')
 * @param {string} iconBgColor - Color de fondo del icono (puede ser una var CSS o color hex)
 * @param {string} iconColor - Color del icono (por defecto 'white')
 * @param {function} onClick - Función a ejecutar al hacer click en la tarjeta
 * @param {boolean} loading - Estado de carga
 * @param {object} style - Estilos personalizados para la tarjeta
 * @param {string} className - Clases CSS adicionales
 */
const StatsCard = ({
    title = 'Título',
    value = '0',
    icon = 'Package',
    iconBgColor = 'var(--primary)',
    iconColor = 'white',
    onClick,
    loading = false,
    style,
    className = ''
}) => {
    // Obtener el icono de Lucide React dinámicamente
    const IconComponent = LucideIcons[icon] || LucideIcons.Package;

    return (
        <Card
            className={`${styles.statsCard} ${onClick ? styles.clickable : ''} ${className}`}
            style={style}
            loading={loading}
            onClick={onClick}
            variant="borderless"
        >
            <div className={styles.cardContent}>
                {/* Icono */}
                <div 
                    className={styles.iconContainer}
                    style={{ 
                        backgroundColor: iconBgColor,
                    }}
                >
                    <IconComponent 
                        size={24} 
                        color={iconColor}
                        strokeWidth={2}
                    />
                </div>

                {/* Contenido */}
                <div className={styles.content}>
                    <span className={styles.title}>{title}</span>
                    <div className={styles.value}>{value}</div>
                </div>
            </div>
        </Card>
    );
};

/**
 * StatsCardGrid - Componente contenedor para múltiples StatsCards
 * 
 * @param {array} stats - Array de configuraciones de tarjetas
 * @param {number} columns - Número de columnas (1-4, default: 4)
 * @param {object} cardProps - Props comunes para todas las tarjetas
 */
export const StatsCardGrid = ({ 
    stats = [], 
    columns = 4,
    cardProps = {}
}) => {
    return (
        <div 
            className={styles.statsGrid}
            style={{ 
                gridTemplateColumns: `repeat(auto-fit, minmax(${columns === 1 ? '100%' : columns === 2 ? '280px' : '220px'}, 1fr))` 
            }}
        >
            {stats.map((stat, index) => (
                <StatsCard 
                    key={index} 
                    {...cardProps}
                    {...stat} 
                />
            ))}
        </div>
    );
};

export default StatsCard;