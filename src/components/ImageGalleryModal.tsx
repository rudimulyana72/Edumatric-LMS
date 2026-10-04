import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  captions?: string[];
  title?: string;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  captions = [],
  title = 'Lampiran Gambar Pendukung Soal',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex] || images[0];
  const currentCaption = captions[currentIndex] || `Gambar ${currentIndex + 1} dari ${images.length}`;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">{title}</h3>
              <p className="text-xs text-slate-400">
                Gambar {currentIndex + 1} dari {images.length} (Maksimal 5 gambar per paket)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Perbesar / Normal"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto min-h-[350px]">
          <img
            src={currentImg}
            alt={currentCaption}
            className={`rounded-lg object-contain transition-all duration-300 max-h-[60vh] ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-lg transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Caption & Thumbnail Strip */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-3">
          <p className="text-sm text-slate-200 text-center font-medium bg-slate-900/60 py-2 px-4 rounded-lg border border-slate-800">
            {currentCaption}
          </p>

          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                    currentIndex === idx
                      ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 bg-black/70 text-[10px] text-white px-1 font-mono">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
