"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Cropper, { Area } from "react-easy-crop";

// Helper to create cropped image from crop area
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.95);
}

type Step = "passphrase" | "photo" | "crop" | "upload";

export default function ScanPage() {
  const [step, setStep] = useState<Step>("passphrase");
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generatePassphrase = async () => {
    try {
      const res = await fetch("/api/passphrase", { method: "POST" });
      const data = await res.json();
      setPassphrase(data.passphrase);
      setStep("photo");
    } catch {
      setError("Failed to generate passphrase");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setError(null);
        setStep("crop");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(cropped);
      setStep("upload");
    } catch {
      setError("Failed to crop image");
    }
  };

  const handleUpload = async () => {
    if (!croppedImage || !passphrase) return;

    setIsProcessing(true);
    setError(null);
    setStatus("Processing image...");

    try {
      // Step 1: Parse the cropped image
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: croppedImage }),
      });

      if (!parseRes.ok) {
        const parseData = await parseRes.json();
        throw new Error(parseData.error || "Failed to parse image");
      }

      const puzzleData = await parseRes.json();
      setStatus("Saving puzzle...");

      // Step 2: Store the puzzle data with the passphrase
      const storeRes = await fetch("/api/puzzle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase, puzzleData }),
      });

      if (!storeRes.ok) {
        const storeData = await storeRes.json();
        throw new Error(storeData.error || "Failed to store puzzle");
      }

      setStatus("Puzzle uploaded! Enter the passphrase on your laptop to play.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToPhoto = () => {
    setImage(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setStep("photo");
    setError(null);
    setStatus("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-900">
      <Link
        href="/"
        className="mb-8 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Scan Puzzle
      </h1>

      {/* Step: Generate Passphrase */}
      {step === "passphrase" && (
        <>
          <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
            Photograph the puzzle from your newspaper
          </p>
          <button
            onClick={generatePassphrase}
            className="flex h-14 w-64 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Start Scanning
          </button>
        </>
      )}

      {/* Step: Take Photo */}
      {step === "photo" && passphrase && (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="w-full rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
            <p className="mb-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Your passphrase
            </p>
            <p className="text-center text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
              {passphrase}
            </p>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Type this on your laptop to connect
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-500 dark:hover:bg-zinc-700"
          >
            <span className="text-4xl">📷</span>
            <span className="mt-2 text-zinc-600 dark:text-zinc-400">
              Take photo or select image
            </span>
          </button>

          <button
            onClick={async () => {
              const res = await fetch("/examples/demo_puzzle.jpg");
              const blob = await res.blob();
              const reader = new FileReader();
              reader.onload = (e) => {
                setImage(e.target?.result as string);
                setError(null);
                setStep("crop");
              };
              reader.readAsDataURL(blob);
            }}
            className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Load demo puzzle
          </button>
        </div>
      )}

      {/* Step: Crop Image */}
      {step === "crop" && image && (
        <div className="flex w-full max-w-lg flex-col items-center gap-4">
          <p className="text-center text-zinc-600 dark:text-zinc-400">
            Drag and zoom to select the <strong>5×5 tile grid</strong>
          </p>

          <div className="relative h-80 w-full overflow-hidden rounded-xl bg-black">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex w-full items-center gap-4">
            <span className="text-sm text-zinc-500">Zoom:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>

          <div className="flex w-full gap-4">
            <button
              onClick={resetToPhoto}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Retake Photo
            </button>
            <button
              onClick={handleCropConfirm}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Confirm Crop
            </button>
          </div>
        </div>
      )}

      {/* Step: Upload */}
      {step === "upload" && croppedImage && passphrase && (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <div className="w-full rounded-xl bg-white p-6 shadow-sm dark:bg-zinc-800">
            <p className="mb-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Your passphrase
            </p>
            <p className="text-center text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
              {passphrase}
            </p>
          </div>

          <div className="w-full">
            <p className="mb-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Cropped tile grid:
            </p>
            <img
              src={croppedImage}
              alt="Cropped puzzle"
              className="w-full rounded-xl"
            />
          </div>

          <div className="flex w-full gap-4">
            <button
              onClick={resetToPhoto}
              disabled={isProcessing}
              className="flex h-12 flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Retake
            </button>
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-green-600 font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-zinc-400"
            >
              {isProcessing ? "Processing..." : "Upload"}
            </button>
          </div>

          {status && (
            <p className="text-center text-sm text-green-600 dark:text-green-400">
              {status}
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
