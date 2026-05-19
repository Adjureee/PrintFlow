export type OrderStatus =
  | "pending"
  | "awaiting-verification"
  | "processing"
  | "printing"
  | "ready"
  | "completed";

export type PrintColor = "bw" | "color";
export type PrintSize = "letter" | "legal" | "a4";

export interface PrintSettings {
  color: PrintColor;
  size: PrintSize;
  copies: number;
}

export interface Order {
  id: string;
  studentName: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  location: string;
  shopId?: string | null;
  settings: PrintSettings;
  gcashRefNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  claimCode: string;
}

export interface PrintLocation {
  id: string;
  name: string;
  waitTime: number; // in minutes
  status: "online" | "offline";
  lat: number;
  lng: number;
}

export type { PrintShop } from "./print-shops";
export const mockLocations: PrintLocation[] = [];

let mockOrders: Order[] = [
  {
    id: "ORD-001",
    studentName: "Maria Santos",
    studentId: "STU-2024-001",
    fileName: "Thesis_Chapter1.pdf",
    fileUrl: "mock://file1.pdf",
    location: "DNSC Main Partner Shop",
    shopId: null,
    settings: { color: "bw", size: "letter", copies: 3 },
    gcashRefNumber: "GC-7829451263",
    totalAmount: 45,
    status: "awaiting-verification",
    createdAt: new Date("2026-04-01T09:30:00"),
    claimCode: "CLAIM-001",
  },
  {
    id: "ORD-002",
    studentName: "John Dela Cruz",
    studentId: "STU-2024-002",
    fileName: "Assignment_Math.docx",
    fileUrl: "mock://file2.pdf",
    location: "Library Partner Shop",
    shopId: null,
    settings: { color: "color", size: "a4", copies: 1 },
    gcashRefNumber: "GC-9823471562",
    totalAmount: 25,
    status: "printing",
    createdAt: new Date("2026-04-01T09:45:00"),
    claimCode: "CLAIM-002",
  },
  {
    id: "ORD-003",
    studentName: "Sarah Johnson",
    studentId: "STU-2024-003",
    fileName: "Research_Paper.pdf",
    fileUrl: "mock://file3.pdf",
    location: "DNSC Main Partner Shop",
    shopId: null,
    settings: { color: "bw", size: "letter", copies: 5 },
    gcashRefNumber: "GC-4567821239",
    totalAmount: 75,
    status: "ready",
    createdAt: new Date("2026-04-01T10:00:00"),
    claimCode: "CLAIM-003",
  },
];

// Store management
export const orderStore = {
  getOrders: (): Order[] => {
    return [...mockOrders].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  },

  getOrderById: (id: string): Order | undefined => {
    return mockOrders.find((order) => order.id === id);
  },

  getOrdersByStudent: (studentId: string): Order[] => {
    return mockOrders.filter((order) => order.studentId === studentId);
  },

  createOrder: (
    order: Omit<Order, "id" | "createdAt" | "claimCode">,
  ): Order => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${String(mockOrders.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
      claimCode: `CLAIM-${String(mockOrders.length + 1).padStart(3, "0")}`,
    };
    mockOrders = [newOrder, ...mockOrders];
    return newOrder;
  },

  updateOrderStatus: (id: string, status: OrderStatus): Order | null => {
    const orderIndex = mockOrders.findIndex((order) => order.id === id);
    if (orderIndex !== -1) {
      mockOrders[orderIndex] = { ...mockOrders[orderIndex], status };
      return mockOrders[orderIndex];
    }
    return null;
  },

  updateOrder: (id: string, updates: Partial<Order>): Order | null => {
    const orderIndex = mockOrders.findIndex((order) => order.id === id);
    if (orderIndex !== -1) {
      mockOrders[orderIndex] = { ...mockOrders[orderIndex], ...updates };
      return mockOrders[orderIndex];
    }
    return null;
  },
};

// Helper functions
export const calculatePrintCost = (settings: PrintSettings): number => {
  // Pricing in Philippine Peso (₱)
  // Black & White: ₱5 per page
  // Color: ₱15 per page
  // Legal size: 20% additional charge
  const basePrice = settings.color === "color" ? 15 : 5;
  const sizeMultiplier = settings.size === "legal" ? 1.2 : 1;
  return Math.round(basePrice * sizeMultiplier * settings.copies);
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "awaiting-verification":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "printing":
      return "bg-purple-100 text-purple-800";
    case "ready":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "Pending";
    case "awaiting-verification":
      return "Awaiting Verification";
    case "processing":
      return "Processing";
    case "printing":
      return "Printing";
    case "ready":
      return "Ready for Pickup";
    case "completed":
      return "Completed";
    default:
      return status;
  }
};

// Geofencing Utility: Calculate distance in meters between two lat/lng coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
