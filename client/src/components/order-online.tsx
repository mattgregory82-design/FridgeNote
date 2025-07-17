import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ExternalLink, Clock, Truck, Store as StoreIcon, Check } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { ShoppingItem, Store } from "@shared/schema";

interface OrderOnlineProps {
  items: ShoppingItem[];
}

interface OnlineStore {
  id: string;
  name: string;
  chain: string;
  deliveryAvailable: boolean;
  clickCollectAvailable: boolean;
  deliverySlots: string[];
  minOrderValue: number;
  deliveryFee: number;
  estimatedTotal: number;
  url: string;
}

export default function OrderOnline({ items }: OrderOnlineProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { location } = useGeolocation();

  // Get nearby stores for delivery/collection
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores', location?.latitude, location?.longitude],
    enabled: !!location
  });

  // Mock online delivery services (in real app, this would come from APIs)
  const onlineServices: OnlineStore[] = [
    {
      id: "tesco-delivery",
      name: "Tesco Groceries",
      chain: "Tesco",
      deliveryAvailable: true,
      clickCollectAvailable: true,
      deliverySlots: ["Today 18:00-20:00", "Tomorrow 10:00-12:00", "Tomorrow 14:00-16:00"],
      minOrderValue: 40,
      deliveryFee: 4.50,
      estimatedTotal: calculateEstimatedTotal(items, "tesco"),
      url: "https://www.tesco.com/groceries"
    },
    {
      id: "sainsburys-delivery",
      name: "Sainsbury's Groceries",
      chain: "Sainsbury's",
      deliveryAvailable: true,
      clickCollectAvailable: true,
      deliverySlots: ["Today 19:00-21:00", "Tomorrow 09:00-11:00", "Tomorrow 15:00-17:00"],
      minOrderValue: 40,
      deliveryFee: 5.00,
      estimatedTotal: calculateEstimatedTotal(items, "sainsburys"),
      url: "https://www.sainsburys.co.uk/groceries-api"
    },
    {
      id: "asda-delivery",
      name: "ASDA Groceries",
      chain: "ASDA",
      deliveryAvailable: true,
      clickCollectAvailable: true,
      deliverySlots: ["Tomorrow 11:00-13:00", "Tomorrow 16:00-18:00"],
      minOrderValue: 25,
      deliveryFee: 3.50,
      estimatedTotal: calculateEstimatedTotal(items, "asda"),
      url: "https://groceries.asda.com"
    }
  ];

  function calculateEstimatedTotal(items: ShoppingItem[], chain: string): number {
    // This would normally use real pricing data
    const basePrice = items.length * 2.5; // Mock calculation
    const chainMultiplier = chain === "tesco" ? 1.1 : chain === "sainsburys" ? 1.15 : 1.05;
    return Math.round(basePrice * chainMultiplier * 100) / 100;
  }

  const handleOrderOnline = (service: OnlineStore) => {
    // In a real app, this would integrate with the store's API or redirect to their website
    // For now, we'll open their website in a new tab
    window.open(service.url, '_blank');
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items to Order</h3>
          <p className="text-gray-600 mb-4">
            Capture your shopping list first to see online ordering options.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Online</h2>
        <p className="text-gray-600">
          Get your shopping delivered or ready for collection from these stores
        </p>
      </div>

      {/* Shopping List Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Your Shopping List ({items.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {items.slice(0, 8).map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {item.name}
              </Badge>
            ))}
            {items.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{items.length - 8} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Online Services */}
      <div className="grid gap-6">
        {onlineServices.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <StoreIcon className="w-5 h-5 mr-2" />
                  {service.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Est. £{service.estimatedTotal.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Service Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.deliveryAvailable && (
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Home Delivery</p>
                      <p className="text-sm text-gray-600">
                        From £{service.deliveryFee} delivery fee
                      </p>
                      <p className="text-xs text-gray-500">
                        Min order: £{service.minOrderValue}
                      </p>
                    </div>
                  </div>
                )}

                {service.clickCollectAvailable && (
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <StoreIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Click & Collect</p>
                      <p className="text-sm text-gray-600">
                        Free collection from store
                      </p>
                      <p className="text-xs text-gray-500">
                        Min order: £{service.minOrderValue}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Slots */}
              <div>
                <p className="font-medium mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Available Slots
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.deliverySlots.map((slot, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Estimated total: <span className="font-semibold">£{service.estimatedTotal.toFixed(2)}</span>
                  {service.deliveryAvailable && (
                    <span className="text-xs block">+ £{service.deliveryFee} delivery</span>
                  )}
                </div>
                
                <Button 
                  onClick={() => handleOrderOnline(service)}
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Order Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How it works:</p>
              <p>
                Clicking "Order Now" will take you to the store's website where you can add your items 
                to basket and complete your order. Prices and availability may vary from estimates shown.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}