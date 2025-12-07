// context/CategoriesContext.jsx

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useCategories as useCategoriesHook } from '../features/Categories/hook/categoryHook';

const CategoriesContext = createContext(null);

export const CategoriesProvider = ({ children }) => {
    const categoriesData = useCategoriesHook();
    const hasLoadedRef = useRef(false);
    
    useEffect(() => {
        // ✅ Solo cargar UNA VEZ cuando se monta el provider
        if (!hasLoadedRef.current) {
            console.log('🌳 CategoriesProvider: Cargando árbol inicial...');
            hasLoadedRef.current = true;
            categoriesData.fetchCategoryTree(true);
        }
    }, []); // ✅ Array vacío - solo al montar

    return (
        <CategoriesContext.Provider value={categoriesData}>
            {children}
        </CategoriesContext.Provider>
    );
};

export const useCategoriesContext = () => {
    const context = useContext(CategoriesContext);
    if (!context) {
        throw new Error('useCategoriesContext debe usarse dentro de CategoriesProvider');
    }
    return context;
};