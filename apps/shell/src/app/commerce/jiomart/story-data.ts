// Data + timing for the interactive JioMart purchase story (React rewrite of the
// former static iframe thread). Pure data only — no JSX — so it can be shared by
// the orchestrator and the presentational widgets.

export type Product = {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  offLabel?: string;
  image: string;
  state: "oos" | "added" | "add";
};

/** Product imagery served from apps/shell/public/commerce/purchasing-groceries. */
export const GROCERIES_ASSETS = "/commerce/purchasing-groceries";

export type AddressTag = "home" | "default" | "test";

export type SavedAddress = {
  id: string;
  name: string;
  tags: AddressTag[];
  line: string;
};

// ── Search swim lanes ──────────────────────────────────────────────────────────

export const APPLE_PRODUCTS: Product[] = [
  {
    id: "apple-shimla",
    name: "Apple Shimla Economy 1 kg",
    price: 220,
    image: `${GROCERIES_ASSETS}/apple-shimla.webp`,
    state: "oos",
  },
  {
    id: "apple-royal-gala",
    name: "Apple Royal Gala 4 pcs (500–700 g)",
    price: 220,
    image: `${GROCERIES_ASSETS}/apple-royal-gala.webp`,
    state: "added",
  },
  {
    id: "apple-washington",
    name: "Washington Apple 1 kg",
    price: 260,
    image: `${GROCERIES_ASSETS}/washington-apple.webp`,
    state: "add",
  },
];

export const GHEE_PRODUCTS: Product[] = [
  {
    id: "ghee-amul",
    name: "Amul Pure Ghee 1 L (Tetra Pak)",
    price: 627,
    mrp: 660,
    offLabel: "5% OFF",
    image: `${GROCERIES_ASSETS}/amul-pure-ghee.webp`,
    state: "oos",
  },
  {
    id: "ghee-milkfood",
    name: "Milkfood Rich Desi Ghee 900 ml",
    price: 559,
    mrp: 670,
    offLabel: "17% OFF",
    image: `${GROCERIES_ASSETS}/milkfood-rich-desi-ghee.webp`,
    state: "added",
  },
  {
    id: "ghee-mother-dairy",
    name: "Mother Dairy Cow Ghee 1 L",
    price: 615,
    mrp: 670,
    offLabel: "8% OFF",
    image: `${GROCERIES_ASSETS}/mother-dairy-cow-ghee.webp`,
    state: "add",
  },
];

// ── Cart maths ──────────────────────────────────────────────────────────────────

export const CART = {
  appleUnit: 220,
  appleMrpUnit: 220,
  gheeLine: 559,
  gheeMrp: 670,
};

export const formatRupees = (n: number) => "₹" + n.toLocaleString("en-IN");

// ── Saved addresses ─────────────────────────────────────────────────────────────

export const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "blr-cunningham",
    name: "GOKUL KUMAR",
    tags: ["home"],
    line: "37, Cunningham Rd, near Fortis Hospital, Vasanth Nagar, Bengaluru, Karnataka · 560001",
  },
  {
    id: "ggn-sector27",
    name: "GOKUL KUMAR",
    tags: ["home", "default"],
    line: "188, 2nd floor, Sector 27, Gurugram, Haryana · 122009",
  },
  {
    id: "knp-harrisganj",
    name: "GOKUL KUMAR",
    tags: ["test"],
    line: "F932J78, Harris Ganj, Mirpur, Kanpur, Uttar Pradesh · 208004",
  },
];

export const KANPUR_ADDRESS = SAVED_ADDRESSES[2];

export const CONFIRM_DELIVER_TO = {
  name: "GOKUL KUMAR",
  tag: "home" as AddressTag,
  line: "801, Sai Ganga, Sector 5, Indiranagar, Bengaluru, Karnataka 560038",
};

export const ORDER_META = {
  id: "#JM-48213907",
  arriving: "Tomorrow, 6–8 PM",
  paying: "₹779 · Cash on Delivery",
};

// ── Timeline pacing (ms) ─────────────────────────────────────────────────────────

export const TIMING = {
  initial: 500,
  beat: 2000,
  searchHold: 2000,
  loaderHold: 2000,
  addressHold: 3000,
};

// Actions emitted by the gated buttons inside widgets.
export type StoryAction =
  | "checkout"
  | "use-current-location"
  | "save-address"
  | "place-order"
  | "track-order";
