import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Edit } from "lucide-react";
import { useOCR } from "@/hooks/use-ocr";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

interface CameraCaptureProps {
  onItemsDetected: (items: ShoppingItem[]) => void;
}

export default function CameraCapture({ onItemsDetected }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [recentLists] = useLocalStorage<Array<{id: string, name: string, date: string, itemCount: number}>>("recent_lists", []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { processImage, isProcessing } = useOCR();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Fallback to file upload
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    
    try {
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const items = await processImage(blob);
            onItemsDetected(items);
            stopCamera();
          }
        }, "image/jpeg", 0.8);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [processImage, onItemsDetected]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const items = await processImage(file);
      onItemsDetected(items);
    } catch (error) {
      console.error("Error processing uploaded image:", error);
    }
  };

  const handleManualEntry = () => {
    // For now, just create a sample manual entry
    const manualItems: ShoppingItem[] = [
      {
        id: "manual-1",
        text: "Enter items manually",
        confidence: 1.0,
        completed: false
      }
    ];
    onItemsDetected(manualItems);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Capture Your Shopping List</h2>
        
        {/* Camera Preview */}
        <div className="camera-preview mb-4">
          {showCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="camera-overlay" />
              <Button 
                onClick={captureImage}
                disabled={isCapturing || isProcessing}
                className="capture-button"
                size="icon"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tap camera button to start</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Button 
            onClick={showCamera ? stopCamera : startCamera}
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
          >
            <Camera className="w-4 h-4 mr-2" />
            {showCamera ? "Stop Camera" : "Start Camera"}
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          
          <Button 
            onClick={handleManualEntry}
            variant="outline" 
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Type List
          </Button>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Processing image...
            </div>
          </div>
        )}

        {/* Recent Lists */}
        {recentLists.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Lists</h3>
            <div className="space-y-3">
              {recentLists.slice(0, 3).map((list) => (
                <div 
                  key={list.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{list.name}</div>
                    <div className="text-sm text-gray-500">{list.date} • {list.itemCount} items</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Load →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
