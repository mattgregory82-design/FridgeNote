import { pgTable, text, serial, integer, real, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const shoppingLists = pgTable("shopping_lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  items: json("items").$type<ShoppingItem[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chain: text("chain").notNull(),
  address: text("address").notNull(),
  postcode: text("postcode").notNull(),
  phone: text("phone"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  openingHours: text("opening_hours").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  tescoPrice: real("tesco_price"),
  sainsburysPrice: real("sainsburys_price"),
  asdaPrice: real("asda_price"),
  morrisisonsPrice: real("morrisons_price"),
});

export const shoppingItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string().optional(),
  confidence: z.number().min(0).max(1),
  completed: z.boolean().default(false),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
}).extend({
  items: z.array(shoppingItemSchema).optional().default([])
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type ShoppingItem = z.infer<typeof shoppingItemSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
