import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Smile, X, Plus, Trash2 } from 'lucide-react';
import {
  EMOJI_CATEGORIES,
  EMOJI_DATABASE,
  LIVE_STICKERS,
  LIVE_STICKER_PACKS,
  LiveSticker,
  LiveStickerRenderer,
} from '../../data/emojisAndStickers';
import { CustomSticker } from '../../types';
import { CustomStickerView } from './CustomStickerView';

interface EmojiStickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  onSelectSticker: (sticker: LiveSticker) => void;
  customStickers?: CustomSticker[];
  onSelectCustomSticker?: (sticker: CustomSticker) => void;
  onOpenCreateSticker?: () => void;
  onDeleteCustomSticker?: (stickerId: string) => void;
}

const STICKER_PAGE_SIZE = 48;

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  onSelectSticker,
  customStickers = [],
  onSelectCustomSticker,
  onOpenCreateSticker,
  onDeleteCustomSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers'>('emojis');
  const [selectedCategory, setSelectedCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stickerPack, setStickerPack] = useState<string>('all');
  const [visibleLimit, setVisibleLimit] = useState<number>(STICKER_PAGE_SIZE);

  const queryLower = searchQuery.trim().toLowerCase();

  // Search or category filtered emojis
  const currentEmojis = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.values(EMOJI_DATABASE)
        .flat()
        .filter((emoji) => emoji.includes(searchQuery.trim()));
    }
    return EMOJI_DATABASE[selectedCategory] || [];
  }, [searchQuery, selectedCategory]);

  // Filtered live stickers (from 1,012+ catalog)
  const currentStickers = useMemo(() => {
    if (stickerPack === 'custom') return [];
    return LIVE_STICKERS.filter((s) => {
      const matchesPack =
        stickerPack === 'all' || s.pack.toLowerCase() === stickerPack.toLowerCase();
      if (!matchesPack) return false;
      if (!queryLower) return true;
      return (
        s.name.toLowerCase().includes(queryLower) ||
        s.pack.toLowerCase().includes(queryLower) ||
        (s.badgeText && s.badgeText.toLowerCase().includes(queryLower)) ||
        s.emojiFallback.includes(queryLower)
      );
    });
  }, [stickerPack, queryLower]);

  // Filtered user-created stickers
  const filteredCustomStickers = useMemo(() => {
    if (stickerPack !== 'all' && stickerPack !== 'custom') return [];
    if (!queryLower) return customStickers;
    return customStickers.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        (s.captionText && s.captionText.toLowerCase().includes(queryLower))
    );
  }, [customStickers, stickerPack, queryLower]);

  if (!isOpen) return null;

  const displayedStickers = currentStickers.slice(0, visibleLimit);
  const hasMoreStickers = currentStickers.length > displayedStickers.length;

  return (
    <div className="absolute bottom-20 left-2 sm:left-4 z-40 w-[94vw] sm:w-[420px] h-[440px] max-h-[72vh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl shadow-[0_0_40px_rgba(0,229,212,0.25)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 backdrop-blur-xl">
      {/* Top Header */}
      <div className="px-3 pt-3 pb-2 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between gap-2 shrink-0">
        <div className="flex p-0.5 bg-[#03090D] rounded-xl border border-[#00E5D4]/20 flex-1 max-w-[235px]">
          <button
            type="button"
            onClick={() => setActiveTab('emojis')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'emojis'
                ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Smile size={14} />
            Emojis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stickers')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Stickers ({LIVE_STICKERS.length}+)</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenCreateSticker && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateSticker();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#00E5D4]/15 border border-[#00E5D4]/35 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Create your own custom sticker"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Create</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#A8BBC2] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-3 py-2 bg-[#07151B] border-b border-[#00E5D4]/10 shrink-0">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleLimit(STICKER_PAGE_SIZE);
            }}
            placeholder={
              activeTab === 'emojis'
                ? 'Search emojis...'
                : `Search ${LIVE_STICKERS.length}+ live stickers (e.g. cyber, hype, love, goal)...`
            }
            className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'emojis' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-7 sm:grid-cols-8 gap-1.5 content-start select-none scrollbar-thin">
            {currentEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => onSelectEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl rounded-xl hover:bg-[#0B1B22] hover:scale-125 transition-all active:scale-95 cursor-pointer"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between gap-1 overflow-x-auto scrollbar-none shrink-0">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id && !searchQuery
                    ? 'bg-[#00E5D4]/20 border border-[#00E5D4]/40 scale-110'
                    : 'opacity-70 hover:opacity-100 hover:bg-[#03090D]'
                }`}
                title={cat.name}
              >
                {cat.icon}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* LIVE STICKERS (1,000+) + CUSTOM STICKERS TRAY */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sticker Pack Tabs */}
          <div className="px-3 py-2 bg-[#03090D] border-b border-[#00E5D4]/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {[
              { id: 'all', label: `✨ All (${LIVE_STICKERS.length})` },
              { id: 'custom', label: `🎨 Mine (${customStickers.length})` },
              ...LIVE_STICKER_PACKS.map((p) => ({ id: p, label: p })),
            ].map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => {
                  setStickerPack(pack.id);
                  setVisibleLimit(STICKER_PAGE_SIZE);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  stickerPack === pack.id
                    ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/30'
                    : 'text-[#A8BBC2] hover:text-white'
                }`}
              >
                {pack.label}
              </button>
            ))}
          </div>

          {/* Stickers Grid */}
          <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start select-none scrollbar-thin">
            {onOpenCreateSticker && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateSticker();
                }}
                className="aspect-square p-2 rounded-2xl bg-[#03090D]/80 hover:bg-[#0B1B22] border-2 border-dashed border-[#00E5D4]/35 hover:border-[#00E5D4] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-[#00E5D4]"
                title="Create Custom Sticker"
              >
                <Plus size={22} strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-center leading-tight">
                  Create Sticker
                </span>
              </button>
            )}

            {/* User-Created Custom Stickers */}
            {filteredCustomStickers.map((cst) => (
              <div key={cst.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomSticker?.(cst);
                    onClose();
                  }}
                  className="w-full aspect-square p-2 rounded-2xl bg-[#03090D]/80 hover:bg-[#0B1B22] border border-[#00E5D4]/25 hover:border-[#00E5D4]/60 transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,229,212,0.3)]"
                  title={`Send ${cst.name}`}
                >
                  <CustomStickerView sticker={cst} size="picker" />
                  <span className="text-[10px] text-[#A8BBC2] group-hover:text-[#00E5D4] font-medium truncate max-w-full mt-1">
                    {cst.name}
                  </span>
                </button>
                {onDeleteCustomSticker && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomSticker(cst.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#07151B] border border-[#F33248]/50 text-[#F33248] opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-[#F33248] hover:text-white transition-all cursor-pointer"
                    title="Delete custom sticker"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}

            {/* 1,000+ Built-In Fresh Live Stickers */}
            {displayedStickers.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => {
                  onSelectSticker(sticker);
                  onClose();
                }}
                className="group relative aspect-square p-2 rounded-2xl bg-[#03090D]/80 hover:bg-[#0B1B22] border border-[#00E5D4]/15 hover:border-[#00E5D4]/50 transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(0,229,212,0.3)]"
                title={`Send ${sticker.name}`}
              >
                <LiveStickerRenderer sticker={sticker} size="picker" />
                <span className="text-[9.5px] text-[#A8BBC2] group-hover:text-[#00E5D4] font-medium truncate max-w-full mt-1">
                  {sticker.name}
                </span>
              </button>
            ))}

            {hasMoreStickers && (
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + STICKER_PAGE_SIZE)}
                className="col-span-3 sm:col-span-4 py-2.5 rounded-xl bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-xs font-bold transition-colors cursor-pointer"
              >
                Load more live stickers ({currentStickers.length - displayedStickers.length} remaining)
              </button>
            )}
          </div>

          <div className="px-3 py-2 bg-[#0B1B22] border-t border-[#00E5D4]/15 flex items-center justify-between text-[11px] text-[#00E5D4] shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#20E66B] animate-ping" />
              {currentStickers.length} Fresh Live Stickers
            </span>
            <span className="text-[#A8BBC2]">Tap any sticker to send</span>
          </div>
        </div>
      )}
    </div>
  );
};
