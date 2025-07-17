import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShoppingListSchema, insertStoreSchema, insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Shopping Lists
  app.get("/api/shopping-lists", async (req, res) => {
    try {
      const lists = await storage.getAllShoppingLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.get("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const list = await storage.getShoppingList(id);
      if (!list) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });

  app.post("/api/shopping-lists", async (req, res) => {
    try {
      const validatedData = insertShoppingListSchema.parse(req.body);
      const list = await storage.createShoppingList(validatedData);
      res.status(201).json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  app.put("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertShoppingListSchema.partial().parse(req.body);
      const list = await storage.updateShoppingList(id, validatedData);
      if (!list) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      res.json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid shopping list data" });
    }
  });

  app.delete("/api/shopping-lists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteShoppingList(id);
      if (!deleted) {
        return res.status(404).json({ message: "Shopping list not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete shopping list" });
    }
  });

  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      if (lat && lng && radius) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusKm = parseFloat(radius as string);
        
        const stores = await storage.getStoresByLocation(latitude, longitude, radiusKm);
        res.json(stores);
      } else {
        const stores = await storage.getAllStores();
        res.json(stores);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { search } = req.query;
      
      if (search) {
        const products = await storage.searchProducts(search as string);
        res.json(products);
      } else {
        const products = await storage.getAllProducts();
        res.json(products);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:name", async (req, res) => {
    try {
      const product = await storage.getProductByName(req.params.name);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
