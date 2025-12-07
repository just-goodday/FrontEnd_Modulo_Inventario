import './index.css'
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from './theme/ThemeProvider';
import { HeaderProvider } from './context/HeaderProvider';
import { AuthProvider } from './routes/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppRouter from './routes/AppRouter.jsx';
import { App as AntApp } from 'antd';
import { useApiErrorToast } from './hooks/useApiErrorToast.js';
import './index.css';

// 👉 Componente interno que usa los providers
function AppContent() {
  // 👈 Usar el hook aquí (después de ToastProvider)
  useApiErrorToast();

  return (
    <BrowserRouter>
      <AntApp>
        <AppRouter />
      </AntApp>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <HeaderProvider>
            {/* 👇 Mover el contenido a un componente interno */}
            <AppContent />
          </HeaderProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}