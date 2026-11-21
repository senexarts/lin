import React, { useState, useMemo } from 'react';
import {
  Plus,
  Eye,
  MoreVertical,
  Maximize2,
  Trash2,
  Send,
  Sparkles,
  Clock,
  Camera,
  Play,
  Megaphone,
  ExternalLink,
  EyeOff,
} from 'lucide-react';
import { Story, CurrentUser, SponsoredStoryCampaign } from '../../types';

interface StoriesViewProps {
  stories: Story[];
  sponsoredCampaigns?: SponsoredStoryCampaign[];
  currentUser: CurrentUser;
  onOpenAddStory: () => void;
  onOpenAdvertise?: () => void;
  onSelectStoryFullscreen: (storyId: string) => void;
  onSendReply: (story: Story, replyText: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onHideAd?: (campaignId: string) => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  stories,
  sponsoredCampaigns = [],
  currentUser,
  onOpenAddStory,
  onOpenAdvertise,
  onSelectStoryFullscreen,
  onSendReply,
  onDeleteStory,
  onHideAd,
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string>(
    stories[0]?.id || ''
  );
  const [replyText, setReplyText] = useState('');
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  const personGroups = useMemo(() => {
    const map = new Map<string, Story[]>();
    for (const story of stories) {
      const key = story.userId || story.userChatCode || story.userName;
      const list = map.get(key) || [];
      list.push(story);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items,
      currentStory: items.find((s) => !s.isViewed) || items[0],
      hasUnviewed: items.some((s) => !s.isViewed),
    }));
  }, [stories]);

  const featuredStory =
    stories.find((s) => s.id === selectedStoryId) || stories[0] || null;

  const handleQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featuredStory || !replyText.trim()) return;
    onSendReply(featuredStory, replyText.trim());
    setReplyText('');
    setSentFeedback(`Reply sent to ${featuredStory.userName}`);
    setTimeout(() => setSentFeedback(null), 2200);
  };

  const handleQuickReaction = (emoji: string) => {
    if (!featuredStory) return;
    onSendReply(featuredStory, `Reacted to your story: ${emoji}`);
    setSentFeedback(`Sent ${emoji} to ${featuredStory.userName}`);
    setTimeout(() => setSentFeedback(null), 2200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden">
      {/* Top Header */}
      <div className="px-5 sm:px-6 py-4 border-b border-[#00E5D4]/15 bg-[#07151B]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-display text-white tracking-tight">
            Linmax Stories
          </h1>
          <p className="text-[11px] text-[#A8BBC2] hidden sm:block">
            Tap any story to watch full-screen & continue through everyone&apos;s updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAdvertise && (
            <button
              type="button"
              onClick={onOpenAdvertise}
              className="px-3 py-1.5 rounded-xl bg-[#0B1B22] border border-amber-400/35 text-amber-300 hover:bg-amber-400 hover:text-[#1C1202] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Promote events or businesses in Linmax Stories"
            >
              <Megaphone size={13} />
              <span className="hidden sm:inline">Advertise</span>
            </button>
          )}
          {stories.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectStoryFullscreen(stories[0].id)}
              className="px-3 py-1.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Play size={13} className="fill-current" />
              <span className="hidden sm:inline">Play All</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAddStory}
            aria-label="Add Story"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] text-[#03090D] flex items-center gap-1.5 text-xs font-bold shadow-[0_0_16px_rgba(0,229,212,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Post a new Story"
          >
            <Camera size={15} strokeWidth={2.5} />
            <span>Add Story</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-5">
          {/* 1. Horizontal Story Rings Strip */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {/* Add Story Ring */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenAddStory}
                className="w-16 h-16 rounded-full border-2 border-[#00E5D4] bg-[#07151B] flex items-center justify-center text-[#00E5D4] shadow-[0_0_15px_rgba(0,229,212,0.28)] hover:bg-[#0B1B22] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Add Story"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
              <span className="text-xs text-[#A8BBC2] font-medium">
                Add Story
              </span>
            </div>

            {/* Contact Story Rings — One ring per person with segmented arcs matching their story count */}
            {personGroups.map(({ key: personKey, items: personStories, currentStory: primaryStory, hasUnviewed }) => {
              const isSelected = personStories.some(
                (s) => s.id === featuredStory?.id
              );
              const count = personStories.length;
              const radius = 30;
              const circumference = 2 * Math.PI * radius;
              const gap = count > 1 ? 5 : 0;
              const segmentLen = Math.max(
                4,
                (circumference - gap * count) / count
              );

              return (
                <div
                  key={personKey}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStoryId(primaryStory.id);
                      setShowCardMenu(false);
                      onSelectStoryFullscreen(primaryStory.id);
                    }}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                      isSelected ? 'scale-105' : ''
                    }`}
                    title={`${primaryStory.userName} (${count} ${
                      count === 1 ? 'story' : 'stories'
                    })`}
                  >
                    {/* Segmented SVG Ring: 1 segment per story */}
                    <svg
                      viewBox="0 0 64 64"
                      className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    >
                      {personStories.map((st, idx) => {
                        const offset = -(idx * (segmentLen + gap));
                        return (
                          <circle
                            key={st.id}
                            cx="32"
                            cy="32"
                            r={radius}
                            fill="none"
                            stroke={st.isViewed ? '#213B47' : '#00E5D4'}
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeDasharray={`${segmentLen} ${circumference}`}
                            strokeDashoffset={offset}
                          />
                        );
                      })}
                    </svg>

                    <div className="w-[54px] h-[54px] rounded-full bg-[#03090D] p-[2px] overflow-hidden">
                      <img
                        src={primaryStory.userAvatar}
                        alt={primaryStory.userName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </button>
                  <span
                    className={`text-xs font-medium truncate w-16 text-center ${
                      hasUnviewed
                        ? 'text-[#00E5D4] font-semibold'
                        : 'text-[#A8BBC2]'
                    }`}
                  >
                    {primaryStory.userName.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 2. Featured Story Showcase + Remaining Stories */}
          {!featuredStory ? (
            <div className="py-16 rounded-3xl bg-[#07151B] border border-[#00E5D4]/15 flex flex-col items-center justify-center text-center gap-3">
              <Sparkles size={32} className="text-[#00E5D4]" />
              <p className="text-sm text-[#A8BBC2]">No active stories right now.</p>
              <button
                type="button"
                onClick={onOpenAddStory}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
              >
                Create First Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Featured Story Card */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <div className="relative rounded-3xl overflow-hidden bg-[#07151B] border border-[#00E5D4]/25 shadow-[0_0_35px_rgba(0,229,212,0.12)] group">
                  {/* Top Overlay Info */}
                  <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/35 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] shrink-0">
                        <img
                          src={featuredStory.userAvatar}
                          alt={featuredStory.userName}
                          className="w-full h-full object-cover rounded-full bg-[#03090D]"
                        />
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-bold text-white drop-shadow">
                          {featuredStory.userName}
                        </div>
                        <div className="text-[11px] text-[#A8BBC2] drop-shadow">
                          {featuredStory.timestamp}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCardMenu((prev) => !prev)}
                        className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors cursor-pointer"
                        title="Story options"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {showCardMenu && (
                        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 shadow-2xl p-1.5 z-30 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCardMenu(false);
                              onSelectStoryFullscreen(featuredStory.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white hover:bg-[#0B1B22] cursor-pointer text-left"
                          >
                            <Maximize2 size={14} className="text-[#00E5D4]" />
                            <span>Open Fullscreen</span>
                          </button>
                          {onDeleteStory &&
                            featuredStory.userId === currentUser.id && (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCardMenu(false);
                                  onDeleteStory(featuredStory.id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#F33248] hover:bg-[#F33248]/10 cursor-pointer text-left"
                              >
                                <Trash2 size={14} />
                                <span>Delete Story</span>
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Media / Content (Tap opens full-screen) */}
                  <div
                    onClick={() => onSelectStoryFullscreen(featuredStory.id)}
                    className="cursor-pointer relative aspect-[3/4] sm:aspect-[4/5] max-h-[540px] w-full overflow-hidden"
                  >
                    {featuredStory.mediaType === 'image' &&
                    featuredStory.mediaUrl ? (
                      <img
                        src={featuredStory.mediaUrl}
                        alt={featuredStory.userName}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className={`w-full h-full p-8 flex items-center justify-center text-center bg-gradient-to-br ${
                          featuredStory.bgGradient ||
                          'from-[#07151B] via-[#0B1B22] to-[#00AFC2]'
                        }`}
                      >
                        <p className="text-xl sm:text-2xl font-bold font-display text-white leading-relaxed drop-shadow">
                          {featuredStory.text}
                        </p>
                      </div>
                    )}

                    {/* Bottom Overlay Caption + View Counter */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end justify-between gap-3">
                      <p className="text-xs sm:text-sm text-white/95 font-medium line-clamp-2 drop-shadow">
                        {featuredStory.caption || ''}
                      </p>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5">
                        <Eye size={13} className="text-[#00E5D4]" />
                        <span>{featuredStory.viewsCount}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Reaction & Reply Strip */}
                <div className="p-3 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {['🔥', '❤️', '👏', '😂', '🚀'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleQuickReaction(emoji)}
                          className="w-8 h-8 rounded-full bg-[#0B1B22] hover:bg-[#00E5D4]/20 border border-white/5 flex items-center justify-center text-base hover:scale-110 transition-transform cursor-pointer"
                          title={`React ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {sentFeedback ? (
                      <span className="text-[11px] font-semibold text-[#00E5D4]">
                        {sentFeedback}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectStoryFullscreen(featuredStory.id)}
                        className="text-[11px] font-semibold text-[#00CFEF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 size={11} />
                        <span>Watch Fullscreen</span>
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={handleQuickReply}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${featuredStory.userName}'s story...`}
                      className="flex-1 bg-[#03090D] border border-[#00E5D4]/20 rounded-full px-4 py-2 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="p-2 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] disabled:opacity-40 cursor-pointer"
                      title="Send Story Reply"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: One card per person showing only their current story thumbnail */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00E5D4] flex items-center gap-1.5">
                    <Clock size={13} />
                    Active Circle Stories ({personGroups.length})
                  </span>
                  <span className="text-[11px] text-[#A8BBC2]">
                    Tap any card to play full-screen
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                  {personGroups.map(({ key: personKey, items: personStories, currentStory: story }) => {
                    const isSelected = personStories.some((s) => s.id === featuredStory.id);
                    const currentIdx = personStories.findIndex((s) => s.id === story.id);
                    return (
                      <div
                        key={personKey}
                        onClick={() => {
                          setSelectedStoryId(story.id);
                          onSelectStoryFullscreen(story.id);
                        }}
                        className={`relative aspect-[9/13] rounded-2xl overflow-hidden border transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[#00E5D4] ring-2 ring-[#00E5D4]/30 shadow-[0_0_20px_rgba(0,229,212,0.2)]'
                            : 'border-[#00E5D4]/20 hover:border-[#00E5D4]/60'
                        }`}
                      >
                        {story.mediaType === 'image' && story.mediaUrl ? (
                          <img
                            src={story.mediaUrl}
                            alt={story.userName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className={`w-full h-full p-4 flex items-center justify-center text-center bg-gradient-to-br ${
                              story.bgGradient ||
                              'from-[#07151B] via-[#0B1B22] to-[#00AFC2]'
                            }`}
                          >
                            <p className="text-xs font-semibold text-white line-clamp-4">
                              {story.text}
                            </p>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 p-2.5 flex flex-col justify-between">
                          <div className="flex flex-col gap-2">
                            {/* Mini story bars when this person has multiple stories */}
                            {personStories.length > 1 && (
                              <div className="flex items-center gap-1">
                                {personStories.map((st, idx) => (
                                  <span
                                    key={st.id}
                                    className={`h-1 flex-1 rounded-full ${
                                      idx <= currentIdx
                                        ? 'bg-[#00E5D4]'
                                        : 'bg-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <img
                                src={story.userAvatar}
                                alt={story.userName}
                                className={`w-7 h-7 rounded-full object-cover border-2 ${
                                  story.isViewed ? 'border-[#A8BBC2]/50' : 'border-[#00E5D4]'
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate drop-shadow">
                                  {story.userName}
                                </div>
                                <div className="text-[10px] text-[#A8BBC2]">
                                  {story.timestamp}
                                  {personStories.length > 1
                                    ? ` · ${currentIdx + 1}/${personStories.length}`
                                    : ''}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-white/90">
                            <span className="truncate max-w-[70%] text-[#A8BBC2]">
                              {story.caption || 'Story'}
                            </span>
                            <span className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full">
                              <Eye size={10} className="text-[#00E5D4]" />
                              {story.viewsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. Clearly-Labelled Sponsored Stories Showcase */}
          {sponsoredCampaigns.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Megaphone size={14} />
                  <span>Sponsored Stories &amp; Local Highlights</span>
                </div>
                {onOpenAdvertise && (
                  <button
                    type="button"
                    onClick={onOpenAdvertise}
                    className="text-xs font-semibold text-[#00E5D4] hover:underline cursor-pointer"
                  >
                    Promote your event or brand
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {sponsoredCampaigns.map((ad) => (
                  <div
                    key={ad.id}
                    onClick={() => onSelectStoryFullscreen(`ad:${ad.id}`)}
                    className="rounded-2xl overflow-hidden bg-[#07151B] border border-amber-400/25 hover:border-[#00E5D4]/60 transition-colors cursor-pointer group flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      {ad.mediaType === 'video' ? (
                        <video
                          src={ad.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={ad.mediaUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/45 p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-300 drop-shadow">
                            Sponsored · {ad.category}
                          </span>
                          {onHideAd && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onHideAd(ad.id);
                              }}
                              className="p-1 rounded-full bg-black/60 text-[#A8BBC2] hover:text-white cursor-pointer"
                              title="Hide this ad"
                            >
                              <EyeOff size={12} />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={ad.advertiserAvatar}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover border border-amber-400"
                          />
                          <span className="text-xs font-semibold text-white truncate">
                            {ad.advertiserName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {ad.title}
                        </h3>
                        <p className="text-xs text-[#A8BBC2] line-clamp-2 mt-0.5">
                          {ad.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                        <span className="text-[11px] text-[#00CFEF] truncate">
                          {ad.venue || ad.eventDate || 'View Story'}
                        </span>
                        <span className="font-bold text-[#00E5D4] flex items-center gap-1 shrink-0">
                          <span>{ad.ctaLabel}</span>
                          <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
