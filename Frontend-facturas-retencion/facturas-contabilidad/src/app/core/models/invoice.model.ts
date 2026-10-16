export interface Factura {
  id_factura: string;
  nit_proveedor: number;
  fecha_factura: string;
  concepto: string;
  base_gravable: number;
  tarifa_iva: number;
  valor_iva: number;
  tarifa_retencion: number;
  valor_retencion: number;
  total_factura: number;
  ivaEsperado: number;
  totalEsperado: number;
  facturaDuplicada: boolean;
  RegistroContable: boolean;
  FacturaCorrecta: boolean;
  FacturaError: string;
}

export interface ApiResponseFacturas {
  status: string;
  message: string;
  dataFactura: Factura[];
}

export type StatusFilter = 'ALL' | 'CORRECT' | 'ERROR' | 'NO_RECORD';