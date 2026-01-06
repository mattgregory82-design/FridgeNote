import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Route, Download, Save, GripVertical } from "lucide-react";
import { categorizeItems, STORE_CATEGORIES } from "@/lib/shopping-data";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

interface OrganisedViewProps {
  items: ShoppingItem[];
  onItemsUpdated: (items: ShoppingItem[]) => void;
}

export default function OrganisedView({ items, onItemsUpdated }: OrganisedViewProps) {
  const [organisedItems, setOrganisedItems] = useState<ShoppingItem[]>([]);
  const [, setSavedLists] = useLocalStorage<Array<{id: string, name: string, date: string, itemCount: number}>>("recent_lists", []);
  const lastInputFingerprintRef = useRef<string>("");
  const lastOutputFingerprintRef = useRef<string>("");

  // Memoize items fingerprint to detect actual changes in input
  const inputFingerprint = useMemo(() => {
    return items.map(i => i.id + i.text).join('|');
  }, [items]);

  // Memoize categorised items to avoid recalculating
  const categorisedItems = useMemo(() => {
    if (items.length === 0) return [];
    return categorizeItems(items);
  }, [items]);

  // Fingerprint for output to detect when we need to notify parent
  const outputFingerprint = useMemo(() => {
    return categorisedItems.map(i => i.id + i.text + (i.category || '')).join('|');
  }, [categorisedItems]);

  // Update local state when input changes
  useEffect(() => {
    if (inputFingerprint !== lastInputFingerprintRef.current) {
      lastInputFingerprintRef.current = inputFingerprint;
      setOrganisedItems(categorisedItems);
    }
  }, [inputFingerprint, categorisedItems]);

  // Notify parent only when output actually changes (not on every render)
  useEffect(() => {
    if (categorisedItems.length > 0 && outputFingerprint !== lastOutputFingerprintRef.current) {
      lastOutputFingerprintRef.current = outputFingerprint;
      onItemsUpdated(categorisedItems);
    }
  }, [outputFingerprint, categorisedItems, onItemsUpdated]);

  const moveItem = (itemId: string, newCategory: string) => {
    const updatedItems = organisedItems.map(item =>
      item.id === itemId ? { ...item, category: newCategory } : item
    );
    setOrganisedItems(updatedItems);
    onItemsUpdated(updatedItems);
  };

  const toggleItemComplete = (itemId: string) => {
    const updatedItems = organisedItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setOrganisedItems(updatedItems);
    onItemsUpdated(updatedItems);
  };

  const exportList = () => {
    const listText = STORE_CATEGORIES.map(category => {
      const categoryItems = organisedItems.filter(item => item.category === category.name);
      if (categoryItems.length === 0) return null;
      
      return `${category.name} (${category.aisle}):\n${categoryItems.map(item => `  • ${item.text}`).join('\n')}`;
    }).filter(Boolean).join('\n\n');

    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveList = () => {
    const listName = `Shopping List ${new Date().toLocaleDateString()}`;
    const newList = {
      id: Date.now().toString(),
      name: listName,
      date: new Date().toLocaleDateString(),
      itemCount: organisedItems.length
    };
    
    setSavedLists(prev => [newList, ...prev.slice(0, 9)]); // Keep last 10 lists
  };

  const getCategoryItems = (categoryName: string) => {
    return organisedItems.filter(item => item.category === categoryName);
  };

  if (organisedItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items to Organise</h3>
          <p className="text-gray-600">Capture some items first to see them organised by store layout.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Organised by Store Layout</h2>
          <Button variant="outline" size="sm">
            <Route className="w-4 h-4 mr-2" />
            Optimise Route
          </Button>
        </div>
        
        <div className="space-y-6">
          {STORE_CATEGORIES.map((category) => {
            const categoryItems = getCategoryItems(category.name);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.aisle} • {category.description}</p>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="secondary">{categoryItems.length} items</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`draggable-item flex items-center space-x-3 p-2 rounded-md transition-all ${category.bgColor} ${item.completed ? 'opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItemComplete(item.id)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                      <div className={`w-2 h-2 rounded-full ${category.dotColor}`} />
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.text}
                      </span>
                      <Button size="sm" variant="ghost">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex space-x-3">
          <Button onClick={exportList} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Button onClick={saveList} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
