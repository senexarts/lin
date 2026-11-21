import React from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface MediaLightboxModalProps {
  mediaUrl: string | null;
  mediaType?: 'image' | 'video';
  caption?: string;
  onClose: () => void;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  mediaUrl,
  mediaType = 'image',
  caption,
  onClose,
}) => {
  if (!mediaUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10">
        <span className="text-xs text-[#00E5D4] font-mono">
          Linmax Media High-Fidelity · {mediaType === 'video' ? 'HD Video' : 'Photo'}
        </span>

        <div className="flex items-center gap-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download media"
          >
            <Download size={18} />
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(mediaUrl);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Copy media link"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Media View */}
      <div
        className="flex-1 flex items-center justify-center p-4 cursor-zoom-out"
        onClick={onClose}
      >
        {mediaType === 'video' ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-full rounded-2xl shadow-[0_0_50px_rgba(0,229,212,0.25)] border border-[#00E5D4]/25 bg-black"
          />
        ) : (
          <img
            src={mediaUrl}
            alt={caption || 'Media Preview'}
            className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,229,212,0.2)] border border-[#00E5D4]/20 select-none"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {/* Caption at bottom */}
      {caption && (
        <div className="p-3 text-center text-sm text-white/90 bg-black/50 rounded-xl backdrop-blur-md max-w-lg mx-auto">
          {caption}
        </div>
      )}
    </div>
  );
};
