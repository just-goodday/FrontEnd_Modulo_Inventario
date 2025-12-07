// config/routeConfig.js

export const routePermissions = {
    '/dashboard': null, // Ruta base, accesible para todos los autenticados
    '/products': 'products.index',
    '/inventory': 'inventory.index',
    '/categories': 'categories.index',
    '/warehouses': 'warehouses.index',
    '/users': 'users.index',
    // Agrega más rutas según necesites
};

// Función para obtener la primera ruta disponible según permisos
export const getDefaultRoute = (userPermissions = []) => {
    // Orden de prioridad de rutas
    const routePriority = [
        '/dashboard',
        '/products',
        '/inventory',
        '/categories',
        '/warehouses',
        '/users',
    ];

    // Buscar la primera ruta accesible
    for (const route of routePriority) {
        const requiredPermission = routePermissions[route];
        
        // Si la ruta no requiere permiso o el usuario tiene el permiso
        if (!requiredPermission || userPermissions.includes(requiredPermission)) {
            return route;
        }
    }

    // Si no tiene acceso a ninguna ruta, retornar unauthorized
    return '/unauthorized';
};