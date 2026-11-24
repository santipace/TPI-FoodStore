import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock: number // stock conocido al agregar: limita la cantidad en pantalla (el backend vuelve a validar)
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.producto_id === producto.producto_id)
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, ...producto, cantidad: Math.min(i.cantidad + cantidad, producto.stock) }
                  : i,
              ),
            }
          }
          return { items: [...estado.items, { ...producto, cantidad: Math.min(cantidad, producto.stock) }] }
        }),

      quitar: (productoId) => set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => {
          if (cantidad <= 0) return { items: estado.items.filter((i) => i.producto_id !== productoId) }
          return {
            items: estado.items.map((i) =>
              i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i,
            ),
          }
        }),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: 'food-store-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
