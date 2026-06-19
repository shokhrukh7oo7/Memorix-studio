// Savatcha (himoyalangan).

export interface CartItemView {
  id: string;
  album: {
    id: string;
    title: string;
    coverUrl: string | null;
    pageCount: number;
    photoCount: number;
  };
  quantity: number;
  unitPrice: number;
  oldPrice: number | null;
  extraServices: { id: string; name: string; price: number }[];
}
export interface CartSummary {
  subtotal: number;
  extraServicesTotal: number;
  discount: number;
  deliveryFee?: number;
  total: number;
}
export interface CartView {
  items: CartItemView[];
  summary: CartSummary;
}

export function useCart() {
  const { get, post, patch, del } = useApi();

  return {
    getCart: () => get<CartView>("/cart"),
    addItem: (albumId: string, quantity = 1) =>
      post<CartView>("/cart/items", { albumId, quantity }),
    updateItem: (itemId: string, body: { quantity?: number; extraServices?: string[] }) =>
      patch<CartView>(`/cart/items/${itemId}`, body),
    removeItem: (itemId: string) => del<CartView>(`/cart/items/${itemId}`),
    applyPromo: (code: string) => post<CartView>("/cart/promo", { code }),
    removePromo: () => del<CartView>("/cart/promo"),
  };
}
