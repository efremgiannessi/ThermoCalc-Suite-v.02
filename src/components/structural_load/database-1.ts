import type { StructuralElement } from './types';

export interface StructuralElementGroup {
  label: string;
  options: StructuralElement[];
}

export const abaco: StructuralElement[] = [
  { codice: "NONE", descrizione: "Nessun elemento selezionato", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "" },
  
  // Elementi "Alare"
  { codice: "AL_70", descrizione: "Alare 70", peso_kg_ml: 628.1463, altezza: 70, momento_inerzia_cm4: 0, note: "Elemento di copertura" },
  { codice: "AL_80", descrizione: "Alare 80", peso_kg_ml: 652.288975, altezza: 80, momento_inerzia_cm4: 0, note: "Elemento di copertura" },
  { codice: "AL_100", descrizione: "Alare 100", peso_kg_ml: 711.6569, altezza: 100, momento_inerzia_cm4: 0, note: "Elemento di copertura" },

  // Travi "TR_I_C" - Aggiunti valori di Momento d'Inerzia (cm^4)
  { codice: "TR_I_C_60", descrizione: 'Trave a "I" C 60', peso_kg_ml: 395, altezza: 60, momento_inerzia_cm4: 180000, note: "Trave portante" },
  { codice: "TR_I_C_80", descrizione: 'Trave a "I" C 80', peso_kg_ml: 455, altezza: 80, momento_inerzia_cm4: 450000, note: "Trave portante" },
  { codice: "TR_I_C_100", descrizione: 'Trave a "I" C 100', peso_kg_ml: 775, altezza: 100, momento_inerzia_cm4: 1100000, note: "Trave portante" },
  { codice: "TR_I_C_120", descrizione: 'Trave a "I" C 120', peso_kg_ml: 855, altezza: 120, momento_inerzia_cm4: 1950000, note: "Trave portante" },
  { codice: "TR_I_C_150", descrizione: 'Trave a "I" C 150', peso_kg_ml: 975, altezza: 150, momento_inerzia_cm4: 3500000, note: "Trave portante" },

  // Travi "TR_I_L"
  { codice: "TR_I_L_60", descrizione: 'Trave a "I" L 60', peso_kg_ml: 445, altezza: 60, momento_inerzia_cm4: 210000, note: "Trave portante" },
  { codice: "TR_I_L_80", descrizione: 'Trave a "I" L 80', peso_kg_ml: 505, altezza: 80, momento_inerzia_cm4: 500000, note: "Trave portante" },
  { codice: "TR_I_L_100", descrizione: 'Trave a "I" L 100', peso_kg_ml: 825, altezza: 100, momento_inerzia_cm4: 1250000, note: "Trave portante" },
  { codice: "TR_I_L_120", descrizione: 'Trave a "I" L 120', peso_kg_ml: 905, altezza: 120, momento_inerzia_cm4: 2200000, note: "Trave portante" },
  { codice: "TR_I_L_150", descrizione: 'Trave a "I" L 150', peso_kg_ml: 1025, altezza: 150, momento_inerzia_cm4: 3800000, note: "Trave portante" },

  // Tegoli "TT"
  { codice: "TT_30_10", descrizione: "Tegolo TT H.30 10", peso_kg_ml: 448, altezza: 30, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_30_14", descrizione: "Tegolo TT H.30 14", peso_kg_ml: 498, altezza: 30, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_30_18", descrizione: "Tegolo TT H.30 18", peso_kg_ml: 548, altezza: 30, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_40_10", descrizione: "Tegolo TT H.40 10", peso_kg_ml: 507.72, altezza: 40, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_40_14", descrizione: "Tegolo TT H.40 14", peso_kg_ml: 577.72, altezza: 40, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_40_18", descrizione: "Tegolo TT H.40 18", peso_kg_ml: 647.72, altezza: 40, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_50_10", descrizione: "Tegolo TT H.50 10", peso_kg_ml: 570.75, altezza: 50, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_50_14", descrizione: "Tegolo TT H.50 14", peso_kg_ml: 660.72, altezza: 50, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_50_18", descrizione: "Tegolo TT H.50 18", peso_kg_ml: 750.72, altezza: 50, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_60_10", descrizione: "Tegolo TT H.60 10", peso_kg_ml: 637.08, altezza: 60, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_60_14", descrizione: "Tegolo TT H.60 14", peso_kg_ml: 747.08, altezza: 60, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_60_18", descrizione: "Tegolo TT H.60 18", peso_kg_ml: 857.05, altezza: 60, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_70_10", descrizione: "Tegolo TT H.70 10", peso_kg_ml: 717.37, altezza: 70, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_70_14", descrizione: "Tegolo TT H.70 14", peso_kg_ml: 836.74, altezza: 70, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_70_18", descrizione: "Tegolo TT H.70 18", peso_kg_ml: 966.32, altezza: 70, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_80_10", descrizione: "Tegolo TT H.80 10", peso_kg_ml: 779.26, altezza: 80, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_80_14", descrizione: "Tegolo TT H.80 14", peso_kg_ml: 929.62, altezza: 80, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },
  { codice: "TT_80_18", descrizione: "Tegolo TT H.80 18", peso_kg_ml: 1080, altezza: 80, momento_inerzia_cm4: 0, note: "Solaio a doppia T" },

  // Capriate "DP_CAP" (Tipo 1)
  { codice: "DP_CAP_157", descrizione: "Capriata DP CAP 157", peso_kg_ml: 833, altezza: 157, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_163", descrizione: "Capriata DP CAP 163", peso_kg_ml: 847, altezza: 163, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_169", descrizione: "Capriata DP CAP 169", peso_kg_ml: 862, altezza: 169, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_175", descrizione: "Capriata DP CAP 175", peso_kg_ml: 877, altezza: 175, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_181", descrizione: "Capriata DP CAP 181", peso_kg_ml: 892, altezza: 181, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_187", descrizione: "Capriata DP CAP 187", peso_kg_ml: 907, altezza: 187, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_193", descrizione: "Capriata DP CAP 193", peso_kg_ml: 922, altezza: 193, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_199", descrizione: "Capriata DP CAP 199", peso_kg_ml: 937, altezza: 199, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_205", descrizione: "Capriata DP CAP 205", peso_kg_ml: 952, altezza: 205, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },

  // Capriate "DP_CAP" (Tipo 2)
  { codice: "DP_CAP_150", descrizione: "Capriata DP CAP 150", peso_kg_ml: 730, altezza: 150, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_160", descrizione: "Capriata DP CAP 160", peso_kg_ml: 745, altezza: 160, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_170", descrizione: "Capriata DP CAP 170", peso_kg_ml: 760, altezza: 170, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_180", descrizione: "Capriata DP CAP 180", peso_kg_ml: 775, altezza: 180, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_190", descrizione: "Capriata DP CAP 190", peso_kg_ml: 790, altezza: 190, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_200", descrizione: "Capriata DP CAP 200", peso_kg_ml: 805, altezza: 200, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_210", descrizione: "Capriata DP CAP 210", peso_kg_ml: 820, altezza: 210, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_220", descrizione: "Capriata DP CAP 220", peso_kg_ml: 835, altezza: 220, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },
  { codice: "DP_CAP_230", descrizione: "Capriata DP CAP 230", peso_kg_ml: 850, altezza: 230, momento_inerzia_cm4: 0, note: "Elemento di copertura principale" },

  // Arcarecci "ARC"
  { codice: "ARC_45", descrizione: "Arcareccio 45", peso_kg_ml: 170, altezza: 45, momento_inerzia_cm4: 0, note: "Arcareccio" },
  { codice: "ARC_60", descrizione: "Arcareccio 60", peso_kg_ml: 218.17, altezza: 60, momento_inerzia_cm4: 0, note: "Arcareccio" },
  { codice: "ARC_80", descrizione: "Arcareccio 80", peso_kg_ml: 345, altezza: 80, momento_inerzia_cm4: 0, note: "Arcareccio" },

  // Canale "TR_U"
  { codice: "TR_U", descrizione: "Canale TR U", peso_kg_ml: 250, altezza: 0, momento_inerzia_cm4: 0, note: "Canale" },

  // Pannelli
  { codice: "PAN_20_grigio", descrizione: "Pannello 20 grigio", peso_kg_ml: 350, altezza: 20, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },
  { codice: "PAN_20_marmo", descrizione: "Pannello 20 marmo", peso_kg_ml: 350, altezza: 20, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },
  { codice: "PAN_20_mincio", descrizione: "Pannello 20 mincio", peso_kg_ml: 350, altezza: 20, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },
  { codice: "PAN_TT30_grigio", descrizione: "Pannello TT30 grigio", peso_kg_ml: 475, altezza: 30, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },
  { codice: "PAN_TT30_marmo", descrizione: "Pannello TT30 marmo", peso_kg_ml: 475, altezza: 30, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },
  { codice: "PAN_TT30_mincio", descrizione: "Pannello TT30 mincio", peso_kg_ml: 475, altezza: 30, momento_inerzia_cm4: 0, note: "Pannello di tamponamento" },

  // Elementi Vari (Shed, Tamponamenti, Lastre)
  { codice: "SHED_M", descrizione: "Shed M", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "SHED_T", descrizione: "Shed T", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_C_100", descrizione: "Tamponamento C 100", peso_kg_ml: 0, altezza: 100, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_C_70", descrizione: "Tamponamento C 70", peso_kg_ml: 0, altezza: 70, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_C_80", descrizione: "Tamponamento C 80", peso_kg_ml: 0, altezza: 80, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_L_100", descrizione: "Tamponamento L 100", peso_kg_ml: 0, altezza: 100, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_L_70", descrizione: "Tamponamento L 70", peso_kg_ml: 0, altezza: 70, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "TMP_L_80", descrizione: "Tamponamento L 80", peso_kg_ml: 0, altezza: 80, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "LASTR_BANCO", descrizione: "Lastra Banco", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "LASTR_CURV", descrizione: "Lastra Curva", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "LASTR_NERV", descrizione: "Lastra Nervata", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
  { codice: "LASTR_PIANA", descrizione: "Lastra Piana", peso_kg_ml: 0, altezza: 0, momento_inerzia_cm4: 0, note: "Elemento vario" },
];

export const groupedAbaco: StructuralElementGroup[] = [
  {
    label: "Solaio Alare",
    options: abaco.filter(e => e.codice.startsWith("AL_")),
  },
  {
    label: 'Travi a "I"',
    options: abaco.filter(e => e.codice.startsWith("TR_I_")),
  },
  {
    label: "Solaio a Tegoli TT",
    options: abaco.filter(e => e.codice.startsWith("TT_")),
  },
  {
    label: "Capriate",
    options: abaco.filter(e => e.codice.startsWith("DP_CAP_")),
  },
  {
    label: "Arcarecci",
    options: abaco.filter(e => e.codice.startsWith("ARC_")),
  },
  {
    label: "Canali",
    options: abaco.filter(e => e.codice.startsWith("TR_U")),
  },
  {
    label: "Pannelli di Tamponamento",
    options: abaco.filter(e => e.codice.startsWith("PAN_")),
  },
  {
    label: "Elementi Vari",
    options: abaco.filter(e => 
      !e.codice.startsWith("AL_") &&
      !e.codice.startsWith("TR_I_") &&
      !e.codice.startsWith("TT_") &&
      !e.codice.startsWith("DP_CAP_") &&
      !e.codice.startsWith("ARC_") &&
      !e.codice.startsWith("TR_U") &&
      !e.codice.startsWith("PAN_") &&
      e.codice !== "NONE"
    ),
  }
];