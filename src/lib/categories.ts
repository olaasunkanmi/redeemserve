import type { VendorCategory } from "./vendors";

// Service-based vendors (no physical delivery possible)
export const SERVICE_CATEGORIES: VendorCategory[] = [
  "Accommodation",
  "Services",
  "Medical",
  "Transport",
];

export function isServiceCategory(category?: string | null): boolean {
  if (!category) return false;
  return SERVICE_CATEGORIES.includes(category as VendorCategory);
}

export type CategoryMode = "goods" | "service";

export function categoryMode(category?: string | null): CategoryMode {
  return isServiceCategory(category) ? "service" : "goods";
}

/** Per-category copy used across product rows, vendor pages and checkout. */
export function categoryCopy(category?: string | null) {
  const c = (category || "").toLowerCase();
  if (c === "accommodation") {
    return {
      itemsLabel: "Rooms & chalets",
      itemNoun: "Stay",
      action: "Book",
      addedLabel: "Booked",
      fulfillmentLabel: "Reservation",
      fulfillmentHelp: "You'll receive a booking confirmation. No delivery — check-in at the vendor.",
      scheduleLabel: "Check-in date",
      timeLabel: "Check-in time",
      partyLabel: "Guests",
      durationLabel: "Nights",
      askDuration: true,
    } as const;
  }
  if (c === "medical") {
    return {
      itemsLabel: "Consultations & services",
      itemNoun: "Service",
      action: "Request",
      addedLabel: "Requested",
      fulfillmentLabel: "Appointment",
      fulfillmentHelp: "The clinic will confirm your appointment shortly. No delivery.",
      scheduleLabel: "Preferred date",
      timeLabel: "Preferred time",
      partyLabel: "People",
      askDuration: false,
    } as const;
  }
  if (c === "transport") {
    return {
      itemsLabel: "Rides & routes",
      itemNoun: "Ride",
      action: "Book ride",
      addedLabel: "Requested",
      fulfillmentLabel: "Ride request",
      fulfillmentHelp: "The driver will contact you at the pickup time. No item delivery.",
      scheduleLabel: "Pickup date",
      timeLabel: "Pickup time",
      partyLabel: "Passengers",
      askDuration: false,
    } as const;
  }
  if (isServiceCategory(category)) {
    return {
      itemsLabel: "Services offered",
      itemNoun: "Service",
      action: "Book",
      addedLabel: "Booked",
      fulfillmentLabel: "Booking",
      fulfillmentHelp: "The vendor will confirm your booking. No delivery applies.",
      scheduleLabel: "Preferred date",
      timeLabel: "Preferred time",
      partyLabel: "People",
      askDuration: false,
    } as const;
  }
  // Goods: Food, Goods, Tech & Phones
  return {
    itemsLabel: "Menu / Items",
    itemNoun: "Item",
    action: "Add",
    addedLabel: "Added",
    fulfillmentLabel: "Fulfilment",
    fulfillmentHelp: "Pick up at the vendor, or have it delivered inside the camp.",
    scheduleLabel: "",
    timeLabel: "",
    partyLabel: "",
    askDuration: false,
  } as const;
}
