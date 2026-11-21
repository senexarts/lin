import React from 'react';
import { CustomSticker } from '../../types';

interface CustomStickerViewProps {
  sticker: CustomSticker;
  size?: 'picker' | 'preview' | 'chat';
}

export const CustomStickerView: React.FC<CustomStickerViewProps> = ({
  sticker,
  size = 'chat',
}) => {
  const shapeClass =
    sticker.shape === 'circle'
      ? 'rounded-full'
      : sticker.shape === 'square'
      ? 'rounded-xl'
      : 'rounded-3xl';

  const borderClass =
    sticker.borderStyle === 'white-diecut'
      ? 'border-[3px] border-white shadow-[0_4px_14px_rgba(255,255,255,0.28)]'
      : sticker.borderStyle === 'cyan-glow'
      ? 'border-[2.5px] border-[#00E5D4] shadow-[0_0_18px_rgba(0,229,212,0.55)]'
      : sticker.borderStyle === 'gold-crown'
      ? 'border-[2.5px] border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.45)]'
      : '';

  const bgClass =
    sticker.bgColor === 'cyber'
      ? 'bg-gradient-to-br from-[#07151B] via-[#0B1B22] to-[#00AFC2]/40'
      : sticker.bgColor === 'cyan'
      ? 'bg-gradient-to-br from-[#00E5D4]/30 to-[#00CFEF]/30'
      : sticker.bgColor === 'sunset'
      ? 'bg-gradient-to-br from-rose-500/35 via-amber-500/30 to-purple-600/35'
      : sticker.bgColor === 'dark'
      ? 'bg-[#07151B]'
      : 'bg-transparent';

  const sizeDim =
    size === 'picker'
      ? 'w-14 h-14'
      : size === 'preview'
      ? 'w-32 h-32'
      : 'w-28 h-28 sm:w-32 sm:h-32';

  const emojiSize =
    size === 'picker' ? 'text-3xl' : size === 'preview' ? 'text-6xl' : 'text-6xl';

  const captionSize =
    size === 'picker'
      ? 'text-[8px] px-1.5 py-0.5'
      : 'text-[11px] px-2.5 py-0.5';

  return (
    <div
      className={`relative ${sizeDim} ${shapeClass} ${borderClass} ${bgClass} ${sticker.animationClass} flex items-center justify-center overflow-hidden select-none`}
      title={sticker.name}
    >
      {sticker.imageUrl ? (
        <img
          src={sticker.imageUrl}
          alt={sticker.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${emojiSize} leading-none drop-shadow-md`}>
          {sticker.emoji || '✨'}
        </span>
      )}

      {sticker.captionText && (
        <span
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 max-w-[92%] truncate font-display font-extrabold uppercase tracking-wide text-white bg-[#03090D]/85 border border-white/25 rounded-full shadow-md ${captionSize}`}
        >
          {sticker.captionText}
        </span>
      )}
    </div>
  );
};
