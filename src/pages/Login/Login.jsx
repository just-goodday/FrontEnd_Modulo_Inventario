import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { Lock, Mail, Eye, EyeOff, Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../routes/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDefaultRoute } from '../../config/routeConfig';
import styles from './Login.module.css';

const Login = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isMobile, setIsMobile] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Detectar tema inicial y tamaño de pantalla
    useEffect(() => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        setTheme(currentTheme);

        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cambiar tema
    const toggleTheme = () => {
        const themes = ['light', 'dark', 'datastore'];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        document.documentElement.setAttribute('data-theme', nextTheme);
        setTheme(nextTheme);
        message.success(`Tema cambiado a ${nextTheme === 'light' ? 'Claro' : nextTheme === 'dark' ? 'Oscuro' : 'DataStore'}`);
    };

    // ✅ Manejar login con redirección inteligente
    const handleLogin = async (values) => {
        setLoading(true);
        
        try {
            const result = await login(values);
            
            if (result.success) {
                message.success('¡Bienvenido al Sistema ERP DataStore!');
                
                // ✅ Obtener la ruta por defecto según permisos del usuario
                const defaultRoute = getDefaultRoute(result.user?.permissions || []);
                
                // Redirigir a la ruta apropiada
                navigate(defaultRoute, { replace: true });
            } else {
                message.error(result.error || 'Credenciales inválidas');
            }
        } catch (error) {
            message.error('Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* Gradiente animado de fondo */}
            <div className={styles.gradientBg}></div>

            {/* Botón de cambio de tema flotante */}
            <button className={styles.themeToggle} onClick={toggleTheme}>
                {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Sparkles size={20} />}
            </button>

            {/* Contenedor principal */}
            <div className={styles.contentWrapper}>
                {/* Panel izquierdo - Branding (oculto en móvil) */}
                {!isMobile && (
                    <div className={styles.brandPanel}>
                        <div className={styles.brandContent}>
                            {/* Logo animado */}
                            <div className={styles.logoContainer}>
                                <div className={styles.logoFallback}>
                                    <div className={styles.logoText}>DS</div>
                                    <div className={styles.logoGlow}></div>
                                </div>
                            </div>

                            {/* Texto de bienvenida */}
                            <h1 className={styles.brandTitle}>
                                Sistema ERP <span className={styles.brandHighlight}>DataStore</span>
                            </h1>
                            <p className={styles.brandSubtitle}>
                                Plataforma empresarial moderna para la gestión integral de tu negocio
                            </p>

                            {/* Características */}
                            <div className={styles.features}>
                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>🚀</div>
                                    <div className={styles.featureText}>Moderno y Rápido</div>
                                </div>
                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>🔒</div>
                                    <div className={styles.featureText}>Seguro y Confiable</div>
                                </div>
                                <div className={styles.feature}>
                                    <div className={styles.featureIcon}>📊</div>
                                    <div className={styles.featureText}>Análisis en Tiempo Real</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Panel derecho - Formulario */}
                <div className={`${styles.formPanel} ${isMobile ? styles.mobileForm : ''}`}>
                    <div className={styles.formContainer}>
                        {/* Header del formulario */}
                        <div className={styles.formHeader}>
                            {isMobile && (
                                <div className={styles.mobileLogo}>
                                    <div className={styles.logoFallback}>
                                        <div className={styles.logoText}>DS</div>
                                    </div>
                                    <h1 className={styles.mobileBrandTitle}>DataStore ERP</h1>
                                </div>
                            )}
                            <h2 className={styles.formTitle}>Iniciar Sesión</h2>
                            <p className={styles.formSubtitle}>
                                Ingresa a tu cuenta para continuar
                            </p>
                        </div>

                        {/* Formulario */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleLogin}
                            className={styles.form}
                            requiredMark={false}
                        >
                            {/* Email o Usuario */}
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Por favor ingresa tu usuario o email' }
                                ]}
                            >
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.inputIcon} size={20} />
                                    <Input
                                        placeholder="usuario@empresa.com"
                                        className={styles.input}
                                        size="large"
                                    />
                                </div>
                            </Form.Item>

                            {/* Password */}
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
                            >
                                <div className={styles.inputWrapper}>
                                    <Lock className={styles.inputIcon} size={20} />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Ingresa tu contraseña"
                                        className={styles.input}
                                        size="large"
                                    />
                                    <button
                                        type="button"
                                        className={styles.eyeButton}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </Form.Item>

                            {/* Recordar y recuperar */}
                            <div className={styles.formOptions}>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox className={styles.checkbox}>
                                        Recordar sesión
                                    </Checkbox>
                                </Form.Item>
                                {/* <a href="#" className={styles.forgotLink}>
                                    ¿Olvidaste tu contraseña?
                                </a> */}
                            </div>

                            {/* Botón de login */}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className={styles.loginButton}
                                    size="large"
                                    block
                                    icon={<ArrowRight size={20} />}
                                    iconPosition="end"
                                >
                                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Footer */}
                        <div className={styles.formFooter}>
                            <p>© 2025 DataStore ERP. Sistema en desarrollo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;