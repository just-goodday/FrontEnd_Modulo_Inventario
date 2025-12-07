import React from 'react';
import { useHeader } from '../../../context/useHeader';
import UnderDevelopment from '../../../pages/Error/UnderDevelopment';

export default function DashboardHome() {
    const { setPageTitle } = useHeader();

    // Establece el título cuando el componente se monta
    React.useEffect(() => {
        setPageTitle('Dashboard');
    }, [setPageTitle]);

    return (
            <UnderDevelopment 
                moduleName="DashBoard" 
                image="/images/working-categories.png"
            />
        );
}