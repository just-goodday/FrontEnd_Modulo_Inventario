// Color principal
export const PRIMARY_COLOR = '#13c888';

// Datos estáticos para los indicadores
export const STAT_CARDS = [
  { title: "Total Productos", value: 1247, color: 'green', iconColor: 'text-green-600', hoverColor: 'bg-green-200/70' },
  { title: "Productos Activos", value: 1189, color: 'lime', iconColor: 'text-lime-600', hoverColor: 'bg-lime-200/70' },
  { title: "Stock Bajo", value: 23, color: 'red', iconColor: 'text-red-600', hoverColor: 'bg-red-200/70' },
  { title: "Categorías", value: 45, color: 'purple', iconColor: 'text-purple-600', hoverColor: 'bg-purple-200/70' },
];

// Datos estáticos momentáneos (simulando API)
export const MOCK_PRODUCTS = [
  { id: 1, name: "Laptop Dell Inspiron 15", sku: "001", category: "Electrónicos", price: 2499.00, stock: 25, minStock: 10, status: "Activo" },
  { id: 2, name: "Producto Sub", sku: "001", category: "Accesorios", price: 289.00, stock: 5, minStock: 15, status: "Stock Bajo" },
  { id: 3, name: "Webcam Logitech C920", sku: "002", category: "Accesorios", price: 89.99, stock: 150, minStock: 50, status: "Activo" },
  { id: 4, name: "Monitor Curvo Samsung G5", sku: "003", category: "Gaming", price: 450.00, stock: 12, minStock: 15, status: "Activo" },
  { id: 5, name: "Teclado Mecánico Corsair K95", sku: "004", category: "Gaming", price: 189.00, stock: 4, minStock: 10, status: "Stock Bajo" },
  { id: 6, name: "Smartwatch Xiaomi Band 8", sku: "005", category: "Electrónicos", price: 55.00, stock: 200, minStock: 30, status: "Activo" },
  { id: 7, name: "Disco Duro Externo 2TB", sku: "006", category: "Accesorios", price: 75.00, stock: 8, minStock: 10, status: "Stock Bajo" },
];
