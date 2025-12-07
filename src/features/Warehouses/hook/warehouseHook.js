import { useState, useEffect } from "react";
import { getWarehouses } from "../services/warehouseService";

export const useWarehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getWarehouses();
                
                // La respuesta ya viene procesada del service
                if (response.success && response.data) {
                    setWarehouses(response.data);
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (err) {
                console.error('❌ Error fetching warehouses:', err);
                setError(err.message);
                setWarehouses([]); // Array vacío en caso de error
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    return { 
        warehouses, 
        loading, 
        error 
    };
};