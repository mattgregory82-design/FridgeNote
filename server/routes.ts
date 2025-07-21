import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertShoppingListSchema, insertStoreSchema, insertProductSchema } from "@shared/schema";
import { sanitizeShoppingItem, sanitizeText, validateInputLength, validateNumericInput } from "./security";
import { csrfProtection, getCSRFToken } from "./csrf";

export async function registerRoutes(app: Express): Promise<Server> {
  // CSRF token endpoint
  app.get("/api/csrf-token", getCSRFToken);

  // Apply CSRF protection to state-changing endpoints
  app.use("/api/shopping-lists", (req, res, next) => {
    if (req.method !== 'GET') {
      return csrfProtection(req, res, next);
    }
    next();
  });

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
      const id = validateNumericInput(req.params.id, 1);
      if (id === null) {
        return res.status(400).json({ message: "Invalid ID parameter" });
      }
      
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
      // Sanitize input data
      const sanitizedBody = {
        ...req.body,
        name: sanitizeText(req.body.name || ''),
        items: Array.isArray(req.body.items) 
          ? req.body.items.map(sanitizeShoppingItem).filter(Boolean)
          : []
      };

      // Validate input lengths
      if (!validateInputLength(sanitizedBody.name, 255)) {
        return res.status(400).json({ message: "List name too long" });
      }

      const validatedData = insertShoppingListSchema.parse(sanitizedBody);
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
        const latitude = validateNumericInput(lat as string, -90, 90);
        const longitude = validateNumericInput(lng as string, -180, 180);
        const radiusKm = validateNumericInput(radius as string, 0.1, 100);
        
        if (latitude === null || longitude === null || radiusKm === null) {
          return res.status(400).json({ message: "Invalid location parameters" });
        }
        
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
        const sanitizedSearch = sanitizeText(search as string);
        if (!validateInputLength(sanitizedSearch, 100)) {
          return res.status(400).json({ message: "Search query too long" });
        }
        
        const products = await storage.searchProducts(sanitizedSearch);
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
      const sanitizedName = sanitizeText(req.params.name);
      if (!validateInputLength(sanitizedName, 100)) {
        return res.status(400).json({ message: "Product name too long" });
      }
      
      const product = await storage.getProductByName(sanitizedName);
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
