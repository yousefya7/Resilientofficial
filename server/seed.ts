import { storage } from "./storage";
import { db } from "./db";
import { products, stock, categories } from "@shared/schema";
import { inArray, eq } from "drizzle-orm";

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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716088/resilient/ouwujk2mpplhhcwucger.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716089/resilient/o1wpo5qmuu4www4sbqbn.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716090/resilient/va3f2ijaguxcpep4acjc.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716091/resilient/dkipgfnyoc3yaqylsrx6.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716092/resilient/zasxkwzq6bvoeslsektk.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716093/resilient/vbkvliotwhwmzbyqojx9.jpg",
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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716094/resilient/outiuli9csdtgr6l5rif.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716095/resilient/udonue1ky0asxjjcgevk.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716096/resilient/zspaz5w5brk5zqketzbu.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716097/resilient/dpyhlu0tiqd5s5npnn3c.jpg",
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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716097/resilient/ysilaccdbyfbwoi06l25.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716098/resilient/bmpl4fu8jr23dmvctxws.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716099/resilient/ebxyah00b3ouaxdxwufa.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716100/resilient/eamxix2y0efqalnyts2s.jpg",
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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716081/resilient/csznh3qqhdqvcz1vpc9q.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716082/resilient/sfb9umwr7ovbdjt7wshm.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716083/resilient/apnyqmcuqqawvji3zgqv.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716084/resilient/ssqws5fwkerg9zqwnd0y.jpg",
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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716085/resilient/sm0t6pxv0cnv7ghxdiwb.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716086/resilient/kvcibv1g6tacdzvsks8p.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716087/resilient/ownwqu01woplapdio1xv.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716087/resilient/dygutbbbrlveywfeiawd.jpg",
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
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716078/resilient/d5n0vn9bilgjs6ijytov.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716079/resilient/exj7i3h4ye2ajfofqiwa.jpg",
      "https://res.cloudinary.com/dgawn40ku/image/upload/v1773716080/resilient/iklgazgvdsfsoqrqr07c.jpg",
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
    // Already seeded with real products — update images to Cloudinary if still using /uploads/
    const needsImageUpdate = existing.some((p) =>
      (p.images || []).some((img: string) => img.startsWith("/uploads/"))
    );
    if (needsImageUpdate) {
      console.log("Updating product images to Cloudinary URLs...");
      for (const seedProduct of REAL_PRODUCTS) {
        const match = existing.find((p) => p.name === seedProduct.name);
        if (match) {
          await db.update(products)
            .set({ images: seedProduct.images })
            .where(eq(products.id, match.id));
        }
      }
      console.log("Product images updated to Cloudinary.");
    }
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
