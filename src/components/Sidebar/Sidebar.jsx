import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import MenuSidebar from './Menu/Menu';
import LogoutButton from './ButtonLogOut/BtnLogOut';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoImage}>
            <img src="/logo.svg" alt="DataStore" />
          </div>
          <div className={styles.logoText}>DataStore</div>
        </div>
      </div>

      {/* Navigation - Usando el componente MenuSidebar */}
      <nav className={styles.nav}>
        <MenuSidebar />
      </nav>

      {/* Botón de cerrar sesión en el footer */}
      <footer className={styles.sidebarFooter}>
        <LogoutButton />
      </footer>
    </aside>
  );
};

export default Sidebar;