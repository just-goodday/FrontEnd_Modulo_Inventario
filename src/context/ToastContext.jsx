// context/ToastContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ToastContext.module.css'; // 👈 IMPORT CSS MODULE
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Info,
    Loader2,
    Package,
    Trash2
} from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('light');

    useEffect(() => {
        const detectTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme') || 'light';
            setCurrentTheme(theme);
        };

        detectTheme();
        const observer = new MutationObserver(detectTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        return () => observer.disconnect();
    }, []);

    const getToastIcon = (type, isLoading = false) => {
        if (isLoading) {
            return <Loader2 size={20} className="animate-spin" />;
        }

        const iconProps = { size: 20 };

        switch (type) {
            case 'success':
                return <CheckCircle {...iconProps} />;
            case 'error':
                return <XCircle {...iconProps} />;
            case 'warning':
                return <AlertCircle {...iconProps} />;
            case 'info':
                return <Info {...iconProps} />;
            case 'product':
                return <Package {...iconProps} />;
            case 'delete':
                return <Trash2 {...iconProps} />;
            default:
                return <Info {...iconProps} />;
        }
    };

    const getToastClassName = (type) => {
        const baseClass = styles.toast;
        const typeClass = {
            success: styles.toastSuccess,
            error: styles.toastError,
            warning: styles.toastWarning,
            info: styles.toastInfo,
            loading: styles.toastLoading,
            product: styles.toastProduct,
            delete: styles.toastDelete,
        }[type] || styles.toastInfo;

        return `${baseClass} ${typeClass}`;
    };

    const showToast = (message, type = 'info', options = {}) => {
        const {
            isLoading = false,
            iconType = type,
            autoClose = true,
            ...toastOptions
        } = options;

        const autoCloseConfig = {
            success: 4000,
            error: 6000,
            warning: 5000,
            info: 4000,
            product: 4000,
            delete: 4000,
            loading: 30000
        };

        const themeConfig = {
            position: "top-right",
            autoClose: autoClose ? (autoCloseConfig[type] || 4000) : false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: currentTheme === 'light' ? 'light' : 'dark',
            icon: getToastIcon(iconType, isLoading),
            className: getToastClassName(type), // 👈 CLASE CSS MODULE
            progressClassName: styles.progressBar, // 👈 PROGRESS BAR PERSONALIZADA
            bodyClassName: styles.toastBody,
            ...toastOptions
        };

        if (isLoading) {
            return toast.loading(message, themeConfig);
        }

        switch (type) {
            case 'success':
                toast.success(message, themeConfig);
                break;
            case 'error':
                toast.error(message, themeConfig);
                break;
            case 'warning':
                toast.warning(message, themeConfig);
                break;
            case 'info':
                toast.info(message, themeConfig);
                break;
            default:
                toast(message, themeConfig);
        }
    };

    const toastMethods = {
        success: (message, options) => showToast(message, 'success', options),
        error: (message, options) => showToast(message, 'error', options),
        warning: (message, options) => showToast(message, 'warning', options),
        info: (message, options) => showToast(message, 'info', options),
        loading: (message, options) => showToast(message, 'loading', { 
            ...options, 
            isLoading: true,
            autoClose: options?.autoClose !== undefined ? options.autoClose : true
        }),
        product: (message, options) => showToast(message, 'product', { iconType: 'product', ...options }),
        delete: (message, options) => showToast(message, 'delete', { iconType: 'delete', ...options }),
        promise: (promise, messages, options) => {
            return toast.promise(promise, messages, {
                position: "top-right",
                theme: currentTheme === 'light' ? 'light' : 'dark',
                ...options
            });
        }
    };

    return (
        <ToastContext.Provider value={toastMethods}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={currentTheme === 'light' ? 'light' : 'dark'}
                className={styles.toastContainer} // 👈 CONTENEDOR PERSONALIZADO
                toastClassName={styles.toast} // 👈 CLASE BASE PARA TODOS
                closeButton={false} // 👈 OCULTAMOS EL BOTÓN POR DEFECTO
            />
        </ToastContext.Provider>
    );
};