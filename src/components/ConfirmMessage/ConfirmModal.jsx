import React from "react";
import ReactDOM from "react-dom";
import styles from "./ConfirmModal.module.css";
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;

    return ReactDOM.createPortal(
        <div className={styles.toastContainer}>
            <div className={styles.toastCard}>
                <AlertTriangle className={styles.icon} />

                <p className={styles.title}>Confirmación requerida</p>
                <p className={styles.message}>{message}</p>

                <div className={styles.actions}>
                    <button className={styles.cancel} onClick={onCancel}>Cancelar</button>
                    <button className={styles.confirm} onClick={onConfirm}>Aceptar</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
