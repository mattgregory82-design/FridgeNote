import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Camera, List, PoundSterling, MapPin, Plus, ShoppingCart } from "lucide-react";
import CameraCapture from "@/components/camera-capture";
import OCRResults from "@/components/ocr-results";
import OrganisedView from "@/components/organised-view";
import PriceComparison from "@/components/price-comparison";
import StoreLocator from "@/components/store-locator";
import OrderOnline from "@/components/order-online";
import LanguageSelector from "@/components/language-selector";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("capture");
  const [capturedItems, setCapturedItems] = useState<ShoppingItem[]>([]);
  const [organisedItems, setOrganisedItems] = useState<ShoppingItem[]>([]);
  const [currentList, setCurrentList] = useLocalStorage<ShoppingItem[]>("current_list", []);

  const handleItemsDetected = (items: ShoppingItem[]) => {
    setCapturedItems(items);
    setCurrentList(items);
  };

  const handleItemsOrganised = (items: ShoppingItem[]) => {
    setOrganisedItems(items);
    setCurrentList(items);
  };

  const handleQuickCapture = () => {
    setActiveTab("capture");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">FridgeNote</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Button variant="ghost" size="icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent space-x-8 overflow-x-auto">
              <TabsTrigger 
                value="capture" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture List
              </TabsTrigger>
              <TabsTrigger 
                value="organized"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
              >
                <List className="w-4 h-4 mr-2" />
                Organised View
              </TabsTrigger>
              <TabsTrigger 
                value="compare"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
              >
                <PoundSterling className="w-4 h-4 mr-2" />
                Price Compare
              </TabsTrigger>
              <TabsTrigger 
                value="stores"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Find Stores
              </TabsTrigger>
              <TabsTrigger 
                value="order"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Online
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="capture" className="space-y-6">
            <CameraCapture onItemsDetected={handleItemsDetected} />
            {capturedItems.length > 0 && (
              <OCRResults 
                items={capturedItems} 
                onItemsUpdated={setCapturedItems}
                onOrganise={() => setActiveTab("organized")}
              />
            )}
          </TabsContent>

          <TabsContent value="organized" className="space-y-6">
            <OrganisedView 
              items={currentList} 
              onItemsUpdated={handleItemsOrganised}
            />
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <PriceComparison items={currentList} />
          </TabsContent>

          <TabsContent value="stores" className="space-y-6">
            <StoreLocator />
          </TabsContent>

          <TabsContent value="order" className="space-y-6">
            <OrderOnline items={currentList} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Button */}
      <Button 
        onClick={handleQuickCapture}
        className="fab"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
