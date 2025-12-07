import { useState } from 'react';
import { HeaderContext } from './HeaderContext';

export function HeaderProvider({ children }) {
  const [pageTitle, setPageTitle] = useState('Dashboard');

  return (
    <HeaderContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </HeaderContext.Provider>
  );
}