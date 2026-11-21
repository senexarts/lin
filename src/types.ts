export interface CurrentUser {
  id: string;
  name: string;
  chatCode: string;
  avatar: string;
  bio: string;
  email: string;
  isOnline: boolean;
  status: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userChatCode?: string;
  mediaType: 'image' | 'video' | 'text';
  mediaUrl?: string;
  text?: string;
  bgGradient?: string;
  caption?: string;
  timestamp: string;
  isViewed: boolean;
  viewsCount: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface CustomSticker {
  id: string;
  name: string;
  imageUrl?: string;
  emoji?: string;
  captionText?: string;
  borderStyle: 'white-diecut' | 'cyan-glow' | 'gold-crown' | 'none';
  shape: 'circle' | 'rounded' | 'square';
  animationClass: string;
  bgColor?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker';
  stickerId?: string;
  customSticker?: CustomSticker;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  audioDuration?: string;
  reactions?: Record<string, number>;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isPinned?: boolean;
  postType?: 'standard' | 'election' | 'event' | 'announcement';
  election?: GroupElection;
  electionData?: GroupElection;
  event?: GroupEvent;
  eventData?: GroupEvent;
}

export interface ElectionCandidate {
  id: string;
  name: string;
  avatar?: string;
  votes: number;
  voters: string[];
}

export interface GroupElection {
  id: string;
  title: string;
  role: 'president' | 'king';
  electionDate: string;
  description: string;
  status: 'scheduled' | 'voting' | 'concluded';
  candidates: ElectionCandidate[];
  winnerName?: string;
  winnerAvatar?: string;
}

export interface GroupEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  attendees: string[];
}

export interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name: string;
  chatCode?: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageStatus?: 'sent' | 'delivered' | 'read';
  lastMessageFromMe?: boolean;
  unreadCount: number;
  isOnline?: boolean;
  isVerified?: boolean;
  membersCount?: number;
  members?: string[];
  president?: string;
  presidentAvatar?: string;
  admins?: string[];
  election?: GroupElection;
  isPinned?: boolean;
  description?: string;
}

export interface CallLog {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactChatCode: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: string;
  duration?: string;
  date: string;
}

export interface UpdatePost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorChatCode: string;
  isVerified?: boolean;
  timestamp: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  replies: number;
  shares: number;
  userLiked?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  subscribers: string;
  isFollowing: boolean;
  description: string;
  category: string;
  posts: {
    id: string;
    title?: string;
    text: string;
    timestamp: string;
    views: string;
    image?: string;
    reactionsCount?: number;
  }[];
}

export interface LinmaxSettings {
  account: {
    securityNotifications: boolean;
    twoStepEnabled: boolean;
    twoStepPin: string;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    about: 'everyone' | 'contacts' | 'nobody';
    statusShare: 'contacts' | 'except' | 'only';
    readReceipts: boolean;
    defaultMessageTimer: 'off' | '24h' | '7d' | '90d';
    blockedChatIds: string[];
    appLockEnabled?: boolean;
    appLockPin?: string;
    blockScreenshots?: boolean;
    groupAddPermission?: 'everyone' | 'contacts';
  };
  chats: {
    homeThemeId?: string;
    chatThemeId?: string;
    unlockedLiveThemeIds?: string[];
    customThemeUrl?: string;
    customThemeName?: string;
    customThemeIsLight?: boolean;
    customThemeAccent?: string;
    chatAreaUseThemeBg?: boolean;
    fontFamily?: 'jakarta' | 'outfit' | 'poppins' | 'rounded' | 'serif' | 'mono';
    bubbleStyle?: 'classic' | 'pill' | 'modern';
    compactList?: boolean;
    wallpaperId: string;
    customWallpaperUrl?: string;
    wallpaperDimming: number;
    enterIsSend: boolean;
    mediaVisibility: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  notifications: {
    conversationTones: boolean;
    messageTone:
      | 'Cyber Chime'
      | 'Crystal Ping'
      | 'Aurora Bell'
      | 'Pop Bubble'
      | 'Neon Pluck'
      | 'Custom Tone'
      | 'Silent';
    customMessageToneUrl?: string;
    customMessageToneName?: string;
    groupNotifications: boolean;
    callRingtone:
      | 'Linmax Pulse'
      | 'Quantum Ring'
      | 'Afrobeat Groove'
      | 'Cyberpunk Synth'
      | 'Marimba Tropics'
      | 'Royal Fanfare'
      | 'Midnight Lo-Fi'
      | 'Classic'
      | 'Custom Ringtone';
    customRingtoneUrl?: string;
    customRingtoneName?: string;
    highPriority: boolean;
    vibrate?: boolean;
    showPreviews?: boolean;
    tabBadge?: boolean;
  };
  storage: {
    autoDownloadPhotos: boolean;
    autoDownloadVideos?: boolean;
    autoDownloadAudio: boolean;
    autoDownloadDocs: boolean;
    uploadQuality: 'auto' | 'best' | 'saver';
    lowDataCalls?: boolean;
  };
}

export type ActiveNavTab =
  | 'home'
  | 'chats'
  | 'stories'
  | 'advertise'
  | 'groups'
  | 'channels'
  | 'calls'
  | 'profile'
  | 'settings';

export type AdPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'reversed';
export type AdApprovalStatus = 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
export type AdDeliveryStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'terminated';

export type AdAudienceType = 'all_users' | 'location' | 'specific_codes';
export type AdPaymentProvider = 'mtn_momo' | 'airtel_money' | 'flutterwave_card' | 'pesapal' | 'marzpay';

export type AdCategory =
  | 'Entertainment & Events'
  | 'Concerts & Nightlife'
  | 'Food & Dining'
  | 'Retail & Fashion'
  | 'Education & Campus'
  | 'Community & Faith'
  | 'Tech & Business';

export type AdCtaLabel =
  | 'Learn More'
  | 'Buy Tickets'
  | 'Book Now'
  | 'Register'
  | 'Contact Us'
  | 'WhatsApp Us'
  | 'Visit Website';

export interface SponsoredStoryCampaign {
  id: string;
  advertiserUserId: string;
  advertiserName: string;
  advertiserAvatar: string;
  advertiserContact: string;
  title: string;
  category: AdCategory;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  bgGradient?: string;
  ctaLabel: AdCtaLabel;
  destinationUrl: string;
  eventDate?: string;
  venue?: string;
  targetType: AdAudienceType;
  targetLocation?: string;
  targetUserCodes?: string[];
  durationHours: 24 | 48 | 72;
  basePriceUgx: number;
  feeUgx: number;
  amountPaidUgx: number;
  currency: 'UGX';
  paymentProvider?: AdPaymentProvider;
  paymentAccount?: string;
  paymentReference: string;
  paymentStatus: AdPaymentStatus;
  approvalStatus: AdApprovalStatus;
  deliveryStatus: AdDeliveryStatus;
  rejectionReason?: string;
  moderationNotes?: string;
  createdAt: number;
  startsAt?: number;
  expiresAt?: number;
  impressions: number;
  uniqueViewerIds: string[];
  storyCompletions: number;
  videoViews: number;
  ctaClicks: number;
}

export interface AdPriceRules {
  currency: 'UGX';
  allUsers24hUgx: number;
  location24hUgx: number;
  specificCodes24hUgx: number;
  duration48hMultiplier: number;
  duration72hMultiplier: number;
  platformFeePercent: number;
  frequencyCapOrganicStories: number;
  maxTargetCodesPerCampaign: number;
  updatedAt: number;
}

export interface AdPaymentEvent {
  id: string;
  campaignId: string;
  campaignTitle: string;
  provider: AdPaymentProvider;
  reference: string;
  eventType: 'checkout_verified' | 'refund_issued' | 'payment_failed';
  amountUgx: number;
  currency: 'UGX';
  accountMasked: string;
  createdAt: number;
}

export interface AdReviewRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  decision: AdApprovalStatus | 'paused' | 'resumed' | 'terminated';
  adminName: string;
  reason?: string;
  notes?: string;
  createdAt: number;
}

export interface AdReportRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  reporterUserId: string;
  reason: 'Misleading or Scam' | 'Repetitive / Too Frequent' | 'Inappropriate Content' | 'Broken Destination Link';
  details?: string;
  status: 'open' | 'reviewed';
  createdAt: number;
}


