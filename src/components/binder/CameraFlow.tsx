"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  RotateCcw,
  Check,
  Search,
  Sparkles,
  ScanLine,
  Pencil,
} from "lucide-react";
import { identifyFromOcrText, getCardDetail, type ApiCard } from "@/lib/pokemonTcg";
import { CardResultGrid, ResultSkeletons, useCardSearch } from "./CardSearchSheet";
import type { CardListType } from "@/types";

type Step = "camera" | "scanning" | "match" | "search" | "manual" | "confirm";

interface CameraFlowProps {
  listType: CardListType;
  onIdentified: (card: ApiCard, photoUrl: string) => void;
  onManual: (name: string, photoUrl: string) => void;
  onClose: () => void;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = url;
  });
}

/**
 * Crop a top fraction of the photo, upscale it, and boost contrast in
 * grayscale — this dramatically improves OCR accuracy on glossy cards.
 */
function preprocessForOcr(img: HTMLImageElement, cropFraction: number): HTMLCanvasElement {
  const srcH = Math.round(img.naturalHeight * cropFraction);
  const scale = Math.max(1, Math.min(3, 1400 / img.naturalWidth));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(srcH * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, img.naturalWidth, srcH, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = imageData.data;
  for (let i = 0; i < px.length; i += 4) {
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const boosted = Math.max(0, Math.min(255, (gray - 128) * 1.6 + 140));
    px[i] = px[i + 1] = px[i + 2] = boosted;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * OCR the card-name band; if that produces no usable matches the caller
 * can retry with the full photo using the same worker.
 */
async function scanForCards(photoUrl: string): Promise<{ query: string; results: ApiCard[] }> {
  const img = await loadImage(photoUrl);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    // Pass 1: top band, where the card name is printed.
    const band = preprocessForOcr(img, 0.3);
    const first = await worker.recognize(band);
    let identified = await identifyFromOcrText(first.data.text ?? "");
    if (identified.results.length > 0) return identified;

    // Pass 2: the whole photo (name band may have been misframed).
    const full = preprocessForOcr(img, 1);
    const second = await worker.recognize(full);
    identified = await identifyFromOcrText(
      `${first.data.text ?? ""} ${second.data.text ?? ""}`
    );
    return identified;
  } finally {
    await worker.terminate();
  }
}

export function CameraFlow({ listType, onIdentified, onManual, onClose }: CameraFlowProps) {
  const [step, setStep] = useState<Step>("camera");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<ApiCard[]>([]);
  const [detectedQuery, setDetectedQuery] = useState("");
  const [selected, setSelected] = useState<ApiCard | null>(null);
  const [manualName, setManualName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const search = useCardSearch(searchQuery);

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const title = listType === "wishlist" ? "Scan Wishlist Card" : "Scan Trade Card";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch {
      fileRef.current?.click();
    }
  }, []);

  const scanPhoto = useCallback(async (url: string) => {
    setStep("scanning");
    try {
      const { query, results } = await scanForCards(url);
      setDetectedQuery(query);
      setMatches(results);
    } catch {
      setDetectedQuery("");
      setMatches([]);
    }
    setStep("match");
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);
      const url = canvas.toDataURL("image/jpeg", 0.85);
      setPhotoUrl(url);
      stopCamera();
      scanPhoto(url);
    }
  }, [stopCamera, scanPhoto]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPhotoUrl(url);
      scanPhoto(url);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setPhotoUrl(null);
    setMatches([]);
    setSelected(null);
    setStep("camera");
    startCamera();
  };

  const handleSelect = (card: ApiCard) => {
    setSelected(card);
    setStep("confirm");
    // Fill in real rarity and set name while the confirm screen is shown.
    getCardDetail(card.id).then((detail) => {
      if (detail) {
        setSelected((s) => (s && s.id === card.id ? { ...s, ...detail } : s));
      }
    });
  };

  const handleSave = () => {
    if (!photoUrl) return;
    if (selected) onIdentified(selected, photoUrl);
    else if (manualName.trim()) onManual(manualName.trim(), photoUrl);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-deep flex flex-col"
      >
        <div className="flex items-center justify-between px-4 pt-safe py-3 border-b border-white/10">
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <h2 className="font-bold text-sm">{title}</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {step === "camera" && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative bg-black m-4 rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[70%] aspect-[3/4] border-2 border-pikachu/60 rounded-xl" />
                </div>
                {cameraReady && (
                  <p className="absolute bottom-4 inset-x-0 text-center text-xs text-white/60 font-medium">
                    Line up the card inside the frame
                  </p>
                )}
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900">
                    <Camera size={48} className="text-white/30" />
                    <button
                      onClick={startCamera}
                      className="bg-pikachu text-slate-deep font-bold px-6 py-3 rounded-full"
                    >
                      Open Camera
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="text-sm text-white/50 underline"
                    >
                      Choose from gallery
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <div className="px-6 pb-safe pb-8 flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-pikachu shadow-lg active:scale-95 transition-transform"
                  aria-label="Capture"
                />
              </div>
            </div>
          )}

          {step === "scanning" && photoUrl && (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Scanning" className="w-full h-full object-contain" />
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: ["0%", "96%", "0%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pikachu to-transparent shadow-[0_0_18px_4px_rgba(255,203,5,0.5)]"
                />
                <div className="absolute inset-0 bg-pikachu/5" />
              </div>
              <div className="py-6 text-center pb-safe">
                <div className="inline-flex items-center gap-2 text-pikachu font-bold text-sm">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={16} />
                  </motion.span>
                  Identifying card…
                </div>
                <p className="text-xs text-white/40 mt-1.5">
                  Reading the card name and matching it against the card database
                </p>
              </div>
            </div>
          )}

          {step === "match" && photoUrl && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-5 pt-4 pb-3">
                {matches.length > 0 ? (
                  <>
                    <p className="font-bold text-sm">
                      <ScanLine size={14} className="inline mr-1.5 text-pikachu" />
                      {detectedQuery
                        ? <>Detected “<span className="text-pikachu">{detectedQuery}</span>” — is it one of these?</>
                        : "Is it one of these?"}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">Tap the exact card you scanned</p>
                  </>
                ) : (
                  <p className="font-bold text-sm">Couldn’t identify the card</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5">
                {matches.length > 0 ? (
                  <CardResultGrid results={matches} onSelect={handleSelect} />
                ) : (
                  <div className="py-10 text-center">
                    <ScanLine size={30} className="mx-auto text-white/20 mb-3" />
                    <p className="text-sm text-white/50">
                      The scan couldn’t read this card.
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      Glare and foil finishes can confuse the scanner — try searching instead.
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 pb-safe space-y-2 border-t border-white/10">
                <button
                  onClick={() => { setSearchQuery(detectedQuery); setStep("search"); }}
                  className="w-full py-3.5 rounded-2xl bg-white/10 font-semibold text-sm flex items-center justify-center gap-2 active:scale-98"
                >
                  <Search size={15} />
                  {matches.length > 0 ? "None of these — search manually" : "Search the card database"}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetake}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white/60 flex items-center justify-center gap-2 active:bg-white/5"
                  >
                    <RotateCcw size={14} />
                    Retake
                  </button>
                  <button
                    onClick={() => { setManualName(detectedQuery); setStep("manual"); }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white/60 flex items-center justify-center gap-2 active:bg-white/5"
                  >
                    <Pencil size={14} />
                    Type name
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "search" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-5 pt-4 pb-3">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any Pokémon card…"
                    autoFocus
                    className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-base font-semibold placeholder:text-white/30 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-pikachu/50"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-4">
                {search.loading && <ResultSkeletons />}
                {!search.loading && search.results.length > 0 && (
                  <CardResultGrid results={search.results} onSelect={handleSelect} />
                )}
                {search.searched && !search.loading && search.results.length === 0 && (
                  <p className="py-10 text-center text-sm text-white/40">
                    No cards found for “{searchQuery.trim()}”
                  </p>
                )}
              </div>
              <div className="px-5 py-4 pb-safe border-t border-white/10">
                <button
                  onClick={() => setStep("match")}
                  className="w-full py-3 rounded-2xl text-sm font-semibold text-white/60 active:bg-white/5"
                >
                  Back to scan results
                </button>
              </div>
            </div>
          )}

          {step === "manual" && photoUrl && (
            <div className="flex-1 flex flex-col p-6">
              <div className="w-28 mx-auto aspect-[3/4] rounded-xl overflow-hidden shadow-2xl mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="Card" className="w-full h-full object-cover" />
              </div>
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <p className="text-xs text-white/50 text-center">Enter the card name yourself</p>
                <input
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Charizard EX"
                  autoFocus
                  className="w-full bg-white/10 border border-pikachu/30 rounded-xl px-4 py-3 text-center font-bold placeholder:text-white/25 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-pikachu/50"
                />
                <button
                  onClick={handleSave}
                  disabled={!manualName.trim()}
                  className="w-full py-4 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98 disabled:opacity-40"
                >
                  Save Card
                </button>
                <button
                  onClick={() => setStep("match")}
                  className="w-full py-2 text-sm font-semibold text-white/50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && photoUrl && selected && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-2 ring-pikachu/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.imageLarge || selected.imageSmall}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden opacity-70 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="Your photo" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="text-center">
                  <p className="text-pikachu font-bold text-sm mb-1 flex items-center justify-center gap-1.5">
                    <Check size={14} />
                    Card Identified
                  </p>
                  <p className="text-xl font-bold">{selected.name}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {selected.setName}
                    {selected.cardNumber ? ` · #${selected.cardNumber}` : ""} · {selected.rarity}
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-2xl bg-pikachu text-slate-deep font-bold active:scale-98"
                >
                  Add to {listType === "wishlist" ? "Wishlist" : "Trade Binder"}
                </button>
                <button
                  onClick={() => { setSelected(null); setStep("match"); }}
                  className="w-full py-2 text-sm font-semibold text-white/50"
                >
                  Wrong card? Go back
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
