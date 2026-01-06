import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Edit, AlertCircle, Smartphone } from "lucide-react";
import { useOCR } from "@/hooks/use-ocr";
import type { ShoppingItem } from "@shared/schema";

interface CameraCaptureProps {
  onItemsDetected: (items: ShoppingItem[]) => void;
}

export default function CameraCapture({ onItemsDetected }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const { processImage, isProcessing } = useOCR();

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      // @ts-expect-error srcObject exists at runtime
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const activateFallbackMode = useCallback(
    (message: string) => {
      stopCamera();
      setCameraError(message);
      setShowFallback(true);
    },
    [stopCamera]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setShowFallback(false);

    try {
      let stream: MediaStream;

      // Try preferred constraints first; fallback to generic camera if iOS can't satisfy them.
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      const video = videoRef.current;
      if (!video) {
        activateFallbackMode("Camera preview couldn't start. Use camera capture instead.");
        return;
      }

      // iOS Safari/PWA: these are important.
      video.setAttribute("playsinline", "true");
      video.muted = true;

      // @ts-expect-error srcObject exists at runtime
      video.srcObject = stream;
      streamRef.current = stream;

      try {
        await video.play();
      } catch (err) {
        // iOS sometimes blocks autoplay; user can still try capture fallback.
        console.warn("Video play() failed:", err);
      }

      setShowCamera(true);

      // Watchdog: if preview doesn't become usable quickly, switch to capture fallback.
      window.setTimeout(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.readyState < 2 || v.videoWidth === 0) {
          activateFallbackMode("Live camera preview isn't available on this device. Use iPhone Camera instead.");
        }
      }, 1200);
    } catch (err) {
      console.error("Error accessing camera:", err);
      activateFallbackMode("Live camera preview isn't available on this device. Use iPhone Camera instead.");
    }
  }, [activateFallbackMode]);

  const captureImage = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsCapturing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          const items = await processImage(blob);
          onItemsDetected(items);
          stopCamera();
        },
        "image/jpeg",
        0.85
      );
    } catch (err) {
      console.error("Error capturing image:", err);
      setCameraError("Could not capture image. Please try again or use upload/camera fallback.");
    } finally {
      setIsCapturing(false);
    }
  }, [onItemsDetected, processImage, stopCamera]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const items = await processImage(file);
        onItemsDetected(items);
      } catch (err) {
        console.error("Error processing uploaded image:", err);
        setCameraError("Could not process that image. Please try another photo.");
      } finally {
        e.target.value = "";
      }
    },
    [onItemsDetected, processImage]
  );

  const handleCameraCaptureFallback = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const items = await processImage(file);
        onItemsDetected(items);
        setCameraError(null);
        setShowFallback(false);
      } catch (err) {
        console.error("Error processing camera capture:", err);
        setCameraError("Could not process that photo. Please try again.");
      } finally {
        e.target.value = "";
      }
    },
    [onItemsDetected, processImage]
  );

  const handleManualEntry = useCallback(() => {
    const input = window.prompt("Type your shopping items separated by commas or new lines:");
    if (!input || !input.trim()) return;

    const itemTexts = input
      .split(/[,\n]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (itemTexts.length === 0) return;

    const manualItems: ShoppingItem[] = itemTexts.map((text, idx) => ({
      id: `manual-${Date.now()}-${idx}`,
      text,
      confidence: 1.0,
      completed: false,
    }));

    onItemsDetected(manualItems);
  }, [onItemsDetected]);

  const StartArea = (
    <button
      type="button"
      onClick={startCamera}
      disabled={isProcessing}
      className="w-full rounded-lg border border-dashed border-gray-300 p-6 text-left hover:bg-gray-50 transition"
      data-testid="button-tap-to-start"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Camera className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">Tap here to start camera</div>
          <div className="text-sm text-gray-600">Or use the buttons below to upload / type a list.</div>
        </div>
      </div>
    </button>
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Capture Your Shopping List</h2>
          <p className="text-sm text-gray-600">Take a photo of your fridge note or upload an image.</p>
        </div>

        {/* Preview / Start area */}
        {showCamera ? (
          <div className="space-y-3">
            <div className="rounded-lg overflow-hidden border bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
                data-testid="video-preview"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={captureImage}
                className="flex-1"
                disabled={isCapturing || isProcessing}
                data-testid="button-take-photo"
              >
                <Camera className="w-4 h-4 mr-2" />
                Take photo
              </Button>
              <Button onClick={stopCamera} variant="outline" disabled={isProcessing} data-testid="button-stop-camera">
                Stop
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {StartArea}

            {/* Error / fallback */}
            {cameraError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div className="flex-1">{cameraError}</div>
              </div>
            )}

            {showFallback && (
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full"
                disabled={isProcessing}
                data-testid="button-use-iphone-camera"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Use iPhone Camera
              </Button>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={startCamera} className="flex-1" disabled={isProcessing} data-testid="button-start-camera">
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
                data-testid="button-upload-image"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                onClick={handleManualEntry}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
                data-testid="button-manual-entry"
              >
                <Edit className="w-4 h-4 mr-2" />
                Type
              </Button>
            </div>

            {isProcessing && <div className="text-sm text-gray-600">Processing image…</div>}
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
          data-testid="input-upload"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCameraCaptureFallback}
          data-testid="input-ios-camera"
        />
      </CardContent>
    </Card>
  );
}
