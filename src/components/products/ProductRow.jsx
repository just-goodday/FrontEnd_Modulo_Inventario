import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'
import { PRIMARY_COLOR } from '../../constants/appConfig.js'

export default function ProductRow({ product }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150">
      {/* Checkbox */}
      <td className="pl-4 py-3 align-middle">
        <input
          type="checkbox"
          className="h-4 w-4 rounded focus:ring-0"
          style={{ accentColor: PRIMARY_COLOR }}
        />
      </td>

      {/* Producto */}
      <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap align-middle">
        {product.name}
      </td>

      {/* SKU */}
      <td className="px-3 text-slate-600 whitespace-nowrap align-middle">
        {product.sku}
      </td>

      {/* Categoría */}
      <td className="px-3 text-slate-600 whitespace-nowrap align-middle">
        {product.category}
      </td>

      {/* Precio */}
      <td className="px-3 text-slate-800 whitespace-nowrap align-middle">
        S/. {product.price.toFixed(2)}
      </td>

      {/* Stock + mínimo */}
      <td className="px-3 text-slate-600 whitespace-nowrap align-middle">
        <div className="font-medium text-slate-800">{product.stock} unidades</div>
        <div className="text-xs text-slate-500">Mín: {product.minStock}</div>
      </td>

      {/* Estado */}
      <td className="px-3 whitespace-nowrap align-middle">
        <StatusBadge status={product.status} />
      </td>

      {/* Acciones */}
      <td className="px-3 pr-4 whitespace-nowrap align-middle text-right">
        <div className="flex items-center justify-end gap-3 text-slate-400">
          <button title="Editar producto" className="hover:text-emerald-600 transition-colors">
            <Edit size={16} />
          </button>
          <button title="Eliminar producto" className="hover:text-rose-600 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}