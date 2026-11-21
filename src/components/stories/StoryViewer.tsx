import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Trash2,
  Pause,
  Play,
  ExternalLink,
  Flag,
  EyeOff,
  MoreVertical,
  Info,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AdReportRecord, SponsoredStoryCampaign, Story } from '../../types';

interface StoryViewerProps {
  stories: Story[];
  sponsoredCampaigns?: SponsoredStoryCampaign[];
  frequencyCapOrganic?: number;
  initialStoryId: string;
  currentUserId?: string;
  onClose: () => void;
  onSendReply: (story: Story, replyText: string) => void;
  onDeleteStory?: (storyId: string) => void;
  onMarkStoryViewed?: (storyId: string) => void;
  onTrackAdImpression?: (campaignId: string) => void;
  onTrackAdCompletion?: (campaignId: string) => void;
  onTrackAdCtaClick?: (campaignId: string) => void;
  onHideAd?: (campaignId: string) => void;
  onReportAd?: (
    campaignId: string,
    reason: AdReportRecord['reason'],
    details?: string
  ) => void;
}

type ViewerGroup =
  | {
      kind: 'organic';
      key: string;
      userId: string;
      userName: string;
      userAvatar: string;
      userChatCode?: string;
      items: Story[];
    }
  | {
      kind: 'sponsored';
      key: string;
      campaign: SponsoredStoryCampaign;
    };

const STORY_DURATION_MS = 5500;
const AD_DURATION_MS = 7000;

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  sponsoredCampaigns = [],
  frequencyCapOrganic = 3,
  initialStoryId,
  currentUserId = 'user_me',
  onClose,
  onSendReply,
  onDeleteStory,
  onMarkStoryViewed,
  onTrackAdImpression,
  onTrackAdCompletion,
  onTrackAdCtaClick,
  onHideAd,
  onReportAd,
}) => {
  // Build interleaved feed: organic person groups + frequency-capped Sponsored Stories
  const groups = useMemo<ViewerGroup[]>(() => {
    const map = new Map<
      string,
      {
        userId: string;
        userName: string;
        userAvatar: string;
        userChatCode?: string;
        items: Story[];
      }
    >();

    for (const story of stories) {
      const key = story.userId || story.userChatCode || story.userName;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(story);
      } else {
        map.set(key, {
          userId: story.userId,
          userName: story.userName,
          userAvatar: story.userAvatar,
          userChatCode: story.userChatCode,
          items: [story],
        });
      }
    }

    const organicGroups: ViewerGroup[] = Array.from(map.entries()).map(([key, g]) => ({
      kind: 'organic',
      key: `org_${key}`,
      ...g,
    }));

    // If user clicked directly on a sponsored ad card (`ad:<campaignId>`), start cleanly with that sponsored slide
    if (initialStoryId.startsWith('ad:')) {
      const targetId = initialStoryId.slice(3);
      const targetAd = sponsoredCampaigns.find((c) => c.id === targetId);
      const restAds = sponsoredCampaigns.filter((c) => c.id !== targetId);
      const list: ViewerGroup[] = [];
      if (targetAd) {
        list.push({
          kind: 'sponsored',
          key: `ad_${targetAd.id}`,
          campaign: targetAd,
        });
      }
      const cap = Math.max(1, frequencyCapOrganic);
      let adIdx = 0;
      organicGroups.forEach((og, idx) => {
        list.push(og);
        if ((idx + 1) % cap === 0 && adIdx < restAds.length) {
          const ad = restAds[adIdx++];
          list.push({ kind: 'sponsored', key: `ad_${ad.id}`, campaign: ad });
        }
      });
      return list;
    }

    if (sponsoredCampaigns.length === 0) return organicGroups;

    const interleaved: ViewerGroup[] = [];
    const cap = Math.max(1, frequencyCapOrganic);
    let adIdx = 0;
    organicGroups.forEach((og, idx) => {
      interleaved.push(og);
      if ((idx + 1) % cap === 0 && adIdx < sponsoredCampaigns.length) {
        const ad = sponsoredCampaigns[adIdx++];
        interleaved.push({ kind: 'sponsored', key: `ad_${ad.id}`, campaign: ad });
      }
    });

    // If fewer organic groups than frequency cap, place 1 eligible sponsored story at end of reel
    if (adIdx === 0 && organicGroups.length > 0) {
      const ad = sponsoredCampaigns[0];
      interleaved.push({ kind: 'sponsored', key: `ad_${ad.id}`, campaign: ad });
    }

    return interleaved;
  }, [stories, sponsoredCampaigns, frequencyCapOrganic, initialStoryId]);

  const initialCoords = useMemo(() => {
    if (initialStoryId.startsWith('ad:')) {
      const targetKey = `ad_${initialStoryId.slice(3)}`;
      const gIdx = groups.findIndex((g) => g.key === targetKey);
      return { gIdx: Math.max(0, gIdx), iIdx: 0 };
    }
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const g = groups[gIdx];
      if (g.kind === 'organic') {
        const iIdx = g.items.findIndex((s) => s.id === initialStoryId);
        if (iIdx >= 0) return { gIdx, iIdx };
      }
    }
    return { gIdx: 0, iIdx: 0 };
  }, [groups, initialStoryId]);

  const [groupIndex, setGroupIndex] = useState(initialCoords.gIdx);
  const [itemIndex, setItemIndex] = useState(initialCoords.iIdx);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyFocused, setReplyFocused] = useState(false);
  const [showAdMenu, setShowAdMenu] = useState(false);
  const [showWhyAdModal, setShowWhyAdModal] = useState(false);
  const [reportingAd, setReportingAd] = useState<SponsoredStoryCampaign | null>(null);
  const [reportReason, setReportReason] = useState<AdReportRecord['reason']>('Misleading or Scam');
  const [reportDetails, setReportDetails] = useState('');
  const [destinationPreview, setDestinationPreview] = useState<SponsoredStoryCampaign | null>(null);
  const [reactions, setReactions] = useState<
    { id: number; emoji: string; x: number }[]
  >([]);

  const trackedImpressionKeysRef = useRef<Set<string>>(new Set());
  const trackedCompletionKeysRef = useRef<Set<string>>(new Set());

  const safeGroupIndex = Math.min(groupIndex, Math.max(0, groups.length - 1));
  const currentGroup = groups[safeGroupIndex];

  const isSponsored = currentGroup?.kind === 'sponsored';
  const currentAd = currentGroup?.kind === 'sponsored' ? currentGroup.campaign : null;
  const personStories = currentGroup?.kind === 'organic' ? currentGroup.items : [];
  const safeItemIndex = Math.min(itemIndex, Math.max(0, personStories.length - 1));
  const currentStory = currentGroup?.kind === 'organic' ? personStories[safeItemIndex] : null;

  const hasNextInPerson = !isSponsored && safeItemIndex < personStories.length - 1;
  const nextGroup = safeGroupIndex < groups.length - 1 ? groups[safeGroupIndex + 1] : null;

  const timerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const handleNext = useCallback(() => {
    setProgress(0);
    setShowAdMenu(false);
    if (!isSponsored && safeItemIndex < personStories.length - 1) {
      setItemIndex(safeItemIndex + 1);
    } else if (safeGroupIndex < groups.length - 1) {
      setGroupIndex(safeGroupIndex + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  }, [isSponsored, safeItemIndex, personStories.length, safeGroupIndex, groups.length, onClose]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setShowAdMenu(false);
    if (!isSponsored && safeItemIndex > 0) {
      setItemIndex(safeItemIndex - 1);
    } else if (safeGroupIndex > 0) {
      const prevGroup = groups[safeGroupIndex - 1];
      setGroupIndex(safeGroupIndex - 1);
      setItemIndex(
        prevGroup.kind === 'organic' ? Math.max(0, prevGroup.items.length - 1) : 0
      );
    }
  }, [isSponsored, safeItemIndex, safeGroupIndex, groups]);

  // Mark organic story viewed
  useEffect(() => {
    if (currentStory && !currentStory.isViewed) {
      onMarkStoryViewed?.(currentStory.id);
    }
  }, [currentStory?.id, currentStory?.isViewed, onMarkStoryViewed]);

  // Track Sponsored Story qualified impression once per slide entry
  useEffect(() => {
    if (!currentAd) return;
    const key = `${currentAd.id}_${safeGroupIndex}`;
    if (!trackedImpressionKeysRef.current.has(key)) {
      trackedImpressionKeysRef.current.add(key);
      onTrackAdImpression?.(currentAd.id);
    }
  }, [currentAd?.id, safeGroupIndex, onTrackAdImpression]);

  // Track Sponsored Story completion when reaching 90%+
  useEffect(() => {
    if (!currentAd || progress < 90) return;
    const key = `${currentAd.id}_${safeGroupIndex}`;
    if (!trackedCompletionKeysRef.current.has(key)) {
      trackedCompletionKeysRef.current.add(key);
      onTrackAdCompletion?.(currentAd.id);
    }
  }, [currentAd?.id, progress, safeGroupIndex, onTrackAdCompletion]);

  // Auto-advance timer
  useEffect(() => {
    const modalOpen = Boolean(reportingAd || showWhyAdModal || destinationPreview || showAdMenu);
    if (isPaused || replyFocused || modalOpen || (!currentStory && !currentAd)) return;

    const intervalTime = 50;
    const durMs = currentAd ? AD_DURATION_MS : STORY_DURATION_MS;
    const step = (intervalTime / durMs) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        return nextVal >= 100 ? 100 : nextVal;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    safeGroupIndex,
    safeItemIndex,
    isPaused,
    replyFocused,
    currentStory,
    currentAd,
    reportingAd,
    showWhyAdModal,
    destinationPreview,
    showAdMenu,
  ]);

  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (replyFocused || reportingAd || showWhyAdModal || destinationPreview) {
        if (e.key === 'Escape') {
          setReplyFocused(false);
          setReportingAd(null);
          setShowWhyAdModal(false);
          setDestinationPreview(null);
        }
        return;
      }
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    handleNext,
    handlePrev,
    onClose,
    replyFocused,
    reportingAd,
    showWhyAdModal,
    destinationPreview,
  ]);

  const triggerReaction = (emoji: string, skipReply = false) => {
    if (!currentStory) return;
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 1400);

    if (!skipReply) {
      onSendReply(currentStory, `Reacted to your story: ${emoji}`);
    }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStory || !replyText.trim()) return;
    onSendReply(currentStory, replyText.trim());
    setReplyText('');
    triggerReaction('💬', true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (startX === null || endX === undefined) return;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
  };

  if (!currentStory && !currentAd) return null;

  const isFirstOverall = safeGroupIndex === 0 && (isSponsored || safeItemIndex === 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#03090D] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-150"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient full-screen backdrop */}
      {currentAd ? (
        <div className="absolute inset-0 pointer-events-none">
          {currentAd.mediaType === 'image' && (
            <img
              src={currentAd.mediaUrl}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 to-black/95" />
        </div>
      ) : currentStory?.mediaType === 'image' && currentStory.mediaUrl ? (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={currentStory.mediaUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-black/90" />
        </div>
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            currentStory?.bgGradient || 'from-[#07151B] via-[#0B1B22] to-[#00AFC2]'
          }`}
        />
      )}

      {/* Top Progress Segments & Author / Advertiser Header */}
      <div className="relative z-30 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 flex flex-col gap-3">
        {currentAd ? (
          <div className="h-1.5 w-full bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-300 to-[#00E5D4] transition-all duration-75 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {personStories.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setItemIndex(idx);
                  setProgress(0);
                }}
                aria-label={`${currentStory?.userName}'s story ${idx + 1} of ${personStories.length}`}
                className="h-1.5 flex-1 bg-white/25 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] transition-all duration-75 rounded-full"
                  style={{
                    width:
                      idx < safeItemIndex
                        ? '100%'
                        : idx === safeItemIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Header Identity */}
        <div className="flex items-center justify-between gap-3">
          {currentAd ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-[#00E5D4] shrink-0">
                <img
                  src={currentAd.advertiserAvatar}
                  alt={currentAd.advertiserName}
                  className="w-full h-full object-cover rounded-full bg-[#03090D]"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base text-white font-display truncate">
                    {currentAd.advertiserName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                  <span>Sponsored</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#A8BBC2] font-normal truncate">
                    {currentAd.category}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            currentStory && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] shrink-0">
                  <img
                    src={currentStory.userAvatar}
                    alt={currentStory.userName}
                    className="w-full h-full object-cover rounded-full bg-[#03090D]"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-white font-display truncate">
                      {currentStory.userName}
                    </span>
                    {currentStory.userChatCode && (
                      <span className="hidden sm:inline-block text-[10px] text-[#00E5D4] font-mono">
                        {currentStory.userChatCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#A8BBC2]">
                    <span>{currentStory.timestamp}</span>
                    <span>·</span>
                    <span>
                      {safeItemIndex + 1} of {personStories.length}
                    </span>
                    {nextGroup && !hasNextInPerson && nextGroup.kind === 'organic' && (
                      <span className="hidden md:inline text-[#00CFEF]">
                        · Next: {nextGroup.userName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 shrink-0 relative">
            {((currentAd && currentAd.mediaType === 'video') ||
              currentStory?.mediaType === 'video') && (
              <button
                type="button"
                onClick={() => setIsVideoMuted((m) => !m)}
                className="p-2 rounded-full bg-black/45 hover:bg-black/70 text-white/90 hover:text-white transition-colors cursor-pointer"
                title={isVideoMuted ? 'Unmute video' : 'Mute video'}
              >
                {isVideoMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              className="p-2 rounded-full bg-black/45 hover:bg-black/70 text-white/90 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume story' : 'Pause story'}
              aria-label={isPaused ? 'Resume story' : 'Pause story'}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>

            {currentAd && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAdMenu((v) => !v)}
                  className="p-2 rounded-full bg-black/45 hover:bg-black/70 text-white/90 hover:text-white transition-colors cursor-pointer"
                  title="Sponsored Story options"
                >
                  <MoreVertical size={18} />
                </button>
                {showAdMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#07151B] border border-white/15 shadow-2xl p-1.5 z-40 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdMenu(false);
                        setShowWhyAdModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white hover:bg-white/10 cursor-pointer text-left"
                    >
                      <Info size={14} className="text-[#00E5D4]" />
                      <span>Why am I seeing this ad?</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdMenu(false);
                        onHideAd?.(currentAd.id);
                        handleNext();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white hover:bg-white/10 cursor-pointer text-left"
                    >
                      <EyeOff size={14} className="text-amber-300" />
                      <span>Hide this ad</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAdMenu(false);
                        setReportingAd(currentAd);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#F33248] hover:bg-[#F33248]/10 cursor-pointer text-left"
                    >
                      <Flag size={14} />
                      <span>Report Sponsored Story</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!currentAd && currentStory && onDeleteStory && currentStory.userId === currentUserId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStory(currentStory.id);
                  if (stories.length <= 1) {
                    onClose();
                  } else {
                    setProgress(0);
                  }
                }}
                className="p-2 text-red-400 hover:text-red-300 rounded-full bg-black/45 hover:bg-black/70 transition-colors cursor-pointer"
                title="Delete Story"
              >
                <Trash2 size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/90 hover:text-white rounded-full bg-black/45 hover:bg-black/70 transition-colors cursor-pointer"
              aria-label="Close Story Viewer"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Media Area */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        {currentAd ? (
          currentAd.mediaType === 'video' ? (
            <video
              key={currentAd.id}
              src={currentAd.mediaUrl}
              className="w-full h-full max-w-md sm:max-w-lg object-contain md:rounded-2xl shadow-2xl"
              autoPlay
              muted={isVideoMuted}
              playsInline
              loop
            />
          ) : (
            <img
              src={currentAd.mediaUrl}
              alt={currentAd.title}
              className="w-full h-full max-w-4xl object-contain sm:object-cover md:rounded-2xl shadow-2xl select-none"
            />
          )
        ) : currentStory?.mediaType === 'video' && currentStory.mediaUrl ? (
          <video
            key={currentStory.id}
            src={currentStory.mediaUrl}
            className="w-full h-full max-w-md sm:max-w-lg object-contain md:rounded-2xl shadow-2xl"
            autoPlay
            muted={isVideoMuted}
            playsInline
            loop
          />
        ) : currentStory?.mediaType === 'image' && currentStory.mediaUrl ? (
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.userName}
            className="w-full h-full max-w-4xl object-contain sm:object-cover md:rounded-2xl shadow-2xl select-none"
          />
        ) : (
          <div className="w-full h-full max-w-3xl flex flex-col items-center justify-center p-8 sm:p-14 text-center">
            <p className="text-2xl sm:text-4xl font-bold font-display text-white leading-relaxed drop-shadow-lg">
              {currentStory?.text}
            </p>
          </div>
        )}

        {/* Left / Right Tap Navigation Zones */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          disabled={isFirstOverall}
          className="absolute left-0 top-0 bottom-0 w-1/3 z-20 flex items-center pl-3 sm:pl-6 opacity-75 md:opacity-0 md:hover:opacity-100 transition-opacity disabled:pointer-events-none disabled:opacity-0 cursor-pointer"
          aria-label="Previous Story"
        >
          <div className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15">
            <ChevronLeft size={24} />
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-end pr-3 sm:pr-6 opacity-75 md:opacity-0 md:hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Next Story"
        >
          <div className="p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/15">
            <ChevronRight size={24} />
          </div>
        </button>

        {/* Animated Flying Reactions (organic stories) */}
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute text-5xl pointer-events-none animate-bounce z-30"
            style={{ left: `${r.x}%`, bottom: '20%' }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Bottom Bar: Sponsored CTA Panel vs Organic Story Replies */}
      {currentAd ? (
        <div
          className="relative z-30 w-full max-w-2xl mx-auto px-4 pb-5 pt-3 flex flex-col gap-2.5"
          onClick={(e) => e.stopPropagation()}
        >
          {(currentAd.eventDate || currentAd.venue) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#00E5D4] font-medium">
              {currentAd.eventDate && (
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{currentAd.eventDate}</span>
                </span>
              )}
              {currentAd.venue && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{currentAd.venue}</span>
                </span>
              )}
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold font-display text-white">
              {currentAd.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/85 mt-0.5 leading-relaxed">
              {currentAd.description}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onTrackAdCtaClick?.(currentAd.id);
                setDestinationPreview(currentAd);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
            >
              <span>{currentAd.ctaLabel}</span>
              <ExternalLink size={15} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        currentStory && (
          <div className="relative z-30 w-full max-w-2xl mx-auto px-4 pb-4 pt-2 flex flex-col gap-2">
            {currentStory.caption && (
              <p className="text-sm sm:text-base text-white font-medium text-center drop-shadow">
                {currentStory.caption}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-[#A8BBC2] px-1">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-[#00E5D4]" />
                <span className="font-semibold text-white">
                  {currentStory.viewsCount}
                </span>{' '}
                views
              </span>
              <span className="text-[11px] text-[#00E5D4]">
                {hasNextInPerson
                  ? `Next in ${currentStory.userName.split(' ')[0]}'s story (${safeItemIndex + 2}/${personStories.length})`
                  : nextGroup?.kind === 'organic'
                  ? `Up next: ${nextGroup.userName}`
                  : nextGroup?.kind === 'sponsored'
                  ? 'Next: Sponsored highlight'
                  : 'Last active story'}
              </span>
            </div>

            <div className="flex items-center justify-around py-1">
              {['🔥', '❤️', '👏', '😂', '😮', '🚀'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerReaction(emoji);
                  }}
                  className="p-1.5 text-xl hover:scale-125 active:scale-95 transition-transform cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSubmitReply}
              className="flex items-center gap-2 pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={replyText}
                onFocus={() => setReplyFocused(true)}
                onBlur={() => setReplyFocused(false)}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${currentStory.userName}...`}
                className="flex-1 bg-[#0B1B22]/90 backdrop-blur-md border border-[#00E5D4]/25 rounded-full px-4 py-2.5 text-sm text-white placeholder-[#A8BBC2] focus:outline-none focus:border-[#00E5D4] transition-colors"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="p-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )
      )}

      {/* WHY AM I SEEING THIS AD DISCLOSURE */}
      {showWhyAdModal && currentAd && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setShowWhyAdModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#07151B] border border-white/15 p-5 flex flex-col gap-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">About this Sponsored Story</h4>
              <button
                type="button"
                onClick={() => setShowWhyAdModal(false)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[#A8BBC2] leading-relaxed">
              This paid promotion from <strong className="text-white">{currentAd.advertiserName}</strong> appears in Linmax Stories and is never shown inside private chats.
            </p>
            <p className="text-[#A8BBC2] leading-relaxed">
              Targeting rule:{' '}
              <strong className="text-[#00E5D4]">
                {currentAd.targetType === 'all_users'
                  ? 'All eligible Linmax users'
                  : currentAd.targetType === 'location'
                  ? `Supported region (${currentAd.targetLocation})`
                  : 'Selected +LM Chat Code list'}
              </strong>
              . Private messages and calls are never used to target ads.
            </p>
            <button
              type="button"
              onClick={() => setShowWhyAdModal(false)}
              className="mt-1 py-2 rounded-xl bg-[#00E5D4] text-[#03090D] font-bold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* SAFE IN-APP DESTINATION PREVIEW */}
      {destinationPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setDestinationPreview(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{destinationPreview.ctaLabel}</h4>
              <button
                type="button"
                onClick={() => setDestinationPreview(null)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#A8BBC2]">
              You clicked the Sponsored Story CTA for{' '}
              <strong className="text-white">{destinationPreview.title}</strong>.
            </p>
            <div className="rounded-xl bg-[#03090D] border border-white/10 p-3 text-xs font-mono text-[#00E5D4] break-all">
              {destinationPreview.destinationUrl}
            </div>
            <p className="text-[11px] text-[#A8BBC2]">
              Verified contact: {destinationPreview.advertiserContact}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={destinationPreview.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold text-center"
              >
                Open Destination
              </a>
              <button
                type="button"
                onClick={() => setDestinationPreview(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT AD MODAL */}
      {reportingAd && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setReportingAd(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onReportAd?.(reportingAd.id, reportReason, reportDetails.trim() || undefined);
              setReportingAd(null);
              setReportDetails('');
              handleNext();
            }}
            className="w-full max-w-sm rounded-2xl bg-[#07151B] border border-[#F33248]/35 p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Report Sponsored Story</h4>
              <button
                type="button"
                onClick={() => setReportingAd(null)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[#A8BBC2]">
              Help keep Linmax Stories safe. This report is sent directly to the moderation queue and the ad is hidden from your feed.
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value as AdReportRecord['reason'])}
              className="bg-[#03090D] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
            >
              <option value="Misleading or Scam">Misleading or Scam</option>
              <option value="Repetitive / Too Frequent">Repetitive / Too Frequent</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Broken Destination Link">Broken Destination Link</option>
            </select>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={2}
              placeholder="Optional note for moderators..."
              className="bg-[#03090D] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4] resize-none"
            />
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-[#F33248] text-white text-xs font-bold cursor-pointer"
            >
              Submit Report &amp; Hide Ad
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
