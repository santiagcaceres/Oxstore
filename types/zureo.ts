// Tipos basados en la documentación de la API de Zureo v1.8

export interface ZureoProduct {
  id: number
  codigo: string
  nombre: string
  fecha_alta: string
  fecha_modificado: string
  stock: number
  descripcion_corta: string
  descripcion_larga: string
  precio: number
  id_moneda: number
  impuesto: number
  tipo: { id: number; nombre: string }
  marca: { id: number; nombre: string }
  variedades: ZureoVariety[]
  baja?: boolean
}

export interface ZureoVariety {
  id: number
  nombre: string
  descripcion: string
  fecha_modificado: string
  stock: number
  precio: number
  id_moneda: number
  atributos: Array<{ atributo: string; valor: string }>
}

export interface ZureoImage {
  id: number
  tipo_id: number
  tipo_nombre: string
  base64: string
  descripcion: string
  filename: string
  fecha_modificado: string
}

export interface ZureoOrder {
  id_referencia?: number
  id_empresa: number
  id_tipo_comprobante?: number
  id_sucursal?: number
  fecha: string
  id_moneda: number
  tipo_cambio?: number
  envio: ZureoShippingInfo
  comentario?: string
  pago: ZureoPaymentInfo
  productos: ZureoOrderProduct[]
  cliente: ZureoCustomerInfo
}

export interface ZureoShippingInfo {
  id: number
  costo?: number
  horario?: string
  comentario?: string
  direccion: ZureoAddress
}

export interface ZureoPaymentInfo {
  modalidad: number
  codigo?: string
  estado?: string
  fechaPago?: string
  cuotas?: number
  importe: number
  moneda: number
  autorizacion?: string
}

export interface ZureoOrderProduct {
  id_producto: number
  id_variedad?: number
  precio_unitario: number
  cantidad: number
  comentario?: string
}

export interface ZureoCustomerInfo {
  nombre: string
  apellido: string
  razon_social?: string
  guardar_como: string
  email: string
  telefono?: string
  identificador?: string
  direccion: ZureoAddress
}

export interface ZureoAddress {
  calle: string
  numero: string
  apto?: string
  entre?: string
  id_ciudad: number
  cod_postal?: number
}
