import { shoppingLists, stores, products, type ShoppingList, type InsertShoppingList, type Store, type InsertStore, type Product, type InsertProduct } from "@shared/schema";

export interface IStorage {
  // Shopping Lists
  getShoppingList(id: number): Promise<ShoppingList | undefined>;
  getAllShoppingLists(): Promise<ShoppingList[]>;
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  updateShoppingList(id: number, list: Partial<InsertShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: number): Promise<boolean>;

  // Stores
  getAllStores(): Promise<Store[]>;
  getStoresByLocation(latitude: number, longitude: number, radiusKm: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProductByName(name: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class MemStorage implements IStorage {
  private shoppingLists: Map<number, ShoppingList>;
  private stores: Map<number, Store>;
  private products: Map<number, Product>;
  private currentListId: number;
  private currentStoreId: number;
  private currentProductId: number;

  constructor() {
    this.shoppingLists = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.currentListId = 1;
    this.currentStoreId = 1;
    this.currentProductId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed UK stores
    const ukStores: InsertStore[] = [
      {
        name: "Tesco Extra - Manchester Arndale",
        chain: "Tesco",
        address: "49 High St, Manchester M4 3AH",
        postcode: "M4 3AH",
        phone: "0345 677 9696",
        latitude: 53.4834,
        longitude: -2.2426,
        openingHours: "24 hours"
      },
      {
        name: "Sainsbury's Local",
        chain: "Sainsbury's",
        address: "134 Deansgate, Manchester M3 2BQ",
        postcode: "M3 2BQ",
        phone: "0161 834 3280",
        latitude: 53.4794,
        longitude: -2.2453,
        openingHours: "7am - 11pm"
      },
      {
        name: "ASDA Manchester",
        chain: "ASDA",
        address: "Eastlands, Ashton New Rd, Manchester M11 4BD",
        postcode: "M11 4BD",
        phone: "0161 230 1143",
        latitude: 53.4831,
        longitude: -2.2007,
        openingHours: "7am - 10pm"
      },
      {
        name: "Marks & Spencer",
        chain: "M&S",
        address: "7 Market St, Manchester M1 1WR",
        postcode: "M1 1WR",
        phone: "0161 831 7341",
        latitude: 53.4808,
        longitude: -2.2426,
        openingHours: "8am - 9pm"
      }
    ];

    ukStores.forEach(store => this.createStore(store));

    // Seed UK products with prices
    const ukProducts: InsertProduct[] = [
      {
        name: "Milk (2L)",
        category: "Dairy",
        tescoPrice: 1.45,
        sainsburysPrice: 1.50,
        asdaPrice: 1.25,
        morrisisonsPrice: 1.40
      },
      {
        name: "Bread (Wholemeal)",
        category: "Bakery",
        tescoPrice: 1.20,
        sainsburysPrice: 1.35,
        asdaPrice: 1.30,
        morrisisonsPrice: 1.25
      },
      {
        name: "Apples (1kg)",
        category: "Fresh Produce",
        tescoPrice: 2.50,
        sainsburysPrice: 2.25,
        asdaPrice: 2.45,
        morrisisonsPrice: 2.35
      },
      {
        name: "Chicken Breast (1kg)",
        category: "Meat & Fish",
        tescoPrice: 6.50,
        sainsburysPrice: 6.75,
        asdaPrice: 6.20,
        morrisisonsPrice: 6.45
      },
      {
        name: "Tomatoes (500g)",
        category: "Fresh Produce",
        tescoPrice: 1.80,
        sainsburysPrice: 1.95,
        asdaPrice: 1.90,
        morrisisonsPrice: 1.85
      },
      {
        name: "Bananas (1kg)",
        category: "Fresh Produce",
        tescoPrice: 1.10,
        sainsburysPrice: 1.15,
        asdaPrice: 1.05,
        morrisisonsPrice: 1.12
      },
      {
        name: "Cheddar Cheese (200g)",
        category: "Dairy",
        tescoPrice: 2.50,
        sainsburysPrice: 2.65,
        asdaPrice: 2.40,
        morrisisonsPrice: 2.55
      }
    ];

    ukProducts.forEach(product => this.createProduct(product));
  }

  // Shopping Lists
  async getShoppingList(id: number): Promise<ShoppingList | undefined> {
    return this.shoppingLists.get(id);
  }

  async getAllShoppingLists(): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createShoppingList(insertList: InsertShoppingList): Promise<ShoppingList> {
    const id = this.currentListId++;
    const list: ShoppingList = { 
      ...insertList, 
      id, 
      createdAt: new Date() 
    };
    this.shoppingLists.set(id, list);
    return list;
  }

  async updateShoppingList(id: number, updates: Partial<InsertShoppingList>): Promise<ShoppingList | undefined> {
    const existing = this.shoppingLists.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.shoppingLists.set(id, updated);
    return updated;
  }

  async deleteShoppingList(id: number): Promise<boolean> {
    return this.shoppingLists.delete(id);
  }

  // Stores
  async getAllStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStoresByLocation(latitude: number, longitude: number, radiusKm: number): Promise<Store[]> {
    const stores = Array.from(this.stores.values());
    
    return stores.filter(store => {
      const distance = this.calculateDistance(latitude, longitude, store.latitude, store.longitude);
      return distance <= radiusKm;
    }).sort((a, b) => {
      const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentStoreId++;
    const store: Store = { ...insertStore, id };
    this.stores.set(id, store);
    return store;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductByName(name: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => 
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p =>
      p.name.toLowerCase().includes(lowerQuery)
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const storage = new MemStorage();
