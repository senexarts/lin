import React, { useState } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Chat, Message, Story, Channel } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  messages: Record<string, Message[]>;
  stories: Story[];
  channels: Channel[];
  onSelectChat: (chat: Chat) => void;
  onSelectStory: (storyId: string) => void;
  onSelectChannel: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  chats,
  messages,
  stories,
  channels,
  onSelectChat,
  onSelectStory,
  onSelectChannel,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<
    'all' | 'chats' | 'messages' | 'channels' | 'stories'
  >('all');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search results
  const matchedChats = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.chatCode && c.chatCode.toLowerCase().includes(q))
  );

  const matchedMessages: { message: Message; chat: Chat }[] = [];
  if (q.length >= 2) {
    Object.entries(messages).forEach(([chatId, msgs]) => {
      const parentChat = chats.find((c) => c.id === chatId);
      if (parentChat) {
        msgs.forEach((m) => {
          if (m.text.toLowerCase().includes(q)) {
            matchedMessages.push({ message: m, chat: parentChat });
          }
        });
      }
    });
  }

  const matchedChannels = channels.filter(
    (ch) =>
      ch.name.toLowerCase().includes(q) ||
      ch.description.toLowerCase().includes(q)
  );

  const matchedStories = stories.filter(
    (s) =>
      s.userName.toLowerCase().includes(q) ||
      (s.caption && s.caption.toLowerCase().includes(q)) ||
      (s.text && s.text.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,229,212,0.2)] flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center gap-3">
          <Search size={18} className="text-[#00E5D4]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts, messages, +LM codes, stories..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-[#A8BBC2] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#A8BBC2] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-2 bg-[#03090D] border-b border-[#00E5D4]/10 gap-1 overflow-x-auto scrollbar-none">
          {(['all', 'chats', 'messages', 'channels', 'stories'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/30'
                    : 'text-[#A8BBC2] hover:text-white'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {!query.trim() ? (
            <div className="py-12 text-center text-[#A8BBC2] text-xs">
              Type to search conversations, group chats, stories, or Linmax Chat Codes...
            </div>
          ) : (
            <>
              {/* CHATS RESULTS */}
              {(category === 'all' || category === 'chats') &&
                matchedChats.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E5D4]">
                      Contacts & Groups ({matchedChats.length})
                    </span>
                    {matchedChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => {
                          onSelectChat(chat);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#102630] border border-[#00E5D4]/10 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-xs text-white">
                              {chat.name}
                            </div>
                            {chat.chatCode && (
                              <span className="text-[10px] text-[#00E5D4] font-mono">
                                {chat.chatCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[#A8BBC2]" />
                      </div>
                    ))}
                  </div>
                )}

              {/* MESSAGES RESULTS */}
              {(category === 'all' || category === 'messages') &&
                matchedMessages.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00CFEF]">
                      Messages ({matchedMessages.length})
                    </span>
                    {matchedMessages.slice(0, 6).map(({ message, chat }) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          onSelectChat(chat);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#102630] border border-[#00CFEF]/15 flex flex-col gap-1 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#00E5D4] font-semibold">
                            {chat.name}
                          </span>
                          <span className="text-[#A8BBC2]">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-white line-clamp-1">
                          {message.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* CHANNELS RESULTS */}
              {(category === 'all' || category === 'channels') &&
                matchedChannels.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#00AFC2]">
                      Channels ({matchedChannels.length})
                    </span>
                    {matchedChannels.map((ch) => (
                      <div
                        key={ch.id}
                        onClick={() => {
                          onSelectChannel();
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#102630] border border-[#00AFC2]/15 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={ch.avatar}
                            alt={ch.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-xs text-white">
                              {ch.name}
                            </div>
                            <span className="text-[10px] text-[#A8BBC2]">
                              {ch.subscribers} subscribers
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-[#00E5D4] font-bold">
                          View
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* STORIES RESULTS */}
              {(category === 'all' || category === 'stories') &&
                matchedStories.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#20E66B]">
                      Linmax Stories ({matchedStories.length})
                    </span>
                    {matchedStories.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectStory(s.id);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#102630] border border-[#20E66B]/15 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={s.userAvatar}
                            alt={s.userName}
                            className="w-9 h-9 rounded-full object-cover border border-[#00E5D4]"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                              <span>{s.userName}</span>
                              <span className="text-[10px] text-[#A8BBC2]">
                                · {s.timestamp}
                              </span>
                            </div>
                            <p className="text-xs text-[#A8BBC2] truncate">
                              {s.caption || s.text || 'View 24h Story'}
                            </p>
                          </div>
                        </div>
                        <Sparkles size={14} className="text-[#00E5D4] shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
