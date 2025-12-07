import React from 'react';
import { Pagination, Select } from 'antd';
import styles from './Pagination.module.css';

const CustomPagination = ({ total, currentPage, perPage, onPageChange }) => {
    const handleChange = (page, pageSize) => {
        onPageChange(page, pageSize);
    };

    const handleSizeChange = (current, size) => {
        onPageChange(1, size); // Reset to page 1 when changing page size
    };

    // Calcular los números que se muestran
    const start = total > 0 ? ((currentPage - 1) * perPage) + 1 : 0;
    const end = Math.min(currentPage * perPage, total);
    
    return (
        <div className={styles.paginationContainer}>
            {/* Texto a la izquierda */}
            <div className={styles.paginationInfo}>
                Mostrando {start}-{end} de {total.toLocaleString()} productos
            </div>

            {/* Selector de items por página */}
            <div className={styles.pageSizeSelector}>
                <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Mostrar:</span>
                <Select
                    value={perPage}
                    onChange={(value) => handleSizeChange(currentPage, value)}
                    options={[
                        { value: 10, label: '10' },
                        { value: 25, label: '25' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' },
                    ]}
                    style={{ width: 80 }}
                    size="small"
                />
            </div>

            {/* Paginación a la derecha */}
            <div className={styles.paginationWrapper}>
                <Pagination
                    showSizeChanger={false}
                    current={currentPage}
                    total={total}
                    pageSize={perPage}
                    onChange={handleChange}
                    showQuickJumper={false}
                    // 🔥 REMOVIDO: showTotal (ya lo muestras arriba)
                />
            </div>
        </div>
    );
};

export default CustomPagination;