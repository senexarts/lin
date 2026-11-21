import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Lock, ShieldCheck } from 'lucide-react';
import { 
  initialCurrentUser, 
  initialStories, 
  initialChats, 
  initialMessages, 
  initialCallLogs, 
  initialChannels 
} from './data/initialData';
import {
  CurrentUser,
  Story,
  Chat,
  Message,
  CallLog,
  Channel,
  ActiveNavTab,
  GroupElection,
  GroupEvent,
  LinmaxSettings,
  CustomSticker,
  SponsoredStoryCampaign,
  AdPriceRules,
  AdPaymentEvent,
  AdReviewRecord,
  AdReportRecord,
} from './types';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileNav } from './components/navigation/MobileNav';
import { ChatList } from './components/chat/ChatList';
import { ChatWindow } from './components/chat/ChatWindow';
import { StoriesView } from './components/stories/StoriesView';
import { StoryViewer } from './components/stories/StoryViewer';
import { AddStoryModal } from './components/stories/AddStoryModal';
import { SponsoredStoriesStudio } from './components/ads/SponsoredStoriesStudio';
import { CallModal, ActiveCallState } from './components/calling/CallModal';
import { CallsView } from './components/calling/CallsView';
import { GroupsView } from './components/groups/GroupsView';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { ChannelsView } from './components/channels/ChannelsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView, SettingsSectionId } from './components/settings/SettingsView';
import { AddContactModal } from './components/contacts/AddContactModal';
import { SearchModal } from './components/search/SearchModal';
import { AuthView } from './components/auth/AuthView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { defaultSettings } from './data/wallpapers';
import {
  DEFAULT_AD_PRICE_RULES,
  buildInitialSponsoredCampaigns,
  buildInitialPaymentEvents,
  isCampaignEligibleForFeed,
} from './data/sponsoredStories';
import { applyFontPreference } from './data/chatThemes';
import { soundEngine } from './utils/audio';
import { sendLinmaxNotification, syncAppUnreadBadges } from './utils/notifications';

function deduplicateChats(list: Chat[]): Chat[] {
  const seenIds = new Set<string>();
  const seenDirectCodes = new Set<string>();
  const seenDirectNames = new Set<string>();
  const result: Chat[] = [];

  for (const chat of list) {
    if (seenIds.has(chat.id)) continue;

    if (chat.type === 'direct') {
      const normCode = chat.chatCode?.trim().toUpperCase();
      const normName = chat.name.trim().toLowerCase();
      if (normCode && seenDirectCodes.has(normCode)) continue;
      if (!normCode && seenDirectNames.has(normName)) continue;
      if (normCode) seenDirectCodes.add(normCode);
      seenDirectNames.add(normName);
    }

    seenIds.add(chat.id);
    result.push(chat);
  }
  return result;
}

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('linmax_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const saved = localStorage.getItem('linmax_user');
    return saved ? JSON.parse(saved) : initialCurrentUser;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('linmax_stories');
    return saved ? JSON.parse(saved) : initialStories;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('linmax_chats');
    return deduplicateChats(saved ? JSON.parse(saved) : initialChats);
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('linmax_messages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem('linmax_call_logs');
    return saved ? JSON.parse(saved) : initialCallLogs;
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('linmax_channels');
    return saved ? JSON.parse(saved) : initialChannels;
  });

  const [customStickers, setCustomStickers] = useState<CustomSticker[]>(() => {
    const saved = localStorage.getItem('linmax_custom_stickers');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<LinmaxSettings>(() => {
    const saved = localStorage.getItem('linmax_settings');
    if (!saved) return defaultSettings;
    try {
      const parsed = JSON.parse(saved);
      return {
        account: { ...defaultSettings.account, ...(parsed.account || {}) },
        privacy: { ...defaultSettings.privacy, ...(parsed.privacy || {}) },
        chats: {
          ...defaultSettings.chats,
          ...(parsed.chats || {}),
          homeThemeId: parsed.chats?.homeThemeId || defaultSettings.chats.homeThemeId,
          unlockedLiveThemeIds: Array.isArray(parsed.chats?.unlockedLiveThemeIds)
            ? parsed.chats.unlockedLiveThemeIds
            : [],
        },
        notifications: { ...defaultSettings.notifications, ...(parsed.notifications || {}) },
        storage: { ...defaultSettings.storage, ...(parsed.storage || {}) },
      };
    } catch {
      return defaultSettings;
    }
  });

  // Sponsored Stories State (localStorage-persisted; no Linmax Pro)
  const [adCampaigns, setAdCampaigns] = useState<SponsoredStoryCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('linmax_sponsored_campaigns');
      return saved ? JSON.parse(saved) : buildInitialSponsoredCampaigns();
    } catch {
      return buildInitialSponsoredCampaigns();
    }
  });

  const [adPriceRules, setAdPriceRules] = useState<AdPriceRules>(() => {
    try {
      const saved = localStorage.getItem('linmax_ad_price_rules');
      return saved ? { ...DEFAULT_AD_PRICE_RULES, ...JSON.parse(saved) } : DEFAULT_AD_PRICE_RULES;
    } catch {
      return DEFAULT_AD_PRICE_RULES;
    }
  });

  const [adPaymentEvents, setAdPaymentEvents] = useState<AdPaymentEvent[]>(() => {
    try {
      const saved = localStorage.getItem('linmax_ad_payment_events');
      return saved ? JSON.parse(saved) : buildInitialPaymentEvents();
    } catch {
      return buildInitialPaymentEvents();
    }
  });

  const [adReviewRecords, setAdReviewRecords] = useState<AdReviewRecord[]>(() => {
    try {
      const saved = localStorage.getItem('linmax_ad_review_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adReports, setAdReports] = useState<AdReportRecord[]>(() => {
    try {
      const saved = localStorage.getItem('linmax_ad_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [hiddenAdIds, setHiddenAdIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('linmax_hidden_ads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('chats');
  const [settingsSection, setSettingsSection] = useState<SettingsSectionId>('chats');
  const [pendingLiveThemeCheckout, setPendingLiveThemeCheckout] = useState<{
    themeId: string;
    target: 'home' | 'chat';
  } | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>('chat_linmax_squad');
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);

  // Modals & Notification Banner
  const [viewingStoryId, setViewingStoryId] = useState<string | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState<boolean>(false);
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() =>
    Boolean(settings.privacy.appLockEnabled && settings.privacy.appLockPin)
  );
  const [lockPinEntry, setLockPinEntry] = useState('');
  const [lockPinError, setLockPinError] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{
    id: number;
    title: string;
    body: string;
    chatId?: string;
    avatar?: string;
  } | null>(null);

  const activeChatIdRef = useRef<string | null>(activeChatId);
  const activeTabRef = useRef<ActiveNavTab>(activeTab);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const triggerNotification = (
    title: string,
    body: string,
    options?: {
      chatId?: string;
      icon?: string;
      tag?: string;
      forceToast?: boolean;
      playSound?: boolean;
    }
  ) => {
    const showPreviews = settings.notifications.showPreviews ?? true;
    const displayBody = showPreviews ? body : 'New encrypted message';

    if (options?.playSound !== false) {
      soundEngine.playMessageReceived();
    }

    sendLinmaxNotification({
      title,
      body: displayBody,
      icon: options?.icon,
      tag: options?.tag,
      vibrate: settings.notifications.vibrate ?? true,
      onClick: () => {
        if (options?.chatId) {
          const target = chats.find((c) => c.id === options.chatId);
          if (target) handleSelectChat(target);
        }
      },
    });

    if (options?.forceToast || settings.notifications.highPriority) {
      const id = Date.now();
      setNotificationToast({
        id,
        title,
        body: displayBody,
        chatId: options?.chatId,
        avatar: options?.icon,
      });
      setTimeout(() => {
        setNotificationToast((curr) => (curr && curr.id === id ? null : curr));
      }, 4500);
    }
  };

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('linmax_auth', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('linmax_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('linmax_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('linmax_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem('linmax_messages', JSON.stringify(messages));
    } catch {
      // Strip oversized inline video/blob payloads if localStorage quota is exceeded
      try {
        const compact: Record<string, Message[]> = {};
        for (const [cid, list] of Object.entries(messages)) {
          compact[cid] = list.map((m) =>
            m.mediaUrl && (m.mediaUrl.startsWith('blob:') || m.mediaUrl.length > 350_000)
              ? { ...m, mediaUrl: undefined }
              : m
          );
        }
        localStorage.setItem('linmax_messages', JSON.stringify(compact));
      } catch {
        // ignore
      }
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('linmax_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem('linmax_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    try {
      localStorage.setItem('linmax_custom_stickers', JSON.stringify(customStickers));
    } catch {
      // ignore quota
    }
  }, [customStickers]);

  useEffect(() => {
    try {
      localStorage.setItem('linmax_sponsored_campaigns', JSON.stringify(adCampaigns));
    } catch {
      // ignore quota
    }
  }, [adCampaigns]);

  useEffect(() => {
    localStorage.setItem('linmax_ad_price_rules', JSON.stringify(adPriceRules));
  }, [adPriceRules]);

  useEffect(() => {
    localStorage.setItem('linmax_ad_payment_events', JSON.stringify(adPaymentEvents));
  }, [adPaymentEvents]);

  useEffect(() => {
    localStorage.setItem('linmax_ad_review_records', JSON.stringify(adReviewRecords));
  }, [adReviewRecords]);

  useEffect(() => {
    localStorage.setItem('linmax_ad_reports', JSON.stringify(adReports));
  }, [adReports]);

  useEffect(() => {
    localStorage.setItem('linmax_hidden_ads', JSON.stringify(hiddenAdIds));
  }, [hiddenAdIds]);

  useEffect(() => {
    try {
      localStorage.setItem('linmax_settings', JSON.stringify(settings));
    } catch {
      // If custom theme/ringtone base64 is huge, persist core preferences cleanly
      try {
        const leanSettings: LinmaxSettings = {
          ...settings,
          chats: { ...settings.chats, customThemeUrl: undefined, customWallpaperUrl: undefined },
          notifications: {
            ...settings.notifications,
            customRingtoneUrl: undefined,
            customMessageToneUrl: undefined,
          },
        };
        localStorage.setItem('linmax_settings', JSON.stringify(leanSettings));
      } catch {
        // ignore
      }
    }
    applyFontPreference(settings.chats.fontFamily);
    soundEngine.configure({
      enabled: settings.notifications.conversationTones,
      messageTone: settings.notifications.messageTone,
      customMessageToneUrl: settings.notifications.customMessageToneUrl,
      callRingtone: settings.notifications.callRingtone,
      customRingtoneUrl: settings.notifications.customRingtoneUrl,
    });
  }, [settings]);

  // Derived current active chat
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeChatMessages = (activeChat && messages[activeChat.id]) || [];

  const totalUnreadMessages = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const totalUnreadCalls = callLogs.filter((c) => c.type === 'missed').length;

  useEffect(() => {
    syncAppUnreadBadges(totalUnreadMessages, settings.notifications.tabBadge !== false);
  }, [totalUnreadMessages, settings.notifications.tabBadge]);

  // Handlers
  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setActiveTab('chats');
    setMobileShowChat(true);

    // Clear unread
    if (chat.unreadCount > 0) {
      setChats((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
      );
    }
  };

  const handleSendMessage = (
    text: string,
    mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker',
    mediaUrl?: string,
    replyTo?: Message,
    stickerId?: string,
    mediaName?: string,
    mediaSize?: string,
    audioDuration?: string,
    customSticker?: CustomSticker
  ) => {
    if (!activeChat) return;

    const targetChatId = activeChat.id;
    const targetChatName = activeChat.name;
    const targetChatAvatar = activeChat.avatar;
    const msgId = `msg_${Date.now()}`;

    const newMsg: Message = {
      id: msgId,
      chatId: targetChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: 'Just now',
      status: 'sent',
      mediaType,
      mediaUrl,
      mediaName,
      mediaSize,
      audioDuration,
      stickerId,
      customSticker,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.senderName,
            text: replyTo.text,
          }
        : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), newMsg],
    }));

    // Update last message in chat list with initial 'sent' single-tick status
    const previewLabel =
      mediaType === 'image'
        ? `📷 ${text || 'Photo'}`
        : mediaType === 'video'
        ? `🎬 ${text || 'Video'}`
        : mediaType === 'audio'
        ? `🎤 Voice note (${audioDuration || '0:06'})`
        : mediaType === 'document'
        ? `📄 ${mediaName || text}`
        : text;

    setChats((prev) =>
      prev.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              lastMessage: previewLabel,
              lastMessageTime: 'Just now',
              lastMessageFromMe: true,
              lastMessageStatus: 'sent',
            }
          : c
      )
    );

    // 1. Mark message as 'delivered' (grey double-tick) after 700ms
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [targetChatId]: (prev[targetChatId] || []).map((m) =>
          m.id === msgId && m.status === 'sent' ? { ...m, status: 'delivered' } : m
        ),
      }));
      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId && c.lastMessageFromMe && c.lastMessageStatus === 'sent'
            ? { ...c, lastMessageStatus: 'delivered' }
            : c
        )
      );
    }, 700);

    // 2. Simulate recipient viewing message -> 'read' (blue double-tick) & smart reply after 2.4s
    setTimeout(() => {
      const replyText = getSmartReply(text, targetChatName, mediaType);

      setMessages((prev) => {
        const list = (prev[targetChatId] || []).map((m) =>
          m.id === msgId ? { ...m, status: 'read' as const } : m
        );
        const contactReply: Message = {
          id: `msg_rep_${Date.now()}`,
          chatId: targetChatId,
          senderId: 'contact_auto',
          senderName: targetChatName,
          senderAvatar: targetChatAvatar,
          text: replyText,
          timestamp: 'Just now',
          status: 'read',
        };
        return {
          ...prev,
          [targetChatId]: [...list, contactReply],
        };
      });

      const isUserViewingThisChat =
        activeTabRef.current === 'chats' &&
        activeChatIdRef.current === targetChatId &&
        document.visibilityState === 'visible';

      setChats((prev) =>
        prev.map((c) =>
          c.id === targetChatId
            ? {
                ...c,
                lastMessage: replyText,
                lastMessageTime: 'Just now',
                lastMessageFromMe: false,
                lastMessageStatus: 'read',
                unreadCount: isUserViewingThisChat ? 0 : c.unreadCount + 1,
              }
            : c
        )
      );

      const isBlocked = settings.privacy.blockedChatIds.includes(targetChatId);
      if (isBlocked) return;

      if (isUserViewingThisChat) {
        soundEngine.playMessageReceived();
      } else {
        triggerNotification(targetChatName, replyText, {
          chatId: targetChatId,
          icon: targetChatAvatar,
          tag: `linmax-msg-${targetChatId}`,
          forceToast: true,
        });
      }
    }, 2400);
  };

  const getSmartReply = (userText: string, contactName: string, mediaType?: Message['mediaType']) => {
    const lower = userText.toLowerCase();
    if (mediaType === 'audio') {
      return `Got your audio! Sounding loud and clear on Linmax 🎧🔥`;
    }
    if (mediaType === 'video' || lower.includes('video')) {
      return `Awesome video clip! Playing it in HD right now 🎬🔥`;
    }
    if (lower.includes('hello') || lower.includes('hey') || lower.includes('hi')) {
      return `Hey ${currentUser.name}! Great to hear from you on Linmax 🔥`;
    }
    if (lower.includes('call') || lower.includes('meet')) {
      return `Sounds perfect! I am ready for a Linmax voice or video call whenever you are.`;
    }
    if (lower.includes('story') || lower.includes('photo')) {
      return `Loved the new story you posted today!`;
    }
    return `Got it! Connecting without limits with you on Linmax. Talk soon! 👍`;
  };

  const handleSimulateIncomingMessage = () => {
    const target =
      chats.find((c) => c.type === 'direct' && !settings.privacy.blockedChatIds.includes(c.id)) ||
      chats[0];
    if (!target) return;
    const sampleText = `Hey ${currentUser.name}! Are we still meeting on Linmax tonight? 🚀`;
    const newMsg: Message = {
      id: `msg_sim_${Date.now()}`,
      chatId: target.id,
      senderId: 'contact_sim',
      senderName: target.name,
      senderAvatar: target.avatar,
      text: sampleText,
      timestamp: 'Just now',
      status: 'read',
    };
    setMessages((prev) => ({
      ...prev,
      [target.id]: [...(prev[target.id] || []), newMsg],
    }));
    setChats((prev) =>
      prev.map((c) =>
        c.id === target.id
          ? {
              ...c,
              lastMessage: sampleText,
              lastMessageTime: 'Just now',
              lastMessageFromMe: false,
              unreadCount: c.unreadCount + 1,
            }
          : c
      )
    );
    triggerNotification(target.name, sampleText, {
      chatId: target.id,
      icon: target.avatar,
      tag: `linmax-sim-${target.id}`,
      forceToast: true,
    });
  };

  // Calling Handlers
  const handleStartCall = (
    contact: { name: string; avatar: string; chatCode: string },
    type: 'voice' | 'video'
  ) => {
    setActiveCall({
      status: 'outgoing',
      callType: type,
      contactName: contact.name,
      contactAvatar: contact.avatar,
      contactChatCode: contact.chatCode,
    });

    // Simulate contact answering after 3.2s
    setTimeout(() => {
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
    }, 3200);

    // Add to call logs
    const newLog: CallLog = {
      id: `call_${Date.now()}`,
      contactId: contact.chatCode,
      contactName: contact.name,
      contactAvatar: contact.avatar,
      contactChatCode: contact.chatCode,
      type: 'outgoing',
      callType: type,
      timestamp: 'Just now',
      duration: '01:20',
      date: 'Today',
    };
    setCallLogs((prev) => [newLog, ...prev]);
  };

  const handleAcceptCall = () => {
    setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
  };

  const handleDeclineCall = () => {
    setActiveCall(null);
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  // Story Handlers
  const handleAddStory = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
  };

  const handleSendStoryReply = (story: Story, replyText: string) => {
    const normCode = story.userChatCode?.trim().toUpperCase();
    const canonicalId = normCode
      ? `chat_${normCode.replace(/[^A-Z0-9]/gi, '').toLowerCase()}`
      : `chat_${story.userId}`;

    const existingChat = chats.find(
      (c) =>
        c.id === canonicalId ||
        c.id === `chat_${story.userId}` ||
        (normCode && c.chatCode?.toUpperCase() === normCode) ||
        (c.type === 'direct' && c.name.toLowerCase() === story.userName.toLowerCase())
    );
    const targetChatId = existingChat ? existingChat.id : canonicalId;

    setChats((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.id === targetChatId ||
          (normCode && c.chatCode?.toUpperCase() === normCode) ||
          (c.type === 'direct' && c.name.toLowerCase() === story.userName.toLowerCase())
      );

      if (idx >= 0) {
        const updated = prev.map((c, i) =>
          i === idx
            ? {
                ...c,
                lastMessage: replyText,
                lastMessageTime: 'Just now',
                lastMessageFromMe: true,
                lastMessageStatus: 'sent' as const,
              }
            : c
        );
        return deduplicateChats(updated);
      }

      const newChat: Chat = {
        id: targetChatId,
        type: 'direct',
        name: story.userName,
        chatCode: normCode || '+LM-STORY',
        avatar: story.userAvatar,
        lastMessage: replyText,
        lastMessageTime: 'Just now',
        lastMessageFromMe: true,
        lastMessageStatus: 'sent',
        unreadCount: 0,
        isOnline: true,
      };
      return deduplicateChats([newChat, ...prev]);
    });

    const replyMsg: Message = {
      id: `msg_story_${Date.now()}`,
      chatId: targetChatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: replyText,
      timestamp: 'Just now',
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), replyMsg],
    }));

    soundEngine.playMessageSent();
  };

  const handleDeleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const handleMarkStoryViewed = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId && !s.isViewed ? { ...s, isViewed: true } : s))
    );
  };

  // Sponsored Stories Campaign, Moderation & Real Analytics Handlers
  const eligibleSponsoredCampaigns = adCampaigns.filter((c) =>
    isCampaignEligibleForFeed(c, currentUser.chatCode, hiddenAdIds)
  );

  const handleCreatePaidCampaign = (
    campaign: SponsoredStoryCampaign,
    paymentEvent: AdPaymentEvent
  ) => {
    setAdCampaigns((prev) => [campaign, ...prev]);
    setAdPaymentEvents((prev) => [paymentEvent, ...prev]);
  };

  const handleResubmitCampaign = (
    campaignId: string,
    updates: Partial<SponsoredStoryCampaign>
  ) => {
    setAdCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              ...updates,
              approvalStatus: 'pending_review',
              deliveryStatus: 'scheduled',
              rejectionReason: undefined,
            }
          : c
      )
    );
  };

  const handleTogglePauseCampaign = (campaignId: string) => {
    setAdCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const nextDelivery = c.deliveryStatus === 'active' ? 'paused' : 'active';
        return { ...c, deliveryStatus: nextDelivery };
      })
    );
  };

  const handleModerateCampaign = (
    campaignId: string,
    decision: 'approved' | 'rejected' | 'changes_requested' | 'paused' | 'resumed' | 'terminated',
    reason?: string,
    notes?: string
  ) => {
    const now = Date.now();
    let targetTitle = '';

    setAdCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        targetTitle = c.title;

        if (decision === 'approved') {
          if (c.paymentStatus !== 'paid') return c;
          return {
            ...c,
            approvalStatus: 'approved',
            deliveryStatus: 'active',
            startsAt: now,
            expiresAt: now + c.durationHours * 3600 * 1000,
            moderationNotes: notes || c.moderationNotes,
            rejectionReason: undefined,
          };
        }

        if (decision === 'changes_requested') {
          return {
            ...c,
            approvalStatus: 'changes_requested',
            deliveryStatus: 'scheduled',
            moderationNotes: reason || notes || 'Please refine creative or details.',
          };
        }

        if (decision === 'rejected') {
          const refundEvent: AdPaymentEvent = {
            id: `pay_ref_${now}`,
            campaignId: c.id,
            campaignTitle: c.title,
            provider: c.paymentProvider || 'mtn_momo',
            reference: `REFUND-${c.paymentReference}`,
            eventType: 'refund_issued',
            amountUgx: c.amountPaidUgx,
            currency: 'UGX',
            accountMasked: c.paymentAccount || 'N/A',
            createdAt: now,
          };
          setAdPaymentEvents((evPrev) => [refundEvent, ...evPrev]);
          return {
            ...c,
            approvalStatus: 'rejected',
            deliveryStatus: 'cancelled',
            paymentStatus: 'refunded',
            rejectionReason: reason || 'Campaign rejected during moderation review.',
          };
        }

        if (decision === 'paused') {
          return { ...c, deliveryStatus: 'paused', moderationNotes: reason || c.moderationNotes };
        }

        if (decision === 'resumed') {
          return {
            ...c,
            deliveryStatus: c.approvalStatus === 'approved' && c.paymentStatus === 'paid' ? 'active' : c.deliveryStatus,
          };
        }

        // terminated
        return {
          ...c,
          deliveryStatus: 'terminated',
          rejectionReason: reason || 'Terminated by administrator.',
        };
      })
    );

    const rev: AdReviewRecord = {
      id: `rev_${now}`,
      campaignId,
      campaignTitle: targetTitle || campaignId,
      decision,
      adminName: `${currentUser.name} (Moderator)`,
      reason,
      notes,
      createdAt: now,
    };
    setAdReviewRecords((prev) => [rev, ...prev]);
  };

  const handleTrackAdImpression = (campaignId: string) => {
    setAdCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const hasViewer = c.uniqueViewerIds.includes(currentUser.id);
        return {
          ...c,
          impressions: c.impressions + 1,
          uniqueViewerIds: hasViewer ? c.uniqueViewerIds : [...c.uniqueViewerIds, currentUser.id],
          videoViews: c.mediaType === 'video' ? c.videoViews + 1 : c.videoViews,
        };
      })
    );
  };

  const handleTrackAdCompletion = (campaignId: string) => {
    setAdCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, storyCompletions: c.storyCompletions + 1 } : c
      )
    );
  };

  const handleTrackAdCtaClick = (campaignId: string) => {
    setAdCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ctaClicks: c.ctaClicks + 1 } : c))
    );
  };

  const handleHideAd = (campaignId: string) => {
    setHiddenAdIds((prev) => (prev.includes(campaignId) ? prev : [...prev, campaignId]));
  };

  const handleReportAd = (
    campaignId: string,
    reason: AdReportRecord['reason'],
    details?: string
  ) => {
    const found = adCampaigns.find((c) => c.id === campaignId);
    const report: AdReportRecord = {
      id: `rep_${Date.now()}`,
      campaignId,
      campaignTitle: found?.title || campaignId,
      reporterUserId: currentUser.id,
      reason,
      details,
      status: 'open',
      createdAt: Date.now(),
    };
    setAdReports((prev) => [report, ...prev]);
    handleHideAd(campaignId);
  };

  const handleUpdateUser = (updated: Partial<CurrentUser>) => {
    const oldName = currentUser.name;
    const oldChatCode = currentUser.chatCode;
    const newName = updated.name?.trim();
    const newChatCode = updated.chatCode?.trim().toUpperCase();
    const nextUser: CurrentUser = {
      ...currentUser,
      ...updated,
      name: newName || currentUser.name,
      chatCode: newChatCode || currentUser.chatCode,
    };
    setCurrentUser(nextUser);

    // Sync updates back to registered accounts list so lookups see latest DP/name/bio/chatCode
    try {
      const rawAccs = localStorage.getItem('linmax_accounts');
      if (rawAccs) {
        const parsed = JSON.parse(rawAccs) as Array<{
          id: string;
          chatCode?: string;
          name: string;
          avatar: string;
          bio: string;
        }>;
        if (Array.isArray(parsed)) {
          const synced = parsed.map((a) =>
            a.id === nextUser.id ||
            a.chatCode?.toUpperCase() === oldChatCode.toUpperCase()
              ? {
                  ...a,
                  name: nextUser.name,
                  avatar: nextUser.avatar,
                  bio: nextUser.bio,
                  chatCode: nextUser.chatCode,
                }
              : a
          );
          localStorage.setItem('linmax_accounts', JSON.stringify(synced));
        }
      }
    } catch {
      // ignore
    }

    if (newName && newName !== oldName) {
      setChats((prev) =>
        prev.map((c) => ({
          ...c,
          president: c.president === oldName ? newName : c.president,
          admins: c.admins?.map((a) => (a === oldName ? newName : a)),
          members: c.members?.map((m) => (m === oldName ? newName : m)),
        }))
      );
    }

    if (
      (newName && newName !== oldName) ||
      updated.avatar ||
      (newChatCode && newChatCode !== oldChatCode)
    ) {
      setStories((prev) =>
        prev.map((s) =>
          s.userId === currentUser.id
            ? {
                ...s,
                userName: nextUser.name,
                userAvatar: nextUser.avatar,
                userChatCode: nextUser.chatCode,
              }
            : s
        )
      );
    }
  };

  // Channels Handlers
  const handleToggleChannelFollow = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId ? { ...ch, isFollowing: !ch.isFollowing } : ch
      )
    );
  };

  const handleCreateChannel = (newChannel: Channel) => {
    setChannels((prev) => [newChannel, ...prev]);
  };

  const handleAddChannelPost = (
    channelId: string,
    text: string,
    imageUrl?: string
  ) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === channelId
          ? {
              ...ch,
              posts: [
                ...ch.posts,
                {
                  id: `cp_${Date.now()}`,
                  text,
                  timestamp: 'Just now',
                  views: '1',
                  image: imageUrl,
                  reactionsCount: 1,
                },
              ],
            }
          : ch
      )
    );
    soundEngine.playMessageSent();
  };

  const handleCreateGroup = (newGroup: Chat, scheduledElection?: GroupElection) => {
    setChats((prev) => [newGroup, ...prev]);
    setActiveChatId(newGroup.id);
    setActiveTab('chats');
    setMobileShowChat(true);

    const initialMsgs: Message[] = [
      {
        id: `msg_init_${Date.now()}`,
        chatId: newGroup.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: `${currentUser.name} established the group "${newGroup.name}" with inaugural King ${newGroup.president || currentUser.name}.`,
        timestamp: 'Just now',
        status: 'read',
      },
    ];

    if (scheduledElection) {
      initialMsgs.push({
        id: `msg_elec_init_${Date.now()}`,
        chatId: newGroup.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: `🗳️ Democratic Election Notice: Vote for the next Group King 👑`,
        timestamp: 'Just now',
        status: 'read',
        postType: 'election',
        election: scheduledElection,
      });
    }

    setMessages((prev) => ({
      ...prev,
      [newGroup.id]: initialMsgs,
    }));

    soundEngine.playMessageSent();
  };

  const handleVoteElection = (messageId: string, candidateId: string) => {
    if (!activeChat) return;

    soundEngine.playMessageSent();

    setMessages((prev) => {
      const chatMsgs = prev[activeChat.id] || [];
      let leadingCandidateName: string | null = null;
      let maxVotes = -1;

      const updatedMsgs = chatMsgs.map((m) => {
        if (m.id === messageId && m.election) {
          const updatedCandidates = m.election.candidates.map((cand) => {
            const alreadyVotedThis = cand.voters?.includes(currentUser.name);
            if (cand.id === candidateId) {
              const newVoters = alreadyVotedThis 
                ? cand.voters 
                : [...(cand.voters || []), currentUser.name];
              const newVotes = alreadyVotedThis ? cand.votes : (cand.votes || 0) + 1;
              if (newVotes > maxVotes) {
                maxVotes = newVotes;
                leadingCandidateName = cand.name;
              }
              return { ...cand, votes: newVotes, voters: newVoters };
            } else {
              // Clear vote from others if changing selection
              const filteredVoters = (cand.voters || []).filter((v) => v !== currentUser.name);
              const votes = filteredVoters.length;
              if (votes > maxVotes) {
                maxVotes = votes;
                leadingCandidateName = cand.name;
              }
              return { ...cand, votes, voters: filteredVoters };
            }
          });

          return {
            ...m,
            election: {
              ...m.election,
              candidates: updatedCandidates,
            },
          };
        }
        return m;
      });

      // Update Group King / President dynamically if leader emerges
      if (leadingCandidateName) {
        setChats((chatsPrev) =>
          chatsPrev.map((c) =>
            c.id === activeChat.id ? { ...c, president: leadingCandidateName! } : c
          )
        );
      }

      return {
        ...prev,
        [activeChat.id]: updatedMsgs,
      };
    });
  };

  const handleRsvpEvent = (messageId: string, status: 'attending' | 'declined') => {
    if (!activeChat) return;

    soundEngine.playMessageSent();

    setMessages((prev) => {
      const chatMsgs = prev[activeChat.id] || [];
      return {
        ...prev,
        [activeChat.id]: chatMsgs.map((m) => {
          if (m.id === messageId && m.event) {
            const currentAttendees = m.event.attendees || [];
            const newAttendees =
              status === 'attending'
                ? currentAttendees.includes(currentUser.name)
                  ? currentAttendees
                  : [...currentAttendees, currentUser.name]
                : currentAttendees.filter((name) => name !== currentUser.name);

            return {
              ...m,
              event: {
                ...m.event,
                attendees: newAttendees,
              },
            };
          }
          return m;
        }),
      };
    });
  };

  const handlePostElection = (election: GroupElection) => {
    if (!activeChat) return;

    const newMsg: Message = {
      id: `msg_elec_${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `🗳️ Scheduled Election: ${election.title}`,
      timestamp: 'Just now',
      status: 'sent',
      postType: 'election',
      election,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              election,
              lastMessage: `🗳️ Election scheduled: ${election.title}`,
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    soundEngine.playMessageSent();
    if (settings.notifications.groupNotifications) {
      triggerNotification(
        `${activeChat.name} · Election`,
        `King election scheduled: ${election.title}`,
        { chatId: activeChat.id, tag: `linmax-elec-${activeChat.id}` }
      );
    }
  };

  const handlePostEvent = (event: GroupEvent) => {
    if (!activeChat) return;

    const newMsg: Message = {
      id: `msg_ev_${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `📅 Group Event: ${event.title}`,
      timestamp: 'Just now',
      status: 'sent',
      postType: 'event',
      event,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: `📅 Meetup: ${event.title}`,
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    soundEngine.playMessageSent();
  };

  const handlePostAnnouncement = (title: string, text: string) => {
    if (!activeChat) return;

    const newMsg: Message = {
      id: `msg_dec_${Date.now()}`,
      chatId: activeChat.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `${title}: ${text}`,
      timestamp: 'Just now',
      status: 'sent',
      postType: 'announcement',
    };

    setMessages((prev) => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: `👑 Royal Decree: ${title}`,
              lastMessageTime: 'Just now',
            }
          : c
      )
    );

    soundEngine.playMessageSent();
    if (settings.notifications.groupNotifications) {
      triggerNotification(
        `${activeChat.name} · Royal Decree`,
        `${title}: ${text}`,
        { chatId: activeChat.id, tag: `linmax-decree-${activeChat.id}` }
      );
    }
  };

  const handleAddContactAndOpenChat = (newContact: Chat) => {
    const normCode = newContact.chatCode?.trim().toUpperCase();
    const existing = chats.find(
      (c) =>
        c.id === newContact.id ||
        (normCode && c.type === 'direct' && c.chatCode?.toUpperCase() === normCode)
    );
    const targetId = existing ? existing.id : newContact.id;

    setChats((prev) => {
      const idx = prev.findIndex(
        (c) =>
          c.id === targetId ||
          (normCode && c.type === 'direct' && c.chatCode?.toUpperCase() === normCode)
      );
      if (idx >= 0) {
        return deduplicateChats(
          prev.map((c, i) =>
            i === idx
              ? { ...c, name: newContact.name, avatar: newContact.avatar || c.avatar }
              : c
          )
        );
      }
      return deduplicateChats([newContact, ...prev]);
    });
    setActiveChatId(targetId);
    setActiveTab('chats');
    setMobileShowChat(true);
  };

  const handleTogglePinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;
    setMessages((prev) => {
      const chatMsgs = prev[activeChat.id] || [];
      return {
        ...prev,
        [activeChat.id]: chatMsgs.map((m) => {
          if (m.id === messageId) {
            const currentReactions = m.reactions || {};
            const count = (currentReactions[emoji] || 0) + 1;
            return {
              ...m,
              reactions: {
                ...currentReactions,
                [emoji]: count,
              },
            };
          }
          return m;
        }),
      };
    });
  };

  // Group Member Management (Post-Formation Add / Remove / Admin / King / Avatar)
  const handleAddGroupMembers = (chatId: string, memberNames: string[]) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const existing = c.members || ['Senate Agaba'];
        const added = memberNames.filter(
          (name) => !existing.some((m) => m.toLowerCase() === name.toLowerCase())
        );
        const updatedMembers = [...existing, ...added];
        return {
          ...c,
          members: updatedMembers,
          membersCount: Math.max((c.membersCount || existing.length) + added.length, updatedMembers.length),
          lastMessage: `${currentUser.name} added ${added.join(', ')}`,
          lastMessageTime: 'Just now',
        };
      })
    );

    const sysMsg: Message = {
      id: `msg_add_${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `👥 ${currentUser.name} added ${memberNames.join(', ')} to the group.`,
      timestamp: 'Just now',
      status: 'read',
    };
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
    soundEngine.playMessageSent();
  };

  const handleRemoveGroupMember = (chatId: string, memberName: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const existing = c.members || ['Senate Agaba'];
        const updatedMembers = existing.filter((m) => m !== memberName);
        const updatedAdmins = (c.admins || []).filter((a) => a !== memberName);
        return {
          ...c,
          members: updatedMembers,
          admins: updatedAdmins,
          membersCount: Math.max(1, (c.membersCount || existing.length) - 1),
          lastMessage: `${currentUser.name} removed ${memberName}`,
          lastMessageTime: 'Just now',
        };
      })
    );

    const sysMsg: Message = {
      id: `msg_rem_${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `🚪 ${currentUser.name} removed ${memberName} from the group.`,
      timestamp: 'Just now',
      status: 'read',
    };
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  const handleUpdateGroupAvatar = (chatId: string, avatarUrl: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, avatar: avatarUrl } : c))
    );
    soundEngine.playMessageSent();
  };

  const handleToggleGroupAdmin = (chatId: string, memberName: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const admins = c.admins || [c.president || currentUser.name];
        const isAlreadyAdmin = admins.includes(memberName);
        return {
          ...c,
          admins: isAlreadyAdmin
            ? admins.filter((a) => a !== memberName)
            : [...admins, memberName],
        };
      })
    );
  };

  const handleSetGroupKing = (chatId: string, memberName: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const admins = c.admins || [];
        return {
          ...c,
          president: memberName,
          admins: admins.includes(memberName) ? admins : [...admins, memberName],
          lastMessage: `👑 ${memberName} was crowned Group King!`,
          lastMessageTime: 'Just now',
        };
      })
    );
    const sysMsg: Message = {
      id: `msg_king_${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: `👑 Royal Proclamation: ${memberName} is now the Group King!`,
      timestamp: 'Just now',
      status: 'read',
    };
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), sysMsg],
    }));
  };

  const handleClearChat = () => {
    if (!activeChat) return;
    if (window.confirm('Are you sure you want to clear conversation history?')) {
      setMessages((prev) => ({
        ...prev,
        [activeChat.id]: [],
      }));
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id ? { ...c, lastMessage: 'Chat cleared' } : c
        )
      );
    }
  };

  const handleClearAllChats = () => {
    setMessages({});
    setChats((prev) =>
      prev.map((c) => ({
        ...c,
        lastMessage: 'Chat cleared',
        unreadCount: 0,
        lastMessageFromMe: false,
      }))
    );
  };

  const handleResetWorkspace = () => {
    localStorage.removeItem('linmax_chats');
    localStorage.removeItem('linmax_messages');
    localStorage.removeItem('linmax_stories');
    localStorage.removeItem('linmax_call_logs');
    localStorage.removeItem('linmax_channels');
    localStorage.removeItem('linmax_settings');
    setChats(initialChats);
    setMessages(initialMessages);
    setStories(initialStories);
    setCallLogs(initialCallLogs);
    setChannels(initialChannels);
    setSettings(defaultSettings);
    setActiveChatId(initialChats[0].id);
  };

  // If not logged in, show Auth
  if (!isAuthenticated) {
    return (
      <AuthView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // App Lock Screen if enabled in Privacy Settings
  if (isAppLocked && settings.privacy.appLockEnabled && settings.privacy.appLockPin) {
    return (
      <div className="h-screen w-screen bg-[#03090D] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl bg-[#07151B] border border-[#00E5D4]/30 p-6 shadow-[0_0_40px_rgba(0,229,212,0.18)] flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00E5D4]/15 border border-[#00E5D4]/35 flex items-center justify-center text-[#00E5D4]">
            <Lock size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display">Linmax Locked</h2>
            <p className="text-xs text-[#A8BBC2] mt-1">
              Enter your App Lock PIN for {currentUser.name} ({currentUser.chatCode})
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (lockPinEntry === settings.privacy.appLockPin) {
                setIsAppLocked(false);
                setLockPinEntry('');
                setLockPinError(false);
              } else {
                setLockPinError(true);
              }
            }}
            className="w-full flex flex-col gap-3"
          >
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={lockPinEntry}
              onChange={(e) => {
                setLockPinEntry(e.target.value.replace(/\D/g, ''));
                setLockPinError(false);
              }}
              placeholder="Enter PIN..."
              autoFocus
              className="w-full text-center tracking-[0.5em] text-lg font-mono bg-[#03090D] border border-[#00E5D4]/30 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-[#00E5D4]"
            />
            {lockPinError && (
              <p className="text-xs text-[#F33248] font-medium">
                Incorrect PIN. Please try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Unlock Linmax</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#03090D] text-white">
      <OfflineIndicator />

      {/* Non-blocking In-App Notification Banner (Clickable to jump right to conversation) */}
      {notificationToast && (
        <div
          onClick={() => {
            if (notificationToast.chatId) {
              const target = chats.find((c) => c.id === notificationToast.chatId);
              if (target) handleSelectChat(target);
            }
            setNotificationToast(null);
          }}
          className="fixed top-4 right-4 z-50 max-w-xs sm:max-w-sm bg-[#07151B]/95 backdrop-blur-xl border border-[#00E5D4]/45 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(0,229,212,0.3)] flex items-start gap-3 cursor-pointer animate-in fade-in"
        >
          {notificationToast.avatar ? (
            <img
              src={notificationToast.avatar}
              alt={notificationToast.title}
              className="w-10 h-10 rounded-full object-cover border border-[#00E5D4]/40 shrink-0"
            />
          ) : (
            <div className="p-2 rounded-xl bg-[#00E5D4]/15 text-[#00E5D4] shrink-0">
              <Bell size={16} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-white truncate font-display">
                {notificationToast.title}
              </div>
              <span className="text-[9px] font-semibold text-[#00E5D4] shrink-0">now</span>
            </div>
            <div className="text-[11px] text-[#A8BBC2] line-clamp-2 mt-0.5">
              {notificationToast.body}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNotificationToast(null);
            }}
            className="text-[#A8BBC2] hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. LEFT COLUMN: Linmax Sidebar Navigation */}
      <div className="hidden md:block shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileShowChat(false);
          }}
          currentUser={currentUser}
          unreadMessagesCount={totalUnreadMessages}
          unreadCallsCount={totalUnreadCalls}
        />
      </div>

      {/* 2. MIDDLE & RIGHT COLUMNS (Responsive Phone / Tablet / Desktop Orchestration) */}
      <main className="flex-1 min-w-0 flex overflow-hidden relative">
        {/* VIEW ROUTING */}
        {activeTab === 'chats' && (
          <div className="flex-1 min-w-0 flex h-full overflow-hidden">
            {/* Middle Column: ChatList (visible on mobile when no chat opened, always on tablet/desktop) */}
            <div
              className={`w-full md:w-72 lg:w-88 xl:w-96 h-full flex flex-col shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                chatThemeId={settings.chats.chatThemeId}
                chatsSettings={settings.chats}
                onSelectChat={handleSelectChat}
                onOpenAddContact={() => setShowAddContactModal(true)}
                onOpenNewChat={() => setShowAddContactModal(true)}
                onOpenCreateGroup={() => setShowCreateGroupModal(true)}
                onOpenSearchModal={() => setShowSearchModal(true)}
                onSelectTheme={(themeId) =>
                  setSettings((prev) => ({
                    ...prev,
                    chats: { ...prev.chats, chatThemeId: themeId },
                  }))
                }
                onSelectHomeTheme={(homeThemeId) =>
                  setSettings((prev) => ({
                    ...prev,
                    chats: { ...prev.chats, homeThemeId },
                  }))
                }
                onOpenUnlockLiveTheme={(themeId, target) => {
                  setPendingLiveThemeCheckout({ themeId, target });
                  setSettingsSection('chats');
                  setActiveTab('settings');
                }}
                onUploadCustomTheme={(themeUrl, themeName, isLight) =>
                  setSettings((prev) => ({
                    ...prev,
                    chats: {
                      ...prev.chats,
                      chatThemeId: 'custom_uploaded_theme',
                      customThemeUrl: themeUrl,
                      customThemeName: themeName,
                      customThemeIsLight: isLight,
                      chatAreaUseThemeBg: true,
                    },
                  }))
                }
                onOpenThemeSettings={() => {
                  setSettingsSection('chats');
                  setActiveTab('settings');
                }}
                readReceiptsEnabled={settings.privacy.readReceipts}
                blockedChatIds={settings.privacy.blockedChatIds}
              />
            </div>

            {/* Right Column: ChatWindow (visible on mobile when chat selected, always on tablet/desktop) */}
            <div
              className={`flex-1 min-w-0 h-full flex flex-col ${
                !mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              {activeChat ? (
                <ChatWindow
                  chat={activeChat}
                  messages={activeChatMessages}
                  currentUser={currentUser}
                  settings={settings}
                  availableContacts={chats}
                  customStickers={customStickers}
                  onCreateCustomSticker={(st) => setCustomStickers((prev) => [st, ...prev])}
                  onDeleteCustomSticker={(id) =>
                    setCustomStickers((prev) => prev.filter((s) => s.id !== id))
                  }
                  onSendMessage={handleSendMessage}
                  onStartCall={handleStartCall}
                  onBack={() => setMobileShowChat(false)}
                  onTogglePinChat={handleTogglePinChat}
                  onReaction={handleReaction}
                  onClearChat={handleClearChat}
                  onVoteElection={handleVoteElection}
                  onRsvpEvent={handleRsvpEvent}
                  onPostElection={handlePostElection}
                  onPostEvent={handlePostEvent}
                  onPostAnnouncement={handlePostAnnouncement}
                  onAddGroupMembers={handleAddGroupMembers}
                  onRemoveGroupMember={handleRemoveGroupMember}
                  onUpdateGroupAvatar={handleUpdateGroupAvatar}
                  onToggleGroupAdmin={handleToggleGroupAdmin}
                  onSetGroupKing={handleSetGroupKing}
                  onOpenWallpaperSettings={() => {
                    setSettingsSection('chats');
                    setActiveTab('settings');
                  }}
                  onUnblockContact={(chatId) =>
                    setSettings((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        blockedChatIds: prev.privacy.blockedChatIds.filter((id) => id !== chatId),
                      },
                    }))
                  }
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#A8BBC2]">
                  <p>Select a conversation or start a new chat</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linmax Calls View */}
        {activeTab === 'calls' && (
          <CallsView
            callLogs={callLogs}
            contacts={chats.filter((c) => c.type === 'direct')}
            onStartCall={handleStartCall}
            onJoinMeeting={(code) => {
              handleStartCall(
                { name: `Linmax Room ${code}`, avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', chatCode: code },
                'video'
              );
            }}
          />
        )}

        {/* Linmax Groups View */}
        {activeTab === 'groups' && (
          <GroupsView
            groups={chats.filter((c) => c.type === 'group')}
            currentUser={currentUser}
            availableContacts={chats.filter((c) => c.type === 'direct')}
            onSelectGroup={handleSelectChat}
            onCreateGroup={handleCreateGroup}
          />
        )}

        {/* Linmax Channels View */}
        {activeTab === 'channels' && (
          <ChannelsView
            channels={channels}
            currentUser={currentUser}
            onToggleFollow={handleToggleChannelFollow}
            onCreateChannel={handleCreateChannel}
            onAddChannelPost={handleAddChannelPost}
          />
        )}

        {/* Linmax Stories Dedicated View */}
        {activeTab === 'stories' && (
          <StoriesView
            stories={stories}
            sponsoredCampaigns={eligibleSponsoredCampaigns}
            currentUser={currentUser}
            onOpenAddStory={() => setShowAddStoryModal(true)}
            onOpenAdvertise={() => setActiveTab('advertise')}
            onSelectStoryFullscreen={(storyId) => setViewingStoryId(storyId)}
            onSendReply={handleSendStoryReply}
            onDeleteStory={handleDeleteStory}
            onHideAd={handleHideAd}
          />
        )}

        {/* Sponsored Stories & Advertiser Studio (No Linmax Pro) */}
        {activeTab === 'advertise' && (
          <SponsoredStoriesStudio
            currentUser={currentUser}
            campaigns={adCampaigns}
            priceRules={adPriceRules}
            paymentEvents={adPaymentEvents}
            reviewRecords={adReviewRecords}
            adReports={adReports}
            onCreatePaidCampaign={handleCreatePaidCampaign}
            onResubmitCampaign={handleResubmitCampaign}
            onTogglePauseCampaign={handleTogglePauseCampaign}
            onModerateCampaign={handleModerateCampaign}
            onUpdatePriceRules={setAdPriceRules}
            onResolveReport={(reportId) =>
              setAdReports((prev) =>
                prev.map((r) => (r.id === reportId ? { ...r, status: 'reviewed' } : r))
              )
            }
            onOpenStoriesFeed={(campaignId) => {
              setActiveTab('stories');
              if (campaignId) setViewingStoryId(`ad:${campaignId}`);
            }}
          />
        )}

        {/* Linmax User Profile View */}
        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onOpenSettings={(section) => {
              if (section) setSettingsSection(section);
              setActiveTab('settings');
            }}
            onOpenAdvertise={() => setActiveTab('advertise')}
            onLogout={() => {
              setIsAuthenticated(false);
              localStorage.removeItem('linmax_auth');
            }}
          />
        )}

        {/* WhatsApp-Style Settings & Wallpapers View */}
        {activeTab === 'settings' && (
          <SettingsView
            key={settingsSection}
            currentUser={currentUser}
            settings={settings}
            chats={chats}
            messages={messages}
            initialSection={settingsSection}
            initialLiveThemeCheckout={pendingLiveThemeCheckout}
            onClearInitialLiveThemeCheckout={() => setPendingLiveThemeCheckout(null)}
            onUpdateSettings={(updater) => setSettings((prev) => updater(prev))}
            onUpdateUser={handleUpdateUser}
            onClearAllChats={handleClearAllChats}
            onResetWorkspace={handleResetWorkspace}
            onSimulateIncomingMessage={handleSimulateIncomingMessage}
            onLogout={() => {
              setIsAuthenticated(false);
              localStorage.removeItem('linmax_auth');
            }}
          />
        )}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION (Channels replaces center +) */}
      {!mobileShowChat && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileShowChat(false);
          }}
          unreadCount={totalUnreadMessages}
        />
      )}

      {/* 4. MODALS */}
      {/* Full-Screen Stories Viewer (Organic + Frequency-Capped Sponsored Stories) */}
      {viewingStoryId && (
        <StoryViewer
          stories={stories}
          sponsoredCampaigns={eligibleSponsoredCampaigns}
          frequencyCapOrganic={adPriceRules.frequencyCapOrganicStories}
          initialStoryId={viewingStoryId}
          currentUserId={currentUser.id}
          onClose={() => setViewingStoryId(null)}
          onSendReply={handleSendStoryReply}
          onDeleteStory={handleDeleteStory}
          onMarkStoryViewed={handleMarkStoryViewed}
          onTrackAdImpression={handleTrackAdImpression}
          onTrackAdCompletion={handleTrackAdCompletion}
          onTrackAdCtaClick={handleTrackAdCtaClick}
          onHideAd={handleHideAd}
          onReportAd={handleReportAd}
        />
      )}

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <AddStoryModal
          currentUser={currentUser}
          onClose={() => setShowAddStoryModal(false)}
          onAddStory={handleAddStory}
        />
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <AddContactModal
          currentUser={currentUser}
          existingChats={chats}
          onClose={() => setShowAddContactModal(false)}
          onAddContactAndOpenChat={handleAddContactAndOpenChat}
        />
      )}

      {/* WhatsApp-Style 2-Step Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          currentUser={currentUser}
          availableContacts={chats.filter((c) => c.type === 'direct')}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {/* Active Call Modal (Incoming, Outgoing, Active Voice/Video) */}
      {activeCall && (
        <CallModal
          call={activeCall}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onEnd={handleEndCall}
        />
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        chats={chats}
        messages={messages}
        stories={stories}
        channels={channels}
        onSelectChat={handleSelectChat}
        onSelectStory={(storyId) => {
          setActiveTab('stories');
          setViewingStoryId(storyId);
        }}
        onSelectChannel={() => setActiveTab('channels')}
      />
    </div>
  );
}
