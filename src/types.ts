
export type TabType = 'termica' | 'commerciale' | 'scientifica' | 'interpol' | 'pendenze' | 'pesi' | 'montaggio' | 'trasporto' | 'manufatti' | 'convertitore' | 'cantieristica' | 'idraulica' | 'pluviali' | 'stratigrafie' | 'strutturale' | 'isocalc' | 'structural_load';

export interface ToastProps {
  message: string;
  show: boolean;
}

export interface StructuralElement {
  codice: string;
  descrizione: string;
  peso_kg_ml: number;
  altezza: number;
  momento_inerzia_cm4: number;
  note: string;
}

export interface CalculationState {
  id: string;
  moduleTitle: string;
  solaioCodice: string;
  interasseSolaio: number;
  traveCodice: string;
  luceTrave: number;
  areaInfluenzaTrave: number;
  caricoImpermeabilizzazione: number;
  caricoIsolante: number;
  caricoNeve: number;
  caricoFotovoltaico: number;
  caricoAppesi: number;
  caricoAltriPermanenti: number;
}

// Ensure Leaflet and other libs are recognized on window
declare global {
  interface Window {
    L: any;
    jspdf: any;
    html2canvas: any;
    XLSX: any;
  }
}
