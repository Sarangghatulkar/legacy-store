import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, quantity = 1, selectedSize, selectedColor) => {
        const size = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
        const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
        const itemKey = `${product.id}-${size}-${color || 'default'}`;

        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.id === itemKey);
          if (existingItemIndex > -1) {
            const updated = [...state.items];
            updated[existingItemIndex].quantity += quantity;
            return { items: updated, isOpen: true };
          }
          return {
            items: [
              ...state.items,
              {
                id: itemKey,
                product,
                quantity,
                selectedSize: size,
                selectedColor: color,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'vanguard-store-cart',
    }
  )
);
