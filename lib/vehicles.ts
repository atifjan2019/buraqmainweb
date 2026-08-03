/**
 * Vehicle data access.
 *
 * Today this reads a static list mirroring the live site's stock. When the CRM
 * at crm.burraqmotors.co.uk exposes a public JSON API, only the bodies of the
 * exported functions need to change — every component consumes them as async,
 * so swapping in `fetch()` is a drop-in replacement and no UI code moves.
 *
 * Note the CRM's vehicles table also carries `purchase_price`, `prep_cost` and
 * profit accessors. Those are internal commercial figures and must never be
 * mapped onto this type.
 *
 * Slugs match the folder names under /public/cars, so images resolve directly.
 */

export type FuelType = "Hybrid" | "Petrol" | "Diesel" | "Electric";
export type Transmission = "Automatic" | "Manual";
export type VehicleStatus = "in_stock" | "reserved" | "sold";

export interface Vehicle {
  id: number;
  /** URL-safe identifier, also the image folder name. */
  slug: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  /** Price in GBP. */
  price: number;
  fuelType: FuelType;
  transmission: Transmission;
  bodyType: string;
  color: string;
  /** Litres, e.g. "1.8". */
  engineSize: string | null;
  status: VehicleStatus;
  featured: boolean;
  financeAvailable: boolean;
  /** Public paths under /public. First entry is the hero shot. */
  images: string[];
}

/** Builds the /cars/<slug>/NN.jpeg paths the download script produced. */
function gallery(slug: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/cars/${slug}/${String(i + 1).padStart(2, "0")}.jpeg`,
  );
}

/**
 * The six vehicles the live homepage features (its most recent stock).
 * Make/model casing is normalised — the source database stores it
 * inconsistently ("TOYOTA", "Toyota ", "Toyota").
 */
const VEHICLES: Vehicle[] = [
  {
    id: 112,
    slug: "112-toyota-prius",
    make: "Toyota",
    model: "Prius",
    year: 2020,
    mileage: 55043,
    price: 12900,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Hatchback",
    color: "Black",
    engineSize: "1.8",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("112-toyota-prius", 6),
  },
  {
    id: 111,
    slug: "111-audi-a3-sedan-quattro",
    make: "Audi",
    model: "A3 Sedan Quattro",
    year: 2016,
    mileage: 32854,
    price: 9700,
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Saloon",
    color: "White",
    engineSize: "1.8",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("111-audi-a3-sedan-quattro", 6),
  },
  {
    id: 110,
    slug: "110-toyota-noah",
    make: "Toyota",
    model: "Noah",
    year: 2017,
    mileage: 46529,
    price: 12700,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "MPV",
    color: "White",
    engineSize: "1.8",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("110-toyota-noah", 6),
  },
  {
    id: 109,
    slug: "109-honda-fit",
    make: "Honda",
    model: "Fit",
    year: 2015,
    mileage: 48444,
    price: 6500,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Hatchback",
    color: "White",
    engineSize: "1.5",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("109-honda-fit", 6),
  },
  {
    id: 108,
    slug: "108-toyota-prius",
    make: "Toyota",
    model: "Prius",
    year: 2019,
    mileage: 47019,
    price: 12000,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Hatchback",
    color: "White",
    engineSize: "1.8",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("108-toyota-prius", 6),
  },
  {
    id: 107,
    slug: "107-toyota-prius",
    make: "Toyota",
    model: "Prius",
    year: 2019,
    mileage: 55043,
    price: 11900,
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Hatchback",
    color: "Black",
    engineSize: "1.8",
    status: "in_stock",
    featured: true,
    financeAvailable: true,
    images: gallery("107-toyota-prius", 6),
  },
];

export async function getVehicles(): Promise<Vehicle[]> {
  return VEHICLES;
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const all = await getVehicles();
  return all.filter((v) => v.featured && v.status !== "sold").slice(0, limit);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const all = await getVehicles();
  return all.find((v) => v.slug === slug) ?? null;
}

/* ---------------------------------------------------------------- */
/* Formatting helpers                                                */
/* ---------------------------------------------------------------- */

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return gbp.format(value);
}

const miles = new Intl.NumberFormat("en-GB");

export function formatMileage(value: number): string {
  return `${miles.format(value)} miles`;
}

export function vehicleTitle(v: Vehicle): string {
  return `${v.make} ${v.model}`;
}

/** Hero image, or null when a car has no photos yet. */
export function primaryImage(v: Vehicle): string | null {
  return v.images[0] ?? null;
}
