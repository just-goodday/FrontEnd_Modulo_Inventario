// pages/Error/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: '20px'
        }}>
            <h1>403 - No Autorizado</h1>
            <p>No tienes permisos para acceder a esta página</p>
            <button onClick={() => navigate('/dashboard')}>
                Volver al Dashboard
            </button>
        </div>
    );
};

export default Unauthorized;