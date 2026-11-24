import type { Categoria } from '../../categorias/types/categoria'

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria | null
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export interface FiltrosProductos {
  skip?: number
  limit?: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export interface ProductoPayload {
  categoria_id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
}

export interface ProductoStockPayload {
  stock: number
  disponible: boolean
}
