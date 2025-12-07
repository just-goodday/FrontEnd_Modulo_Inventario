import React, { createContext, useContext } from 'react';
import { usePriceLists } from '../features/PriceLists/hook/priceListHook';

const PriceListsContext = createContext(null);

export const PriceListsProvider = ({ children }) => {
    // El hook ya carga los datos automáticamente con su useEffect interno
    const priceListsData = usePriceLists();
    
    console.log('🌳 PriceListsProvider montado, estado:', {
        loading: priceListsData.loading,
        cantidad: priceListsData.priceLists.length
    });

    return (
        <PriceListsContext.Provider value={priceListsData}>
            {children}
        </PriceListsContext.Provider>
    );
};

export const usePriceListsContext = () => {
    const context = useContext(PriceListsContext);
    if (!context) {
        throw new Error('usePriceListsContext debe usarse dentro de PriceListsProvider');
    }
    return context;
};