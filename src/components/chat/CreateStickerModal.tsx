import React, { useState, useRef } from 'react';
import { X, Upload, Sparkles, Smile, Send, Check, Image as ImageIcon } from 'lucide-react';
import { CustomSticker } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';
import { CustomStickerView } from './CustomStickerView';

interface CreateStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSticker: (sticker: CustomSticker, sendImmediately?: boolean) => void;
}

const STICKER_EMOJIS = [
  '🔥', '👑', '😎', '🚀', '💀', '❤️', '😂', '⚽',
  '💪', '✨', '🎉', '🫡', '🫶', '🥳', '💎', '🦁',
];

const ANIMATION_OPTIONS = [
  { id: 'animate-sticker-bounce', label: 'Bounce' },
  { id: 'animate-sticker-heartbeat', label: 'Heartbeat' },
  { id: 'animate-sticker-dance', label: 'Dance' },
  { id: 'animate-sticker-wiggle', label: 'Wiggle' },
  { id: 'animate-sticker-float', label: 'Float' },
  { id: 'animate-sticker-laugh', label: 'Pop' },
];

export const CreateStickerModal: React.FC<CreateStickerModalProps> = ({
  isOpen,
  onClose,
  onSaveSticker,
}) => {
  const [sourceMode, setSourceMode] = useState<'image' | 'emoji'>('image');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string>('👑');
  const [name, setName] = useState<string>('');
  const [captionText, setCaptionText] = useState<string>('');
  const [shape, setShape] = useState<'circle' | 'rounded' | 'square'>('rounded');
  const [borderStyle, setBorderStyle] = useState<
    'white-diecut' | 'cyan-glow' | 'gold-crown' | 'none'
  >('white-diecut');
  const [bgColor, setBgColor] = useState<string>('cyber');
  const [animationClass, setAnimationClass] = useState<string>('animate-sticker-bounce');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const previewSticker: CustomSticker = {
    id: 'preview',
    name: name.trim() || captionText.trim() || 'My Sticker',
    imageUrl: sourceMode === 'image' ? imageUrl || undefined : undefined,
    emoji: sourceMode === 'emoji' || !imageUrl ? selectedEmoji : undefined,
    captionText: captionText.trim() || undefined,
    borderStyle,
    shape,
    animationClass,
    bgColor,
    createdAt: Date.now(),
  };

  const canSave = sourceMode === 'emoji' || Boolean(imageUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 512, 0.88);
      setImageUrl(dataUrl);
      setSourceMode('image');
    } catch {
      // ignore invalid image
    }
    e.target.value = '';
  };

  const handleSubmit = (sendNow: boolean) => {
    if (!canSave) return;
    const finalSticker: CustomSticker = {
      ...previewSticker,
      id: `custom_st_${Date.now()}`,
      createdAt: Date.now(),
    };
    onSaveSticker(finalSticker, sendNow);
    setName('');
    setCaptionText('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#07151B] border border-[#00E5D4]/35 rounded-3xl shadow-[0_0_40px_rgba(0,229,212,0.2)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E5D4]/15 text-[#00E5D4]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">
                Create Custom Sticker
              </h3>
              <p className="text-[11px] text-[#A8BBC2]">
                Turn any photo or emoji into a live animated sticker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#A8BBC2] hover:text-white rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Studio Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Live Animated Sticker Preview */}
          <div className="shrink-0 rounded-2xl bg-[#03090D] border border-[#00E5D4]/20 py-6 px-4 flex flex-col items-center justify-center gap-3">
            <CustomStickerView sticker={previewSticker} size="preview" />
            <span className="text-[11px] text-[#00E5D4] font-medium">
              Live Sticker Preview
            </span>
          </div>

          {/* Source Mode Switcher */}
          <div className="shrink-0 flex p-1 bg-[#03090D] rounded-xl border border-[#00E5D4]/15">
            <button
              type="button"
              onClick={() => setSourceMode('image')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sourceMode === 'image'
                  ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D]'
                  : 'text-[#A8BBC2] hover:text-white'
              }`}
            >
              <ImageIcon size={14} />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={() => setSourceMode('emoji')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sourceMode === 'emoji'
                  ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D]'
                  : 'text-[#A8BBC2] hover:text-white'
              }`}
            >
              <Smile size={14} />
              Emoji Sticker
            </button>
          </div>

          {sourceMode === 'image' ? (
            <div className="shrink-0 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-[#00E5D4]/35 bg-[#0B1B22]/60 hover:bg-[#0B1B22] hover:border-[#00E5D4] text-xs font-semibold text-[#00E5D4] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload size={20} />
                <span>
                  {imageUrl
                    ? 'Choose a different photo from files'
                    : 'Upload image from your device (PNG / JPG / WebP)'}
                </span>
              </button>
            </div>
          ) : (
            <div className="shrink-0 grid grid-cols-8 gap-1.5 p-2.5 rounded-2xl bg-[#03090D] border border-[#00E5D4]/15">
              {STICKER_EMOJIS.map((emo) => (
                <button
                  key={emo}
                  type="button"
                  onClick={() => setSelectedEmoji(emo)}
                  className={`h-9 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                    selectedEmoji === emo
                      ? 'bg-[#00E5D4]/25 border border-[#00E5D4] scale-110'
                      : 'hover:bg-[#0B1B22]'
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          )}

          {/* Sticker Name & Caption */}
          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#A8BBC2]">
                Sticker Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Squad Vibes"
                className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-[#A8BBC2]">
                Text Overlay (Optional)
              </label>
              <input
                type="text"
                maxLength={18}
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="e.g. BORN TO WIN"
                className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
              />
            </div>
          </div>

          {/* Shape & Frame Style */}
          <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[#A8BBC2]">Shape</span>
              <div className="flex gap-1.5">
                {(['circle', 'rounded', 'square'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShape(s)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold capitalize border cursor-pointer transition-colors ${
                      shape === s
                        ? 'bg-[#00E5D4]/20 border-[#00E5D4] text-[#00E5D4]'
                        : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[#A8BBC2]">Outline</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'white-diecut', label: 'Die-Cut' },
                  { id: 'cyan-glow', label: 'Cyber Cyan' },
                  { id: 'gold-crown', label: 'Gold' },
                  { id: 'none', label: 'None' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setBorderStyle(opt.id as CustomSticker['borderStyle'])
                    }
                    className={`py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-colors ${
                      borderStyle === opt.id
                        ? 'bg-[#00E5D4]/20 border-[#00E5D4] text-[#00E5D4]'
                        : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Backdrop & Animation */}
          <div className="shrink-0 flex flex-col gap-2">
            <span className="text-[11px] font-medium text-[#A8BBC2]">
              Live Motion Effect
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ANIMATION_OPTIONS.map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setAnimationClass(anim.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-colors ${
                    animationClass === anim.id
                      ? 'bg-[#00E5D4] border-[#00E5D4] text-[#03090D]'
                      : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          {sourceMode === 'emoji' && (
            <div className="shrink-0 flex flex-col gap-2">
              <span className="text-[11px] font-medium text-[#A8BBC2]">
                Sticker Backdrop
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'cyber', label: 'Cyber' },
                  { id: 'cyan', label: 'Aqua' },
                  { id: 'sunset', label: 'Sunset' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'transparent', label: 'Clear' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBgColor(bg.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-colors ${
                      bgColor === bg.id
                        ? 'bg-[#00CFEF]/25 border-[#00CFEF] text-[#00CFEF]'
                        : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={!canSave}
            onClick={() => handleSubmit(false)}
            className="flex-1 py-2.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/35 text-[#00E5D4] hover:bg-[#00E5D4]/10 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <Check size={14} />
            <span>Save to My Stickers</span>
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => handleSubmit(true)}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-[0_0_16px_rgba(0,229,212,0.3)] cursor-pointer"
          >
            <Send size={14} />
            <span>Save & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
