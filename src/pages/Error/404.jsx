import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import styles from './404.module.css';

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                
                {/* Ilustración animada */}
                <div className={styles.errorAnimation}>
                    <div className={styles.floatingElement}>
                        <div className={styles.errorCode}>404</div>
                    </div>
                    
                    {/* Elementos decorativos animados */}
                    <div className={`${styles.decorationCircle} ${styles.circle1}`}></div>
                    <div className={`${styles.decorationCircle} ${styles.circle2}`}></div>
                    <div className={`${styles.decorationCircle} ${styles.circle3}`}></div>
                </div>

                {/* Contenido de texto */}
                <div className={styles.errorContent}>
                    <h1 className={styles.errorTitle}>
                        ¡Ups! Página no encontrada
                    </h1>
                    
                    <p className={styles.errorDescription}>
                        La página que estás buscando parece haberse perdido en el espacio digital. 
                        Puede que haya sido movida, eliminada o quizás nunca existió.
                    </p>

                    {/* Botones de acción */}
                    <div className={styles.actionButtons}>
                        <Link to="/dashboard" className={styles.btnPrimary}>
                            <Home size={18} />
                            Ir al Dashboard
                        </Link>
                        
                        <button 
                            onClick={() => window.history.back()} 
                            className={styles.btnSecondary}
                        >
                            <ArrowLeft size={18} />
                            Volver Atrás
                        </button>
                    </div>

                    {/* Información adicional */}
                    <div className={styles.additionalInfo}>
                        <p className={styles.infoText}>
                            Si crees que esto es un error, contacta al equipo de soporte.
                        </p>
                        <div className={styles.statusCode}>
                            <span>Código de error: </span>
                            <strong>404 Not Found</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}