import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  images: text("images").array().notNull(),
  featured: boolean("featured").default(false),
  active: boolean("active").default(true),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stock = pgTable("stock", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(0),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  shippingAddress: jsonb("shipping_address"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  lastPurchase: timestamp("last_purchase"),
  smsSubscribed: boolean("sms_subscribed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  items: jsonb("items").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  shippingAddress: jsonb("shipping_address"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  statusChangedAt: timestamp("status_changed_at"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  refundId: text("refund_id"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smsSubscribers = pgTable("sms_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertStockSchema = createInsertSchema(stock).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertSmsSubscriberSchema = createInsertSchema(smsSubscribers).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Stock = typeof stock.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SmsSubscriber = typeof smsSubscribers.$inferSelect;
export type InsertSmsSubscriber = z.infer<typeof insertSmsSubscriberSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type OrderItem = {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: string;
};

export type ShippingAddress = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type ProductWithStock = Product & {
  stock: Stock[];
};

export type CustomerWithOrders = Customer & {
  orders: Order[];
};
