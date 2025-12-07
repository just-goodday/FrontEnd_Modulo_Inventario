import { useState, useEffect } from 'react';
import styles from './Header.module.css';

const Header = ({ 
  pageTitle = 'Gestión de Productos',
  userName = 'Jonathan',
  userRole = 'admin',
  notificationCount = 3,
  onThemeChange
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    setCurrentTheme(theme);
  }, []);

  const handleThemeToggle = () => {
    const themes = ['light', 'dark', 'datastore'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    
    if (onThemeChange) {
      onThemeChange(nextTheme);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(`.${styles.userMenu}`)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const getUserInitial = () => {
    return userName.charAt(0).toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Acciones del header */}
        <div className={styles.actions}>
          {/* Botón de notificaciones */}
          <button className={styles.notificationButton} aria-label="Notificaciones">
            <div className={styles.iconWrapper}>
              <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            {notificationCount > 0 && (
              <div className={styles.badge}>
                <span>{notificationCount}</span>
              </div>
            )}
          </button>

          {/* Separador */}
          <div className={styles.separator}></div>

          {/* Botón de tema */}
          <button 
            className={styles.themeButton} 
            onClick={handleThemeToggle}
            aria-label="Cambiar tema"
            title={`Tema actual: ${currentTheme}`}
          >
            {currentTheme === 'light' ? (
              <svg className={styles.themeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : currentTheme === 'dark' ? (
              <svg className={styles.themeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className={styles.themeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </button>

          {/* Menú de usuario */}
          <div className={styles.userMenu}>
            <button 
              className={styles.userButton}
              onClick={toggleUserMenu}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className={styles.avatar}>
                <div className={styles.avatarInner}>
                  <span>{getUserInitial()}</span>
                </div>
              </div>

              {/* Información del usuario */}
              <div className={styles.userInfo}>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userRole}>{userRole}</div>
              </div>

              {/* Chevron */}
              <div className={`${styles.chevron} ${isUserMenuOpen ? styles.chevronOpen : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path 
                    d="M4 6L8 10L12 6" 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="1.33333" 
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown del menú */}
            {isUserMenuOpen && (
              <div className={styles.dropdown}>
                <button className={styles.dropdownItem}>
                  <span>Mi Perfil</span>
                </button>
                <button className={styles.dropdownItem}>
                  <span>Configuración</span>
                </button>
                <div className={styles.dropdownDivider}></div>
                <button className={styles.dropdownItem}>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;