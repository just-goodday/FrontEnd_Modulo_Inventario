import { useState, useCallback } from "react";
import { generateProductInfo } from "../services/geminiService";

export const useGemini = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState('');

    const generateProductAction = useCallback(async (productName) => {
        if (!productName?.trim()) {
            const errorMsg = '❌ Ingresa un nombre para generar';
            setError(errorMsg);
            setResult(errorMsg);
            return { success: false, error: errorMsg };
        }

        setLoading(true);
        setError(null);

        try {
            const response = await generateProductInfo(productName);
            setResult('✅ Producto generado correctamente');
            return { success: true, data: response.data };
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            setResult('❌ Error generando producto: ' + errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        generateProduct: generateProductAction,
        loading,
        error,
        result
    };
};
