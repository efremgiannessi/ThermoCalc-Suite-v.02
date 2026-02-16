
export type TabType = 'termica' | 'commerciale' | 'scientifica' | 'interpol' | 'pendenze' | 'pesi' | 'montaggio' | 'trasporto' | 'manufatti' | 'convertitore' | 'cantieristica' | 'idraulica' | 'pluviali' | 'stratigrafie' | 'strutturale';

export interface ToastProps {
  message: string;
  show: boolean;
}

// Ensure Leaflet is recognized on window
declare global {
  interface Window {
    L: any;
  }
}