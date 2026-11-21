import React, { useMemo, useState } from 'react';
import {
  KeyRound,
  Lock,
  MessageSquare,
  Bell,
  Database,
  HelpCircle,
  Search,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Upload,
  UserX,
  Trash2,
  LogOut,
  ArrowLeft,
  Volume2,
  Image as ImageIcon,
  Sliders,
  Eye,
  Clock,
  CheckCircle2,
  RotateCcw,
  Edit3,
  BellRing,
  X,
  CreditCard,
  Wallet,
  Smartphone,
  BadgeCheck,
  Copy,
  AlertCircle,
  Crown,
  Palette,
  Music,
  Play,
  Square,
  Download,
  Type,
  Shield,
} from 'lucide-react';
import { Chat, CurrentUser, LinmaxSettings, Message } from '../../types';
import { CHAT_WALLPAPERS, getWallpaperStyle } from '../../data/wallpapers';
import {
  ChatThemeConfig,
  HOME_THEMES,
  CHAT_AREA_THEMES,
  LIVE_THEMES,
  LINMAX_FONT_OPTIONS,
  resolveHomeTheme,
  resolveChatAreaTheme,
  isLiveThemeUnlocked,
} from '../../data/chatThemes';
import { LiveThemeBackdrop } from '../chat/LiveThemeBackdrop';
import { LINMAX_KNOWN_DIRECTORY } from '../../data/directory';
import {
  readImageFileAsDataUrl,
  detectImageIsLight,
  readAudioFileAsDataUrl,
  formatFileSize,
} from '../../utils/imageUpload';
import { RINGTONE_CATALOG, MESSAGE_TONE_CATALOG, soundEngine } from '../../utils/audio';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendLinmaxNotification,
  triggerNotificationVibration,
} from '../../utils/notifications';

interface OwnedVanityCode {
  code: string;
  purchasedAt: string;
  amountUsd: number;
  paymentMethod: 'card' | 'mobile_money' | 'paypal';
  receiptId: string;
}

const OWNED_CODES_KEY = 'linmax_owned_codes';
const RESERVED_HANDLES = new Set([
  'ADMIN',
  'OFFICIAL',
  'SUPPORT',
  'LINMAX',
  'SYSTEM',
  'SECURITY',
  'ROOT',
  'HELP',
]);

function sanitizeVanityHandle(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/^\+?LM-?/i, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 16);
}

function loadOwnedCodes(): OwnedVanityCode[] {
  try {
    const raw = localStorage.getItem(OWNED_CODES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export type SettingsSectionId =
  | 'account'
  | 'privacy'
  | 'chats'
  | 'notifications'
  | 'storage'
  | 'help';

interface SettingsViewProps {
  currentUser: CurrentUser;
  settings: LinmaxSettings;
  chats: Chat[];
  messages?: Record<string, Message[]>;
  initialSection?: SettingsSectionId;
  initialLiveThemeCheckout?: { themeId: string; target: 'home' | 'chat' } | null;
  onClearInitialLiveThemeCheckout?: () => void;
  onUpdateSettings: (updater: (prev: LinmaxSettings) => LinmaxSettings) => void;
  onUpdateUser: (updated: Partial<CurrentUser>) => void;
  onClearAllChats: () => void;
  onResetWorkspace: () => void;
  onLogout: () => void;
  onSimulateIncomingMessage?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  settings,
  chats,
  messages,
  initialSection = 'chats',
  initialLiveThemeCheckout = null,
  onClearInitialLiveThemeCheckout,
  onUpdateSettings,
  onUpdateUser,
  onClearAllChats,
  onResetWorkspace,
  onLogout,
  onSimulateIncomingMessage,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>(initialSection);
  const [mobileShowDetail, setMobileShowDetail] = useState(
    initialSection === 'account' || Boolean(initialLiveThemeCheckout)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState(settings.account.twoStepPin || '');
  const [appLockPinInput, setAppLockPinInput] = useState(settings.privacy.appLockPin || '1234');
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [usernameInput, setUsernameInput] = useState(currentUser.name);
  const [bioInput, setBioInput] = useState(currentUser.bio);
  const [editingTopProfile, setEditingTopProfile] = useState(false);
  const [playingRingtonePreview, setPlayingRingtonePreview] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );
  const [insideThemeFilter, setInsideThemeFilter] = useState<'all' | 'live'>('all');
  const [homeThemeFilter, setHomeThemeFilter] = useState<'all' | 'live'>('all');
  const [liveThemeCheckout, setLiveThemeCheckout] = useState<{
    theme: ChatThemeConfig;
    target: 'home' | 'chat';
  } | null>(() => {
    if (!initialLiveThemeCheckout) return null;
    const found = CHAT_AREA_THEMES.find((t) => t.id === initialLiveThemeCheckout.themeId);
    return found ? { theme: found, target: initialLiveThemeCheckout.target } : null;
  });
  const [liveThemeReceipt, setLiveThemeReceipt] = useState<{
    theme: ChatThemeConfig;
    target: 'home' | 'chat';
    paymentMethod: 'card' | 'mobile_money' | 'paypal';
    receiptId: string;
    purchasedAt: string;
  } | null>(null);
  const [liveCheckoutError, setLiveCheckoutError] = useState<string | null>(null);
  const [isProcessingLivePayment, setIsProcessingLivePayment] = useState(false);

  // Unique +LMNAME Chat Code ($5.00 USD) Storefront State
  const [vanityHandle, setVanityHandle] = useState<string>(() => {
    const firstWord = sanitizeVanityHandle(currentUser.name.split(' ')[0] || '');
    return firstWord.length >= 2 ? firstWord : 'APPIX';
  });
  const [ownedCodes, setOwnedCodes] = useState<OwnedVanityCode[]>(() => loadOwnedCodes());
  const [checkoutCode, setCheckoutCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'paypal'>('card');
  const [cardName, setCardName] = useState(currentUser.name);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [momoProvider, setMomoProvider] = useState('MTN Mobile Money');
  const [momoPhone, setMomoPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(currentUser.email || '');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<OwnedVanityCode | null>(null);
  const [previewWallpaperId, setPreviewWallpaperId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const unlockedLiveThemeIds = settings.chats.unlockedLiveThemeIds || [];

  const openLiveThemeCheckout = (theme: ChatThemeConfig, target: 'home' | 'chat') => {
    setLiveCheckoutError(null);
    setLiveThemeReceipt(null);
    setLiveThemeCheckout({ theme, target });
  };

  const handleCompleteLiveThemePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveThemeCheckout || isProcessingLivePayment) return;
    setLiveCheckoutError(null);

    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (cardName.trim().length < 2) {
        setLiveCheckoutError('Please enter the cardholder full name.');
        return;
      }
      if (digits.length < 12) {
        setLiveCheckoutError('Please enter a valid 12–19 digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        setLiveCheckoutError('Enter expiry date in MM/YY format.');
        return;
      }
      if (cardCvc.replace(/\D/g, '').length < 3) {
        setLiveCheckoutError('Enter a valid 3 or 4 digit security CVC.');
        return;
      }
    } else if (paymentMethod === 'mobile_money') {
      if (momoPhone.replace(/\D/g, '').length < 7) {
        setLiveCheckoutError('Enter a valid mobile money phone number.');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail.includes('@') || !paypalEmail.includes('.')) {
        setLiveCheckoutError('Enter a valid PayPal account email.');
        return;
      }
    }

    const purchasedTheme = liveThemeCheckout.theme;
    const applyTarget = liveThemeCheckout.target;
    setIsProcessingLivePayment(true);
    setTimeout(() => {
      const receipt = {
        theme: purchasedTheme,
        target: applyTarget,
        paymentMethod,
        receiptId: `LM-THEME-${Math.floor(100000 + Math.random() * 900000)}`,
        purchasedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      onUpdateSettings((prev) => {
        const existing = prev.chats.unlockedLiveThemeIds || [];
        const nextUnlocked = existing.includes(purchasedTheme.id)
          ? existing
          : [...existing, purchasedTheme.id];
        return {
          ...prev,
          chats: {
            ...prev.chats,
            unlockedLiveThemeIds: nextUnlocked,
            ...(applyTarget === 'home'
              ? { homeThemeId: purchasedTheme.id }
              : { chatThemeId: purchasedTheme.id, chatAreaUseThemeBg: true }),
          },
        };
      });
      sendLinmaxNotification({
        title: 'Live Theme Unlocked ($2.00 USD)',
        body: `${purchasedTheme.name} is now unlocked and active on ${
          applyTarget === 'home' ? 'Home Place' : 'Inside Chats'
        }!`,
      });
      setIsProcessingLivePayment(false);
      setLiveThemeReceipt(receipt);
      onClearInitialLiveThemeCheckout?.();
      showToast(`${purchasedTheme.name} unlocked & applied!`);
    }, 550);
  };

  const directContacts = chats.filter((c) => c.type === 'direct');
  const blockedChats = directContacts.filter((c) =>
    settings.privacy.blockedChatIds.includes(c.id)
  );
  const unblockedChats = directContacts.filter(
    (c) => !settings.privacy.blockedChatIds.includes(c.id)
  );

  // Calculate real localStorage usage
  const storageStats = useMemo(() => {
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('linmax_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
        }
      }
    } catch {
      totalBytes = 0;
    }
    return {
      bytes: totalBytes,
      formatted: formatFileSize(totalBytes),
      percent: Math.min(100, Math.round((totalBytes / (5 * 1024 * 1024)) * 100)),
    };
  }, [chats, settings, currentUser]);

  const sections: {
    id: SettingsSectionId;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
  }[] = [
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Buy +LMNAME code ($5 USD), two-step PIN, identity',
      icon: KeyRound,
      color: 'text-[#00E5D4]',
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Block contacts, disappearing messages, read receipts',
      icon: Lock,
      color: 'text-[#00CFEF]',
    },
    {
      id: 'chats',
      title: 'Chats & Wallpaper',
      subtitle: 'Abstract pattern wallpapers, Enter is send, font size',
      icon: MessageSquare,
      color: 'text-[#20E66B]',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Message chimes, group alerts, call ringtones',
      icon: Bell,
      color: 'text-amber-400',
    },
    {
      id: 'storage',
      title: 'Storage and data',
      subtitle: 'Local storage usage, media auto-download, upload quality',
      icon: Database,
      color: 'text-[#00E5D4]',
    },
    {
      id: 'help',
      title: 'Help',
      subtitle: 'Help center, contact us, encryption & app info',
      icon: HelpCircle,
      color: 'text-[#A8BBC2]',
    },
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Real-time availability check for custom +LMNAME code (no hyphen)
  const cleanHandle = useMemo(() => sanitizeVanityHandle(vanityHandle), [vanityHandle]);
  const previewVanityCode = cleanHandle ? `+LM${cleanHandle}` : '+LM';

  const vanitySuggestions = useMemo(() => {
    const first = sanitizeVanityHandle(currentUser.name.split(' ')[0] || '');
    const raw = [
      'APPIX',
      first && first.length >= 2 ? first : 'APEX',
      first && first.length >= 2 ? `${first.slice(0, 12)}HQ` : 'LINMAXPRO',
      first && first.length >= 2 ? `${first.slice(0, 12)}26` : 'VIP26',
    ];
    return Array.from(new Set(raw));
  }, [currentUser.name]);

  const vanityStatus = useMemo(() => {
    if (cleanHandle.length < 2) {
      return {
        state: 'invalid' as const,
        message: 'Enter at least 2 letters or numbers after +LM',
      };
    }
    if (RESERVED_HANDLES.has(cleanHandle)) {
      return {
        state: 'taken' as const,
        message: `${previewVanityCode} is a reserved Linmax system handle`,
      };
    }
    if (currentUser.chatCode.toUpperCase() === previewVanityCode) {
      return {
        state: 'active' as const,
        message: `${previewVanityCode} is currently active on your account`,
      };
    }
    if (ownedCodes.some((o) => o.code.toUpperCase() === previewVanityCode)) {
      return {
        state: 'owned' as const,
        message: `You already own ${previewVanityCode} — switch anytime at no extra cost`,
      };
    }

    // Check global directory, chats, and other registered local accounts
    const takenInDirectory = LINMAX_KNOWN_DIRECTORY.some(
      (u) => u.chatCode.toUpperCase() === previewVanityCode
    );
    const takenInChats = chats.some(
      (c) => c.chatCode && c.chatCode.toUpperCase() === previewVanityCode
    );
    let takenByOtherAccount = false;
    try {
      const rawAccs = localStorage.getItem('linmax_accounts');
      if (rawAccs) {
        const parsed = JSON.parse(rawAccs) as Array<{ id: string; chatCode?: string }>;
        if (Array.isArray(parsed)) {
          takenByOtherAccount = parsed.some(
            (a) =>
              a.id !== currentUser.id &&
              a.chatCode?.toUpperCase() === previewVanityCode
          );
        }
      }
    } catch {
      // ignore
    }

    if (takenInDirectory || takenInChats || takenByOtherAccount) {
      return {
        state: 'taken' as const,
        message: `${previewVanityCode} is already claimed by another user`,
      };
    }

    return {
      state: 'available' as const,
      message: `${previewVanityCode} is available · Lifetime exclusivity for $5.00 USD`,
    };
  }, [cleanHandle, previewVanityCode, currentUser.chatCode, currentUser.id, ownedCodes, chats]);

  const handleOpenVanityCheckout = () => {
    if (vanityStatus.state === 'owned') {
      onUpdateUser({ chatCode: previewVanityCode });
      showToast(`Switched active Chat Code to ${previewVanityCode}`);
      return;
    }
    if (vanityStatus.state !== 'available') return;
    setCheckoutError(null);
    setCompletedReceipt(null);
    setCheckoutCode(previewVanityCode);
  };

  const handleCompleteVanityPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCode || isProcessingPayment) return;
    setCheckoutError(null);

    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (cardName.trim().length < 2) {
        setCheckoutError('Please enter the cardholder full name.');
        return;
      }
      if (digits.length < 12) {
        setCheckoutError('Please enter a valid 12–19 digit card number.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        setCheckoutError('Enter expiry date in MM/YY format.');
        return;
      }
      if (cardCvc.replace(/\D/g, '').length < 3) {
        setCheckoutError('Enter a valid 3 or 4 digit security CVC.');
        return;
      }
    } else if (paymentMethod === 'mobile_money') {
      if (momoPhone.replace(/\D/g, '').length < 7) {
        setCheckoutError('Enter a valid mobile money phone number.');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail.includes('@') || !paypalEmail.includes('.')) {
        setCheckoutError('Enter a valid PayPal account email.');
        return;
      }
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      const receipt: OwnedVanityCode = {
        code: checkoutCode,
        purchasedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        amountUsd: 5,
        paymentMethod,
        receiptId: `LM-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      };
      const nextOwned = [receipt, ...ownedCodes.filter((o) => o.code !== checkoutCode)];
      setOwnedCodes(nextOwned);
      try {
        localStorage.setItem(OWNED_CODES_KEY, JSON.stringify(nextOwned));
      } catch {
        // ignore
      }
      onUpdateUser({ chatCode: checkoutCode });
      sendLinmaxNotification({
        title: 'Custom Linmax Chat Code Activated',
        body: `Your unique Chat Code ${checkoutCode} ($5.00 USD) is now active!`,
      });
      setIsProcessingPayment(false);
      setCompletedReceipt(receipt);
      showToast(`Activated unique code ${checkoutCode}!`);
    }, 600);
  };

  const handleToggleBlockContact = (chatId: string) => {
    onUpdateSettings((prev) => {
      const isBlocked = prev.privacy.blockedChatIds.includes(chatId);
      return {
        ...prev,
        privacy: {
          ...prev.privacy,
          blockedChatIds: isBlocked
            ? prev.privacy.blockedChatIds.filter((id) => id !== chatId)
            : [...prev.privacy.blockedChatIds, chatId],
        },
      };
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 600, 0.85);
      onUpdateUser({ avatar: dataUrl });
      showToast('Profile photo updated from local files!');
    } catch {
      showToast('Could not read that image file.');
    }
    e.target.value = '';
  };

  const handleCustomWallpaperUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 1280, 0.82);
      onUpdateSettings((prev) => ({
        ...prev,
        chats: {
          ...prev.chats,
          wallpaperId: 'custom_uploaded',
          customWallpaperUrl: dataUrl,
        },
      }));
      showToast('Custom chat wallpaper applied!');
    } catch {
      showToast('Could not load wallpaper image.');
    }
    e.target.value = '';
  };

  const handleCustomThemeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 1280, 0.85);
      const isLight = await detectImageIsLight(dataUrl);
      const cleanName = file.name.replace(/\.[^.]+$/, '').slice(0, 24) || 'My Device Theme';
      onUpdateSettings((prev) => ({
        ...prev,
        chats: {
          ...prev.chats,
          chatThemeId: 'custom_uploaded_theme',
          customThemeUrl: dataUrl,
          customThemeName: cleanName,
          customThemeIsLight: isLight,
          chatAreaUseThemeBg: true,
        },
      }));
      showToast(`Custom theme "${cleanName}" applied inside Chat Area!`);
    } catch {
      showToast('Could not read that theme image.');
    }
    e.target.value = '';
  };

  const handleCustomRingtoneUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readAudioFileAsDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '').slice(0, 28) || 'My Ringtone';
      onUpdateSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          callRingtone: 'Custom Ringtone',
          customRingtoneUrl: url,
          customRingtoneName: cleanName,
        },
      }));
      soundEngine.previewRingtone('Custom Ringtone', url);
      setPlayingRingtonePreview('Custom Ringtone');
      showToast(`Custom ringtone "${cleanName}" uploaded & active!`);
    } catch {
      showToast('Please select a valid audio file (MP3, WAV, OGG, M4A).');
    }
    e.target.value = '';
  };

  const handleCustomMessageToneUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await readAudioFileAsDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '').slice(0, 28) || 'Custom Chime';
      onUpdateSettings((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          messageTone: 'Custom Tone',
          customMessageToneUrl: url,
          customMessageToneName: cleanName,
        },
      }));
      soundEngine.playMessageReceived('Custom Tone', url);
      showToast(`Custom notification tone "${cleanName}" applied!`);
    } catch {
      showToast('Please select a valid audio file.');
    }
    e.target.value = '';
  };

  const handleExportChatBackup = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        account: { name: currentUser.name, chatCode: currentUser.chatCode },
        chats,
        messages: messages || {},
        settings,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `linmax-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Chat backup exported (.json)!');
    } catch {
      showToast('Could not generate backup file.');
    }
  };

  return (
    <div className="flex-1 flex h-full bg-[#03090D] overflow-hidden relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4] text-xs font-semibold text-[#00E5D4] shadow-[0_0_20px_rgba(0,229,212,0.35)] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT COLUMN: WhatsApp-style Settings Menu */}
      <div
        className={`w-full md:w-72 lg:w-88 xl:w-96 border-r border-[#00E5D4]/15 bg-[#07151B] flex flex-col h-full shrink-0 pb-16 md:pb-0 ${
          mobileShowDetail ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#00E5D4]/15 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-display text-white">Settings</h1>
            <span className="text-[10px] font-mono text-[#00E5D4] bg-[#0B1B22] px-2 py-0.5 rounded-full border border-[#00E5D4]/20">
              Linmax v2.5
            </span>
          </div>

          {/* Search settings */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBC2]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
            />
          </div>
        </div>

        {/* Profile Card (WhatsApp style at top of settings list with inline username edit) */}
        <div className="p-4 border-b border-[#00E5D4]/10 flex items-center gap-3.5 bg-[#0B1B22]/40">
          <label
            className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] shrink-0 cursor-pointer group"
            title="Upload new profile picture from device"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover rounded-full bg-[#03090D]"
            />
            <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} className="text-[#00E5D4]" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
          <div className="min-w-0 flex-1">
            {editingTopProfile ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!usernameInput.trim()) return;
                  onUpdateUser({
                    name: usernameInput.trim(),
                    bio: bioInput.trim() || currentUser.bio,
                  });
                  setEditingTopProfile(false);
                  showToast('Username updated!');
                }}
                className="flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Username"
                    required
                    autoFocus
                    className="flex-1 min-w-0 bg-[#03090D] border border-[#00E5D4]/40 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 rounded-lg bg-[#00E5D4] text-[#03090D] text-[10px] font-bold cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTopProfile(false);
                      setUsernameInput(currentUser.name);
                      setBioInput(currentUser.bio);
                    }}
                    className="p-1 rounded-lg bg-[#03090D] text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Bio / status..."
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-lg px-2 py-1 text-[11px] text-[#A8BBC2] focus:outline-none focus:border-[#00E5D4]"
                />
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-white text-sm truncate">
                    {currentUser.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameInput(currentUser.name);
                      setBioInput(currentUser.bio);
                      setEditingTopProfile(true);
                    }}
                    className="p-1 rounded-lg text-[#00E5D4] hover:bg-[#0B1B22] transition-colors cursor-pointer shrink-0"
                    title="Change Username"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
                <p className="text-xs text-[#A8BBC2] truncate">{currentUser.bio}</p>
                <span className="text-[10px] font-mono text-[#00E5D4]">
                  {currentUser.chatCode}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#00E5D4]/5">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setMobileShowDetail(true);
                }}
                className={`w-full px-5 py-3.5 flex items-center gap-3.5 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1B22] border-l-2 border-[#00E5D4]'
                    : 'hover:bg-[#0B1B22]/50'
                }`}
              >
                <div className="p-2 rounded-xl bg-[#03090D] border border-[#00E5D4]/15 shrink-0">
                  <Icon size={18} className={sec.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{sec.title}</div>
                  <div className="text-[11px] text-[#A8BBC2] truncate">
                    {sec.subtitle}
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#A8BBC2] shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Bottom Install & Log Out */}
        <div className="p-4 border-t border-[#00E5D4]/15 flex flex-col gap-2 shrink-0">
          <PWAInstallButton className="w-full" />
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-[#F33248]/10 hover:bg-[#F33248]/20 border border-[#F33248]/25 text-[#F33248] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Log Out of Linmax</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Detailed Section Controls */}
      <div
        className={`flex-1 flex-col h-full bg-[#03090D] overflow-y-auto ${
          !mobileShowDetail ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Mobile Back Header */}
        <div className="px-6 py-4 border-b border-[#00E5D4]/15 bg-[#07151B]/80 backdrop-blur-md flex items-center gap-3 sticky top-0 z-10 shrink-0">
          <button
            onClick={() => setMobileShowDetail(false)}
            className="md:hidden p-1.5 rounded-lg bg-[#0B1B22] text-[#A8BBC2] hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              {sections.find((s) => s.id === activeSection)?.title}
            </h2>
            <p className="text-xs text-[#A8BBC2]">
              {sections.find((s) => s.id === activeSection)?.subtitle}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 max-w-3xl w-full mx-auto flex flex-col gap-5 pb-28 md:pb-10">
          {/* ==================== 1. CHATS & WALLPAPER ==================== */}
          {activeSection === 'chats' && (
            <>
              {/* 1. Inside Chat Themes (Conversation Area Only) */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                      <Palette size={16} className="text-[#00E5D4]" />
                      Inside Chat Themes
                    </h3>
                    <p className="text-xs text-[#A8BBC2]">
                      Applies only inside open conversations. Free static themes &amp; premium animated Live Themes ($2.00 USD).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#03090D] border border-white/10">
                      <button
                        type="button"
                        onClick={() => setInsideThemeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          insideThemeFilter === 'all'
                            ? 'bg-[#00E5D4] text-[#03090D]'
                            : 'text-[#A8BBC2] hover:text-white'
                        }`}
                      >
                        All ({CHAT_AREA_THEMES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsideThemeFilter('live')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          insideThemeFilter === 'live'
                            ? 'bg-amber-400 text-[#1C1202]'
                            : 'text-amber-300 hover:text-white'
                        }`}
                      >
                        <Sparkles size={11} />
                        <span>Live · $2 ({LIVE_THEMES.length})</span>
                      </button>
                    </div>
                    <label className="px-3 py-1.5 rounded-xl bg-[#00E5D4]/15 hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/35 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload size={13} />
                      <span>Upload Theme</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomThemeUpload}
                      />
                    </label>
                    <span className="text-[11px] font-semibold text-[#00E5D4]">
                      Active: {resolveChatAreaTheme(settings.chats).name}
                    </span>
                  </div>
                </div>

                {/* Inside Chat Area Backdrop Mode */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#03090D] border border-[#00E5D4]/15">
                  <span className="text-[11px] font-semibold text-white">Inside Chat Area Backdrop</span>
                  <div className="flex gap-1.5">
                    {[
                      { val: true, label: 'Use Theme Artwork' },
                      { val: false, label: 'Use Pattern Wallpaper' },
                    ].map((opt) => {
                      const active = (settings.chats.chatAreaUseThemeBg ?? true) === opt.val;
                      return (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => {
                            onUpdateSettings((prev) => ({
                              ...prev,
                              chats: { ...prev.chats, chatAreaUseThemeBg: opt.val },
                            }));
                          }}
                          className={`py-1.5 px-3 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#00E5D4]/20 border-[#00E5D4] text-[#00E5D4]'
                              : 'bg-[#07151B] border-white/10 text-[#A8BBC2] hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Device Theme Fine-Tuning Banner if uploaded */}
                {settings.chats.customThemeUrl && (
                  <div className="p-3 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={settings.chats.customThemeUrl}
                        alt="Custom theme"
                        className="w-10 h-10 rounded-lg object-cover border border-[#00E5D4]/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          Device Theme: {settings.chats.customThemeName || 'Custom Upload'}
                        </div>
                        <div className="text-[10px] text-[#A8BBC2]">
                          Text Contrast:{' '}
                          <span className="text-[#00E5D4] font-semibold">
                            {settings.chats.customThemeIsLight ? 'Dark Ink on Light' : 'White Ink on Dark'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: {
                              ...prev.chats,
                              chatThemeId: 'custom_uploaded_theme',
                              customThemeIsLight: !prev.chats.customThemeIsLight,
                            },
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#03090D] border border-[#00E5D4]/30 text-[10px] font-semibold text-[#00E5D4] cursor-pointer"
                      >
                        Flip Light / Dark Text
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: { ...prev.chats, chatThemeId: 'custom_uploaded_theme' },
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#00E5D4] text-[#03090D] text-[10px] font-bold cursor-pointer"
                      >
                        Activate
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {(insideThemeFilter === 'live' ? LIVE_THEMES : CHAT_AREA_THEMES).map((themeItem) => {
                    const unlocked = isLiveThemeUnlocked(themeItem, unlockedLiveThemeIds);
                    const isSelected =
                      unlocked && resolveChatAreaTheme(settings.chats).id === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          if (!unlocked) {
                            openLiveThemeCheckout(themeItem, 'chat');
                            return;
                          }
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: { ...prev.chats, chatThemeId: themeItem.id },
                          }));
                          showToast(`Inside Chat theme applied: ${themeItem.name}`);
                        }}
                        className="group flex flex-col items-center gap-2 text-left cursor-pointer focus:outline-none"
                      >
                        {/* Mini Inside-Chat Card Preview */}
                        <div
                          className={`w-full aspect-[9/15] rounded-2xl overflow-hidden border-2 relative flex flex-col p-2 transition-all duration-200 shadow-lg ${
                            isSelected
                              ? 'border-[#00E5D4] shadow-[0_0_20px_rgba(0,229,212,0.45)] scale-[1.03]'
                              : !unlocked
                              ? 'border-amber-400/45 group-hover:border-amber-300 group-hover:scale-[1.02]'
                              : 'border-white/15 group-hover:border-[#00E5D4]/55 group-hover:scale-[1.01]'
                          }`}
                          style={themeItem.panelStyle}
                        >
                          {themeItem.isLive && themeItem.liveEffect && (
                            <LiveThemeBackdrop
                              liveEffect={themeItem.liveEffect}
                              accentColor={themeItem.logoAccentColor}
                              compact
                            />
                          )}

                          {isSelected ? (
                            <span className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-[#00E5D4] text-[#03090D] flex items-center justify-center shadow">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : !unlocked ? (
                            <span className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded-md bg-amber-400 text-[#1C1202] text-[8.5px] font-extrabold font-mono flex items-center gap-0.5 shadow">
                              <Lock size={9} strokeWidth={2.75} />
                              <span>${themeItem.priceUsd?.toFixed(2)}</span>
                            </span>
                          ) : null}

                          <span className="absolute bottom-1.5 right-1.5 z-20 text-[7px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white/95">
                            {themeItem.isLive
                              ? unlocked
                                ? 'Live · Owned'
                                : 'Live Theme'
                              : 'Inside Chat'}
                          </span>

                          {/* Mini Chat Header */}
                          <div className="flex items-center justify-between gap-1 mb-2 relative z-10 pb-1 border-b border-white/15">
                            <div className="flex items-center gap-1 min-w-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                                style={themeItem.plusBtnStyle}
                              />
                              <span
                                className={`text-[8.5px] font-bold truncate ${
                                  themeItem.headerIsDark ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                Chat Header
                              </span>
                            </div>
                            {themeItem.hasCrownMotif && (
                              <Crown size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                            )}
                          </div>

                          {/* Mini Chat Bubbles */}
                          <div className="flex-1 flex flex-col justify-center gap-1.5 relative z-10">
                            <div
                              className={`self-start max-w-[85%] rounded-xl rounded-bl-xs px-2 py-1 text-[7px] shadow-xs ${themeItem.incomingBubbleClass}`}
                            >
                              Hey! Ready?
                            </div>
                            <div
                              style={themeItem.outgoingBubbleStyle}
                              className={`self-end max-w-[85%] rounded-xl rounded-br-xs px-2 py-1 text-[7px] font-semibold shadow-xs ${themeItem.outgoingBubbleTextClass}`}
                            >
                              On my way!
                            </div>
                            <div
                              className={`self-start max-w-[78%] rounded-xl rounded-bl-xs px-2 py-1 text-[7px] shadow-xs ${themeItem.incomingBubbleClass}`}
                            >
                              Awesome ✨
                            </div>
                          </div>

                          {/* Mini Composer Bar */}
                          <div
                            className={`h-4 rounded-full border px-2 flex items-center justify-between text-[6.5px] relative z-10 ${themeItem.searchInputClass}`}
                          >
                            <span className="opacity-65 truncate">Message...</span>
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${themeItem.sendBtnTextClass}`}
                              style={themeItem.sendBtnStyle}
                            />
                          </div>
                        </div>

                        {/* Showcase Name Label Below Card */}
                        <span
                          className={`w-full py-1 px-2 rounded-full text-center text-[11px] font-bold truncate transition-transform group-hover:scale-[1.02] ${themeItem.labelPillTextClass} ${
                            isSelected ? 'ring-2 ring-[#00E5D4]/70' : ''
                          }`}
                          style={themeItem.labelPillStyle}
                        >
                          {!unlocked ? `Unlock ${themeItem.name.replace('Live ', '')} · $2` : themeItem.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Home Place Themes (Conversation List Only) */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                      <Sliders size={16} className="text-[#20E66B]" />
                      Home Place Themes
                    </h3>
                    <p className="text-xs text-[#A8BBC2]">
                      Specific themes for your Home conversation list screen — completely separate from Inside Chat themes.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#03090D] border border-white/10">
                      <button
                        type="button"
                        onClick={() => setHomeThemeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          homeThemeFilter === 'all'
                            ? 'bg-[#20E66B] text-[#03090D]'
                            : 'text-[#A8BBC2] hover:text-white'
                        }`}
                      >
                        All ({HOME_THEMES.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setHomeThemeFilter('live')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                          homeThemeFilter === 'live'
                            ? 'bg-amber-400 text-[#1C1202]'
                            : 'text-amber-300 hover:text-white'
                        }`}
                      >
                        <Sparkles size={11} />
                        <span>Live · $2 ({LIVE_THEMES.length})</span>
                      </button>
                    </div>
                    <span className="text-[11px] font-semibold text-[#20E66B]">
                      Active: {resolveHomeTheme(settings.chats).name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(homeThemeFilter === 'live' ? LIVE_THEMES : HOME_THEMES).map((themeItem) => {
                    const unlocked = isLiveThemeUnlocked(themeItem, unlockedLiveThemeIds);
                    const isSelected =
                      unlocked && resolveHomeTheme(settings.chats).id === themeItem.id;
                    return (
                      <button
                        key={themeItem.id}
                        type="button"
                        onClick={() => {
                          if (!unlocked) {
                            openLiveThemeCheckout(themeItem, 'home');
                            return;
                          }
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: { ...prev.chats, homeThemeId: themeItem.id },
                          }));
                          showToast(`Home Place theme applied: ${themeItem.name}`);
                        }}
                        className="group flex flex-col items-center gap-2 text-left cursor-pointer focus:outline-none"
                      >
                        {/* Mini Home List Card Preview */}
                        <div
                          className={`w-full aspect-[9/15] rounded-2xl overflow-hidden border-2 relative flex flex-col p-2 transition-all duration-200 shadow-lg ${
                            isSelected
                              ? 'border-[#20E66B] shadow-[0_0_20px_rgba(32,230,107,0.4)] scale-[1.03]'
                              : !unlocked
                              ? 'border-amber-400/45 group-hover:border-amber-300 group-hover:scale-[1.02]'
                              : 'border-white/15 group-hover:border-[#20E66B]/55 group-hover:scale-[1.01]'
                          }`}
                          style={themeItem.panelStyle}
                        >
                          {themeItem.isLive && themeItem.liveEffect && (
                            <LiveThemeBackdrop
                              liveEffect={themeItem.liveEffect}
                              accentColor={themeItem.logoAccentColor}
                              compact
                            />
                          )}

                          {isSelected ? (
                            <span className="absolute top-1.5 right-1.5 z-20 w-5 h-5 rounded-full bg-[#20E66B] text-[#03090D] flex items-center justify-center shadow">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          ) : !unlocked ? (
                            <span className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded-md bg-amber-400 text-[#1C1202] text-[8.5px] font-extrabold font-mono flex items-center gap-0.5 shadow">
                              <Lock size={9} strokeWidth={2.75} />
                              <span>${themeItem.priceUsd?.toFixed(2)}</span>
                            </span>
                          ) : null}

                          <span className="absolute bottom-1.5 right-1.5 z-20 text-[7px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white/95">
                            {themeItem.isLive
                              ? unlocked
                                ? 'Live · Owned'
                                : 'Live Theme'
                              : 'Home Place'}
                          </span>

                          {/* Mini Top Header */}
                          <div className="flex items-center justify-between gap-1 mb-1.5 relative z-10">
                            <span
                              className={`text-[10px] font-extrabold font-display tracking-tight flex items-center gap-1 ${
                                themeItem.headerIsDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              <span>Linmax</span>
                              {themeItem.hasCrownMotif && (
                                <Crown size={9} className="text-amber-400 fill-amber-400" />
                              )}
                            </span>
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${themeItem.plusBtnTextClass}`}
                              style={themeItem.plusBtnStyle}
                            >
                              +
                            </span>
                          </div>

                          {/* Mini Search Bar */}
                          <div
                            className={`h-3.5 rounded-full border mb-1.5 px-2 flex items-center text-[7px] relative z-10 ${themeItem.searchInputClass}`}
                          >
                            <span className="opacity-65 truncate">Search +LM...</span>
                          </div>

                          {/* Mini Segmented Pill Bar */}
                          <div className={`flex items-center gap-0.5 p-0.5 rounded-md border mb-2 relative z-10 ${themeItem.tabsContainerClass}`}>
                            <span
                              className={`px-1.5 py-0.5 rounded-[4px] text-[6.5px] font-bold ${themeItem.activeTabTextClass}`}
                              style={themeItem.activeTabStyle}
                            >
                              Chats
                            </span>
                            <span className={`px-1 py-0.5 text-[6px] ${themeItem.inactiveTabClass}`}>
                              Groups
                            </span>
                          </div>

                          {/* Mini Sample Chat Rows */}
                          <div className={`flex-1 rounded-xl p-1 flex flex-col gap-1.5 relative z-10 overflow-hidden ${themeItem.feedSurfaceClass}`}>
                            {[
                              { name: 'Desh Friends', msg: 'Okay bro', badge: '6' },
                              { name: 'Linmax Updates', msg: 'New update!', badge: '3' },
                              { name: 'Family Group', msg: 'Bless you', badge: '5' },
                            ].map((row) => (
                              <div key={row.name} className="flex items-center gap-1.5">
                                <span
                                  className="w-4 h-4 rounded-full shrink-0 border border-white/25"
                                  style={themeItem.plusBtnStyle}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className={`text-[7.5px] font-bold truncate leading-tight ${themeItem.rowTitleClass}`}>
                                    {row.name}
                                  </div>
                                  <div className={`text-[6.5px] truncate leading-tight ${themeItem.rowSubtitleClass}`}>
                                    {row.msg}
                                  </div>
                                </div>
                                <span
                                  className={`w-3.5 h-3.5 rounded-full text-[6.5px] font-bold flex items-center justify-center shrink-0 ${themeItem.unreadBadgeTextClass}`}
                                  style={themeItem.unreadBadgeStyle}
                                >
                                  {row.badge}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Showcase Name Label Below Card */}
                        <span
                          className={`w-full py-1 px-2 rounded-full text-center text-[11px] font-bold truncate transition-transform group-hover:scale-[1.02] ${themeItem.labelPillTextClass} ${
                            isSelected ? 'ring-2 ring-[#20E66B]/70' : ''
                          }`}
                          style={themeItem.labelPillStyle}
                        >
                          {!unlocked ? `Unlock ${themeItem.name.replace('Live ', '')} · $2` : themeItem.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography & Fonts Picker */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <Type size={16} className="text-[#00E5D4]" />
                    App & Chat Font Style
                  </h3>
                  <p className="text-xs text-[#A8BBC2]">
                    Switch typography across the entire Linmax workspace and message bubbles.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LINMAX_FONT_OPTIONS.map((fontOpt) => {
                    const isSelected = (settings.chats.fontFamily || 'jakarta') === fontOpt.id;
                    return (
                      <button
                        key={fontOpt.id}
                        type="button"
                        onClick={() => {
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: { ...prev.chats, fontFamily: fontOpt.id },
                          }));
                          showToast(`Font changed to ${fontOpt.label}`);
                        }}
                        style={{ fontFamily: fontOpt.bodyFont }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00E5D4]/15 border-[#00E5D4] shadow-[0_0_12px_rgba(0,229,212,0.2)]'
                            : 'bg-[#03090D] border-white/10 hover:border-[#00E5D4]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-bold text-white truncate">
                            {fontOpt.label}
                          </span>
                          {isSelected && <Check size={13} className="text-[#00E5D4] shrink-0" />}
                        </div>
                        <div className="text-[11px] text-[#A8BBC2] truncate">
                          {fontOpt.sample} · Aa Bb
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Chat Preview Box */}
              <div className="rounded-2xl border border-[#00E5D4]/25 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-[#0B1B22] border-b border-[#00E5D4]/15 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#00E5D4] flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Live Inside-Chat Preview
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-[#A8BBC2] hidden sm:inline">
                      {CHAT_WALLPAPERS.find((w) => w.id === settings.chats.wallpaperId)?.name ||
                        'Custom Wallpaper'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewWallpaperId(settings.chats.wallpaperId)}
                      className="px-2.5 py-1 rounded-lg bg-[#03090D] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Full View</span>
                    </button>
                  </div>
                </div>

                {/* Mini Chat Feed Preview */}
                {(() => {
                  const activeTheme = resolveChatAreaTheme(settings.chats);
                  const useThemePreviewBg = settings.chats.chatAreaUseThemeBg ?? true;
                  const outWhite = activeTheme.outgoingBubbleTextClass.includes('text-white');
                  return (
                    <div
                      className="relative p-5 flex flex-col gap-3 min-h-[190px] justify-center overflow-hidden transition-all"
                      style={
                        useThemePreviewBg
                          ? activeTheme.panelStyle
                          : getWallpaperStyle(
                              settings.chats.wallpaperId,
                              settings.chats.customWallpaperUrl
                            )
                      }
                    >
                      {useThemePreviewBg && activeTheme.isLive && activeTheme.liveEffect && (
                        <LiveThemeBackdrop
                          liveEffect={activeTheme.liveEffect}
                          accentColor={activeTheme.logoAccentColor}
                        />
                      )}

                      {/* Dimming Overlay */}
                      <div
                        className="absolute inset-0 bg-[#03090D] pointer-events-none transition-opacity"
                        style={{
                          opacity: useThemePreviewBg
                            ? activeTheme.isLightSurface
                              ? 0
                              : (settings.chats.wallpaperDimming / 100) * 0.35
                            : settings.chats.wallpaperDimming / 100,
                        }}
                      />

                        <div
                          className={`relative z-10 self-start max-w-[78%] rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-md ${activeTheme.incomingBubbleClass}`}
                        >
                          <p
                            className={
                              settings.chats.fontSize === 'small'
                                ? 'text-xs'
                                : settings.chats.fontSize === 'large'
                                ? 'text-base'
                                : 'text-sm'
                            }
                          >
                            Look how crisp <span className="font-bold">{activeTheme.name}</span> & this wallpaper look! ✨
                          </p>
                          <span
                            className={`text-[10px] block text-right mt-1 ${
                              activeTheme.isLightSurface ? 'text-slate-500' : 'text-[#A8BBC2]'
                            }`}
                          >
                            2:40 PM
                          </span>
                        </div>

                        <div
                          style={activeTheme.outgoingBubbleStyle}
                          className={`relative z-10 self-end max-w-[78%] rounded-2xl rounded-br-xs font-medium px-4 py-2.5 shadow-md ${activeTheme.outgoingBubbleTextClass}`}
                        >
                          <p
                            className={
                              settings.chats.fontSize === 'small'
                                ? 'text-xs'
                                : settings.chats.fontSize === 'large'
                                ? 'text-base'
                                : 'text-sm'
                            }
                          >
                            Love it! Read receipts are{' '}
                            {settings.privacy.readReceipts ? 'enabled' : 'hidden'}.
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              outWhite ? 'text-white/80' : 'text-[#03090D]/80'
                            }`}
                          >
                            <span>2:41 PM</span>
                            {settings.privacy.readReceipts ? (
                              <span title="Read (Double-tick)" className="inline-flex items-center">
                                <CheckCheck
                                  size={15}
                                  className={
                                    outWhite
                                      ? 'text-cyan-200 stroke-[2.75]'
                                      : 'text-[#0038A8] stroke-[2.75]'
                                  }
                                />
                              </span>
                            ) : (
                              <span title="Delivered" className="inline-flex items-center">
                                <CheckCheck
                                  size={14}
                                  className={
                                    outWhite
                                      ? 'text-white/75 stroke-[2.2]'
                                      : 'text-[#03090D]/60 stroke-[2.2]'
                                  }
                                />
                              </span>
                            )}
                          </div>
                        </div>
                    </div>
                  );
                })()}
              </div>

              {/* Predefined Abstract Pattern Wallpapers Grid */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Abstract Pattern Wallpapers
                    </h3>
                    <p className="text-xs text-[#A8BBC2]">
                      Choose a predefined abstract pattern or upload your own wallpaper.
                    </p>
                  </div>

                  <label className="px-3 py-1.5 rounded-xl bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload size={13} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomWallpaperUpload}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {settings.chats.customWallpaperUrl && (
                    <div
                      className={`group rounded-2xl overflow-hidden border-2 text-left transition-all ${
                        settings.chats.wallpaperId === 'custom_uploaded'
                          ? 'border-[#00E5D4] shadow-[0_0_16px_rgba(0,229,212,0.35)] scale-[1.02]'
                          : 'border-white/10 hover:border-[#00E5D4]/40'
                      }`}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onUpdateSettings((prev) => ({
                            ...prev,
                            chats: { ...prev.chats, wallpaperId: 'custom_uploaded' },
                          }));
                          showToast('Applied your custom uploaded wallpaper');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onUpdateSettings((prev) => ({
                              ...prev,
                              chats: { ...prev.chats, wallpaperId: 'custom_uploaded' },
                            }));
                          }
                        }}
                        className="h-28 w-full relative cursor-pointer p-2.5 flex flex-col justify-end gap-1.5"
                        style={getWallpaperStyle('custom_uploaded', settings.chats.customWallpaperUrl)}
                      >
                        <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-[#00E5D4]">
                          Uploaded
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewWallpaperId('custom_uploaded');
                          }}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-[#00E5D4] text-white hover:text-[#03090D] transition-colors cursor-pointer"
                          title="View full wallpaper"
                        >
                          <Eye size={13} />
                        </button>
                        {settings.chats.wallpaperId === 'custom_uploaded' && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00E5D4] text-[#03090D] flex items-center justify-center shadow">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 bg-[#0B1B22]">
                        <div className="text-xs font-semibold text-white truncate">
                          My Photo
                        </div>
                        <div className="text-[10px] text-[#A8BBC2] truncate">
                          Custom gallery image
                        </div>
                      </div>
                    </div>
                  )}

                  {CHAT_WALLPAPERS.map((wp) => {
                    const selected = settings.chats.wallpaperId === wp.id;
                    return (
                      <div
                        key={wp.id}
                        className={`group rounded-2xl overflow-hidden border-2 text-left transition-all ${
                          selected
                            ? 'border-[#00E5D4] shadow-[0_0_16px_rgba(0,229,212,0.35)] scale-[1.02]'
                            : 'border-white/10 hover:border-[#00E5D4]/40'
                        }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            onUpdateSettings((prev) => ({
                              ...prev,
                              chats: { ...prev.chats, wallpaperId: wp.id },
                            }));
                            showToast(`Wallpaper set to ${wp.name}`);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onUpdateSettings((prev) => ({
                                ...prev,
                                chats: { ...prev.chats, wallpaperId: wp.id },
                              }));
                            }
                          }}
                          className="h-28 w-full relative cursor-pointer p-2.5 flex flex-col justify-center gap-1.5"
                          style={wp.style}
                        >
                          <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-[#00E5D4]">
                            {wp.badge}
                          </span>
                          {/* Mini decorative chat bubble preview hints */}
                          <div className="self-start w-14 h-3 rounded-lg rounded-bl-xs bg-[#0B1B22]/90 border border-[#00E5D4]/30 mt-3" />
                          <div className="self-end w-16 h-3 rounded-lg rounded-br-xs bg-gradient-to-r from-[#00E5D4]/90 to-[#00CFEF]/90" />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewWallpaperId(wp.id);
                            }}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-[#00E5D4] text-white hover:text-[#03090D] transition-colors cursor-pointer"
                            title={`View ${wp.name} full-screen`}
                          >
                            <Eye size={13} />
                          </button>
                          {selected && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00E5D4] text-[#03090D] flex items-center justify-center shadow">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 bg-[#0B1B22]">
                          <div className="text-xs font-semibold text-white truncate">
                            {wp.name}
                          </div>
                          <div className="text-[10px] text-[#A8BBC2] truncate">
                            {wp.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Wallpaper Dimming Slider */}
                <div className="pt-3 border-t border-[#00E5D4]/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium flex items-center gap-1.5">
                      <Sliders size={14} className="text-[#00E5D4]" />
                      Wallpaper Dimming
                    </span>
                    <span className="font-mono text-[#00E5D4]">
                      {settings.chats.wallpaperDimming}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={settings.chats.wallpaperDimming}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: {
                          ...prev.chats,
                          wallpaperDimming: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-[#00E5D4] cursor-pointer"
                  />
                </div>
              </div>

              {/* Chat Settings (WhatsApp Style) */}
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Enter is send</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Pressing Enter key sends your message immediately
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.chats.enterIsSend}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: { ...prev.chats, enterIsSend: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Media visibility</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Show newly downloaded photos in device media previews
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.chats.mediaVisibility}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: { ...prev.chats, mediaVisibility: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">Font size</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Text scale inside chat message bubbles
                    </div>
                  </div>
                  <select
                    value={settings.chats.fontSize}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: {
                          ...prev.chats,
                          fontSize: e.target.value as 'small' | 'medium' | 'large',
                        },
                      }))
                    }
                    className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium (Default)</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">Bubble shape style</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Customize message bubble corner roundness
                    </div>
                  </div>
                  <select
                    value={settings.chats.bubbleStyle || 'classic'}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: {
                          ...prev.chats,
                          bubbleStyle: e.target.value as 'classic' | 'pill' | 'modern',
                        },
                      }))
                    }
                    className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value="classic">Classic Rounded</option>
                    <option value="pill">Soft Pill</option>
                    <option value="modern">Modern Crisp</option>
                  </select>
                </div>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Compact chat list</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Fit more conversations on screen with sleek row spacing
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.chats.compactList)}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        chats: { ...prev.chats, compactList: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">Export chat backup</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Download all chats, messages & theme settings as JSON
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportChatBackup}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export</span>
                  </button>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-[#F33248]">
                      Clear all chats
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Erase message histories across all conversations
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllChats();
                      showToast('All conversation histories cleared.');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F33248]/15 hover:bg-[#F33248]/25 text-[#F33248] border border-[#F33248]/30 text-xs font-bold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ==================== 2. PRIVACY ==================== */}
          {activeSection === 'privacy' && (
            <>
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                <div className="px-4 py-3 bg-[#0B1B22]/60 text-[11px] font-bold uppercase tracking-wider text-[#00E5D4]">
                  Who can see my personal info
                </div>

                {(
                  [
                    { key: 'lastSeen', label: 'Last seen and online' },
                    { key: 'profilePhoto', label: 'Profile photo' },
                    { key: 'about', label: 'About' },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <select
                      value={settings.privacy[item.key]}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            [item.key]: e.target.value as 'everyone' | 'contacts' | 'nobody',
                          },
                        }))
                      }
                      className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-[#00E5D4] font-semibold focus:outline-none focus:border-[#00E5D4]"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="contacts">My contacts</option>
                      <option value="nobody">Nobody</option>
                    </select>
                  </div>
                ))}

                <div className="p-4 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white">Stories / Status</span>
                  <select
                    value={settings.privacy.statusShare}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          statusShare: e.target.value as 'contacts' | 'except' | 'only',
                        },
                      }))
                    }
                    className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-[#00E5D4] font-semibold focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value="contacts">My contacts</option>
                    <option value="except">My contacts except...</option>
                    <option value="only">Only share with...</option>
                  </select>
                </div>

                {/* Read Receipts (Double-Tick Control) */}
                <label className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span>Read receipts</span>
                      <CheckCheck size={15} className="text-[#00CFEF]" />
                    </div>
                    <p className="text-xs text-[#A8BBC2] mt-0.5 max-w-md">
                      If turned off, you won't send or receive blue double-tick Read
                      receipts in direct chats. Read receipts are always sent for group chats.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.readReceipts}
                    onChange={(e) => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, readReceipts: e.target.checked },
                      }));
                      showToast(
                        e.target.checked
                          ? 'Double-tick read receipts enabled'
                          : 'Read receipts turned off'
                      );
                    }}
                    className="w-4 h-4 accent-[#00E5D4] mt-1 shrink-0"
                  />
                </label>
              </div>

              {/* App Lock, Group Permissions & Screenshot Guard */}
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                        <Shield size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">App Lock PIN</div>
                        <div className="text-xs text-[#A8BBC2]">
                          Require a private passcode to unlock Linmax when opening
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.privacy.appLockEnabled)}
                      onChange={(e) => {
                        onUpdateSettings((prev) => ({
                          ...prev,
                          privacy: {
                            ...prev.privacy,
                            appLockEnabled: e.target.checked,
                            appLockPin: prev.privacy.appLockPin || appLockPinInput || '1234',
                          },
                        }));
                        showToast(
                          e.target.checked
                            ? 'App Lock PIN security enabled!'
                            : 'App Lock disabled'
                        );
                      }}
                      className="w-4 h-4 accent-[#00E5D4] shrink-0"
                    />
                  </div>
                  {settings.privacy.appLockEnabled && (
                    <div className="flex items-center gap-2 pl-11">
                      <input
                        type="password"
                        maxLength={6}
                        value={appLockPinInput}
                        onChange={(e) => setAppLockPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="4-6 digit lock PIN"
                        className="flex-1 bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (appLockPinInput.length < 4) {
                            showToast('Enter at least 4 digits for App Lock PIN');
                            return;
                          }
                          onUpdateSettings((prev) => ({
                            ...prev,
                            privacy: { ...prev.privacy, appLockPin: appLockPinInput },
                          }));
                          showToast('App Lock PIN updated!');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
                      >
                        Save PIN
                      </button>
                    </div>
                  )}
                </div>

                <label className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Forward & Screenshot Guard</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Protect sensitive chats with anti-forward watermarks
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.privacy.blockScreenshots)}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, blockScreenshots: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">Who can add me to groups</div>
                    <div className="text-xs text-[#A8BBC2]">Control automatic group invitations</div>
                  </div>
                  <select
                    value={settings.privacy.groupAddPermission || 'everyone'}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          groupAddPermission: e.target.value as 'everyone' | 'contacts',
                        },
                      }))
                    }
                    className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My contacts only</option>
                  </select>
                </div>
              </div>

              {/* Disappearing Messages */}
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Default message timer
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Start new chats with disappearing messages set to your timer
                    </div>
                  </div>
                </div>
                <select
                  value={settings.privacy.defaultMessageTimer}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        defaultMessageTimer: e.target.value as 'off' | '24h' | '7d' | '90d',
                      },
                    }))
                  }
                  className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                >
                  <option value="off">Off</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="90d">90 days</option>
                </select>
              </div>

              {/* Blocked Contacts */}
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#0B1B22] text-[#F33248]">
                      <UserX size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Blocked contacts ({blockedChats.length})
                      </div>
                      <div className="text-xs text-[#A8BBC2]">
                        Blocked contacts cannot call you or send messages
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockPicker(!showBlockPicker)}
                    className="px-3 py-1.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-xs font-semibold text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                  >
                    {showBlockPicker ? 'Done' : 'Manage'}
                  </button>
                </div>

                {blockedChats.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                    {blockedChats.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-2.5 rounded-xl bg-[#0B1B22] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-xs font-semibold text-white">
                              {contact.name}
                            </div>
                            <div className="text-[10px] text-[#A8BBC2] font-mono">
                              {contact.chatCode}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleBlockContact(contact.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#00E5D4]/15 text-[#00E5D4] text-[11px] font-bold hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showBlockPicker && unblockedChats.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
                    <span className="text-[11px] text-[#A8BBC2]">
                      Tap a contact to block:
                    </span>
                    {unblockedChats.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleToggleBlockContact(c.id)}
                        className="p-2 rounded-xl bg-[#03090D] hover:bg-[#F33248]/10 border border-white/5 flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="text-xs text-white">{c.name}</span>
                        <span className="text-[10px] text-[#F33248] font-semibold">
                          Block
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================== 3. ACCOUNT ==================== */}
          {activeSection === 'account' && (
            <div className="flex flex-col gap-4">
              {/* Unique Custom +LMNAME Chat Code Store ($5.00 USD) */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 shadow-[0_0_25px_rgba(0,229,212,0.08)] flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] shrink-0">
                      <Crown size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-display text-white">
                        Buy Unique Linmax Chat Code
                      </h3>
                      <p className="text-xs text-[#A8BBC2] mt-0.5 leading-relaxed">
                        Upgrade to a custom <span className="text-[#00E5D4] font-mono">+LMNAME</span> identity like{' '}
                        <span className="text-white font-mono">+LMAPPIX</span> instead of random digits.
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-[#00E5D4]/12 border border-[#00E5D4]/35 text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-[#00E5D4] tabular-nums">
                      $5.00 USD
                    </div>
                    <div className="text-[10px] text-[#A8BBC2]">One-time · Lifetime</div>
                  </div>
                </div>

                {/* Customizer Input Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1 flex items-center bg-[#03090D] border border-[#00E5D4]/30 focus-within:border-[#00E5D4] rounded-xl overflow-hidden transition-colors">
                    <span className="px-3.5 py-2.5 bg-[#0B1B22] border-r border-[#00E5D4]/20 text-xs font-mono font-bold text-[#00E5D4] shrink-0 select-none">
                      +LM
                    </span>
                    <input
                      type="text"
                      value={vanityHandle}
                      onChange={(e) => setVanityHandle(sanitizeVanityHandle(e.target.value))}
                      placeholder="APPIX"
                      maxLength={16}
                      aria-label="Custom Linmax Chat Code handle after +LM"
                      className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm font-mono font-semibold text-white uppercase tracking-wider focus:outline-none placeholder:text-[#546B73]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={vanityStatus.state === 'invalid' || vanityStatus.state === 'taken' || vanityStatus.state === 'active'}
                    onClick={handleOpenVanityCheckout}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                      vanityStatus.state === 'available'
                        ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] hover:brightness-110 shadow-[0_0_16px_rgba(0,229,212,0.3)] cursor-pointer'
                        : vanityStatus.state === 'owned'
                        ? 'bg-[#20E66B]/20 text-[#20E66B] border border-[#20E66B]/40 hover:bg-[#20E66B]/30 cursor-pointer'
                        : 'bg-[#0B1B22] text-[#546B73] border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    {vanityStatus.state === 'active' ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Active Code</span>
                      </>
                    ) : vanityStatus.state === 'owned' ? (
                      <>
                        <Check size={14} />
                        <span>Switch Free</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        <span>Buy for $5.00 USD</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Availability Feedback */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div
                    className={`flex items-center gap-1.5 ${
                      vanityStatus.state === 'available' || vanityStatus.state === 'owned' || vanityStatus.state === 'active'
                        ? 'text-[#20E66B]'
                        : vanityStatus.state === 'taken'
                        ? 'text-[#F33248]'
                        : 'text-[#A8BBC2]'
                    }`}
                  >
                    {vanityStatus.state === 'taken' ? (
                      <AlertCircle size={13} className="shrink-0" />
                    ) : (
                      <BadgeCheck size={13} className="shrink-0" />
                    )}
                    <span>{vanityStatus.message}</span>
                  </div>
                  <div className="text-[11px] font-mono text-[#A8BBC2]">
                    Preview: <span className="text-[#00E5D4] font-bold">{previewVanityCode}</span>
                  </div>
                </div>

                {/* Quick Name Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#00E5D4]/10">
                  <span className="text-[11px] text-[#A8BBC2] mr-1">Ideas:</span>
                  {vanitySuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setVanityHandle(sug)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                        cleanHandle === sug
                          ? 'bg-[#00E5D4]/20 border-[#00E5D4] text-[#00E5D4] font-bold'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:border-[#00E5D4]/40 hover:text-white'
                      }`}
                    >
                      +LM{sug}
                    </button>
                  ))}
                </div>

                {/* Owned Custom Codes History */}
                {ownedCodes.length > 0 && (
                  <div className="pt-3 border-t border-[#00E5D4]/15 flex flex-col gap-2">
                    <div className="text-[11px] font-semibold text-[#A8BBC2]">
                      Your Purchased Custom Codes ({ownedCodes.length})
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {ownedCodes.map((item) => {
                        const isActive =
                          currentUser.chatCode.toUpperCase() === item.code.toUpperCase();
                        return (
                          <div
                            key={item.code}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#03090D] border border-[#00E5D4]/15"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BadgeCheck size={14} className="text-[#00E5D4] shrink-0" />
                              <span className="text-xs font-mono font-bold text-white truncate">
                                {item.code}
                              </span>
                              <span className="text-[10px] text-[#A8BBC2] font-mono">
                                · ${item.amountUsd.toFixed(2)} USD · {item.purchasedAt}
                              </span>
                            </div>
                            {isActive ? (
                              <span className="text-[10px] font-bold text-[#20E66B]">
                                Currently Active
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateUser({ chatCode: item.code });
                                  showToast(`Switched Chat Code to ${item.code}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                {/* Username / Display Name Editor */}
                <div className="p-4 flex flex-col gap-2.5">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Username / Display Name
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Update how your name appears in chats, groups, and stories
                    </div>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!usernameInput.trim()) return;
                      onUpdateUser({ name: usernameInput.trim() });
                      showToast(`Username changed to ${usernameInput.trim()}`);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter your username"
                      required
                      className="flex-1 bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Update Name
                    </button>
                  </form>
                </div>

              <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Security notifications
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Get notified when a contact's Linmax encryption key changes
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.account.securityNotifications}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      account: {
                        ...prev.account,
                        securityNotifications: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              {/* Two-step verification */}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Two-step verification
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Require a 6-digit PIN when registering your Chat Code on a new device
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.account.twoStepEnabled}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        account: {
                          ...prev.account,
                          twoStepEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </div>

                {settings.account.twoStepEnabled && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="password"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit PIN"
                      className="flex-1 bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E5D4]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSettings((prev) => ({
                          ...prev,
                          account: { ...prev.account, twoStepPin: pinInput },
                        }));
                        showToast('Two-step verification PIN saved!');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Save PIN
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">
                    Linmax Identity Code
                  </div>
                  <div className="text-xs text-[#00E5D4] font-mono mt-0.5">
                    {currentUser.chatCode} · Verified Private Identity
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#20E66B]/15 text-[#20E66B] font-bold border border-[#20E66B]/30">
                  ACTIVE
                </span>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-[#F33248]">
                    Reset workspace data
                  </div>
                  <div className="text-xs text-[#A8BBC2]">
                    Restore default chats, groups, and settings
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetWorkspace}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F33248]/15 hover:bg-[#F33248]/25 text-[#F33248] border border-[#F33248]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>
              </div>
            </div>
          )}

          {/* ==================== 4. NOTIFICATIONS ==================== */}
          {activeSection === 'notifications' && (
            <div className="flex flex-col gap-4">
              {/* PWA Push Notifications Card */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/25 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/20">
                      <BellRing size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-display">
                        PWA Push Notifications
                      </div>
                      <div className="text-xs text-[#A8BBC2]">
                        Receive system alerts for new messages, voice/video calls & elections
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      notifPerm === 'granted'
                        ? 'bg-[#20E66B]/15 text-[#20E66B] border-[#20E66B]/30'
                        : notifPerm === 'denied'
                        ? 'bg-[#F33248]/15 text-[#F33248] border-[#F33248]/30'
                        : 'bg-[#00CFEF]/15 text-[#00CFEF] border-[#00CFEF]/30'
                    }`}
                  >
                    {notifPerm === 'granted'
                      ? 'Enabled'
                      : notifPerm === 'denied'
                      ? 'Blocked in Browser'
                      : notifPerm === 'unsupported'
                      ? 'Unsupported'
                      : 'Permission Needed'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await requestNotificationPermission();
                        setNotifPerm(res);
                        if (res === 'granted') {
                          await sendLinmaxNotification({
                            title: 'Linmax Notifications Active',
                            body: 'You will now receive instant PWA alerts for chats, calls, and group elections.',
                            tag: 'linmax-enabled',
                          });
                          showToast('PWA Push Notifications enabled!');
                        } else if (res === 'denied') {
                          showToast('Notifications blocked in browser settings.');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Enable Push Notifications
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      const perm = await requestNotificationPermission();
                      setNotifPerm(perm);
                      soundEngine.playMessageReceived(
                        settings.notifications.messageTone,
                        settings.notifications.customMessageToneUrl
                      );
                      triggerNotificationVibration(settings.notifications.vibrate ?? true);
                      const sent = await sendLinmaxNotification({
                        title: 'Linmax — New Message',
                        body: `Hey ${currentUser.name}, PWA notifications are working!`,
                        tag: 'linmax-test',
                        vibrate: settings.notifications.vibrate ?? true,
                      });
                      showToast(
                        sent
                          ? 'Test PWA notification & tone dispatched!'
                          : 'Played alert tone & vibration (enable browser push for OS popups)'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Send Test Notification
                  </button>

                  {onSimulateIncomingMessage && (
                    <button
                      type="button"
                      onClick={() => {
                        onSimulateIncomingMessage();
                        showToast('Simulated incoming friend message alert!');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#20E66B]/15 border border-[#20E66B]/35 text-[#20E66B] hover:bg-[#20E66B] hover:text-[#03090D] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Simulate Friend Alert
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        Conversation tones
                      </div>
                      <div className="text-xs text-[#A8BBC2]">
                        Play notification chimes for incoming and outgoing messages
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.conversationTones}
                    onChange={(e) => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          conversationTones: e.target.checked,
                        },
                      }));
                      showToast(
                        e.target.checked
                          ? 'Conversation tones enabled'
                          : 'Conversation tones muted'
                      );
                    }}
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <div className="p-4 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-white">Message Notification Tone</div>
                      <div className="text-xs text-[#A8BBC2]">
                        Pick a built-in chime or upload your own audio clip
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.notifications.messageTone}
                        onChange={(e) => {
                          const tone = e.target.value as LinmaxSettings['notifications']['messageTone'];
                          onUpdateSettings((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              messageTone: tone,
                            },
                          }));
                          soundEngine.playMessageReceived(tone, settings.notifications.customMessageToneUrl);
                        }}
                        className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                      >
                        {MESSAGE_TONE_CATALOG.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                        {settings.notifications.customMessageToneUrl && (
                          <option value="Custom Tone">
                            Custom: {settings.notifications.customMessageToneName || 'My Audio'}
                          </option>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          soundEngine.playMessageReceived(
                            settings.notifications.messageTone,
                            settings.notifications.customMessageToneUrl
                          )
                        }
                        className="p-2 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                        title="Play Tone Preview"
                      >
                        <Play size={13} />
                      </button>
                      <label className="px-2.5 py-1.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/30 text-[11px] font-semibold text-[#00E5D4] hover:bg-[#00E5D4]/15 cursor-pointer flex items-center gap-1">
                        <Upload size={12} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={handleCustomMessageToneUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Vibrate on message & call alerts</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Trigger haptic pulses on supported phones when messages arrive
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.vibrate ?? true}
                    onChange={(e) => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, vibrate: e.target.checked },
                      }));
                      if (e.target.checked) triggerNotificationVibration(true);
                    }}
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Show message text in popups</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Hide sender message snippets on notifications when turned off
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.showPreviews ?? true}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, showPreviews: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Live unread count in browser tab & app icon</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Updates tab title "(N) New messages · Linmax" & PWA app badge
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.tabBadge ?? true}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, tabBadge: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Group & King Election alerts
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Receive high-priority banners for group polls & royal decrees
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.groupNotifications}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          groupNotifications: e.target.checked,
                        },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>
              </div>

              {/* Call Ringtone Studio + Custom Audio Upload */}
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                      <Music size={16} className="text-[#00E5D4]" />
                      Incoming Call Ringtones
                    </h3>
                    <p className="text-xs text-[#A8BBC2]">
                      Preview 8 signature soundtracks or upload an MP3/WAV song from your device.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {playingRingtonePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.stopRinging();
                          setPlayingRingtonePreview(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#F33248]/15 border border-[#F33248]/40 text-[#F33248] text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Square size={11} />
                        <span>Stop</span>
                      </button>
                    )}
                    <label className="px-3 py-1.5 rounded-xl bg-[#00E5D4]/15 hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/35 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload size={13} />
                      <span>Add My Ringtone</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleCustomRingtoneUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {RINGTONE_CATALOG.map((ring) => {
                    const isSelected = settings.notifications.callRingtone === ring.id;
                    const isPlaying = playingRingtonePreview === ring.id;
                    return (
                      <div
                        key={ring.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? 'bg-[#00E5D4]/15 border-[#00E5D4]'
                            : 'bg-[#03090D] border-white/10 hover:border-[#00E5D4]/40'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, callRingtone: ring.id },
                            }));
                            soundEngine.previewRingtone(ring.id);
                            setPlayingRingtonePreview(ring.id);
                            showToast(`Ringtone set to ${ring.label}`);
                          }}
                          className="flex-1 min-w-0 text-left cursor-pointer"
                        >
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{ring.label}</span>
                            {isSelected && <Check size={12} className="text-[#00E5D4] shrink-0" />}
                          </div>
                          <div className="text-[10px] text-[#A8BBC2]">{ring.vibe}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isPlaying) {
                              soundEngine.stopRinging();
                              setPlayingRingtonePreview(null);
                            } else {
                              soundEngine.previewRingtone(ring.id);
                              setPlayingRingtonePreview(ring.id);
                            }
                          }}
                          className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors shrink-0 ${
                            isPlaying
                              ? 'bg-[#00E5D4] text-[#03090D] border-[#00E5D4]'
                              : 'bg-[#0B1B22] text-[#00E5D4] border-[#00E5D4]/25 hover:border-[#00E5D4]'
                          }`}
                          title={isPlaying ? 'Stop preview' : `Preview ${ring.label}`}
                        >
                          {isPlaying ? <Square size={12} /> : <Play size={12} />}
                        </button>
                      </div>
                    );
                  })}

                  {settings.notifications.customRingtoneUrl && (
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 sm:col-span-2 ${
                        settings.notifications.callRingtone === 'Custom Ringtone'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSettings((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              callRingtone: 'Custom Ringtone',
                            },
                          }));
                          soundEngine.previewRingtone(
                            'Custom Ringtone',
                            settings.notifications.customRingtoneUrl
                          );
                          setPlayingRingtonePreview('Custom Ringtone');
                        }}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <Music size={12} className="text-[#00E5D4] shrink-0" />
                          <span>{settings.notifications.customRingtoneName || 'Custom Device Ringtone'}</span>
                          {settings.notifications.callRingtone === 'Custom Ringtone' && (
                            <Check size={12} className="text-[#00E5D4]" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#20E66B]">Uploaded from your device</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (playingRingtonePreview === 'Custom Ringtone') {
                            soundEngine.stopRinging();
                            setPlayingRingtonePreview(null);
                          } else {
                            soundEngine.previewRingtone(
                              'Custom Ringtone',
                              settings.notifications.customRingtoneUrl
                            );
                            setPlayingRingtonePreview('Custom Ringtone');
                          }
                        }}
                        className="p-2 rounded-lg bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] cursor-pointer"
                      >
                        {playingRingtonePreview === 'Custom Ringtone' ? (
                          <Square size={12} />
                        ) : (
                          <Play size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. STORAGE AND DATA ==================== */}
          {activeSection === 'storage' && (
            <>
              <div className="p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Local Storage Usage</h3>
                    <p className="text-xs text-[#A8BBC2]">
                      Messages, uploaded media, stickers & groups cached on device
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-[#00E5D4]">
                    {storageStats.formatted}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#03090D] overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] rounded-full transition-all"
                    style={{ width: `${Math.max(4, storageStats.percent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#A8BBC2]">
                  <span>{storageStats.percent}% of 5 MB local quota</span>
                  <span>Encrypted Persistence</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 divide-y divide-[#00E5D4]/10 overflow-hidden">
                <div className="px-4 py-3 bg-[#0B1B22]/60 text-[11px] font-bold uppercase tracking-wider text-[#00E5D4]">
                  Media auto-download
                </div>
                {(
                  [
                    { key: 'autoDownloadPhotos', label: 'Auto-download Photos' },
                    { key: 'autoDownloadVideos', label: 'Auto-download Videos' },
                    { key: 'autoDownloadAudio', label: 'Auto-download Voice Notes' },
                    { key: 'autoDownloadDocs', label: 'Auto-download Documents' },
                  ] as const
                ).map((item) => (
                  <label
                    key={item.key}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50"
                  >
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings.storage[item.key])}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          storage: {
                            ...prev.storage,
                            [item.key]: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 accent-[#00E5D4]"
                    />
                  </label>
                ))}

                <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#0B1B22]/50">
                  <div>
                    <div className="text-sm font-medium text-white">Use less data for calls</div>
                    <div className="text-xs text-[#A8BBC2]">
                      Optimize bandwidth on voice & video calls over cellular
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.storage.lowDataCalls)}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        storage: { ...prev.storage, lowDataCalls: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-[#00E5D4]"
                  />
                </label>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">
                      Photo upload quality
                    </div>
                    <div className="text-xs text-[#A8BBC2]">
                      Quality of photos uploaded from local files
                    </div>
                  </div>
                  <select
                    value={settings.storage.uploadQuality}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        storage: {
                          ...prev.storage,
                          uploadQuality: e.target.value as 'auto' | 'best' | 'saver',
                        },
                      }))
                    }
                    className="bg-[#0B1B22] border border-[#00E5D4]/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value="auto">Auto (Recommended)</option>
                    <option value="best">Best quality</option>
                    <option value="saver">Data saver</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* ==================== 6. HELP ==================== */}
          {activeSection === 'help' && (
            <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 p-5 flex flex-col gap-4 text-xs text-[#A8BBC2]">
              <div className="flex items-center gap-3 pb-3 border-b border-[#00E5D4]/15">
                <img
                  src="/assets/aistudio/image_1d68fbe3.png"
                  alt="Linmax"
                  className="w-11 h-11 rounded-2xl object-contain bg-[#03090D] p-1.5 border border-[#00E5D4]/30"
                />
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    Linmax — Connect without limits
                  </h3>
                  <span className="text-[11px] text-[#00E5D4]">
                    Version 2.5 · End-to-End Encrypted Protocol
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-white">Frequently Asked Questions</h4>
                <div className="p-3 rounded-xl bg-[#0B1B22] border border-white/5">
                  <div className="text-white font-semibold mb-1">
                    How do double-tick Read Receipts work?
                  </div>
                  <p>
                    One tick means your message was sent. Two muted ticks mean it was
                    delivered. Two bright royal-blue ticks mean your recipient has read your
                    message. You can toggle this under Privacy.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0B1B22] border border-white/5">
                  <div className="text-white font-semibold mb-1">
                    How do Group Leaders manage members and King elections?
                  </div>
                  <p>
                    Open any Group Info drawer by tapping the group name at the top of a
                    chat. Group Kings and Admins can add new members, remove members,
                    change the group picture, and launch democratic elections.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* $5.00 USD UNIQUE +LM-NAME CHAT CODE CHECKOUT MODAL */}
      {checkoutCode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/35 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Crown size={18} className="text-[#00E5D4] shrink-0" />
                <h3 className="font-display font-bold text-white text-base truncate">
                  {completedReceipt ? 'Chat Code Activated' : 'Checkout — $5.00 USD'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCheckoutCode(null);
                  setCompletedReceipt(null);
                }}
                className="text-[#A8BBC2] hover:text-white cursor-pointer shrink-0 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {completedReceipt ? (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#20E66B]/15 border border-[#20E66B]/40 flex items-center justify-center text-[#20E66B]">
                  <BadgeCheck size={30} />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-white">
                    Welcome to {completedReceipt.code}
                  </h4>
                  <p className="text-xs text-[#A8BBC2] mt-1">
                    Your unique Linmax Chat Code is live across chats, profile, and stories.
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-[#03090D] border border-[#00E5D4]/25 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Activated Code</span>
                    <span className="font-mono font-bold text-[#00E5D4]">
                      {completedReceipt.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Amount Paid</span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      $5.00 USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Receipt ID</span>
                    <span className="font-mono text-[#A8BBC2]">
                      {completedReceipt.receiptId}
                    </span>
                  </div>
                </div>

                <div className="w-full flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(completedReceipt.code);
                      showToast(`Copied ${completedReceipt.code}`);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-xs font-semibold text-[#00E5D4] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Copy Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutCode(null);
                      setCompletedReceipt(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleCompleteVanityPurchase}
                className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
              >
                {/* Order Summary Box */}
                <div className="p-4 rounded-2xl bg-[#03090D] border border-[#00E5D4]/25 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-[#A8BBC2]">Unique Chat Code</div>
                    <div className="text-lg font-mono font-bold text-[#00E5D4] mt-0.5">
                      {checkoutCode}
                    </div>
                    <div className="text-[11px] text-[#A8BBC2] mt-0.5">
                      Lifetime Ownership · Instant Switch
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-mono font-bold text-white tabular-nums">
                      $5.00
                    </div>
                    <div className="text-[10px] text-[#00E5D4] font-semibold">USD</div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#A8BBC2]">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <CreditCard size={15} />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('mobile_money');
                        setCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'mobile_money'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <Smartphone size={15} />
                      <span>Mobile Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('paypal');
                        setCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'paypal'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <Wallet size={15} />
                      <span>PayPal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full name on card"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        placeholder="4242 4242 4242 4242"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#A8BBC2]">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                          }}
                          placeholder="08/29"
                          required
                          className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#A8BBC2]">CVC</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          required
                          className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Network Provider</label>
                      <select
                        value={momoProvider}
                        onChange={(e) => setMomoProvider(e.target.value)}
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                      >
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Orange Money">Orange Money</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Mobile Money Number</label>
                      <input
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="+256 7XX XXX XXX"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#A8BBC2]">PayPal Account Email</label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                )}

                {checkoutError && (
                  <div className="px-3.5 py-2 rounded-xl bg-[#F33248]/15 border border-[#F33248]/40 text-xs text-[#FF7B89] flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCheckoutCode(null)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessingPayment ? (
                      <span>Processing $5.00 USD...</span>
                    ) : (
                      <span>Pay $5.00 USD & Activate</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL-SCREEN VIEWABLE WALLPAPER PREVIEW MODAL */}
      {previewWallpaperId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-lg max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/35 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon size={17} className="text-[#00E5D4] shrink-0" />
                <h3 className="font-display font-bold text-white text-sm sm:text-base truncate">
                  {CHAT_WALLPAPERS.find((w) => w.id === previewWallpaperId)?.name ||
                    'Custom Uploaded Wallpaper'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewWallpaperId(null)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="relative flex-1 min-h-[340px] sm:min-h-[400px] p-5 flex flex-col justify-between overflow-hidden"
              style={getWallpaperStyle(previewWallpaperId, settings.chats.customWallpaperUrl)}
            >
              <div
                className="absolute inset-0 bg-[#03090D] pointer-events-none transition-opacity"
                style={{ opacity: settings.chats.wallpaperDimming / 100 }}
              />

              <div className="relative z-10 mx-auto px-3 py-1 rounded-full bg-[#07151B]/90 border border-[#00E5D4]/20 text-[11px] text-[#A8BBC2]">
                Today · Encrypted Chat Preview
              </div>

              <div className="relative z-10 flex flex-col gap-3 my-auto">
                <div className="self-start max-w-[78%] rounded-2xl rounded-bl-xs bg-[#0B1B22]/95 border border-[#00E5D4]/25 px-4 py-2.5 shadow-md">
                  <p className="text-sm text-white">
                    Wow, this wallpaper looks super crisp behind our chats!
                  </p>
                  <span className="text-[10px] text-[#A8BBC2] block text-right mt-1">
                    4:18 PM
                  </span>
                </div>
                <div className="self-end max-w-[78%] rounded-2xl rounded-br-xs bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-medium px-4 py-2.5 shadow-md">
                  <p className="text-sm">
                    Wait until you test it across all your DMs and groups.
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#03090D]/80">
                    <span>4:19 PM</span>
                    <CheckCheck size={14} className="text-[#0038A8] stroke-[2.75]" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#07151B]/90 border border-[#00E5D4]/20 text-xs text-[#A8BBC2]">
                <span>Type a message...</span>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewWallpaperId(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings((prev) => ({
                    ...prev,
                    chats: { ...prev.chats, wallpaperId: previewWallpaperId },
                  }));
                  const wpName =
                    CHAT_WALLPAPERS.find((w) => w.id === previewWallpaperId)?.name ||
                    'Custom Wallpaper';
                  showToast(`Applied ${wpName}`);
                  setPreviewWallpaperId(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Apply Wallpaper</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* $2.00 USD LIVE THEME CHECKOUT MODAL */}
      {liveThemeCheckout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[90dvh] bg-[#07151B] border border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-400/15 bg-[#0B1B22] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={18} className="text-amber-400 shrink-0" />
                <h3 className="font-display font-bold text-white text-base truncate">
                  {liveThemeReceipt ? 'Live Theme Unlocked!' : 'Unlock Live Theme — $2.00 USD'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLiveThemeCheckout(null);
                  setLiveThemeReceipt(null);
                  onClearInitialLiveThemeCheckout?.();
                }}
                className="text-[#A8BBC2] hover:text-white cursor-pointer shrink-0 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {liveThemeReceipt ? (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#20E66B]/15 border border-[#20E66B]/40 flex items-center justify-center text-[#20E66B]">
                  <BadgeCheck size={30} />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-display text-white">
                    {liveThemeReceipt.theme.name}
                  </h4>
                  <p className="text-xs text-[#A8BBC2] mt-1">
                    Unlocked permanently on your Linmax account and applied to{' '}
                    <span className="text-[#00E5D4] font-semibold">
                      {liveThemeReceipt.target === 'home' ? 'Home Place' : 'Inside Chats'}
                    </span>
                    .
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-[#03090D] border border-[#00E5D4]/25 flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Live Theme</span>
                    <span className="font-bold text-white">{liveThemeReceipt.theme.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Amount Paid</span>
                    <span className="font-mono font-bold text-amber-300 tabular-nums">$2.00 USD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A8BBC2]">Receipt ID</span>
                    <span className="font-mono text-[#A8BBC2]">{liveThemeReceipt.receiptId}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLiveThemeCheckout(null);
                    setLiveThemeReceipt(null);
                    onClearInitialLiveThemeCheckout?.();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                >
                  Done &amp; Enjoy Theme
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleCompleteLiveThemePurchase}
                className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
              >
                {/* Live Theme Animated Preview Banner */}
                <div
                  className="relative rounded-2xl border border-white/15 p-4 overflow-hidden flex items-center justify-between gap-3"
                  style={liveThemeCheckout.theme.panelStyle}
                >
                  {liveThemeCheckout.theme.liveEffect && (
                    <LiveThemeBackdrop
                      liveEffect={liveThemeCheckout.theme.liveEffect}
                      accentColor={liveThemeCheckout.theme.logoAccentColor}
                      compact
                    />
                  )}
                  <div className="relative z-10 min-w-0 rounded-xl bg-black/35 backdrop-blur-[2px] px-2.5 py-1.5">
                    <div className="text-sm font-bold font-display text-white truncate">
                      {liveThemeCheckout.theme.name}
                    </div>
                    <div className="text-[11px] text-white/85 truncate mt-0.5">
                      {liveThemeCheckout.theme.tagline}
                    </div>
                    <div className="text-[10px] text-amber-300 font-semibold mt-1">
                      Lifetime Unlock · Use on Home Place &amp; Inside Chats
                    </div>
                  </div>
                  <div className="relative z-10 text-right shrink-0 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-amber-400/35">
                    <div className="text-base font-mono font-bold text-amber-300 tabular-nums">
                      $2.00
                    </div>
                    <div className="text-[9.5px] text-white/80 font-semibold">USD</div>
                  </div>
                </div>

                {/* Apply Immediately Target Selector (Independent) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#A8BBC2]">
                    Apply Right After Payment To
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLiveThemeCheckout((prev) => (prev ? { ...prev, target: 'chat' } : prev))
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        liveThemeCheckout.target === 'chat'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      Inside Chats Only
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLiveThemeCheckout((prev) => (prev ? { ...prev, target: 'home' } : prev))
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                        liveThemeCheckout.target === 'home'
                          ? 'bg-[#20E66B]/15 border-[#20E66B] text-[#20E66B]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      Home Place Only
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[#A8BBC2]">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('card');
                        setLiveCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <CreditCard size={15} />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('mobile_money');
                        setLiveCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'mobile_money'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <Smartphone size={15} />
                      <span>Mobile Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('paypal');
                        setLiveCheckoutError(null);
                      }}
                      className={`py-2.5 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'paypal'
                          ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                          : 'bg-[#03090D] border-white/10 text-[#A8BBC2] hover:text-white'
                      }`}
                    >
                      <Wallet size={15} />
                      <span>PayPal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full name on card"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        placeholder="4242 4242 4242 4242"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#A8BBC2]">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                          }}
                          placeholder="08/29"
                          required
                          className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#A8BBC2]">CVC</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          required
                          className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Network Provider</label>
                      <select
                        value={momoProvider}
                        onChange={(e) => setMomoProvider(e.target.value)}
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                      >
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Orange Money">Orange Money</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#A8BBC2]">Mobile Money Number</label>
                      <input
                        type="tel"
                        value={momoPhone}
                        onChange={(e) => setMomoPhone(e.target.value)}
                        placeholder="+256 7XX XXX XXX"
                        required
                        className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#A8BBC2]">PayPal Account Email</label>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                )}

                {liveCheckoutError && (
                  <div className="px-3.5 py-2 rounded-xl bg-[#F33248]/15 border border-[#F33248]/40 text-xs text-[#FF7B89] flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{liveCheckoutError}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLiveThemeCheckout(null);
                      onClearInitialLiveThemeCheckout?.();
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingLivePayment}
                    className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-[#1C1202] text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessingLivePayment ? (
                      <span>Processing $2.00 USD...</span>
                    ) : (
                      <span>Pay $2.00 USD &amp; Unlock</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
