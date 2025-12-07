import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context
import { CategoriesProvider } from '../context/CategoriesContext';
import { WarehousesProvider } from '../context/WarehousesContext';
import { PriceListsProvider } from '../context/PriceListsContext'; // ✅ AGREGAR

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Features
import DashboardHome from '../features/Dashboard/ui/DashboardHome';
import ProductsList from '../features/Products/ui/Products';
import CategoriesList from '../features/Categories/ui/Categories';
import InventoryList from '../features/Inventory/ui/Inventory';
import ClientsList from '../features/Clients/ui/Clients';

// Pages
import Login from '../pages/Login/Login';
import NotFound from '../pages/Error/404';
import Unauthorized from '../pages/Error/Unauthorized';

// Components
import ProtectedRoute from '../routes/ProtectedRoute';
import PublicRoute from '../routes/PublicRoute';

export default function AppRouter() {
    return (
        <Routes>
            {/* Redirección raíz */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Ruta de login */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />

            {/* Dashboard - Accesible para todos los autenticados */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardHome />} />
            </Route>

            {/* 🔥 PROVIDERS ENVOLVIENDO TODAS LAS RUTAS */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <CategoriesProvider>
                            <WarehousesProvider>
                                <PriceListsProvider> {/* ✅ AGREGAR AQUÍ */}
                                    <DashboardLayout />
                                </PriceListsProvider>
                            </WarehousesProvider>
                        </CategoriesProvider>
                    </ProtectedRoute>
                }
            >
                {/* Productos */}
                <Route 
                    path="products" 
                    element={
                        <ProtectedRoute requiredPermission="products.index">
                            <ProductsList />
                        </ProtectedRoute>
                    } 
                />

                {/* Inventario */}
                <Route 
                    path="inventory" 
                    element={
                        <ProtectedRoute requiredPermission="inventory.index">
                            <InventoryList />
                        </ProtectedRoute>
                    } 
                />

                {/* Categorías */}
                <Route 
                    path="categories" 
                    element={
                        <ProtectedRoute requiredPermission="categories.index">
                            <CategoriesList />
                        </ProtectedRoute>
                    } 
                />

                {/* Clientes */}
                <Route 
                    path="clients" 
                    element={
                        <ProtectedRoute>
                            <ClientsList />
                        </ProtectedRoute>
                    } 
                />
            </Route>

            {/* Página de no autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}