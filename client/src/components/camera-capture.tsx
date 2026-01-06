import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Edit, AlertCircle, Smartphone } from "lucide-react";
import { useOCR } from "@/hooks/use-ocr";
import { useLocalStorage } from "@/lib/storage";
import type { ShoppingItem } from "@shared/schema";

interface CameraCaptureProps {
  onItemsDetected: (items: ShoppingItem[]) => void;
}

export default function CameraCapture({ onItemsDetected }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [recentLists] = useLocalStorage<Array<{id: string, name: string, date: string, itemCount: number}>>("recent_lists", []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { processImage, isProcessing } = useOCR();

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const activateFallbackMode = (errorMessage: string) => {
    stopCamera();
    setCameraError(errorMessage);
    setShowFallback(true);
  };

  const startCamera = async () => {
    setCameraError(null);
    setShowFallback(false);
    
    try {
      let stream: MediaStream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
      }
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.setAttribute("playsinline", "true");
        video.setAttribute("muted", "true");
        video.srcObject = stream;
        streamRef.current = stream;
        
        try {
          await video.play();
        } catch (playError) {
          console.warn("Video autoplay failed:", playError);
        }
        
        setShowCamera(true);
        
        setTimeout(() => {
          if (videoRef.current) {
            const v = videoRef.current;
            if (v.readyState < 2 || v.videoWidth === 0) {
              activateFallbackMode("Live camera preview isn't available on this device. Use camera capture instead.");
            }
          }
        }, 1200);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      activateFallbackMode("Live camera preview isn't available on this device. Use camera capture instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
    
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleCameraCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const items = await processImage(file);
      onItemsDetected(items);
      setCameraError(null);
      setShowFallback(false);
    } catch (error) {
      console.error("Error processing camera capture:", error);
    }
    
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleManualEntry = () => {
    const input = window.prompt("Type your shopping items separated by commas or new lines:");
    
    if (!input || !input.trim()) return;

    const itemTexts = input
      .split(/[,\n]+/)
      .map(text => text.trim())
      .filter(text => text.length > 0);

    if (itemTexts.length === 0) return;

    const manualItems: ShoppingItem[] = itemTexts.map((text, index) => ({
      id: `manual-${Date.now()}-${index}`,
      text,
      confidence: 1.0,
      completed: false
    }));

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
                muted
                className="w-full h-full object-cover"
              />
              <div className="camera-overlay" />
              <Button 
                onClick={captureImage}
                disabled={isCapturing || isProcessing}
                className="capture-button"
                size="icon"
                data-testid="button-capture-photo"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              disabled={isProcessing}
              className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              data-testid="button-tap-to-start-camera"
            >
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Tap here to start camera</p>
                <p className="text-xs text-gray-500 mt-1">or use buttons below</p>
              </div>
            </button>
          )}
        </div>

        {/* Camera Error Message + Fallback */}
        {cameraError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{cameraError}</p>
            </div>
            {showFallback && (
              <Button 
                onClick={() => cameraInputRef.current?.click()}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isProcessing}
                data-testid="button-use-iphone-camera"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Use iPhone Camera
              </Button>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <Button 
            onClick={showCamera ? stopCamera : startCamera}
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
            data-testid="button-toggle-camera"
          >
            <Camera className="w-4 h-4 mr-2" />
            {showCamera ? "Stop Camera" : "Start Camera"}
          </Button>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            variant="outline" 
            className="flex-1"
            disabled={isProcessing}
            data-testid="button-upload-image"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Button>
          
          <Button 
            onClick={handleManualEntry}
            variant="outline" 
            className="flex-1"
            data-testid="button-manual-entry"
          >
            <Edit className="w-4 h-4 mr-2" />
            Type List
          </Button>
        </div>

        {/* Hidden file input for gallery upload */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden file input for iOS camera capture fallback */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
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
                  data-testid={`recent-list-${list.id}`}
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
