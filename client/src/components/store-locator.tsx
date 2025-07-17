import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Phone, Clock, Search } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { Store } from "@shared/schema";

export default function StoreLocator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRadius, setSearchRadius] = useState(5); // km
  const { location, getCurrentLocation, isLoading: locationLoading } = useGeolocation();

  const { data: stores = [], isLoading, refetch } = useQuery<Store[]>({
    queryKey: ["/api/stores", location?.latitude, location?.longitude, searchRadius],
    enabled: !!location,
  });

  const { data: allStores = [] } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    enabled: !location,
  });

  const calculateDistance = (store: Store) => {
    if (!location) return 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(store.latitude - location.latitude);
    const dLon = deg2rad(store.longitude - location.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(location.latitude)) * Math.cos(deg2rad(store.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const getWalkingTime = (distanceKm: number) => {
    const walkingSpeedKmh = 5; // Average walking speed
    const timeHours = distanceKm / walkingSpeedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    return timeMinutes;
  };

  const filteredStores = (location ? stores : allStores).filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.chain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirections = (store: Store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  const getStoreStatusBadge = (hours: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (hours.includes("24 hours") || hours.includes("24h")) {
      return <Badge className="bg-green-100 text-green-800">Open 24h</Badge>;
    }
    
    // Simple time parsing for demo
    if (hours.includes("11pm") && currentHour < 23) {
      return <Badge className="bg-green-100 text-green-800">Open until 11pm</Badge>;
    }
    
    if (hours.includes("10pm") && currentHour < 22) {
      return <Badge className="bg-yellow-100 text-yellow-800">Closes 10pm</Badge>;
    }
    
    if (hours.includes("9pm") && currentHour < 21) {
      return <Badge className="bg-green-100 text-green-800">Open until 9pm</Badge>;
    }
    
    return <Badge variant="secondary">Check hours</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Find Nearby Stores</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={getCurrentLocation}
            disabled={locationLoading}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {locationLoading ? "Locating..." : "Use My Location"}
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter postcode or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {/* Location Status */}
        {location && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center text-green-700">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Location found • Showing stores within {Math.round(searchRadius * 0.621371)} miles
              </span>
            </div>
          </div>
        )}
        
        {/* Store Results */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Finding stores...
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStores.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No stores found in your area.</p>
              </div>
            ) : (
              filteredStores.map((store) => {
                const distance = location ? calculateDistance(store) : 0;
                const walkingTime = getWalkingTime(distance);
                
                return (
                  <div 
                    key={store.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{store.name}</h3>
                        <p className="text-sm text-gray-500">{store.address}</p>
                      </div>
                      {location && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-primary">
                            {(distance * 0.621371).toFixed(1)} miles
                          </div>
                          <div className="text-xs text-gray-500">
                            {walkingTime} min walk
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {getStoreStatusBadge(store.openingHours)}
                        {store.phone && (
                          <div className="flex items-center text-gray-500">
                            <Phone className="w-3 h-3 mr-1" />
                            {store.phone}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => getDirections(store)}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        {/* Map Placeholder */}
        <div className="mt-6">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-600">Interactive map integration</p>
              <p className="text-xs text-gray-500">Map would show store locations here</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
