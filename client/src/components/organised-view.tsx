import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Route, Download, Save, GripVertical, Plus } from "lucide-react";
import { categorizeItems, STORE_CATEGORIES } from "@/lib/shopping-data";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

interface OrganisedViewProps {
  items: ShoppingItem[];
  onItemsUpdated: (items: ShoppingItem[]) => void;
}

export default function OrganisedView({ items, onItemsUpdated }: OrganisedViewProps) {
  const [organisedItems, setOrganisedItems] = useState<ShoppingItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [, setSavedLists] = useLocalStorage<Array<{id: string, name: string, date: string, itemCount: number}>>("recent_lists", []);
  const lastInputFingerprintRef = useRef<string>("");
  const lastOutputFingerprintRef = useRef<string>("");

  const inputFingerprint = useMemo(() => {
    return items.map(i => i.id + i.text).join('|');
  }, [items]);

  const categorisedItems = useMemo(() => {
    if (items.length === 0) return [];
    return categorizeItems(items);
  }, [items]);

  const outputFingerprint = useMemo(() => {
    return categorisedItems.map(i => i.id + i.text + (i.category || '')).join('|');
  }, [categorisedItems]);

  useEffect(() => {
    if (inputFingerprint !== lastInputFingerprintRef.current) {
      lastInputFingerprintRef.current = inputFingerprint;
      setOrganisedItems(categorisedItems);
    }
  }, [inputFingerprint, categorisedItems]);

  useEffect(() => {
    if (categorisedItems.length > 0 && outputFingerprint !== lastOutputFingerprintRef.current) {
      lastOutputFingerprintRef.current = outputFingerprint;
      onItemsUpdated(categorisedItems);
    }
  }, [outputFingerprint, categorisedItems, onItemsUpdated]);

  const handleAddItem = () => {
    const trimmedText = newItemText.trim();
    if (!trimmedText) return;

    const newItem: ShoppingItem = {
      id: `manual-${Date.now()}`,
      text: trimmedText,
      confidence: 1.0,
      completed: false
    };

    const categorised = categorizeItems([newItem]);
    const updatedItems = [...organisedItems, ...categorised];
    setOrganisedItems(updatedItems);
    onItemsUpdated(updatedItems);
    setNewItemText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

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
    
    setSavedLists(prev => [newList, ...prev.slice(0, 9)]);
  };

  const getCategoryItems = (categoryName: string) => {
    return organisedItems.filter(item => item.category === categoryName);
  };

  if (organisedItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Items to Your List</h2>
            <div className="flex space-x-2">
              <Input
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type an item and press Enter..."
                className="flex-1"
                data-testid="input-add-item"
              />
              <Button onClick={handleAddItem} data-testid="button-add-item">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
          <div className="text-center py-8">
            <Route className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Yet</h3>
            <p className="text-gray-600">Add items above or capture a shopping list to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex space-x-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add another item..."
              className="flex-1"
              data-testid="input-add-item"
            />
            <Button onClick={handleAddItem} data-testid="button-add-item">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Organised by Store Layout</h2>
          <Button variant="outline" size="sm" data-testid="button-optimise-route">
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
                      data-testid={`item-organised-${item.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItemComplete(item.id)}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                        data-testid={`checkbox-${item.id}`}
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
          <Button onClick={exportList} className="flex-1" data-testid="button-export-list">
            <Download className="w-4 h-4 mr-2" />
            Export List
          </Button>
          <Button onClick={saveList} variant="outline" data-testid="button-save-list">
            <Save className="w-4 h-4 mr-2" />
            Save List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
