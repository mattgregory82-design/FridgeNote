import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, PoundSterling } from "lucide-react";
import type { ShoppingItem, Product } from "@shared/schema";

interface PriceComparisonProps {
  items: ShoppingItem[];
}

const SUPERMARKET_CHAINS = [
  { name: "Tesco", key: "tescoPrice", color: "text-red-600", bgColor: "bg-red-600" },
  { name: "Sainsbury's", key: "sainsburysPrice", color: "text-blue-600", bgColor: "bg-blue-600" },
  { name: "ASDA", key: "asdaPrice", color: "text-orange-600", bgColor: "bg-orange-600" },
  { name: "Morrisons", key: "morrisisonsPrice", color: "text-green-600", bgColor: "bg-green-600" },
];

export default function PriceComparison({ items }: PriceComparisonProps) {
  const [selectedStores, setSelectedStores] = useState<string[]>(["Tesco", "Sainsbury's", "ASDA"]);
  
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: items.length > 0,
  });

  const getMatchingProducts = () => {
    return items.map(item => {
      const matchingProduct = products.find(product => 
        product.name.toLowerCase().includes(item.text.toLowerCase()) ||
        item.text.toLowerCase().includes(product.name.toLowerCase().split(' ')[0])
      );
      return { item, product: matchingProduct };
    }).filter(match => match.product);
  };

  const calculateTotals = () => {
    const matchingProducts = getMatchingProducts();
    const totals: Record<string, number> = {};
    
    SUPERMARKET_CHAINS.forEach(chain => {
      totals[chain.name] = matchingProducts.reduce((sum, match) => {
        const price = match.product?.[chain.key as keyof Product] as number;
        return sum + (price || 0);
      }, 0);
    });
    
    return totals;
  };

  const getBestPrice = (product: Product) => {
    const prices = SUPERMARKET_CHAINS.map(chain => ({
      store: chain.name,
      price: product[chain.key as keyof Product] as number || 0,
      color: chain.color
    })).filter(p => p.price > 0);
    
    return prices.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const toggleStore = (storeName: string) => {
    setSelectedStores(prev => 
      prev.includes(storeName) 
        ? prev.filter(s => s !== storeName)
        : [...prev, storeName]
    );
  };

  const matchingProducts = getMatchingProducts();
  const totals = calculateTotals();
  const bestTotal = Math.min(...Object.values(totals).filter(t => t > 0));
  const bestStore = Object.entries(totals).find(([, total]) => total === bestTotal)?.[0];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <PoundSterling className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items to Compare</h3>
          <p className="text-gray-600">Add some items to your list to see price comparisons.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison</h2>
        
        {/* Store Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {SUPERMARKET_CHAINS.map((chain) => (
            <div 
              key={chain.name}
              onClick={() => toggleStore(chain.name)}
              className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                selectedStores.includes(chain.name) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold ${chain.bgColor}`}>
                {chain.name.charAt(0)}
              </div>
              <h3 className="font-medium text-gray-900">{chain.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedStores.includes(chain.name) ? 'Selected' : 'Compare'}
              </p>
            </div>
          ))}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Loading prices...
            </div>
          </div>
        ) : matchingProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No price data found for your items.</p>
          </div>
        ) : (
          <>
            {/* Price Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-900">Item</th>
                    {SUPERMARKET_CHAINS.filter(chain => selectedStores.includes(chain.name)).map(chain => (
                      <th key={chain.name} className={`text-center py-3 px-2 font-medium ${chain.color}`}>
                        {chain.name}
                      </th>
                    ))}
                    <th className="text-center py-3 px-2 font-medium text-gray-900">Best</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matchingProducts.map(({ item, product }) => {
                    if (!product) return null;
                    const bestPrice = getBestPrice(product);
                    
                    return (
                      <tr key={item.id}>
                        <td className="py-3 px-2 text-gray-900">{product.name}</td>
                        {SUPERMARKET_CHAINS.filter(chain => selectedStores.includes(chain.name)).map(chain => {
                          const price = product[chain.key as keyof Product] as number;
                          const isBest = price === bestPrice.price;
                          
                          return (
                            <td key={chain.name} className={`py-3 px-2 text-center ${isBest ? 'font-semibold text-green-600' : ''}`}>
                              {price ? `£${price.toFixed(2)}` : 'N/A'}
                            </td>
                          );
                        })}
                        <td className="py-3 px-2 text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {bestPrice.store}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-gray-300">
                  <tr className="font-semibold">
                    <td className="py-3 px-2 text-gray-900">Total</td>
                    {SUPERMARKET_CHAINS.filter(chain => selectedStores.includes(chain.name)).map(chain => (
                      <td 
                        key={chain.name} 
                        className={`py-3 px-2 text-center ${chain.color} ${
                          chain.name === bestStore ? 'bg-green-50' : ''
                        }`}
                      >
                        £{totals[chain.name].toFixed(2)}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-center">
                      {bestStore && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Save £{(Math.max(...Object.values(totals)) - bestTotal).toFixed(2)}
                        </Badge>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <Button className="flex-1">
                <PoundSterling className="w-4 h-4 mr-2" />
                Select Best Deals
              </Button>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Prices
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
