/**
 * Local dummy dataset for PrintFlow partner print shops.
 * Flagship: PrintFlow Hub @ DNSC (Davao del Norte State College).
 */

export const DNSC_CENTER = { lat: 7.3015, lng: 125.6833 } as const;

export interface PrintShop {
  id: string;
  slug: string;
  name: string;
  initials: string;
  address: string;
  description: string;
  waitTime: number;
  status: 'online' | 'offline';
  lat: number;
  lng: number;
  isFlagship?: boolean;
  hours: string;
  services: string[];
}

export const PRINT_SHOPS: PrintShop[] = [
  {
    id: 'printflow-hub-dnsc',
    slug: 'printflow-hub-dnsc',
    name: 'PrintFlow Hub @ DNSC',
    initials: 'PF',
    address: 'Davao del Norte State College, New Visayas, Panabo City',
    description:
      'Official PrintFlow flagship station on campus. Color & B&W printing, binding, and same-day thesis support.',
    waitTime: 3,
    status: 'online',
    lat: DNSC_CENTER.lat,
    lng: DNSC_CENTER.lng,
    isFlagship: true,
    hours: 'Mon–Sat · 7:00 AM – 6:00 PM',
    services: ['B&W Print', 'Color Print', 'Binding', 'Scan to PDF'],
  },
  {
    id: 'ink-masters',
    slug: 'ink-masters',
    name: 'Ink Masters Print Shop',
    initials: 'IM',
    address: 'Gate 2, DNSC Perimeter Road',
    description: 'Fast turnaround for assignments and lab reports near the main gate.',
    waitTime: 5,
    status: 'offline',
    lat: 7.3022,
    lng: 125.6841,
    hours: 'Mon–Fri · 8:00 AM – 5:00 PM',
    services: ['B&W Print', 'Color Print'],
  },
  {
    id: 'quickprint-solutions',
    slug: 'quickprint-solutions',
    name: 'QuickPrint Solutions',
    initials: 'QP',
    address: 'Brgy. New Visayas, Panabo City',
    description: 'Budget-friendly bulk printing for student organizations.',
    waitTime: 12,
    status: 'online',
    lat: 7.3008,
    lng: 125.6818,
    hours: 'Daily · 8:00 AM – 7:00 PM',
    services: ['B&W Print', 'Lamination'],
  },
  {
    id: 'gigaprint-partners',
    slug: 'gigaprint-partners',
    name: 'GigaPrint Partners',
    initials: 'GP',
    address: 'College Avenue, Panabo City',
    description: 'Large-format posters and presentation materials.',
    waitTime: 8,
    status: 'online',
    lat: 7.2998,
    lng: 125.6825,
    hours: 'Mon–Sat · 9:00 AM – 6:00 PM',
    services: ['Color Print', 'Poster Print', 'Lamination'],
  },
  {
    id: 'campus-edge',
    slug: 'campus-edge',
    name: 'Campus Edge Printing',
    initials: 'CE',
    address: 'Near DNSC Library Complex',
    description: 'Quiet zone pickup — ideal for research papers and portfolios.',
    waitTime: 15,
    status: 'online',
    lat: 7.3012,
    lng: 125.6848,
    hours: 'Mon–Fri · 8:30 AM – 4:30 PM',
    services: ['B&W Print', 'Binding', 'Scan to PDF'],
  },
  {
    id: 'panabo-express',
    slug: 'panabo-express',
    name: 'Panabo Express Prints',
    initials: 'PE',
    address: 'National Highway, Panabo City',
    description: 'Off-campus partner with extended evening hours.',
    waitTime: 10,
    status: 'online',
    lat: 7.2985,
    lng: 125.6790,
    hours: 'Daily · 7:00 AM – 9:00 PM',
    services: ['B&W Print', 'Color Print', 'Photocopy'],
  },
];

export function getShopById(id: string): PrintShop | undefined {
  return PRINT_SHOPS.find((s) => s.id === id || s.slug === id);
}

export function getShopBySlug(slug: string): PrintShop | undefined {
  return PRINT_SHOPS.find((s) => s.slug === slug);
}

/** Map / list compatibility with legacy PrintLocation shape */
export function toPrintLocation(shop: PrintShop) {
  return {
    id: shop.id,
    name: shop.name,
    waitTime: shop.waitTime,
    status: shop.status,
    lat: shop.lat,
    lng: shop.lng,
  };
}

export const printShopLocations = PRINT_SHOPS.map(toPrintLocation);
