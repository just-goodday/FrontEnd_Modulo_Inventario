import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Obtiene el elemento raíz del DOM
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Renderiza la aplicación principal
root.render(
    <App />
);
