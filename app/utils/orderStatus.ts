import type { OrderStatus } from "~/utils/albumStorage";

// Backend statusi (lowercase) -> frontend label (BaseOrder ranglari shu labelga bog'liq)
const LABELS: Record<string, OrderStatus> = {
  pending: "Pending",
  in_review: "In review",
  in_progress: "In progress",
  packing: "Packing",
  delivering: "Delivering",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function orderStatusLabel(status: string): OrderStatus {
  return LABELS[status] ?? "Pending";
}

const HISTORY = new Set(["completed", "cancelled"]);
export function isHistoryStatus(status: string): boolean {
  return HISTORY.has(status);
}
