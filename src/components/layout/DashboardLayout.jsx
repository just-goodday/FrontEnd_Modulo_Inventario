import React from "react";
import { Outlet } from "react-router-dom";
import { useHeader } from "../../context/useHeader";
import { useTheme } from "../../theme/useTheme";
import styles from "./DashboardLayout.module.css";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

export default function DashboardLayout() {
  const { pageTitle } = useHeader();
  const { setTheme } = useTheme();

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <Sidebar activeItem="dashboard" />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Header - Usando tu componente */}
        <Header 
          pageTitle={pageTitle}
          userName="Jonathan"
          userRole="Admin"
          notificationCount={3}
          onThemeChange={setTheme}
        />

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}