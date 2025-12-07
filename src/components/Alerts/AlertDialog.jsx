import { useEffect } from 'react';
import styles from './AlertDialog.module.css';
import svgEliminar from '../imports/svg-bktufcz9yp';
import svgDuplicar from '../imports/svg-4bcw1jskkg';

const AlertDialog = ({
  type = 'delete', // 'delete' | 'duplicate' | 'custom'
  isOpen = false,
  title,
  description,
  productName,
  productSku,
  additionalInfo,
  onCancel,
  onConfirm,
  cancelText = 'Cancelar',
  confirmText,
  customIcon,
}) => {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Configuración según tipo de alerta
  const config = {
    delete: {
      icon: (
        <svg className={styles.icon} fill="none" viewBox="0 0 20 20">
          <path 
            d={svgEliminar.p51e37f1}
            stroke="#E7000B" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.66667" 
          />
          <path 
            d="M10 7.5V10.8333" 
            stroke="#E7000B" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.66667" 
          />
          <path 
            d="M10 14.1667H10.0083" 
            stroke="#E7000B" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.66667" 
          />
        </svg>
      ),
      title: title || '¿Eliminar producto?',
      confirmText: confirmText || 'Eliminar definitivamente',
      confirmIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path 
            d="M6.66667 7.33333V11.3333" 
            stroke="white" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33333" 
          />
          <path 
            d="M9.33333 7.33333V11.3333" 
            stroke="white" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33333" 
          />
          <path 
            d={svgEliminar.p37e28100}
            stroke="white" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33333" 
          />
          <path 
            d="M2 4H14" 
            stroke="white" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33333" 
          />
          <path 
            d={svgEliminar.p2ffbeb80}
            stroke="white" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.33333" 
          />
        </svg>
      ),
      colorClass: styles.typeDelete,
    },
    duplicate: {
      icon: (
        <svg className={styles.icon} fill="none" viewBox="0 0 20 20">
          <clipPath id="clip-duplicate">
            <rect fill="white" height="20" width="20" />
          </clipPath>
          <g clipPath="url(#clip-duplicate)">
            <path 
              d={svgDuplicar.p1a039080}
              stroke="#13C888" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.66667" 
            />
            <path 
              d={svgDuplicar.p2b428080}
              stroke="#13C888" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.66667" 
            />
          </g>
        </svg>
      ),
      title: title || '¿Duplicar producto?',
      confirmText: confirmText || 'Duplicar producto',
      confirmIcon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <clipPath id="clip-duplicate-btn">
            <rect fill="white" height="16" width="16" />
          </clipPath>
          <g clipPath="url(#clip-duplicate-btn)">
            <path 
              d={svgDuplicar.p216f800}
              stroke="white" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.33333" 
            />
            <path 
              d={svgDuplicar.p13e4b3c0}
              stroke="white" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.33333" 
            />
          </g>
        </svg>
      ),
      colorClass: styles.typeDuplicate,
    },
    custom: {
      icon: customIcon,
      title: title || '¿Confirmar acción?',
      confirmText: confirmText || 'Confirmar',
      confirmIcon: null,
      colorClass: styles.typeCustom,
    },
  };

  const currentConfig = config[type] || config.custom;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div 
        className={`${styles.dialog} ${currentConfig.colorClass}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-description"
      >
        {/* Header */}
        <div className={styles.header}>
          {/* Título con icono */}
          <div className={styles.titleWrapper}>
            <div className={styles.iconWrapper}>
              {currentConfig.icon}
            </div>
            <h2 id="alert-title" className={styles.title}>
              {currentConfig.title}
            </h2>
          </div>

          {/* Descripción */}
          <div id="alert-description" className={styles.description}>
            {description && <p className={styles.descriptionText}>{description}</p>}
            
            {productName && (
              <p className={styles.descriptionText}>
                Estás a punto de {type === 'delete' ? 'eliminar' : 'duplicar'} el producto{' '}
                <span className={styles.productName}>"{productName}"</span>
                {productSku && (
                  <>
                    {' '}(SKU: {productSku}).
                  </>
                )}
              </p>
            )}

            {type === 'delete' && (
              <p className={styles.warningText}>
                Esta acción no se puede deshacer y se perderán todos los datos asociados al producto.
              </p>
            )}

            {type === 'duplicate' && (
              <>
                <p className={styles.descriptionText} style={{ marginTop: '20px' }}>
                  El nuevo producto tendrá:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <span className={styles.listLabel}>SKU:</span>
                    <span className={styles.listValue}>{productSku}-COPY</span>
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listLabel}>Nombre:</span>
                    <span className={styles.listValue}>{productName} (Copia)</span>
                  </li>
                  <li className={styles.listItem}>
                    Todos los demás datos del producto original
                  </li>
                </ul>
              </>
            )}

            {additionalInfo && (
              <div className={styles.additionalInfo}>{additionalInfo}</div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button 
            className={styles.confirmButton}
            onClick={onConfirm}
            type="button"
          >
            {currentConfig.confirmIcon && (
              <span className={styles.buttonIcon}>
                {currentConfig.confirmIcon}
              </span>
            )}
            <span>{currentConfig.confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
