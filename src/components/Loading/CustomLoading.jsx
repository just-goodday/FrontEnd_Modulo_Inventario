// components/ThreeCirclesLoading.jsx
import React from 'react';
import { ThreeCircles } from 'react-loader-spinner';

const ThreeCirclesLoading = () => {
    return (
        <div className="loading-container">
        <div className="loading-content">
            <ThreeCircles
            height="80"
            width="80"
            visible={true}
            ariaLabel="three-circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            // 🎨 PALETA DE COLORES DEL TEMA
            outerCircleColor="var(--primary)"           // Verde #13c888
            innerCircleColor="var(--primary-hover)"     // Verde oscuro #10a771
            middleCircleColor="var(--primary-light)"    // Verde claro #d0f4e7
            />
            <p className="loading-text">
            Cargando contenido...
            </p>
        </div>
        
        <style jsx>{`
            .loading-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: var(--bg);
            transition: all 0.3s ease;
            }
            
            .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            }
            
            .loading-text {
            margin-top: 24px;
            font-size: 16px;
            line-height: 24px;
            font-weight: 500;
            color: var(--text-secondary);
            font-family: 'Inter', sans-serif;
            }
        `}</style>
        </div>
    );
};

export default ThreeCirclesLoading;