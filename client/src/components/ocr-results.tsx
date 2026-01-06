import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, RotateCcw, ArrowRight } from "lucide-react";
import { SafeText } from "@/components/safe-text";
import type { ShoppingItem } from "@shared/schema";

interface OCRResultsProps {
  items: ShoppingItem[];
  onItemsUpdated: (items: ShoppingItem[]) => void;
  onContinue: () => void;
}

export default function OCRResults({ items, onItemsUpdated, onContinue }: OCRResultsProps) {
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
          <h3 className="text-lg font-semibold text-gray-900">Review Your Items</h3>
          <Badge variant="secondary">
            {items.length} item{items.length !== 1 ? 's' : ''} found
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Check the items below and make any corrections before continuing.
        </p>
        
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${getConfidenceBg(item.confidence)}`}
              data-testid={`item-review-${item.id}`}
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
                    data-testid="input-edit-item"
                  />
                  <Button size="sm" onClick={saveEdit} data-testid="button-save-edit">Save</Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit} data-testid="button-cancel-edit">Cancel</Button>
                </div>
              ) : (
                <>
                  <SafeText className="flex-1 text-gray-900">{item.text}</SafeText>
                  <span className="text-xs text-gray-500">
                    {Math.round(item.confidence * 100)}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(item)}
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`button-remove-${item.id}`}
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
            onClick={onContinue}
            className="flex-1"
            disabled={items.length === 0}
            data-testid="button-continue-to-organised"
          >
            Continue to Organised List
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
            data-testid="button-retake"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
