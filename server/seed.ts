import { db } from './db';
import { stores, products } from '@shared/schema';

export async function seedDatabase() {
  // Check if database is already seeded
  const existingStores = await db.select().from(stores).limit(1);
  if (existingStores.length > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Seed UK stores
  const ukStores = [
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

  await db.insert(stores).values(ukStores);

  // Seed UK products with prices
  const ukProducts = [
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

  await db.insert(products).values(ukProducts);

  console.log('Database seeded successfully');
}