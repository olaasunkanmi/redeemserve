export const ORDER_FLOW_PICKUP = ["pending", "accepted", "preparing", "ready", "delivered"] as const;
export const ORDER_FLOW_DELIVERY = ["pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered"] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Order placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-blue-100 text-blue-900",
  preparing: "bg-indigo-100 text-indigo-900",
  ready: "bg-emerald-100 text-emerald-900",
  out_for_delivery: "bg-violet-100 text-violet-900",
  delivered: "bg-emerald-200 text-emerald-950",
  cancelled: "bg-rose-100 text-rose-800",
};

export function flowFor(fulfillment: string) {
  return fulfillment === "delivery" ? ORDER_FLOW_DELIVERY : ORDER_FLOW_PICKUP;
}

export function progressIndex(status: string, fulfillment: string): number {
  if (status === "cancelled") return -1;
  const flow = flowFor(fulfillment);
  return flow.indexOf(status as any);
}
