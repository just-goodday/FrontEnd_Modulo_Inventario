import React, { createContext, useContext } from 'react';
import { useWarehouses } from '../features/Warehouses/hook/warehouseHook';

const WarehousesContext = createContext(null);

export const WarehousesProvider = ({ children }) => {
    // El hook ya carga los datos automáticamente con su useEffect interno
    const warehousesData = useWarehouses();
    
    console.log('🌳 WarehousesProvider montado, estado:', {
        loading: warehousesData.loading,
        cantidad: warehousesData.warehouses.length
    });

    return (
        <WarehousesContext.Provider value={warehousesData}>
            {children}
        </WarehousesContext.Provider>
    );
};

export const useWarehousesContext = () => {
    const context = useContext(WarehousesContext);
    if (!context) {
        throw new Error('useWarehousesContext debe usarse dentro de WarehousesProvider');
    }
    return context;
};