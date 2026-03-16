import { storage } from "./storage";
import { db } from "./db";
import { products, stock, categories } from "@shared/schema";
import { inArray } from "drizzle-orm";

const PLACEHOLDER_NAMES = [
  "Phantom Hoodie",
  "Void Tee",
  "Apex Cargo",
  "Shadow Bomber",
  "Essential Tee II",
];

const REAL_PRODUCTS = [
  {
    name: "Rhinestone Jacket",
    description:
      "The sleeves are meticulously embellished with a high-density rhinestone stipple, creating a reflective contrast against the rugged, weathered fabric. Arched across the chest is the signature raw-edge \"RESILIENT\" patchwork, finished with intentional fraying for an archive aesthetic. Complete with a double-layered hood, matte silver hardware, and the mission statement patch at the cuff.",
    price: "777",
    category: "jackets",
    images: [
      "/uploads/0549364b-620b-4506-9bb7-4e8e91a07d02.JPG",
      "/uploads/1cdb43df-85e8-40b7-aa56-fecf34e9df6e.JPG",
      "/uploads/eae890c6-e0bb-41bd-8bb3-3804886a52f1.JPG",
      "/uploads/929bd223-c4c7-4f32-ac92-da03fc3c5577.JPG",
      "/uploads/140e37fa-9ab9-48f5-b1d1-7c3d10e191d1.JPG",
      "/uploads/8b43437a-1055-4166-a597-83c7c1ed7753.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 1,
    stock: { S: 30, M: 25, L: 25, XL: 25, "2XL": 25, "3XL": 25, "4XL": 25, "5XL": 25 },
  },
  {
    name: "Black Resilient Defines Character",
    description:
      "More than just a graphic, it's a mission statement. This heavyweight, boxy-fit tee features our signature Resilient branding layered over a bold \"Character\" motif. Designed for those who let their endurance speak for them, the high-density screen print and drop-shoulder silhouette provide a rugged, oversized look that stands up to the streets.",
    price: "77",
    category: "tees",
    images: [
      "/uploads/1aaf147b-0d8e-487e-9e14-b626d0a894a4.JPG",
      "/uploads/07502602-1687-4b53-9a43-bd7daa1f446c.JPG",
      "/uploads/89667002-16f5-4e57-b1ca-bd77314661f2.JPG",
      "/uploads/87c1f84c-146e-45cf-afad-6d09ab22a968.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 2,
    stock: { S: 30, M: 25, L: 25, XL: 25, "2XL": 25, "3XL": 25, "4XL": 25, "5XL": 25 },
  },
  {
    name: "White Resilient Defines Character",
    description:
      "More than just a graphic, it's a mission statement. This heavyweight, boxy-fit tee features our signature Resilient branding layered over a bold \"Character\" motif. Designed for those who let their endurance speak for them, the high-density screen print and drop-shoulder silhouette provide a rugged, oversized look that stands up to the streets.",
    price: "77",
    category: "tees",
    images: [
      "/uploads/4e7406df-ca8c-402f-ad76-d8d689c835bf.JPG",
      "/uploads/d85e0bbc-794f-4fe4-90cd-3fbbe87249ec.JPG",
      "/uploads/c0384553-9546-448b-ac93-cb79f7e5a233.JPG",
      "/uploads/ca2c5759-9ea8-467a-98d5-c98e159da79d.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 3,
    stock: { S: 30, M: 25, L: 25, XL: 25, "2XL": 25, "3XL": 25, "4XL": 25, "5XL": 25 },
  },
  {
    name: "Resilient Warrior T",
    description:
      "Every scar tells a story; every battle builds the soul. The Resilient Warrior T features a custom-illustrated knight graphic over a premium charcoal mineral wash, symbolizing the armor we wear through the daily hustle. Designed with a boxy, lived-in feel, this tee is a tribute to those who stay standing regardless of the odds.",
    price: "77",
    category: "tees",
    images: [
      "/uploads/054746a5-ae17-494f-b56b-6046517ee4ed.JPG",
      "/uploads/168a04a0-16e3-4178-abbe-a55c9ac8adb3.JPG",
      "/uploads/5c7ca3ea-a8b8-4851-92d7-3e6d9221157d.JPG",
      "/uploads/67a3a51a-94d2-416f-b14d-bd98d49e1031.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 4,
    stock: { S: 1, M: 1, L: 1, XL: 1, "2XL": 1, "3XL": 1, "4XL": 1, "5XL": 1 },
  },
  {
    name: "Blue Resilient Flannel",
    description:
      "Make an entrance and an exit. The Obsidian Blue Flannel features a reconstructed multi-plaid design in deep cobalt, black, and white. The standout feature is the massive, hand-set rhinestone \"Resilient\" script across the back, designed to catch every light in the city. With additional studded detailing on the sleeves, this is high-octane streetwear at its finest.",
    price: "77",
    category: "tees",
    images: [
      "/uploads/795d1a10-eb29-45cc-a7f3-8382aa3c7241.JPG",
      "/uploads/12bc51b9-3d78-47a1-9333-9f8d66bcd699.JPG",
      "/uploads/1ba7b520-f32a-4652-be75-8a15d2d2e30b.JPG",
      "/uploads/0783c7ba-a0c4-4198-bdc4-036bb5a021c5.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 5,
    stock: { S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0, "4XL": 0, "5XL": 0 },
  },
  {
    name: "Crimson Resilient Flannel",
    description:
      "Redefining a classic. The Resilient Crimson Flannel takes the rugged aesthetic of a traditional plaid and elevates it with hand-placed rhinestone detailing along the forearms and cuffs. Featuring a contrasting black collar and button placket for a sharp, industrial silhouette, this piece is designed to catch the light while maintaining its street-ready edge. Premium weight, maximum impact.",
    price: "77",
    category: "tees",
    images: [
      "/uploads/e742c1ee-b946-450c-a16b-0db775d3b12c.JPG",
      "/uploads/3532affa-ee36-4e92-baae-1b7d149f59ec.JPG",
      "/uploads/d0080489-d00c-4d86-be12-897437bdd771.JPG",
    ],
    featured: true,
    active: true,
    displayOrder: 6,
    stock: { S: 1, M: 1, L: 1, XL: 1, "2XL": 1, "3XL": 1, "4XL": 1, "5XL": 1 },
  },
];

export async function seedDatabase() {
  const existing = await db.select().from(products);

  const hasPlaceholders = existing.some((p) => PLACEHOLDER_NAMES.includes(p.name));
  const hasRealProducts = existing.some((p) => p.name === "Rhinestone Jacket");

  if (hasRealProducts && !hasPlaceholders) {
    return;
  }

  if (hasPlaceholders) {
    console.log("Detected placeholder products — replacing with real Resilient catalog...");
    const placeholderIds = existing
      .filter((p) => PLACEHOLDER_NAMES.includes(p.name))
      .map((p) => p.id);
    if (placeholderIds.length > 0) {
      await db.delete(stock).where(inArray(stock.productId, placeholderIds));
      await db.delete(products).where(inArray(products.id, placeholderIds));
    }
  } else {
    console.log("Empty database — seeding Resilient catalog...");
  }

  const existingCats = await db.select().from(categories);
  const catMap: Record<string, string> = {};
  for (const c of existingCats) {
    catMap[c.slug] = c.id;
  }

  const needed = [
    { name: "Jackets", slug: "jackets" },
    { name: "Tees", slug: "tees" },
  ];
  for (const cat of needed) {
    if (!catMap[cat.slug]) {
      const created = await storage.createCategory(cat);
      catMap[cat.slug] = created.id;
    }
  }

  for (const p of REAL_PRODUCTS) {
    const { stock: stockData, ...productFields } = p;
    const product = await storage.createProduct(productFields);
    for (const [size, quantity] of Object.entries(stockData)) {
      await storage.createStock({ productId: product.id, size, quantity });
    }
  }

  const existingCustomers = await storage.getCustomers();
  if (existingCustomers.length === 0) {
    const customerData = [
      {
        email: "marcus.chen@gmail.com",
        name: "Marcus Chen",
        phone: "+1-555-0101",
        totalSpent: "720",
        lastPurchase: new Date("2026-02-15"),
        smsSubscribed: true,
      },
      {
        email: "aria.johnson@icloud.com",
        name: "Aria Johnson",
        phone: "+1-555-0102",
        totalSpent: "195",
        lastPurchase: new Date("2025-12-01"),
        smsSubscribed: true,
      },
      {
        email: "jaylen.williams@outlook.com",
        name: "Jaylen Williams",
        phone: "+1-555-0103",
        totalSpent: "0",
        smsSubscribed: true,
      },
      {
        email: "sofia.martinez@gmail.com",
        name: "Sofia Martinez",
        totalSpent: "550",
        lastPurchase: new Date("2026-03-01"),
        smsSubscribed: false,
      },
    ];
    for (const c of customerData) {
      await storage.createCustomer(c);
    }
  }

  console.log("Resilient catalog seeded successfully.");
}
