import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, RotateCcw, Sparkles } from "lucide-react";
import type { ShoppingItem } from "@shared/schema";

interface OCRResultsProps {
  items: ShoppingItem[];
  onItemsUpdated: (items: ShoppingItem[]) => void;
  onOrganise: () => void;
}

export default function OCRResults({ items, onItemsUpdated, onOrganise }: OCRResultsProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const startEdit = (item: ShoppingItem) => {
    setEditingItem(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    const updatedItems = items.map(item => 
      item.id === editingItem 
        ? { ...item, text: editText, confidence: 1.0 }
        : item
    );
    
    onItemsUpdated(updatedItems);
    setEditingItem(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText("");
  };

  const removeItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsUpdated(updatedItems);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.7) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-50";
    if (confidence >= 0.7) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Detected Items</h3>
          <Badge variant="secondary">
            {items.length} item{items.length !== 1 ? 's' : ''} found
          </Badge>
        </div>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${getConfidenceBg(item.confidence)}`}
            >
              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(item.confidence)}`} />
              
              {editingItem === item.id ? (
                <div className="flex-1 flex space-x-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                  />
                  <Button size="sm" onClick={saveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-gray-900">{item.text}</span>
                  <span className="text-xs text-gray-500">
                    {Math.round(item.confidence * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(item)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex space-x-3">
          <Button 
            onClick={onOrganise}
            className="flex-1"
            disabled={items.length === 0}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Organise Items
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
