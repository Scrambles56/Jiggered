"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function ScanPage() {
  const [passphrase, setPassphrase] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePassphrase = async () => {
    // TODO: Call API to generate passphrase
    // For now, generate a simple placeholder
    const words = ["apple", "river", "cloud", "fish"];
    const shuffled = words.sort(() => Math.random() - 0.5);
    setPassphrase(shuffled.join("-"));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image || !passphrase) return;

    setIsProcessing(true);
    setStatus("Processing image with AI...");

    // TODO: Call /api/parse to extract puzzle data
    // TODO: Call /api/puzzle to store puzzle data

    setTimeout(() => {
      setIsProcessing(false);
      setStatus("Puzzle uploaded! Enter the passphrase on your laptop to play.");
    }, 2000);
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
      <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
        Photograph the puzzle from your newspaper
      </p>

      {!passphrase ? (
        <button
          onClick={generatePassphrase}
          className="flex h-14 w-64 items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Start Scanning
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          {/* Passphrase Display */}
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

          {/* Image Upload */}
          <div className="w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!image ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white transition-colors hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-500 dark:hover:bg-zinc-700"
              >
                <span className="text-4xl">📷</span>
                <span className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Take photo or select image
                </span>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Puzzle"
                  className="w-full rounded-xl"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 px-3 py-1 text-sm text-white hover:bg-black/70"
                >
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {image && (
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-green-600 text-lg font-semibold text-white transition-colors hover:bg-green-700 disabled:bg-zinc-400"
            >
              {isProcessing ? "Processing..." : "Upload Puzzle"}
            </button>
          )}

          {/* Status */}
          {status && (
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
