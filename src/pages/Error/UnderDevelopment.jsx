import React from 'react';
import { useHeader } from '../../context/useHeader';
import styles from './UnderDevelopment.module.css';

/**
 * Componente animado para mostrar que una funcionalidad está en desarrollo
 * @param {string} moduleName - Nombre del módulo en desarrollo
 * @param {string} image - Ruta de la imagen (opcional)
 */
export default function UnderDevelopment({
    moduleName = "esta funcionalidad",
    image = "/images/working.png"
}) {
    const { setPageTitle } = useHeader();

    React.useEffect(() => {
        setPageTitle(moduleName);
    }, [setPageTitle, moduleName]);

    return (
        <div className={styles.container}>
            {/* Contenedor principal con animación de entrada */}
            <div className={styles.developmentContainer}>

                {/* Imagen animada */}
                <div className={styles.imageContainer}>
                    <div className={styles.floatingAnimation}>
                        <img
                            src={image}
                            alt="En desarrollo"
                            className={styles.developmentImage}
                            onError={(e) => {
                                // Fallback si la imagen no carga
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        {/* SVG animado como fallback */}
                        <div className={styles.fallbackAnimation}>
                            <svg
                                width="200"
                                height="200"
                                viewBox="0 0 200 200"
                                className={styles.constructionSvg}
                            >
                                {/* Fondo del engranaje */}
                                <circle cx="100" cy="100" r="80" fill="var(--primary-light)" opacity="0.3" />

                                {/* Engranaje grande */}
                                <g className={styles.gearLarge}>
                                    <circle cx="100" cy="100" r="40" fill="var(--primary)" opacity="0.8" />
                                    <circle cx="100" cy="100" r="30" fill="var(--bg)" />

                                    {/* Dientes del engranaje */}
                                    {[...Array(8)].map((_, i) => (
                                        <rect
                                            key={i}
                                            x="98"
                                            y="30"
                                            width="4"
                                            height="20"
                                            fill="var(--primary)"
                                            transform={`rotate(${i * 45} 100 100)`}
                                        />
                                    ))}
                                </g>

                                {/* Engranaje pequeño */}
                                <g className={styles.gearSmall}>
                                    <circle cx="160" cy="60" r="20" fill="var(--primary)" opacity="0.6" />
                                    <circle cx="160" cy="60" r="15" fill="var(--bg)" />

                                    {/* Dientes del engranaje pequeño */}
                                    {[...Array(6)].map((_, i) => (
                                        <rect
                                            key={i}
                                            x="158"
                                            y="40"
                                            width="4"
                                            height="12"
                                            fill="var(--primary)"
                                            transform={`rotate(${i * 60} 160 60)`}
                                        />
                                    ))}
                                </g>

                                {/* Herramientas */}
                                <g className={styles.tools}>
                                    {/* Martillo */}
                                    <rect x="50" y="130" width="25" height="6" fill="var(--text-secondary)" rx="2" />
                                    <rect x="45" y="120" width="6" height="20" fill="var(--text)" rx="2" />

                                    {/* Llave */}
                                    <rect x="130" y="140" width="4" height="25" fill="var(--text)" rx="1" transform="rotate(45 132 140)" />
                                    <circle cx="140" cy="150" r="8" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray="4 2" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Contenido de texto */}
                <div className={styles.contentContainer}>
                    {/* Título principal */}
                    <h1 className={styles.mainTitle}>
                        ¡Seguimos <span className={styles.highlight}>Chambeando</span>!
                    </h1>

                    {/* Mensaje descriptivo */}
                    <p className={styles.description}>
                        Estamos trabajando duro en <strong>{moduleName}</strong>.
                        Esta funcionalidad estará disponible muy pronto.
                    </p>

                    {/* Mensaje motivacional */}
                    <p className={styles.motivational}>
                        Mientras tanto, ¿por qué no exploras otras secciones de la aplicación?
                    </p>

                    {/* CTA */}
                    <div className={styles.ctaSection}>
                        <button className={styles.ctaButton} onClick={() => window.history.back()}>
                            ← Volver atrás
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}