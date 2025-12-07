import React from 'react'

/**
 * Badge de estado con estilo pastel + borde suave.
 * Uso: <StatusBadge status="Activo" /> | <StatusBadge status="Stock Bajo" />
 * Props:
 *  - status: "Activo" | "Stock Bajo" | "Inactivo" | string
 *  - size: "sm" | "md" (opcional)
 */
export default function StatusBadge({ status = 'Activo', size = 'sm' }) {
  const sizeMap = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const styleMap = {
    Activo: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
    'Stock Bajo': 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
    Inactivo: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  }

  const base =
    'inline-flex items-center rounded-full font-medium whitespace-nowrap'

  const cls = `${base} ${sizeMap[size] || sizeMap.sm} ${
    styleMap[status] || styleMap.Inactivo
  }`

  return <span className={cls}>{status}</span>
}
