export type VendorCategory =
  | "Food & Drinks"
  | "Accommodation"
  | "Transport"
  | "Goods"
  | "Services"
  | "Medical"
  | "Tech & Phones";

export type VendorStatus = "live" | "low-stock" | "sold-out";

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description: string;
  location: string; // ground reference
  zone: "A" | "B" | "C" | "D";
  // approximate position on the grounds map (0-100 percent)
  x: number;
  y: number;
  status: VendorStatus;
  rating: number;
  popularItems: string[];
  priceRange: string;
  forecast: { demand: "High" | "Medium" | "Low"; expectedCustomers: number };
  opensAt: string;
}

export const VENDOR_CATEGORIES: VendorCategory[] = [
  "Food & Drinks",
  "Accommodation",
  "Transport",
  "Goods",
  "Services",
  "Medical",
  "Tech & Phones",
];

export const ZONES = [
  { id: "A", label: "Zone A — Main Auditorium" },
  { id: "B", label: "Zone B — North Gate" },
  { id: "C", label: "Zone C — Family Camp" },
  { id: "D", label: "Zone D — South Parking" },
] as const;

export const VENDORS: Vendor[] = [
  {
    id: "v-001",
    name: "Mama Ngozi's Jollof Kitchen",
    category: "Food & Drinks",
    description: "Family-recipe jollof rice, fried plantain, and grilled chicken served hot.",
    location: "Beside Block 4, Main Auditorium",
    zone: "A",
    x: 38,
    y: 52,
    status: "live",
    rating: 4.8,
    popularItems: ["Jollof Rice", "Plantain", "Grilled Chicken"],
    priceRange: "₦1,500 – ₦3,500",
    forecast: { demand: "High", expectedCustomers: 1820 },
    opensAt: "6:00 AM",
  },
  {
    id: "v-002",
    name: "ClearWater Sachet & Bottled",
    category: "Food & Drinks",
    description: "Cold sachet water, bottled water and soft drinks. Bulk packs available.",
    location: "North Gate Entrance",
    zone: "B",
    x: 62,
    y: 22,
    status: "low-stock",
    rating: 4.6,
    popularItems: ["Sachet Water", "Bottled Water", "Coke 50cl"],
    priceRange: "₦100 – ₦500",
    forecast: { demand: "High", expectedCustomers: 4200 },
    opensAt: "5:00 AM",
  },
  {
    id: "v-003",
    name: "Brother Tunde Tricycle Service",
    category: "Transport",
    description: "Keke rides between Family Camp, South Parking and Main Auditorium.",
    location: "South Parking Loop",
    zone: "D",
    x: 28,
    y: 78,
    status: "live",
    rating: 4.7,
    popularItems: ["Family Camp ➜ Auditorium", "Group ride (4)"],
    priceRange: "₦300 – ₦800 / trip",
    forecast: { demand: "High", expectedCustomers: 960 },
    opensAt: "4:30 AM",
  },
  {
    id: "v-004",
    name: "Grace Bookstore & Bibles",
    category: "Goods",
    description: "Bibles, RCCG study materials, hymn books, and convention souvenirs.",
    location: "Convention Pavilion Walkway",
    zone: "A",
    x: 48,
    y: 44,
    status: "live",
    rating: 4.9,
    popularItems: ["Study Bible", "Convention Tote", "Hymn Book"],
    priceRange: "₦500 – ₦12,000",
    forecast: { demand: "Medium", expectedCustomers: 540 },
    opensAt: "7:00 AM",
  },
  {
    id: "v-005",
    name: "QuickFix Phone Charging",
    category: "Tech & Phones",
    description: "Phone charging, USB cables, power banks, and basic repairs.",
    location: "Family Camp Square",
    zone: "C",
    x: 72,
    y: 62,
    status: "live",
    rating: 4.5,
    popularItems: ["Phone Charge (1hr)", "Power Bank Rental", "USB-C cable"],
    priceRange: "₦200 – ₦4,500",
    forecast: { demand: "Medium", expectedCustomers: 620 },
    opensAt: "6:30 AM",
  },
  {
    id: "v-006",
    name: "Redeemer First-Aid Point",
    category: "Medical",
    description: "Pain relief, malaria tests, ORS, plasters, and basic medical supplies.",
    location: "Behind Hospital Annex",
    zone: "C",
    x: 80,
    y: 50,
    status: "live",
    rating: 5.0,
    popularItems: ["Paracetamol", "ORS Sachets", "Plasters"],
    priceRange: "₦100 – ₦2,500",
    forecast: { demand: "Medium", expectedCustomers: 410 },
    opensAt: "24 hours",
  },
  {
    id: "v-007",
    name: "Sister Bisi's Pap & Akara",
    category: "Food & Drinks",
    description: "Hot pap, akara, moi-moi — perfect for early-morning service attendees.",
    location: "Zone B Food Row",
    zone: "B",
    x: 58,
    y: 30,
    status: "sold-out",
    rating: 4.7,
    popularItems: ["Pap & Akara", "Moi-moi", "Bread & Tea"],
    priceRange: "₦500 – ₦1,500",
    forecast: { demand: "High", expectedCustomers: 1340 },
    opensAt: "4:30 AM",
  },
  {
    id: "v-008",
    name: "GoBus Shuttle Co.",
    category: "Transport",
    description: "Mini-bus shuttles to Lagos, Ibadan & Mowe after service ends.",
    location: "South Parking Bay 3",
    zone: "D",
    x: 22,
    y: 86,
    status: "live",
    rating: 4.4,
    popularItems: ["Lagos Mainland", "Ibadan", "Mowe / Ofada"],
    priceRange: "₦1,500 – ₦4,500",
    forecast: { demand: "High", expectedCustomers: 2100 },
    opensAt: "8:00 PM",
  },
  {
    id: "v-009",
    name: "Mama Tobi Snacks & Biscuits",
    category: "Goods",
    description: "Sweets, biscuits, gum, tissues — all the small things you forgot.",
    location: "Family Camp Walkway",
    zone: "C",
    x: 68,
    y: 70,
    status: "live",
    rating: 4.3,
    popularItems: ["Biscuits Pack", "Sweet Mix", "Tissue Roll"],
    priceRange: "₦100 – ₦1,000",
    forecast: { demand: "Low", expectedCustomers: 280 },
    opensAt: "6:00 AM",
  },
  {
    id: "v-010",
    name: "GlowSound Audio Repair",
    category: "Services",
    description: "On-site repair for earphones, chargers, and small electronics.",
    location: "Tech Row, Zone A",
    zone: "A",
    x: 42,
    y: 60,
    status: "live",
    rating: 4.6,
    popularItems: ["Earphone Repair", "Charger Fix"],
    priceRange: "₦500 – ₦3,000",
    forecast: { demand: "Low", expectedCustomers: 140 },
    opensAt: "9:00 AM",
  },
];

export const STATUS_META: Record<VendorStatus, { label: string; dot: string; text: string; bg: string }> = {
  live: {
    label: "Open now",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  "low-stock": {
    label: "Low stock",
    dot: "bg-amber-500",
    text: "text-amber-800",
    bg: "bg-amber-50",
  },
  "sold-out": {
    label: "Sold out",
    dot: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};
