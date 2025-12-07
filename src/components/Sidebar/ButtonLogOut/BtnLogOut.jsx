import React, { useState } from 'react';
import { ConfigProvider, Button, Modal, App } from 'antd'; // ← Cambiar aquí
import { LogOut, PowerOff } from 'lucide-react';
import { useAuth } from '../../../routes/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './BtnLogOut.module.css';

const LogoutButton = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { message, modal: antdModal } = App.useApp(); // ← NUEVO: usar hook

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            logout();
            message.success('Sesión cerrada correctamente'); // ← Ahora usa el hook
            navigate('/login');
        } catch (error) {
            message.error('Error al cerrar sesión'); // ← Ahora usa el hook
        } finally {
            setLoading(false);
            setIsModalVisible(false);
        }
    };

    // ... el resto de tu código permanece igual
    const modalTheme = {
        token: {
            colorBgElevated: 'var(--card)',
            colorText: 'var(--text)',
            colorTextHeading: 'var(--text)',
            colorTextLabel: 'var(--text-secondary)',
            colorBorder: 'var(--border)',
            colorPrimary: 'var(--error)',
            colorPrimaryHover: 'var(--error-hover)',
            colorBgContainer: 'var(--card)',
            colorIcon: 'var(--text)',
            colorIconHover: 'var(--text)',
        },
        components: {
            Modal: {
                contentBg: 'var(--card)',
                headerBg: 'var(--card)',
                footerBg: 'var(--card)',
                titleColor: 'var(--text)',
                titleFontSize: 18,
            },
            Button: {
                defaultBg: 'transparent',
                defaultColor: 'var(--text)',
                defaultBorderColor: 'var(--border)',
                defaultHoverBg: 'var(--bg-secondary)',
                defaultHoverColor: 'var(--text)',
                defaultHoverBorderColor: 'var(--border)',
            }
        }
    };

    return (
        <>
            <div className={styles.logoutContainer}>
                <button 
                    className={styles.logoutButton}
                    onClick={showModal}
                    title="Cerrar sesión"
                >
                    <div className={styles.logoutContent}>
                        <div className={styles.logoutIcon}>
                            <PowerOff size={18} />
                        </div>
                        <span className={styles.logoutText}>Cerrar Sesión</span>
                    </div>
                </button>
            </div>

            <ConfigProvider theme={modalTheme}>
                <Modal
                    title={
                        <div className={styles.modalHeader}>
                            <LogOut className={styles.modalIcon} />
                            <span>Cerrar Sesión</span>
                        </div>
                    }
                    open={isModalVisible}
                    onOk={handleLogout}
                    onCancel={handleCancel}
                    confirmLoading={loading}
                    okText="Sí, cerrar sesión"
                    cancelText="Cancelar"
                    className={styles.logoutModal}
                    okButtonProps={{
                        className: styles.confirmButton,
                        icon: <PowerOff size={16} />
                    }}
                    cancelButtonProps={{
                        className: styles.cancelButton
                    }}
                    styles={{
                        body: {
                            background: 'var(--card)',
                        },
                        content: {
                            backgroundColor: 'var(--card)',
                            boxShadow: '0 20px 40px var(--overlay-light)',
                        }
                    }}
                >
                    <div className={styles.modalContent}>
                        <p>¿Estás seguro de que deseas cerrar sesión?</p>
                        <p className={styles.modalSubtext}>
                            Serás redirigido a la página de inicio de sesión.
                        </p>
                    </div>
                </Modal>
            </ConfigProvider>
        </>
    );
};

export default LogoutButton;