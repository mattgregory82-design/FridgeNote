import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Camera, List, PoundSterling, MapPin, Plus, ShoppingCart, ClipboardList } from "lucide-react";
import CameraCapture from "@/components/camera-capture";
import OCRResults from "@/components/ocr-results";
import OrganisedView from "@/components/organised-view";
import PriceComparison from "@/components/price-comparison";
import StoreLocator from "@/components/store-locator";
import OrderOnline from "@/components/order-online";
import LanguageSelector from "@/components/language-selector";
import InstallPrompt from "@/components/install-prompt";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState("capture");
  const [capturedItems, setCapturedItems] = useState<ShoppingItem[]>([]);
  const [organisedItems, setOrganisedItems] = useState<ShoppingItem[]>([]);
  const [currentList, setCurrentList] = useLocalStorage<ShoppingItem[]>("current_list", []);
  const [hasConfirmedResults, setHasConfirmedResults] = useLocalStorage<boolean>("has_confirmed_results", false);

  const hasItems = currentList.length > 0 || capturedItems.length > 0;
  const showAdvancedTabs = hasItems && hasConfirmedResults;

  const handleItemsDetected = (items: ShoppingItem[]) => {
    setCapturedItems(items);
    setCurrentList(items);
    setActiveTab("review");
  };

  const handleItemsOrganised = (items: ShoppingItem[]) => {
    setOrganisedItems(items);
    setCurrentList(items);
  };

  const handleContinueToOrganised = () => {
    setHasConfirmedResults(true);
    setActiveTab("organized");
  };

  const handleQuickCapture = () => {
    setActiveTab("capture");
  };

  const handleTabChange = (tab: string) => {
    if (tab === "review" && capturedItems.length === 0 && currentList.length === 0) {
      return;
    }
    if (tab === "organized" && capturedItems.length === 0 && currentList.length === 0) {
      return;
    }
    if ((tab === "compare" || tab === "stores" || tab === "order") && !showAdvancedTabs) {
      return;
    }
    setActiveTab(tab);
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
              <Button variant="ghost" size="icon" data-testid="button-user-profile">
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent space-x-8 overflow-x-auto">
              <TabsTrigger 
                value="capture" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
                data-testid="tab-capture"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </TabsTrigger>
              <TabsTrigger 
                value="review"
                disabled={!hasItems}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="tab-review"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Review
              </TabsTrigger>
              <TabsTrigger 
                value="organized"
                disabled={!hasItems}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="tab-organised"
              >
                <List className="w-4 h-4 mr-2" />
                Organised
              </TabsTrigger>
              {showAdvancedTabs && (
                <>
                  <TabsTrigger 
                    value="compare"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
                    data-testid="tab-compare"
                  >
                    <PoundSterling className="w-4 h-4 mr-2" />
                    Price Compare
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stores"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
                    data-testid="tab-stores"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Stores
                  </TabsTrigger>
                  <TabsTrigger 
                    value="order"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent py-4 px-1 text-sm font-medium whitespace-nowrap"
                    data-testid="tab-order"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order Online
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value="capture" className="space-y-6">
            <CameraCapture onItemsDetected={handleItemsDetected} />
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            {capturedItems.length > 0 || currentList.length > 0 ? (
              <OCRResults 
                items={capturedItems.length > 0 ? capturedItems : currentList} 
                onItemsUpdated={(items) => {
                  setCapturedItems(items);
                  setCurrentList(items);
                }}
                onContinue={handleContinueToOrganised}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items to Review</h3>
                  <p className="text-gray-600 mb-4">Capture or enter some items first.</p>
                  <Button onClick={() => setActiveTab("capture")} data-testid="button-go-to-capture">
                    Go to Capture
                  </Button>
                </CardContent>
              </Card>
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
        data-testid="button-fab-capture"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Install Prompt - only shows after user has confirmed their list */}
      <InstallPrompt showAfterListConfirmed={hasConfirmedResults} />
    </div>
  );
}
