import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    comparePrice?: number | null
    image?: string
    quantity: number
    slug: string
    variantId?: string
    variantName?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string, variantId?: string) => void
    updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void
    clearCart: () => void
    total: () => number
    itemCount: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const existing = get().items.find((i) => i.id === item.id && i.variantId === item.variantId)
                if (existing) {
                    set((state) => ({
                        items: state.items.map((i) =>
                            (i.id === item.id && i.variantId === item.variantId) ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    }))
                } else {
                    set((state) => ({ items: [...state.items, { ...item, quantity: 1 }] }))
                }
            },
            removeItem: (id, variantId) =>
                set((state) => ({ items: state.items.filter((i) => !(i.id === id && i.variantId === variantId)) })),
            updateQuantity: (id, variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id, variantId)
                    return
                }
                set((state) => ({
                    items: state.items.map((i) => (i.id === id && i.variantId === variantId ? { ...i, quantity } : i)),
                }))
            },
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        }),
        { name: 'loja-cart' }
    )
)
