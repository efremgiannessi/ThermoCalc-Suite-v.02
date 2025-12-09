export type TabType = 'termica' | 'commerciale' | 'percentuali' | 'scientifica' | 'interpol' | 'pendenze' | 'pesi';

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