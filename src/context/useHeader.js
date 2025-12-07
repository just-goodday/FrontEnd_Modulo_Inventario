import { useContext } from 'react';
import { HeaderContext } from './HeaderContext';

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader debe usarse dentro de HeaderProvider');
  }
  return context;
}