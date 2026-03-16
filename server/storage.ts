import {
  type Product, type InsertProduct,
  type Stock, type InsertStock,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type SmsSubscriber, type InsertSmsSubscriber,
  type Category, type InsertCategory,
  type ProductWithStock, type CustomerWithOrders,
  products, stock, customers, orders, smsSubscribers, siteSettings, categories,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<ProductWithStock[]>;
  getProduct(id: string): Promise<ProductWithStock | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  createStock(s: InsertStock): Promise<Stock>;
  updateStock(productId: string, size: string, quantity: number): Promise<void>;
  getCustomers(): Promise<Customer[]>;
  getCustomersWithOrders(): Promise<CustomerWithOrders[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<Customer | undefined>;
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, carrier?: string, trackingNumber?: string, refundId?: string, cancelledAt?: Date): Promise<void>;
  deleteOrder(id: string): Promise<void>;
  createSmsSubscriber(sub: InsertSmsSubscriber): Promise<SmsSubscriber>;
  deleteSmsSubscriber(phone: string): Promise<void>;
  getSmsSubscribers(): Promise<SmsSubscriber[]>;
  deleteStock(productId: string, size: string): Promise<void>;
  deleteProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<ProductWithStock[]>;
  updateDisplayOrder(id: string, displayOrder: number): Promise<void>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  getAllSettings(): Promise<Record<string, string>>;
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<Category | undefined>;
  reassignProducts(fromCategory: string, toCategory: string): Promise<number>;
  getStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockAlerts: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<ProductWithStock[]> {
    const allProducts = await db.select().from(products)
      .where(eq(products.active, true))
      .orderBy(products.displayOrder, products.createdAt);
    const allStock = await db.select().from(stock);

    return allProducts.map((p) => ({
      ...p,
      stock: allStock.filter((s) => s.productId === p.id),
    }));
  }

  async getProduct(id: string): Promise<ProductWithStock | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    const productStock = await db.select().from(stock).where(eq(stock.productId, id));
    return { ...product, stock: productStock };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async createStock(s: InsertStock): Promise<Stock> {
    const [created] = await db.insert(stock).values(s).returning();
    return created;
  }

  async updateStock(productId: string, size: string, quantity: number): Promise<void> {
    await db.update(stock)
      .set({ quantity })
      .where(sql`${stock.productId} = ${productId} AND ${stock.size} = ${size}`);
  }

  async deleteStock(productId: string, size: string): Promise<void> {
    await db.delete(stock)
      .where(sql`${stock.productId} = ${productId} AND ${stock.size} = ${size}`);
  }

  async getCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomersWithOrders(): Promise<CustomerWithOrders[]> {
    const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return allCustomers.map((c) => ({
      ...c,
      orders: allOrders.filter((o) => o.customerId === c.id),
    }));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
    return updated;
  }

  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrderStatus(id: string, status: string, carrier?: string, trackingNumber?: string, refundId?: string, cancelledAt?: Date): Promise<void> {
    await db.update(orders).set({
      status,
      statusChangedAt: new Date(),
      ...(carrier !== undefined ? { carrier } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(refundId !== undefined ? { refundId } : {}),
      ...(cancelledAt !== undefined ? { cancelledAt } : {}),
    }).where(eq(orders.id, id));
  }

  async createSmsSubscriber(sub: InsertSmsSubscriber): Promise<SmsSubscriber> {
    const [created] = await db.insert(smsSubscribers).values(sub).returning();
    return created;
  }

  async deleteSmsSubscriber(phone: string): Promise<void> {
    await db.delete(smsSubscribers).where(eq(smsSubscribers.phone, phone));
  }

  async getSmsSubscribers(): Promise<SmsSubscriber[]> {
    return db.select().from(smsSubscribers);
  }

  async deleteProduct(id: string): Promise<Product | undefined> {
    await db.delete(stock).where(eq(stock.productId, id));
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    return deleted;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async deleteCustomer(id: string): Promise<Customer | undefined> {
    await db.delete(orders).where(eq(orders.customerId, id));
    const [deleted] = await db.delete(customers).where(eq(customers.id, id)).returning();
    return deleted;
  }

  async getSetting(key: string): Promise<string | null> {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return row?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value } });
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const rows = await db.select().from(siteSettings);
    const result: Record<string, string> = {};
    rows.forEach((r) => { result[r.key] = r.value; });
    return result;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    return cat;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async createCategory(cat: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<Category | undefined> {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return deleted;
  }

  async reassignProducts(fromCategorySlug: string, toCategorySlug: string): Promise<number> {
    const result = await db.update(products)
      .set({ category: toCategorySlug })
      .where(eq(products.category, fromCategorySlug))
      .returning();
    return result.length;
  }

  async getAllProducts(): Promise<ProductWithStock[]> {
    const allProducts = await db.select().from(products)
      .orderBy(products.displayOrder, products.createdAt);
    const allStock = await db.select().from(stock);

    return allProducts.map((p) => ({
      ...p,
      stock: allStock.filter((s) => s.productId === p.id),
    }));
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<void> {
    await db.update(products).set({ displayOrder }).where(eq(products.id, id));
  }

  async getStats() {
    const allOrders = await db.select().from(orders);
    const allCustomers = await db.select().from(customers);
    const allStock = await db.select().from(stock);

    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const lowStockAlerts = allStock.filter(
      (s) => s.quantity > 0 && s.quantity < 5
    ).length;

    return {
      totalRevenue,
      totalOrders: allOrders.length,
      totalCustomers: allCustomers.length,
      lowStockAlerts,
    };
  }
}

export const storage = new DatabaseStorage();
