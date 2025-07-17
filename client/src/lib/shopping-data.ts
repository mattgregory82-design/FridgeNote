import type { ShoppingItem } from "@shared/schema";

export const STORE_CATEGORIES = [
  {
    name: "Fresh Produce",
    aisle: "Aisle 1-2",
    description: "Start here",
    icon: "🥬",
    color: "bg-green-100",
    bgColor: "category-produce",
    dotColor: "bg-green-500",
    keywords: ["apple", "banana", "orange", "tomato", "lettuce", "carrot", "onion", "potato", "fruit", "vegetable"]
  },
  {
    name: "Dairy",
    aisle: "Aisle 3",
    description: "Refrigerated section",
    icon: "🥛",
    color: "bg-blue-100",
    bgColor: "category-dairy",
    dotColor: "bg-blue-500",
    keywords: ["milk", "cheese", "butter", "yogurt", "cream", "eggs"]
  },
  {
    name: "Meat & Fish",
    aisle: "Aisle 4",
    description: "Butcher counter",
    icon: "🍖",
    color: "bg-red-100",
    bgColor: "category-meat",
    dotColor: "bg-red-500",
    keywords: ["chicken", "beef", "pork", "fish", "salmon", "meat", "turkey", "lamb", "bacon", "sausage"]
  },
  {
    name: "Bakery",
    aisle: "Aisle 5",
    description: "Fresh baked goods",
    icon: "🍞",
    color: "bg-amber-100",
    bgColor: "category-bakery",
    dotColor: "bg-amber-500",
    keywords: ["bread", "roll", "cake", "pastry", "croissant", "muffin", "bagel"]
  },
  {
    name: "Frozen",
    aisle: "Aisle 6",
    description: "Frozen foods",
    icon: "🧊",
    color: "bg-cyan-100",
    bgColor: "bg-cyan-50",
    dotColor: "bg-cyan-500",
    keywords: ["frozen", "ice cream", "frozen vegetables", "frozen fruit", "pizza"]
  },
  {
    name: "Household",
    aisle: "Aisle 7-8",
    description: "Cleaning & household",
    icon: "🧽",
    color: "bg-purple-100",
    bgColor: "category-household",
    dotColor: "bg-purple-500",
    keywords: ["detergent", "soap", "shampoo", "toothpaste", "toilet paper", "kitchen roll", "cleaning"]
  },
];

export function categorizeItems(items: ShoppingItem[]): ShoppingItem[] {
  return items.map(item => {
    const itemText = item.text.toLowerCase();
    
    // Find the best matching category
    let bestCategory = "Household"; // Default category
    let bestScore = 0;
    
    for (const category of STORE_CATEGORIES) {
      const score = category.keywords.filter(keyword => 
        itemText.includes(keyword.toLowerCase())
      ).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category.name;
      }
    }
    
    return {
      ...item,
      category: bestCategory,
    };
  });
}

export function getOptimizedRoute(categorizedItems: ShoppingItem[]): ShoppingItem[] {
  // Sort items by category order (following typical UK supermarket layout)
  const categoryOrder = STORE_CATEGORIES.map(cat => cat.name);
  
  return [...categorizedItems].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category || "Household");
    const bIndex = categoryOrder.indexOf(b.category || "Household");
    return aIndex - bIndex;
  });
}
