// Buyurtmalar (himoyalangan).

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  receiverName: string;
  receiverPhone: string;
  address: string;
  regionName: string | null;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  album_id: string | null;
  title: string;
  cover_url: string | null;
  page_count: number;
  photo_count: number;
  quantity: number;
  unit_price: number;
  old_price: number | null;
  extra_services: { id: string; name: string; price: number }[];
}

export interface CreateOrderInput {
  paymentMethod: "payme" | "click" | "cash";
  receiverName: string;
  receiverPhone: string;
  regionId: string;
  address: string;
  comment?: string;
  agreedLowQuality?: boolean;
}

export function useOrders() {
  const { get, post } = useApi();

  return {
    listOrders: (page = 1, limit = 20) =>
      get<OrderSummary[]>("/orders", { params: { page, limit } }),
    getOrder: (id: string) =>
      get<{ order: OrderSummary; items: OrderItem[]; logs: unknown[] }>(`/orders/${id}`),
    createOrder: (input: CreateOrderInput) =>
      post<{ order: OrderSummary; paymentUrl: string | null }>("/orders", input),
    cancelOrder: (id: string, reason?: string) =>
      post(`/orders/${id}/cancel`, { reason }),
  };
}
