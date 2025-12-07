import styles from './StatCard.module.css';
import ImageWithFallback from './ImageWithFallback'; // ✅ ruta correcta si está en la misma carpeta

export default function StatCard({ icono_url, background, titulo, valor }) {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <div className={styles.iconBox} style={{ backgroundColor: background }}>
          <ImageWithFallback src={icono_url} alt={titulo} className={styles.icon} />
        </div>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.titulo}>{titulo}</p>
        <p className={styles.valor}>{valor}</p>
      </div>
    </div>
  );
}
