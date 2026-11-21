import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pin,
  CheckCheck,
  Check,
  UserPlus,
  CheckCircle2,
  Users,
  Palette,
  Crown,
  X,
  Upload,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Chat, LinmaxSettings } from '../../types';
import { LinmaxLogo } from '../LinmaxLogo';
import {
  HOME_THEMES,
  CHAT_AREA_THEMES,
  resolveChatAreaTheme,
  resolveHomeTheme,
  isLiveThemeUnlocked,
} from '../../data/chatThemes';
import { LiveThemeBackdrop } from './LiveThemeBackdrop';
import {
  readImageFileAsDataUrl,
  detectImageIsLight,
} from '../../utils/imageUpload';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  chatThemeId?: string;
  chatsSettings?: LinmaxSettings['chats'];
  onSelectChat: (chat: Chat) => void;
  onOpenAddContact: () => void;
  onOpenNewChat: () => void;
  onOpenCreateGroup?: () => void;
  onOpenSearchModal?: () => void;
  onSelectTheme?: (themeId: string) => void;
  onSelectHomeTheme?: (themeId: string) => void;
  onOpenUnlockLiveTheme?: (themeId: string, target: 'home' | 'chat') => void;
  onUploadCustomTheme?: (themeUrl: string, themeName: string, isLight: boolean) => void;
  onOpenThemeSettings?: () => void;
  readReceiptsEnabled?: boolean;
  blockedChatIds?: string[];
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  chatThemeId,
  chatsSettings,
  onSelectChat,
  onOpenAddContact,
  onOpenNewChat,
  onOpenCreateGroup,
  onOpenSearchModal,
  onSelectTheme,
  onSelectHomeTheme,
  onOpenUnlockLiveTheme,
  onUploadCustomTheme,
  onOpenThemeSettings,
  readReceiptsEnabled = true,
  blockedChatIds = [],
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'groups' | 'channels'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickThemes, setShowQuickThemes] = useState(false);
  const [quickThemeTarget, setQuickThemeTarget] = useState<'home' | 'chat'>('home');

  const effectiveChatsSettings: LinmaxSettings['chats'] = {
    wallpaperId: chatsSettings?.wallpaperId || 'cyber_doodles',
    wallpaperDimming: chatsSettings?.wallpaperDimming ?? 15,
    enterIsSend: chatsSettings?.enterIsSend ?? true,
    mediaVisibility: chatsSettings?.mediaVisibility ?? true,
    fontSize: chatsSettings?.fontSize || 'medium',
    ...chatsSettings,
    homeThemeId: chatsSettings?.homeThemeId || 'dark_mode',
    chatThemeId: chatsSettings?.chatThemeId || chatThemeId || 'dark_mode',
  };

  const selectedTheme = resolveChatAreaTheme(effectiveChatsSettings);
  const theme = resolveHomeTheme(effectiveChatsSettings);
  const unlockedLiveIds = effectiveChatsSettings.unlockedLiveThemeIds || [];

  const handleQuickUploadTheme = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadCustomTheme) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 1280, 0.85);
      const isLight = await detectImageIsLight(dataUrl);
      const cleanName = file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'My Device Theme';
      onUploadCustomTheme(dataUrl, cleanName, isLight);
      setShowQuickThemes(false);
    } catch {
      // ignore invalid image
    }
    e.target.value = '';
  };

  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.chatCode && c.chatCode.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'direct') return c.type === 'direct';
    if (filterTab === 'groups') return c.type === 'group';
    if (filterTab === 'channels') return c.type === 'channel';
    return true;
  });

  return (
    <div
      className={`w-full md:w-72 lg:w-88 xl:w-96 flex flex-col h-full border-r ${theme.panelBorderClass} shrink-0 overflow-hidden relative transition-all duration-300`}
      style={theme.panelStyle}
    >
      {theme.isLive && theme.liveEffect && (
        <LiveThemeBackdrop liveEffect={theme.liveEffect} accentColor={theme.logoAccentColor} />
      )}
      {/* Top Header */}
      <div className={`p-4 border-b ${theme.headerBorderClass} shrink-0 relative z-10`}>
        <div className="flex items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <LinmaxLogo
              size="sm"
              showText={true}
              tone={theme.logoTone}
              accentColor={theme.logoAccentColor}
            />
            {theme.hasCrownMotif && (
              <Crown
                size={15}
                className="text-amber-400 fill-amber-400 shrink-0 drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]"
                aria-label="Royal Theme"
              />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowQuickThemes((v) => !v)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${theme.headerIconBtnClass}`}
              title={`Home: ${theme.name} | Inside Chats: ${selectedTheme.name}`}
            >
              <Palette size={15} />
            </button>
            {onOpenSearchModal && (
              <button
                type="button"
                onClick={onOpenSearchModal}
                className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${theme.headerIconBtnClass}`}
                title="Global Search (Ctrl+K)"
              >
                <Search size={15} />
              </button>
            )}
            {onOpenCreateGroup && (
              <button
                type="button"
                onClick={onOpenCreateGroup}
                className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${theme.headerIconBtnClass}`}
                title="Create Group with Contacts & King Election"
              >
                <Users size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddContact}
              className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${theme.headerIconBtnClass}`}
              title="Add Contact by Linmax Chat Code (+LM...)"
            >
              <UserPlus size={15} />
            </button>
            <button
              type="button"
              onClick={onOpenNewChat}
              style={theme.plusBtnStyle}
              className={`p-1.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md ${theme.plusBtnTextClass}`}
              title="New Conversation"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Quick Theme Popover Switcher (Independent Home Place vs Inside Chats) */}
        {showQuickThemes && (
          <div className="mb-3 p-3 rounded-2xl bg-[#07151B]/95 border border-[#00E5D4]/30 backdrop-blur-xl shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Palette size={13} className="text-[#00E5D4]" />
                Separate Themes
              </span>
              <div className="flex items-center gap-2">
                {quickThemeTarget === 'chat' && onUploadCustomTheme && (
                  <label className="text-[10px] font-semibold text-[#20E66B] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload size={11} />
                    <span>+ Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQuickUploadTheme}
                    />
                  </label>
                )}
                {onOpenThemeSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickThemes(false);
                      onOpenThemeSettings();
                    }}
                    className="text-[10px] font-semibold text-[#00E5D4] hover:underline cursor-pointer"
                  >
                    Gallery
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQuickThemes(false)}
                  className="text-[#A8BBC2] hover:text-white cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Independent Target Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#03090D] border border-white/10 mb-2">
              <button
                type="button"
                onClick={() => setQuickThemeTarget('home')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  quickThemeTarget === 'home'
                    ? 'bg-[#00E5D4] text-[#03090D]'
                    : 'text-[#A8BBC2] hover:text-white'
                }`}
              >
                Home Place ({HOME_THEMES.length})
              </button>
              <button
                type="button"
                onClick={() => setQuickThemeTarget('chat')}
                className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  quickThemeTarget === 'chat'
                    ? 'bg-[#00E5D4] text-[#03090D]'
                    : 'text-[#A8BBC2] hover:text-white'
                }`}
              >
                Inside Chats ({CHAT_AREA_THEMES.length})
              </button>
            </div>

            <div className="text-[9.5px] text-[#A8BBC2] mb-2 flex items-center justify-between gap-2">
              <span className="truncate">
                Active:{' '}
                <strong className="text-white">
                  {quickThemeTarget === 'home' ? theme.name : selectedTheme.name}
                </strong>
              </span>
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#00E5D4]">
                {quickThemeTarget === 'home' ? 'Home Only' : 'Inside Chats Only'}
              </span>
            </div>

            {quickThemeTarget === 'home' ? (
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                {HOME_THEMES.map((t) => {
                  const isSelected = t.id === theme.id;
                  const unlocked = isLiveThemeUnlocked(t, unlockedLiveIds);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          setShowQuickThemes(false);
                          onOpenUnlockLiveTheme?.(t.id, 'home');
                          return;
                        }
                        onSelectHomeTheme?.(t.id);
                        setShowQuickThemes(false);
                      }}
                      title={
                        !unlocked
                          ? `${t.name} · Unlock Live Theme ($2.00 USD)`
                          : `${t.name} (Home Place Only)`
                      }
                      className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#00E5D4] bg-[#00E5D4]/15 scale-105'
                          : 'border-white/10 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg border border-white/25 flex items-center justify-center shadow-inner relative"
                        style={{ background: t.swatchGradient }}
                      >
                        {!unlocked ? (
                          <Lock size={11} className="text-amber-300 drop-shadow" />
                        ) : isSelected ? (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className={t.isLightSurface ? 'text-slate-900' : 'text-white'}
                          />
                        ) : t.isLive ? (
                          <Sparkles size={10} className="text-white/90" />
                        ) : null}
                      </span>
                      <span className="text-[8.5px] font-medium text-white/90 truncate w-full text-center">
                        {!unlocked ? `$2 ${t.name.replace('Live ', '').split(' ')[0]}` : t.name.replace('Live ', '').split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                {CHAT_AREA_THEMES.map((t) => {
                  const isSelected = t.id === selectedTheme.id;
                  const unlocked = isLiveThemeUnlocked(t, unlockedLiveIds);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        if (!unlocked) {
                          setShowQuickThemes(false);
                          onOpenUnlockLiveTheme?.(t.id, 'chat');
                          return;
                        }
                        onSelectTheme?.(t.id);
                        setShowQuickThemes(false);
                      }}
                      title={
                        !unlocked
                          ? `${t.name} · Unlock Live Theme ($2.00 USD)`
                          : `${t.name} (Inside Chats Only)`
                      }
                      className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#00E5D4] bg-[#00E5D4]/15 scale-105'
                          : 'border-white/10 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg border border-white/25 flex items-center justify-center shadow-inner relative"
                        style={{ background: t.swatchGradient }}
                      >
                        {!unlocked ? (
                          <Lock size={11} className="text-amber-300 drop-shadow" />
                        ) : isSelected ? (
                          <Check
                            size={12}
                            strokeWidth={3}
                            className={t.isLightSurface ? 'text-slate-900' : 'text-white'}
                          />
                        ) : t.isLive ? (
                          <Sparkles size={10} className="text-white/90" />
                        ) : null}
                      </span>
                      <span className="text-[8.5px] font-medium text-white/90 truncate w-full text-center">
                        {!unlocked ? `$2 ${t.name.replace('Live ', '').split(' ')[0]}` : t.name.replace('Live ', '').split(' ')[0]}
                      </span>
                    </button>
                  );
                })}

                {effectiveChatsSettings.customThemeUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTheme?.('custom_uploaded_theme');
                      setShowQuickThemes(false);
                    }}
                    title={effectiveChatsSettings.customThemeName || 'Custom Device Theme'}
                    className={`flex flex-col items-center gap-1 p-1 rounded-xl border transition-all cursor-pointer ${
                      selectedTheme.id === 'custom_uploaded_theme'
                        ? 'border-[#00E5D4] bg-[#00E5D4]/15 scale-105'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg border border-white/25 flex items-center justify-center bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${effectiveChatsSettings.customThemeUrl}")`,
                      }}
                    >
                      {selectedTheme.id === 'custom_uploaded_theme' && (
                        <Check size={12} strokeWidth={3} className="text-white drop-shadow" />
                      )}
                    </span>
                    <span className="text-[8.5px] font-medium text-white/90 truncate w-full text-center">
                      Device
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full mb-3">
          <Search
            size={14}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.searchIconClass}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, contacts, +LM codes..."
            className={`w-full border rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none transition-colors ${theme.searchInputClass}`}
          />
        </div>

        {/* Filter Segmented Pills (Chats, Groups, Channels, Direct) */}
        <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${theme.tabsContainerClass}`}>
          {(
            [
              { id: 'all', label: 'Chats' },
              { id: 'groups', label: 'Groups' },
              { id: 'channels', label: 'Channels' },
              { id: 'direct', label: 'Direct' },
            ] as const
          ).map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                style={active ? theme.activeTabStyle : undefined}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  active ? theme.activeTabTextClass : theme.inactiveTabClass
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div
        className={`flex-1 overflow-y-auto divide-y pb-20 md:pb-2 relative z-10 ${theme.feedSurfaceClass} ${theme.dividerClass}`}
      >
        {filteredChats.length === 0 ? (
          <div className={`p-8 text-center flex flex-col items-center justify-center text-xs ${theme.rowSubtitleClass}`}>
            <p>No conversations found</p>
            <button
              type="button"
              onClick={onOpenAddContact}
              className="mt-3 text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: theme.logoAccentColor }}
            >
              Add contact with Chat Code
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                style={
                  isActive
                    ? { borderLeft: `3px solid ${theme.rowActiveBorderColor}` }
                    : undefined
                }
                className={`px-4 ${
                  effectiveChatsSettings.compactList ? 'py-2' : 'py-3'
                } flex items-center justify-between gap-3 cursor-pointer transition-colors relative ${
                  isActive ? theme.rowActiveClass : theme.rowHoverClass
                }`}
              >
                {/* Contact Avatar & Online Status */}
                <div className="relative shrink-0">
                  <div
                    className={`${
                      effectiveChatsSettings.compactList ? 'w-10 h-10' : 'w-12 h-12'
                    } rounded-full overflow-hidden border ${theme.avatarBorderClass}`}
                  >
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {chat.type === 'direct' && chat.isOnline && (
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#20E66B] ring-2 ${theme.onlineRingClass}`}
                    />
                  )}
                </div>

                {/* Name & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-semibold text-sm truncate font-display ${theme.rowTitleClass}`}>
                        {chat.name}
                      </span>
                      {chat.isVerified && (
                        <CheckCircle2
                          size={13}
                          className={`${theme.verifiedIconClass} shrink-0`}
                        />
                      )}
                      {chat.isPinned && (
                        <Pin
                          size={11}
                          className="shrink-0"
                          style={{
                            color: theme.rowActiveBorderColor,
                            fill: theme.rowActiveBorderColor,
                          }}
                        />
                      )}
                    </div>
                    <span className={`text-[11px] shrink-0 font-mono ${theme.rowTimeClass}`}>
                      {chat.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
                      {chat.lastMessageFromMe && (
                        <span className="shrink-0 inline-flex items-center">
                          {chat.lastMessageStatus === 'read' &&
                          (chat.type === 'group' || readReceiptsEnabled) ? (
                            <CheckCheck
                              size={14}
                              className={`${theme.readTickClass} stroke-[2.5]`}
                            />
                          ) : chat.lastMessageStatus === 'sent' ? (
                            <Check size={13} className={theme.rowSubtitleClass} />
                          ) : (
                            <CheckCheck size={14} className={theme.rowSubtitleClass} />
                          )}
                        </span>
                      )}
                      <p className={`text-xs truncate ${theme.rowSubtitleClass}`}>
                        {chat.lastMessage}
                      </p>
                    </div>

                    {blockedChatIds.includes(chat.id) ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#F33248]/15 text-[#F33248] border border-[#F33248]/30 shrink-0">
                        Blocked
                      </span>
                    ) : (
                      chat.unreadCount > 0 && (
                        <span
                          style={theme.unreadBadgeStyle}
                          className={`min-w-5 h-5 px-1.5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${theme.unreadBadgeTextClass}`}
                        >
                          {chat.unreadCount}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
