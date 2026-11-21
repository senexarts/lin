import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Camera, 
  Mic, 
  Send, 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  FileText, 
  X, 
  Reply, 
  CornerDownRight, 
  ArrowLeft,
  Pin,
  Info,
  Maximize2,
  Crown,
  Vote,
  Calendar,
  Megaphone,
  UserCheck,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Film,
  Music,
  Download,
  Upload,
  ShieldAlert
} from 'lucide-react';
import { Chat, Message, CurrentUser, GroupElection, GroupEvent, LinmaxSettings, CustomSticker } from '../../types';
import { soundEngine, generateSampleVoiceBriefingWavUrl } from '../../utils/audio';
import { ContactInfoDrawer } from './ContactInfoDrawer';
import { MediaLightboxModal } from './MediaLightboxModal';
import { EmojiStickerPicker } from './EmojiStickerPicker';
import { CreateGroupPostModal } from './CreateGroupPostModal';
import { CreateStickerModal } from './CreateStickerModal';
import { CustomStickerView } from './CustomStickerView';
import { LIVE_STICKERS, LiveSticker, LiveStickerRenderer } from '../../data/emojisAndStickers';
import { getWallpaperStyle } from '../../data/wallpapers';
import { resolveChatAreaTheme } from '../../data/chatThemes';
import { LiveThemeBackdrop } from './LiveThemeBackdrop';
import {
  readImageFileAsDataUrl,
  readVideoFileAsPlayableUrl,
  readAudioFileAsPlayableUrl,
  isAudioFile,
  formatDurationSeconds,
  formatFileSize,
} from '../../utils/imageUpload';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUser: CurrentUser;
  settings?: LinmaxSettings;
  availableContacts?: Chat[];
  customStickers?: CustomSticker[];
  onCreateCustomSticker?: (sticker: CustomSticker) => void;
  onDeleteCustomSticker?: (stickerId: string) => void;
  onSendMessage: (
    text: string, 
    mediaType?: 'image' | 'video' | 'audio' | 'document' | 'sticker', 
    mediaUrl?: string, 
    replyTo?: Message,
    stickerId?: string,
    mediaName?: string,
    mediaSize?: string,
    audioDuration?: string,
    customSticker?: CustomSticker
  ) => void;
  onStartCall: (contact: { name: string; avatar: string; chatCode: string }, type: 'voice' | 'video') => void;
  onBack?: () => void;
  onTogglePinChat?: (chatId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  onClearChat?: () => void;
  onVoteElection?: (messageId: string, candidateId: string) => void;
  onRsvpEvent?: (messageId: string, status: 'attending' | 'declined') => void;
  onPostElection?: (election: GroupElection) => void;
  onPostEvent?: (event: GroupEvent) => void;
  onPostAnnouncement?: (title: string, text: string) => void;
  onAddGroupMembers?: (chatId: string, memberNames: string[]) => void;
  onRemoveGroupMember?: (chatId: string, memberName: string) => void;
  onUpdateGroupAvatar?: (chatId: string, avatarUrl: string) => void;
  onToggleGroupAdmin?: (chatId: string, memberName: string) => void;
  onSetGroupKing?: (chatId: string, memberName: string) => void;
  onOpenWallpaperSettings?: () => void;
  onUnblockContact?: (chatId: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUser,
  settings,
  availableContacts = [],
  customStickers = [],
  onCreateCustomSticker,
  onDeleteCustomSticker,
  onSendMessage,
  onStartCall,
  onBack,
  onTogglePinChat,
  onReaction,
  onClearChat,
  onVoteElection,
  onRsvpEvent,
  onPostElection,
  onPostEvent,
  onPostAnnouncement,
  onAddGroupMembers,
  onRemoveGroupMember,
  onUpdateGroupAvatar,
  onToggleGroupAdmin,
  onSetGroupKing,
  onOpenWallpaperSettings,
  onUnblockContact,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCreateStickerModal, setShowCreateStickerModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showGroupPostModal, setShowGroupPostModal] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: 'image' | 'video';
    caption?: string;
  } | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [liveWaveform, setLiveWaveform] = useState<number[]>(
    () => [10, 18, 12, 22, 14, 24, 16, 12, 20, 14, 18, 10]
  );
  const [micPermissionNote, setMicPermissionNote] = useState<string | null>(null);
  const [micBlockedError, setMicBlockedError] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTimeSec, setAudioCurrentTimeSec] = useState<number>(0);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [isPreviewAudioPlaying, setIsPreviewAudioPlaying] = useState(false);
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(() => {
    return messages.find((m) => m.isPinned) || messages[0] || null;
  });
  const [pendingImageUpload, setPendingImageUpload] = useState<{
    url: string;
    caption: string;
  } | null>(null);
  const [pendingVideoUpload, setPendingVideoUpload] = useState<{
    url: string;
    name: string;
    size: string;
    caption: string;
    persisted: boolean;
  } | null>(null);
  const [pendingAudioUpload, setPendingAudioUpload] = useState<{
    url: string;
    name: string;
    size: string;
    duration: string;
    caption: string;
    persisted: boolean;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number>(0);
  const waveformIntervalRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recorderAudioCtxRef = useRef<AudioContext | null>(null);
  const voiceSecondsRef = useRef<number>(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const previewAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fallbackPlaybackTimerRef = useRef<number | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPinnedMessage(messages.find((m) => m.isPinned) || messages[0] || null);
    setPendingImageUpload(null);
    setPendingVideoUpload(null);
    setPendingAudioUpload(null);
    setReplyingTo(null);
    stopAnyAudioPlayback();
  }, [chat.id]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const cleanupRecordingResources = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (recorderAudioCtxRef.current) {
      recorderAudioCtxRef.current.close().catch(() => {});
      recorderAudioCtxRef.current = null;
    }
  };

  const stopPreviewAudio = () => {
    if (previewAudioPlayerRef.current) {
      previewAudioPlayerRef.current.pause();
      previewAudioPlayerRef.current.currentTime = 0;
      previewAudioPlayerRef.current = null;
    }
    setIsPreviewAudioPlaying(false);
  };

  const stopAnyAudioPlayback = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current = null;
    }
    stopPreviewAudio();
    if (fallbackPlaybackTimerRef.current) {
      clearInterval(fallbackPlaybackTimerRef.current);
      fallbackPlaybackTimerRef.current = null;
    }
    setPlayingAudioId(null);
    setAudioProgress(0);
    setAudioCurrentTimeSec(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      stopAnyAudioPlayback();
    };
  }, []);

  const showReadReceiptTicks =
    chat.type === 'group' || (settings?.privacy.readReceipts ?? true);

  const isBlocked =
    chat.type === 'direct' &&
    (settings?.privacy.blockedChatIds.includes(chat.id) ?? false);

  const msgTextSizeClass =
    settings?.chats.fontSize === 'small'
      ? 'text-xs'
      : settings?.chats.fontSize === 'large'
      ? 'text-base'
      : 'text-sm';

  const wallpaperStyle = settings
    ? getWallpaperStyle(settings.chats.wallpaperId, settings.chats.customWallpaperUrl)
    : getWallpaperStyle('cyber_doodles');

  const wallpaperDimOpacity = settings ? settings.chats.wallpaperDimming / 100 : 0.15;
  const theme = resolveChatAreaTheme(settings?.chats);
  const useThemeBg = settings?.chats.chatAreaUseThemeBg ?? true;
  const effectiveFeedStyle = useThemeBg ? theme.panelStyle : wallpaperStyle;
  const effectiveOverlayOpacity = useThemeBg
    ? theme.id === 'custom_uploaded_theme'
      ? Math.max(0.08, wallpaperDimOpacity)
      : theme.isLightSurface
      ? 0
      : wallpaperDimOpacity * 0.35
    : wallpaperDimOpacity;
  const bubbleRadiusClass =
    settings?.chats.bubbleStyle === 'pill'
      ? 'rounded-3xl'
      : settings?.chats.bubbleStyle === 'modern'
      ? 'rounded-lg'
      : 'rounded-2xl';
  const outgoingIsWhiteText = theme.outgoingBubbleTextClass.includes('text-white');

  const renderReceiptTick = (status: Message['status'], onDarkBg = false) => {
    if (status === 'read' && showReadReceiptTicks) {
      return (
        <span title="Read" className="inline-flex items-center">
          <CheckCheck
            size={onDarkBg ? 12 : 14}
            className={
              onDarkBg
                ? 'text-[#00CFEF] stroke-[2.5]'
                : outgoingIsWhiteText
                ? 'text-cyan-200 stroke-[2.75]'
                : 'text-[#0038A8] stroke-[2.75]'
            }
          />
        </span>
      );
    }
    if (status === 'delivered' || status === 'read') {
      return (
        <span title="Delivered" className="inline-flex items-center">
          <CheckCheck
            size={onDarkBg ? 12 : 14}
            className={
              onDarkBg
                ? 'text-[#A8BBC2]'
                : outgoingIsWhiteText
                ? 'text-white/75 stroke-[2.2]'
                : 'text-[#03090D]/55 stroke-[2.2]'
            }
          />
        </span>
      );
    }
    return (
      <span title="Sent" className="inline-flex items-center">
        <Check
          size={onDarkBg ? 11 : 13}
          className={
            onDarkBg
              ? 'text-[#A8BBC2]'
              : outgoingIsWhiteText
              ? 'text-white/75 stroke-[2.2]'
              : 'text-[#03090D]/55 stroke-[2.2]'
          }
        />
      </span>
    );
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pendingAudioUpload) {
      stopPreviewAudio();
      soundEngine.playMessageSent();
      onSendMessage(
        pendingAudioUpload.caption.trim() || inputText.trim() || pendingAudioUpload.name,
        'audio',
        pendingAudioUpload.url,
        replyingTo || undefined,
        undefined,
        pendingAudioUpload.name,
        pendingAudioUpload.size,
        pendingAudioUpload.duration
      );
      setPendingAudioUpload(null);
      setInputText('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      return;
    }

    if (pendingVideoUpload) {
      soundEngine.playMessageSent();
      onSendMessage(
        pendingVideoUpload.caption.trim() || inputText.trim() || pendingVideoUpload.name,
        'video',
        pendingVideoUpload.url,
        replyingTo || undefined,
        undefined,
        pendingVideoUpload.name,
        pendingVideoUpload.size
      );
      setPendingVideoUpload(null);
      setInputText('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      return;
    }

    if (pendingImageUpload) {
      soundEngine.playMessageSent();
      onSendMessage(
        pendingImageUpload.caption.trim() || inputText.trim() || 'Photo',
        'image',
        pendingImageUpload.url,
        replyingTo || undefined
      );
      setPendingImageUpload(null);
      setInputText('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      return;
    }

    if (!inputText.trim()) return;

    soundEngine.playMessageSent();
    onSendMessage(inputText.trim(), undefined, undefined, replyingTo || undefined);
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleLocalImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 1080, 0.85);
      setPendingVideoUpload(null);
      setPendingAudioUpload(null);
      setPendingImageUpload({ url: dataUrl, caption: inputText });
      setShowAttachMenu(false);
    } catch {
      // ignore invalid image
    }
    e.target.value = '';
  };

  const handleLocalVideoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url, persisted } = await readVideoFileAsPlayableUrl(file);
      setPendingImageUpload(null);
      setPendingAudioUpload(null);
      setPendingVideoUpload({
        url,
        name: file.name,
        size: formatFileSize(file.size),
        caption: inputText,
        persisted,
      });
      setShowAttachMenu(false);
    } catch {
      // ignore invalid video
    }
    e.target.value = '';
  };

  const handleLocalAudioSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      stopAnyAudioPlayback();
      const { url, persisted, durationLabel } = await readAudioFileAsPlayableUrl(file);
      setPendingImageUpload(null);
      setPendingVideoUpload(null);
      setMicBlockedError(null);
      setIsRecordingVoice(false);
      cleanupRecordingResources();
      setPendingAudioUpload({
        url,
        name: file.name,
        size: formatFileSize(file.size),
        duration: durationLabel,
        caption: inputText,
        persisted,
      });
      setShowAttachMenu(false);
    } catch {
      // ignore invalid audio
    }
    e.target.value = '';
  };

  const handleLocalDocSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (isAudioFile(file)) {
      await handleLocalAudioSelect(e);
      return;
    }
    const sizeLabel = formatFileSize(file.size);
    soundEngine.playMessageSent();
    onSendMessage(
      `${file.name} (${sizeLabel})`,
      'document',
      undefined,
      replyingTo || undefined,
      undefined,
      file.name,
      sizeLabel
    );
    setReplyingTo(null);
    setShowAttachMenu(false);
    e.target.value = '';
  };

  const pickSupportedAudioMimeType = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      return undefined;
    }
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    return candidates.find((mime) => MediaRecorder.isTypeSupported(mime));
  };

  const startVoiceRecording = async () => {
    setMicPermissionNote(null);
    setMicBlockedError(null);
    setVoiceSeconds(0);
    voiceSecondsRef.current = 0;
    recordingStartedAtRef.current = Date.now();
    audioChunksRef.current = [];
    setIsRecordingVoice(true);

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        if (typeof MediaRecorder === 'undefined') {
          throw new Error('MediaRecorder unsupported in this browser');
        }

        const mimeType = pickSupportedAudioMimeType();
        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };
        recorder.start(150);

        recordingStartedAtRef.current = Date.now();
        recordingTimerRef.current = window.setInterval(() => {
          const secs = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000);
          voiceSecondsRef.current = secs;
          setVoiceSeconds(secs);
        }, 250);

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          recorderAudioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 32;
          source.connect(analyser);
          const dataArr = new Uint8Array(analyser.frequencyBinCount);

          waveformIntervalRef.current = window.setInterval(() => {
            analyser.getByteFrequencyData(dataArr);
            const bars = Array.from({ length: 12 }, (_, idx) => {
              const raw = dataArr[idx % dataArr.length] || 0;
              return Math.max(6, Math.min(26, Math.round((raw / 255) * 26) + 6));
            });
            setLiveWaveform(bars);
          }, 80);
        }
        return;
      }
      throw new Error('Microphone API unavailable');
    } catch {
      // Do NOT send fake silent voice notes if mic permission is denied/unavailable;
      // prompt user cleanly to pick an audio file or allow microphone permission.
      mediaRecorderRef.current = null;
      cleanupRecordingResources();
      setIsRecordingVoice(false);
      setMicBlockedError('Microphone access was blocked. Allow mic permission or send an audio file from your device.');
    }
  };

  const cancelVoiceRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    cleanupRecordingResources();
    setIsRecordingVoice(false);
    setVoiceSeconds(0);
    setMicPermissionNote(null);
  };

  const handleFinishVoiceRecord = async () => {
    const elapsedSec = Math.max(
      1,
      Math.round((Date.now() - recordingStartedAtRef.current) / 1000),
      voiceSecondsRef.current
    );
    const durationStr = formatDurationSeconds(elapsedSec);

    const recorder = mediaRecorderRef.current;
    let audioDataUrl: string | undefined;
    let recordedSizeLabel: string | undefined;

    if (recorder && recorder.state !== 'inactive') {
      audioDataUrl = await new Promise<string | undefined>((resolve) => {
        const timeoutId = window.setTimeout(() => resolve(undefined), 2500);
        recorder.onstop = () => {
          window.clearTimeout(timeoutId);
          const chunks = audioChunksRef.current;
          if (!chunks.length) {
            resolve(undefined);
            return;
          }
          const blob = new Blob(chunks, {
            type: recorder.mimeType || 'audio/webm',
          });
          recordedSizeLabel = formatFileSize(blob.size);
          if (blob.size <= 3.2 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(
                typeof reader.result === 'string'
                  ? reader.result
                  : URL.createObjectURL(blob)
              );
            };
            reader.onerror = () => resolve(URL.createObjectURL(blob));
            reader.readAsDataURL(blob);
          } else {
            resolve(URL.createObjectURL(blob));
          }
        };
        try {
          if (typeof recorder.requestData === 'function') {
            recorder.requestData();
          }
        } catch {
          // ignore if unsupported
        }
        recorder.stop();
      });
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    cleanupRecordingResources();
    setIsRecordingVoice(false);
    setMicPermissionNote(null);

    if (!audioDataUrl) {
      setMicBlockedError('Could not capture audio data. Try recording slightly longer or pick an audio file.');
      return;
    }

    soundEngine.playMessageSent();
    onSendMessage(
      `Voice message (${durationStr})`,
      'audio',
      audioDataUrl,
      replyingTo || undefined,
      undefined,
      `Voice Note (${durationStr})`,
      recordedSizeLabel,
      durationStr
    );
    setReplyingTo(null);
  };

  const handleTogglePlayVoice = (msg: Message) => {
    if (playingAudioId === msg.id) {
      stopAnyAudioPlayback();
      return;
    }

    stopAnyAudioPlayback();
    setPlayingAudioId(msg.id);
    setAudioProgress(0);
    setAudioCurrentTimeSec(0);

    const sourceUrl = msg.mediaUrl || generateSampleVoiceBriefingWavUrl();
    const audio = new Audio(sourceUrl);
    audio.playbackRate = audioPlaybackRate;
    audioPlayerRef.current = audio;

    audio.ontimeupdate = () => {
      setAudioCurrentTimeSec(Math.floor(audio.currentTime || 0));
      if (audio.duration && isFinite(audio.duration)) {
        setAudioProgress(Math.min(100, (audio.currentTime / audio.duration) * 100));
      }
    };
    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioProgress(0);
      setAudioCurrentTimeSec(0);
    };
    audio.onerror = () => {
      setPlayingAudioId(null);
      setAudioProgress(0);
      setAudioCurrentTimeSec(0);
    };
    audio.play().catch(() => {
      setPlayingAudioId(null);
      setAudioProgress(0);
      setAudioCurrentTimeSec(0);
    });
  };

  const handleSeekAudio = (msg: Message, ratio: number) => {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    if (playingAudioId === msg.id && audioPlayerRef.current) {
      const dur = audioPlayerRef.current.duration;
      if (dur && isFinite(dur)) {
        audioPlayerRef.current.currentTime = clampedRatio * dur;
        setAudioProgress(clampedRatio * 100);
        setAudioCurrentTimeSec(Math.floor(audioPlayerRef.current.currentTime));
      }
    } else {
      handleTogglePlayVoice(msg);
      window.setTimeout(() => {
        if (audioPlayerRef.current && audioPlayerRef.current.duration && isFinite(audioPlayerRef.current.duration)) {
          audioPlayerRef.current.currentTime = clampedRatio * audioPlayerRef.current.duration;
          setAudioProgress(clampedRatio * 100);
        }
      }, 120);
    }
  };

  const handleCyclePlaybackRate = () => {
    const nextRate: 1 | 1.5 | 2 =
      audioPlaybackRate === 1 ? 1.5 : audioPlaybackRate === 1.5 ? 2 : 1;
    setAudioPlaybackRate(nextRate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = nextRate;
    }
  };

  const handleTogglePreviewAudio = () => {
    if (!pendingAudioUpload) return;
    if (isPreviewAudioPlaying && previewAudioPlayerRef.current) {
      stopPreviewAudio();
      return;
    }
    stopAnyAudioPlayback();
    const audio = new Audio(pendingAudioUpload.url);
    previewAudioPlayerRef.current = audio;
    setIsPreviewAudioPlaying(true);
    audio.onended = () => setIsPreviewAudioPlaying(false);
    audio.onerror = () => setIsPreviewAudioPlaying(false);
    audio.play().catch(() => setIsPreviewAudioPlaying(false));
  };

  const handleSendSampleImage = (imgUrl: string) => {
    soundEngine.playMessageSent();
    onSendMessage('Retreat photo preview 🌄', 'image', imgUrl);
    setShowAttachMenu(false);
  };

  const handleSendSampleVideo = () => {
    soundEngine.playMessageSent();
    onSendMessage(
      'Spring blossom clip 🎬',
      'video',
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      undefined,
      undefined,
      'flower_hd.mp4',
      '645 KB'
    );
    setShowAttachMenu(false);
  };

  const handleSendDocument = () => {
    soundEngine.playMessageSent();
    onSendMessage('Physics notes.pdf (2.4 MB)', 'document', undefined, undefined, undefined, 'Physics notes.pdf', '2.4 MB');
    setShowAttachMenu(false);
  };

  const handleSendSticker = (sticker: LiveSticker) => {
    soundEngine.playMessageSent();
    onSendMessage(sticker.name, 'sticker', undefined, replyingTo || undefined, sticker.id);
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleSendCustomSticker = (sticker: CustomSticker) => {
    soundEngine.playMessageSent();
    onSendMessage(
      sticker.name,
      'sticker',
      sticker.imageUrl,
      replyingTo || undefined,
      sticker.id,
      undefined,
      undefined,
      undefined,
      sticker
    );
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const filteredMessages = chatSearchQuery.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-[#03090D] relative overflow-hidden">
      {/* 1. CHAT HEADER */}
      <div
        className="px-3 sm:px-5 py-3 border-b backdrop-blur-md flex items-center justify-between gap-2 z-20 shrink-0 transition-colors"
        style={theme.chatWindowHeaderStyle}
      >
        {/* Clickable Contact Profile Area */}
        <div 
          onClick={() => setShowContactDrawer(true)}
          className="flex-1 flex items-center gap-2.5 sm:gap-3 min-w-0 cursor-pointer group"
        >
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className={`md:hidden p-1.5 -ml-1 rounded-lg transition-colors shrink-0 ${
                theme.headerIsDark ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* Profile Picture */}
          <div
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 shrink-0 group-hover:scale-105 transition-transform"
            style={theme.plusBtnStyle}
          >
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-full h-full object-cover rounded-full bg-[#03090D]"
            />
            {chat.type === 'direct' && chat.isOnline && (
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#20E66B] ring-2 ${theme.onlineRingClass}`} />
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className={`font-display font-bold text-sm sm:text-base truncate transition-colors ${theme.chatWindowHeaderTitleClass}`}>
                {chat.name}
              </h2>
              {chat.chatCode && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border hidden sm:inline-block shrink-0 ${
                    theme.headerIsDark
                      ? 'text-[#00E5D4] bg-black/25 border-white/15'
                      : 'text-slate-700 bg-white/80 border-slate-300'
                  }`}
                >
                  {chat.chatCode}
                </span>
              )}
              {chat.type === 'group' && chat.president && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold shrink-0">
                  <Crown size={11} className="fill-amber-400" />
                  <span>King: {chat.president}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs min-w-0">
              <p className="truncate font-medium min-w-0" style={theme.chatWindowHeaderSubStyle}>
                {chat.type === 'group'
                  ? `${chat.membersCount || 25} members · Tap for info`
                  : chat.isOnline
                  ? 'Online · Tap for profile'
                  : 'Last seen recently'}
              </p>
              {chat.type === 'group' && chat.president && (
                <span className="sm:hidden text-amber-500 font-semibold text-[10px] flex items-center gap-0.5 shrink-0 max-w-[110px] truncate">
                  <Crown size={10} className="fill-amber-400 shrink-0" />
                  <span className="truncate">{chat.president}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Group Post, Voice Call, Video Call, Search */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {chat.type === 'group' && (
            <button
              onClick={() => setShowGroupPostModal(true)}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-[#00E5D4]/20 border border-amber-400/40 text-amber-300 hover:text-white hover:border-[#00E5D4] transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold"
              title="Schedule King Election, Group Meetup or Royal Decree"
            >
              <Crown size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
              <span className="hidden lg:inline">Group Post</span>
            </button>
          )}

          <button
            onClick={() =>
              onStartCall(
                { name: chat.name, avatar: chat.avatar, chatCode: chat.chatCode || '+LM-GROUP' },
                'voice'
              )
            }
            className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer ${
              theme.headerIsDark
                ? 'text-[#00E5D4] hover:bg-white/10'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
            title="Voice Call"
          >
            <Phone size={18} />
          </button>

          <button
            onClick={() =>
              onStartCall(
                { name: chat.name, avatar: chat.avatar, chatCode: chat.chatCode || '+LM-GROUP' },
                'video'
              )
            }
            className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer ${
              theme.headerIsDark
                ? 'text-[#00CFEF] hover:bg-white/10'
                : 'text-slate-700 hover:bg-slate-200/70'
            }`}
            title="Video Call"
          >
            <Video size={18} />
          </button>

          <button
            onClick={() => setSearchInChat(!searchInChat)}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer ${
              searchInChat
                ? 'bg-[#00E5D4]/20 text-[#00E5D4]'
                : theme.headerIsDark
                ? 'text-white/75 hover:bg-white/10'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
            title="Search in Chat"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => setShowContactDrawer(true)}
            className={`p-2 sm:p-2.5 rounded-xl transition-colors cursor-pointer ${
              theme.headerIsDark
                ? 'text-white/75 hover:text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
            title="Contact & Group Info"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className={`px-4 py-2 border-b flex items-center justify-between z-10 backdrop-blur-sm transition-colors ${theme.pinnedBarClass}`}>
          <div className="flex items-center gap-2 min-w-0">
            <Pin size={13} className={`${theme.pinnedAccentTextClass} shrink-0`} />
            <div className="text-xs truncate">
              <span className={`${theme.pinnedAccentTextClass} font-semibold`}>
                Pinned ({pinnedMessage.senderName}):
              </span>{' '}
              <span className="opacity-85">{pinnedMessage.text}</span>
            </div>
          </div>
          <button
            onClick={() => setPinnedMessage(null)}
            className="p-1 opacity-70 hover:opacity-100 cursor-pointer"
            title="Dismiss Pinned Bar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* In-Chat Search Bar Toggle */}
      {searchInChat && (
        <div className={`px-4 py-2 border-b flex items-center gap-2 animate-in slide-in-from-top-2 z-10 ${theme.secondarySurfaceClass}`}>
          <Search size={14} className={theme.pinnedAccentTextClass} />
          <input
            type="text"
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            placeholder="Search words in this conversation..."
            className={`flex-1 bg-transparent text-xs focus:outline-none ${
              theme.isLightSurface
                ? 'text-slate-900 placeholder-slate-400'
                : 'text-white placeholder-[#A8BBC2]'
            }`}
            autoFocus
          />
          <button
            onClick={() => {
              setSearchInChat(false);
              setChatSearchQuery('');
            }}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* 2. MESSAGES FEED WITH CHAT THEME / CUSTOM WALLPAPER */}
      <div
        className="flex-1 relative overflow-hidden flex flex-col transition-all duration-300"
        style={effectiveFeedStyle}
      >
        {useThemeBg && theme.isLive && theme.liveEffect && (
          <LiveThemeBackdrop liveEffect={theme.liveEffect} accentColor={theme.logoAccentColor} />
        )}

        {/* Wallpaper / Theme readability overlay */}
        <div
          className="absolute inset-0 bg-[#03090D] pointer-events-none transition-opacity"
          style={{ opacity: effectiveOverlayOpacity }}
        />

        <div className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 pt-9 pb-6 flex flex-col gap-3.5 scroll-smooth">
          {/* Subtle Cyber Encrypted Note */}
          <div className={`shrink-0 mx-auto my-2 px-3.5 py-1 rounded-full border text-[11px] flex items-center gap-1.5 shadow-sm backdrop-blur-md ${theme.protocolPillClass}`}>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: theme.logoAccentColor }}
            />
            Messages in this chat are protected by Linmax protocol.
          </div>

          {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isSticker = msg.mediaType === 'sticker';
            const customStickerObj = isSticker
              ? msg.customSticker ||
                customStickers.find((s) => s.id === msg.stickerId)
              : undefined;
            const matchedSticker =
              isSticker && !customStickerObj
                ? LIVE_STICKERS.find(
                    (s) =>
                      s.id === msg.stickerId ||
                      s.name.toLowerCase() === msg.text.toLowerCase()
                  ) || LIVE_STICKERS[0]
                : null;
            const hasReactions =
              Boolean(msg.reactions) && Object.keys(msg.reactions || {}).length > 0;

            return (
              <div
                key={msg.id}
                className={`shrink-0 flex items-end gap-2 group ${
                  isMe ? 'justify-end' : 'justify-start'
                } ${hasReactions ? 'mb-3' : ''}`}
              >
                {/* Partner Avatar for Incoming Messages */}
                {!isMe && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#07151B] border border-[#00E5D4]/20 shrink-0 mb-1">
                    <img
                      src={msg.senderAvatar || chat.avatar}
                      alt={msg.senderName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className="relative group/bubble max-w-[85%] sm:max-w-md">
                  {isSticker ? (
                    /* WhatsApp-style Live Animated Sticker or User-Created Custom Sticker */
                    <div className="relative flex flex-col select-none">
                      {customStickerObj ? (
                        <div className="p-1 hover:scale-110 transition-transform cursor-pointer">
                          <CustomStickerView sticker={customStickerObj} size="chat" />
                        </div>
                      ) : matchedSticker ? (
                        <div
                          className="p-1 hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_0_16px_rgba(0,229,212,0.4)]"
                          title={matchedSticker.name || msg.text}
                        >
                          <LiveStickerRenderer sticker={matchedSticker} size="chat" />
                        </div>
                      ) : (
                        <div className="w-28 h-28 flex items-center justify-center text-5xl">
                          {msg.text}
                        </div>
                      )}
                      {/* Floating timestamp pill */}
                      <div className="self-end -mt-2 mr-1 bg-[#03090D]/85 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-[#A8BBC2] border border-[#00E5D4]/20 flex items-center gap-1 shadow-sm">
                        <span>{msg.timestamp}</span>
                        {isMe && renderReceiptTick(msg.status, true)}
                      </div>
                    </div>
                  ) : (
                /* Standard Bubble */
                <div
                  style={isMe ? theme.outgoingBubbleStyle : undefined}
                  className={`relative ${bubbleRadiusClass} px-4 py-2.5 transition-all shadow-md ${
                    isMe
                      ? `${theme.outgoingBubbleTextClass} rounded-br-xs font-medium`
                      : `${theme.incomingBubbleClass} rounded-bl-xs`
                  }`}
                >
                  {/* Sender Name in group chats */}
                  {!isMe && chat.type === 'group' && (
                    <span
                      className="text-[11px] font-bold block mb-0.5"
                      style={{ color: theme.logoAccentColor }}
                    >
                      {msg.senderName}
                    </span>
                  )}

                  {/* Reply To Preview in bubble */}
                  {msg.replyTo && (
                    <div
                      className={`mb-2 p-2 rounded-xl text-xs border-l-2 ${
                        isMe
                          ? outgoingIsWhiteText
                            ? 'bg-black/20 border-white/75 text-white'
                            : 'bg-black/15 border-[#03090D] text-[#03090D]'
                          : theme.isLightSurface
                          ? 'bg-slate-100 border-slate-400 text-slate-700'
                          : 'bg-[#07151B] border-[#00E5D4] text-[#A8BBC2]'
                      }`}
                    >
                      <span className="font-bold block text-[10px]">
                        {msg.replyTo.senderName}
                      </span>
                      <span className="truncate block opacity-90">
                        {msg.replyTo.text}
                      </span>
                    </div>
                  )}

                  {/* IMAGE ATTACHMENT */}
                  {msg.mediaType === 'image' && msg.mediaUrl && (
                    <div 
                      onClick={() =>
                        setLightboxMedia({
                          url: msg.mediaUrl!,
                          type: 'image',
                          caption: msg.text,
                        })
                      }
                      className="rounded-xl overflow-hidden mb-2 border border-black/10 cursor-pointer relative group/img"
                    >
                      <img
                        src={msg.mediaUrl}
                        alt="Attachment"
                        className="w-full max-h-60 object-cover rounded-xl group-hover/img:scale-102 transition-transform"
                      />
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <Maximize2 size={13} />
                      </div>
                    </div>
                  )}

                  {/* VIDEO ATTACHMENT */}
                  {msg.mediaType === 'video' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-2 border border-black/20 relative group/vid bg-black">
                      <video
                        src={msg.mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-64 rounded-xl bg-black"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxMedia({
                            url: msg.mediaUrl!,
                            type: 'video',
                            caption: msg.text,
                          })
                        }
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white opacity-85 hover:opacity-100 hover:bg-[#00E5D4] hover:text-[#03090D] transition-all cursor-pointer"
                        title="Expand Video Fullscreen"
                      >
                        <Maximize2 size={13} />
                      </button>
                      {(msg.mediaName || msg.mediaSize) && (
                        <div className="px-2.5 py-1 bg-black/75 text-[10px] text-white/80 flex items-center justify-between gap-2">
                          <span className="truncate">{msg.mediaName || 'Video Clip'}</span>
                          {msg.mediaSize && <span className="font-mono shrink-0">{msg.mediaSize}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DOCUMENT ATTACHMENT */}
                  {msg.mediaType === 'document' && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/20 mb-2 border border-white/10">
                      <div className="p-2 rounded-lg bg-[#00E5D4]/20 text-[#00E5D4]">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold block truncate">
                          {msg.mediaName || msg.text}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {msg.mediaSize ? `${msg.mediaSize} · Shared File` : 'Document · Tap to view'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* AUDIO / VOICE NOTE BUBBLE */}
                  {msg.mediaType === 'audio' ? (
                    <div className="flex flex-col gap-1.5 py-1 min-w-[220px] sm:min-w-[265px]">
                      {msg.mediaName && !msg.mediaName.startsWith('Voice Note') && (
                        <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
                          <span className="truncate font-semibold flex items-center gap-1">
                            <Music size={11} className="shrink-0" />
                            <span className="truncate">{msg.mediaName}</span>
                          </span>
                          {msg.mediaSize && <span className="font-mono shrink-0">{msg.mediaSize}</span>}
                        </div>
                      )}

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePlayVoice(msg)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 ${
                            isMe
                              ? 'bg-[#03090D] text-[#00E5D4]'
                              : 'bg-[#00E5D4] text-[#03090D]'
                          }`}
                          title={playingAudioId === msg.id ? 'Pause audio' : 'Play audio'}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} className="ml-0.5" />
                          )}
                        </button>

                        {/* Interactive Click-to-Seek Waveform */}
                        <div className="flex-1 flex items-center gap-[3px] h-7">
                          {[12, 20, 8, 24, 16, 26, 14, 22, 10, 26, 18, 12, 20, 15, 22, 13].map(
                            (h, i, arr) => {
                              const barRatio = (i + 1) / arr.length;
                              const barPct = barRatio * 100;
                              const isPlaying = playingAudioId === msg.id;
                              const isPlayed = isPlaying && audioProgress >= barPct - 5;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleSeekAudio(msg, (i + 0.5) / arr.length)}
                                  title="Click to seek"
                                  className="flex-1 h-full flex items-center justify-center cursor-pointer group/bar"
                                >
                                  <span
                                    className={`w-1 rounded-full transition-all group-hover/bar:scale-y-110 ${
                                      isMe
                                        ? isPlayed
                                          ? 'bg-[#03090D]'
                                          : 'bg-[#03090D]/40'
                                        : isPlayed
                                        ? 'bg-[#20E66B]'
                                        : 'bg-[#00E5D4]/70'
                                    } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                                    style={{ height: `${h}px` }}
                                  />
                                </button>
                              );
                            }
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[11px] font-mono font-semibold tabular-nums ${
                              isMe ? 'text-[#03090D]' : 'text-[#00E5D4]'
                            }`}
                          >
                            {playingAudioId === msg.id
                              ? formatDurationSeconds(audioCurrentTimeSec)
                              : msg.audioDuration || '0:04'}
                          </span>
                          <button
                            type="button"
                            onClick={handleCyclePlaybackRate}
                            title="Change playback speed"
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold cursor-pointer ${
                              isMe
                                ? 'bg-[#03090D]/15 text-[#03090D] hover:bg-[#03090D]/25'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {audioPlaybackRate}x
                          </button>
                          {msg.mediaUrl && (
                            <a
                              href={msg.mediaUrl}
                              download={msg.mediaName || `linmax-audio-${msg.id}.webm`}
                              title="Download audio"
                              className={`p-1 rounded-md transition-opacity opacity-70 hover:opacity-100 ${
                                isMe ? 'text-[#03090D]' : 'text-[#00E5D4]'
                              }`}
                            >
                              <Download size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : msg.postType === 'election' || msg.election ? (
                    /* 👑 GROUP KING / PRESIDENT ELECTION CARD */
                    <div className="w-full sm:min-w-[320px] max-w-sm rounded-2xl bg-[#03090D] border-2 border-amber-400/40 p-3.5 my-1 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col gap-3 text-left">
                      <div className="flex items-center justify-between border-b border-[#00E5D4]/20 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                            <Crown size={18} className="text-amber-400 fill-amber-400 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white text-xs sm:text-sm">
                              {msg.election?.title || 'Group King Election 👑'}
                            </h4>
                            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                              <Calendar size={10} />
                              Election Date: {msg.election?.electionDate || 'Friday at 7:00 PM'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00E5D4]/15 text-[#00E5D4] border border-[#00E5D4]/30">
                          Live Poll
                        </span>
                      </div>

                      {msg.election?.description && (
                        <p className="text-[11px] text-[#A8BBC2] leading-tight">
                          {msg.election.description}
                        </p>
                      )}

                      {/* Candidates with vote counters & voting buttons */}
                      <div className="flex flex-col gap-2">
                        {(() => {
                          const candidates = msg.election?.candidates || [];
                          const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0) || 1;
                          const maxVotes = Math.max(...candidates.map((c) => c.votes || 0));

                          return candidates.map((cand) => {
                            const hasVoted = cand.voters?.includes(currentUser.name);
                            const percent = Math.round(((cand.votes || 0) / totalVotes) * 100);
                            const isLeading = (cand.votes || 0) === maxVotes && (cand.votes || 0) > 0;

                            return (
                              <div
                                key={cand.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  hasVoted
                                    ? 'bg-[#0B1B22] border-[#00E5D4] shadow-[0_0_15px_rgba(0,229,212,0.25)]'
                                    : 'bg-[#07151B] border-white/5 hover:border-[#00E5D4]/30'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-xs font-bold text-white truncate">
                                      {cand.name}
                                    </span>
                                    {isLeading && (
                                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5 bg-amber-400/10 px-1 rounded border border-amber-400/20 shrink-0 font-medium" title="Reigning Leader">
                                        <Crown size={10} className="fill-amber-400" />
                                        Leader
                                      </span>
                                    )}
                                    {hasVoted && (
                                      <span className="text-[9px] text-[#20E66B] font-semibold bg-[#20E66B]/10 px-1 rounded shrink-0">
                                        Your Choice
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-mono font-bold text-[#00E5D4]">
                                      {cand.votes || 0} votes ({percent}%)
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => onVoteElection && onVoteElection(msg.id, cand.id)}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                        hasVoted
                                          ? 'bg-[#00E5D4] text-[#03090D] shadow-[0_0_8px_rgba(0,229,212,0.4)]'
                                          : 'bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30'
                                      }`}
                                    >
                                      <Vote size={11} />
                                      <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-1.5 bg-[#03090D] rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] transition-all duration-500 rounded-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : msg.postType === 'event' || msg.event ? (
                    /* 📅 GROUP MEETUP / EVENT CARD */
                    <div className="w-full sm:min-w-[300px] max-w-sm rounded-2xl bg-[#03090D] border border-[#00CFEF]/40 p-3.5 my-1 shadow-[0_0_20px_rgba(0,207,239,0.15)] flex flex-col gap-2.5 text-left">
                      <div className="flex items-center justify-between border-b border-[#00CFEF]/20 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#00CFEF]/15 border border-[#00CFEF]/30 flex items-center justify-center shrink-0">
                            <Calendar size={18} className="text-[#00CFEF]" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-white text-xs sm:text-sm">
                              {msg.event?.title || 'Group Meetup'}
                            </h4>
                            <span className="text-[10px] text-[#00CFEF] font-mono">
                              {msg.event?.date || 'Saturday at 2:00 PM'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00CFEF]/10 text-[#00CFEF] border border-[#00CFEF]/30">
                          RSVP
                        </span>
                      </div>

                      {msg.event?.location && (
                        <div className="flex items-center gap-1.5 text-xs text-[#A8BBC2]">
                          <MapPin size={12} className="text-[#00E5D4] shrink-0" />
                          <span className="truncate">{msg.event.location}</span>
                        </div>
                      )}

                      {msg.event?.description && (
                        <p className="text-[11px] text-[#A8BBC2] leading-tight">
                          {msg.event.description}
                        </p>
                      )}

                      {/* Attendees summary and RSVP Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[11px] text-[#A8BBC2]">
                          👥 {msg.event?.attendees?.length || 1} attending
                        </span>

                        {(() => {
                          const isAttending = msg.event?.attendees?.includes(currentUser.name);
                          return (
                            <button
                              type="button"
                              onClick={() => onRsvpEvent && onRsvpEvent(msg.id, isAttending ? 'declined' : 'attending')}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isAttending
                                  ? 'bg-[#20E66B] text-[#03090D] shadow-[0_0_10px_rgba(32,230,107,0.3)]'
                                  : 'bg-[#0B1B22] border border-[#00CFEF]/30 text-[#00CFEF] hover:bg-[#00CFEF] hover:text-[#03090D]'
                              }`}
                            >
                              {isAttending ? '✓ Attending' : 'RSVP Join'}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  ) : msg.postType === 'announcement' ? (
                    /* 📢 ROYAL DECREE / ANNOUNCEMENT */
                    <div className="w-full sm:min-w-[280px] max-w-sm rounded-2xl bg-gradient-to-r from-[#07151B] to-[#0B1B22] border-2 border-amber-400/40 p-3.5 my-1 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-2 text-left">
                      <div className="flex items-center gap-2 border-b border-amber-400/20 pb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                          <Megaphone size={15} className="text-amber-400" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                            👑 Royal Group Decree
                          </span>
                          <span className="text-xs font-bold text-white">
                            Issued by {msg.senderName}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-medium pl-2 border-l-2 border-amber-400">
                        {msg.text}
                      </p>
                    </div>
                  ) : msg.mediaType !== 'document' ? (
                    <p className={`${msgTextSizeClass} leading-relaxed whitespace-pre-wrap select-text`}>
                      {msg.text}
                    </p>
                  ) : null}

                  {/* Message Footer: Timestamp & Double-Tick Delivery/Read Receipts */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe
                        ? outgoingIsWhiteText
                          ? 'text-white/80'
                          : 'text-[#03090D]/80'
                        : theme.isLightSurface
                        ? 'text-slate-500'
                        : 'text-[#A8BBC2]'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && renderReceiptTick(msg.status, false)}
                  </div>

                  {/* Reactions list pill on bubble */}
                  {msg.reactions && (
                    <div className="absolute -bottom-2 right-2 flex items-center gap-1 bg-[#0B1B22] border border-[#00E5D4]/30 px-2 py-0.5 rounded-full text-xs shadow-md">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center gap-0.5">
                          <span>{emoji}</span>
                          <span className="text-[10px] text-[#00E5D4] font-bold">
                            {count}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                )}

                {/* Quick Hover Action Bar (Safe positioning inside mobile/tablet viewport) */}
                <div
                  className={`absolute -top-9 opacity-0 group-hover/bubble:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 bg-[#07151B] border border-[#00E5D4]/30 rounded-full px-2 py-1 shadow-lg z-20 ${
                    isMe ? 'right-0' : 'left-0'
                  }`}
                >
                  {['🔥', '❤️', '👍'].map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => onReaction && onReaction(msg.id, emo)}
                      className="p-1 hover:scale-125 transition-transform text-xs cursor-pointer"
                      title={`React ${emo}`}
                    >
                      {emo}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 text-[#A8BBC2] hover:text-[#00E5D4] transition-colors cursor-pointer"
                    title="Reply"
                  >
                    <Reply size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Hidden Local File Inputs */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLocalImageSelect}
      />
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleLocalVideoSelect}
      />
      <input
        ref={audioFileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac,.opus"
        className="hidden"
        onChange={handleLocalAudioSelect}
      />
      <input
        ref={docFileInputRef}
        type="file"
        className="hidden"
        onChange={handleLocalDocSelect}
      />

      {/* 3. REPLY BANNER IF ACTIVE */}
      {replyingTo && (
        <div className={`px-4 py-2 border-t flex items-center justify-between animate-in slide-in-from-bottom-2 ${theme.secondarySurfaceClass}`}>
          <div className="flex items-center gap-2 min-w-0">
            <CornerDownRight size={14} className={theme.pinnedAccentTextClass} />
            <div className="text-xs truncate">
              <span className={`${theme.pinnedAccentTextClass} font-semibold`}>
                Replying to {replyingTo.senderName}:
              </span>{' '}
              <span className="opacity-80">{replyingTo.text}</span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3B. LOCAL IMAGE UPLOAD PREVIEW BAR */}
      {pendingImageUpload && (
        <div className={`px-4 py-3 border-t flex items-center gap-3 animate-in slide-in-from-bottom-2 z-20 ${theme.secondarySurfaceClass}`}>
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#00E5D4]/40 shrink-0">
            <img
              src={pendingImageUpload.url}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <span className={`text-[11px] font-bold ${theme.pinnedAccentTextClass}`}>
              Ready to post image from local files
            </span>
            <input
              type="text"
              value={pendingImageUpload.caption}
              onChange={(e) =>
                setPendingImageUpload((prev) =>
                  prev ? { ...prev, caption: e.target.value } : null
                )
              }
              placeholder="Add an optional caption..."
              className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${theme.chatWindowComposerInputClass}`}
            />
          </div>
          <button
            type="button"
            onClick={() => setPendingImageUpload(null)}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
            title="Cancel image upload"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3C. LOCAL VIDEO UPLOAD PREVIEW BAR */}
      {pendingVideoUpload && (
        <div className={`px-4 py-3 border-t flex items-center gap-3 animate-in slide-in-from-bottom-2 z-20 ${theme.secondarySurfaceClass}`}>
          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-[#00E5D4]/40 shrink-0 bg-black">
            <video
              src={pendingVideoUpload.url}
              className="w-full h-full object-cover"
              muted
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className={`${theme.pinnedAccentTextClass} truncate`}>
                🎬 {pendingVideoUpload.name}
              </span>
              <span className="opacity-70 font-mono shrink-0">({pendingVideoUpload.size})</span>
            </div>
            <input
              type="text"
              value={pendingVideoUpload.caption}
              onChange={(e) =>
                setPendingVideoUpload((prev) =>
                  prev ? { ...prev, caption: e.target.value } : null
                )
              }
              placeholder="Add a video caption..."
              className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${theme.chatWindowComposerInputClass}`}
            />
          </div>
          <button
            type="button"
            onClick={() => setPendingVideoUpload(null)}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
            title="Cancel video upload"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3D. LOCAL AUDIO FILE UPLOAD PREVIEW BAR */}
      {pendingAudioUpload && (
        <div className={`px-4 py-3 border-t flex items-center gap-3 animate-in slide-in-from-bottom-2 z-20 ${theme.secondarySurfaceClass}`}>
          <button
            type="button"
            onClick={handleTogglePreviewAudio}
            className="w-11 h-11 rounded-2xl bg-[#00E5D4]/20 border border-[#00E5D4]/45 text-[#00E5D4] flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors"
            title={isPreviewAudioPlaying ? 'Pause audio preview' : 'Listen to audio preview'}
          >
            {isPreviewAudioPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className={`${theme.pinnedAccentTextClass} truncate`}>
                🎵 {pendingAudioUpload.name}
              </span>
              <span className="opacity-75 font-mono shrink-0">
                {pendingAudioUpload.duration} · {pendingAudioUpload.size}
              </span>
            </div>
            <input
              type="text"
              value={pendingAudioUpload.caption}
              onChange={(e) =>
                setPendingAudioUpload((prev) =>
                  prev ? { ...prev, caption: e.target.value } : null
                )
              }
              placeholder="Optional note about this audio..."
              className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none ${theme.chatWindowComposerInputClass}`}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              stopPreviewAudio();
              setPendingAudioUpload(null);
            }}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 cursor-pointer"
            title="Cancel audio upload"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3E. MICROPHONE BLOCKED HELPFUL BAR */}
      {micBlockedError && (
        <div className="px-4 py-2.5 border-t border-amber-400/30 bg-[#0B1B22] flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 z-20">
          <span className="flex-1 min-w-[180px]">{micBlockedError}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-[#00E5D4] text-[#03090D] font-bold text-[11px] cursor-pointer"
            >
              Pick Audio File
            </button>
            <button
              type="button"
              onClick={() => setMicBlockedError(null)}
              className="p-1 text-[#A8BBC2] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 4. ATTACHMENT MENU POPOVER */}
      {showAttachMenu && (
        <div className={`absolute bottom-20 left-4 border rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 z-30 animate-in fade-in min-w-[240px] ${theme.secondarySurfaceClass}`}>
          <span className={`text-[11px] font-bold uppercase px-1 ${theme.pinnedAccentTextClass}`}>
            Share from Device & Presets
          </span>
          <button
            type="button"
            onClick={() => imageFileInputRef.current?.click()}
            className="flex items-center gap-2.5 p-2 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload size={16} className="text-[#00E5D4]" />
            <span>Upload Photo from Files</span>
          </button>
          <button
            type="button"
            onClick={() => videoFileInputRef.current?.click()}
            className="flex items-center gap-2.5 p-2 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Film size={16} className="text-[#00CFEF]" />
            <span>Upload Video from Device</span>
          </button>
          <button
            type="button"
            onClick={() => audioFileInputRef.current?.click()}
            className="flex items-center gap-2.5 p-2 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Music size={16} className="text-amber-400" />
            <span>Upload Audio / Music from Device</span>
          </button>
          <button
            type="button"
            onClick={() => docFileInputRef.current?.click()}
            className="flex items-center gap-2.5 p-2 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText size={16} className="text-[#20E66B]" />
            <span>Upload Document from Files</span>
          </button>

          <div className="h-px bg-current opacity-15 my-0.5" />

          <button
            type="button"
            onClick={() =>
              handleSendSampleImage(
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
              )
            }
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Camera size={16} className="text-[#00E5D4]" />
            <span>Sample Mountain View Photo</span>
          </button>
          <button
            type="button"
            onClick={handleSendSampleVideo}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Video size={16} className="text-[#00CFEF]" />
            <span>Sample Blossom Clip Video</span>
          </button>
          <button
            type="button"
            onClick={handleSendDocument}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <FileText size={16} className="text-[#20E66B]" />
            <span>Sample Physics Notes PDF</span>
          </button>

          {/* Group Post special actions for group chats */}
          {chat.type === 'group' && (
            <>
              <div className="h-px bg-current opacity-15 my-1" />
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  setShowGroupPostModal(true);
                }}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs text-amber-400 transition-colors cursor-pointer font-semibold"
              >
                <Crown size={16} className="text-amber-400 fill-amber-400" />
                Schedule King Election 👑
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  setShowGroupPostModal(true);
                }}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs text-[#00CFEF] transition-colors cursor-pointer font-semibold"
              >
                <Calendar size={16} className="text-[#00CFEF]" />
                Create Group Meetup 📅
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  setShowGroupPostModal(true);
                }}
                className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Megaphone size={16} className="text-[#00E5D4]" />
                Royal Decree Announcement 📢
              </button>
            </>
          )}
        </div>
      )}

      {/* 5. EMOJIS & LIVE ANIMATED STICKERS TRAY (WHATSAPP STYLE) */}
      <EmojiStickerPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelectEmoji={(emoji) => setInputText((prev) => prev + emoji)}
        onSelectSticker={handleSendSticker}
        customStickers={customStickers}
        onSelectCustomSticker={handleSendCustomSticker}
        onOpenCreateSticker={() => setShowCreateStickerModal(true)}
        onDeleteCustomSticker={onDeleteCustomSticker}
      />

      {/* 6. MESSAGE COMPOSER BAR (OR BLOCKED NOTICE) */}
      {isBlocked ? (
        <div className="p-4 bg-[#07151B]/95 border-t border-[#F33248]/25 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#A8BBC2]">
            <ShieldAlert size={16} className="text-[#F33248] shrink-0" />
            <span>You blocked {chat.name}. Unblock to send a message.</span>
          </div>
          {onUnblockContact && (
            <button
              type="button"
              onClick={() => onUnblockContact(chat.id)}
              className="px-3.5 py-1.5 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer shrink-0"
            >
              Unblock
            </button>
          )}
        </div>
      ) : (
        <div
          className="p-2.5 sm:p-4 border-t backdrop-blur-md shrink-0 transition-colors"
          style={theme.chatWindowComposerStyle}
        >
          {isRecordingVoice ? (
            /* Live Voice Recording Bar with real AnalyserNode bars */
            <div className="flex items-center justify-between gap-2 bg-[#0B1B22] border border-red-500/40 rounded-full px-3.5 sm:px-5 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-xs font-mono font-bold text-red-400 shrink-0">
                  0:{voiceSeconds < 10 ? '0' : ''}
                  {voiceSeconds}
                </span>
                <div className="hidden xs:flex sm:flex items-center gap-0.5 h-6">
                  {liveWaveform.map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-[#00E5D4] transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                {micPermissionNote && (
                  <span className="hidden md:inline text-[10px] text-[#A8BBC2]">
                    ({micPermissionNote})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="text-xs text-[#A8BBC2] hover:text-white px-2.5 py-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinishVoiceRecord}
                  style={theme.sendBtnStyle}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer ${theme.sendBtnTextClass}`}
                >
                  <Send size={12} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Regular Text & Media Input */
            <form onSubmit={handleSend} className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                  theme.isLightSurface
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-[#A8BBC2] hover:text-white hover:bg-white/10'
                }`}
                title="Add Emoji & Stickers"
              >
                <Smile size={19} />
              </button>

              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                  theme.isLightSurface
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-[#A8BBC2] hover:text-white hover:bg-white/10'
                }`}
                title="Attachments & Local Files"
              >
                <Paperclip size={19} />
              </button>

              <button
                type="button"
                onClick={() => imageFileInputRef.current?.click()}
                className={`hidden sm:inline-flex p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                  theme.isLightSurface
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-[#A8BBC2] hover:text-white hover:bg-white/10'
                }`}
                title="Upload Photo from Device"
              >
                <ImageIcon size={19} />
              </button>

              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                className={`hidden sm:inline-flex p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                  theme.isLightSurface
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-[#A8BBC2] hover:text-white hover:bg-white/10'
                }`}
                title="Upload Video from Device"
              >
                <Film size={19} />
              </button>

              <button
                type="button"
                onClick={() => audioFileInputRef.current?.click()}
                className={`hidden sm:inline-flex p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                  theme.isLightSurface
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                    : 'text-[#A8BBC2] hover:text-white hover:bg-white/10'
                }`}
                title="Send Audio File from Device"
              >
                <Music size={19} />
              </button>

              {/* Main Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && settings && !settings.chats.enterIsSend) {
                    e.preventDefault();
                  }
                }}
                placeholder="Message..."
                className={`flex-1 min-w-0 border rounded-full px-4 sm:px-5 py-2.5 text-sm focus:outline-none transition-colors ${theme.chatWindowComposerInputClass}`}
              />

              {/* Voice Record Toggle or Send Button */}
              {inputText.trim() || pendingImageUpload || pendingVideoUpload || pendingAudioUpload ? (
                <button
                  type="submit"
                  style={theme.sendBtnStyle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer shrink-0 ${theme.sendBtnTextClass}`}
                  title="Send Message"
                >
                  <Send size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  style={theme.sendBtnStyle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-all cursor-pointer shrink-0 shadow-md ${theme.sendBtnTextClass}`}
                  title="Record Voice Note"
                >
                  <Mic size={18} />
                </button>
              )}
            </form>
          )}
        </div>
      )}

      {/* 7. CONTACT & GROUP INFO DRAWER */}
      <ContactInfoDrawer
        chat={chat}
        currentUser={currentUser}
        availableContacts={availableContacts}
        isOpen={showContactDrawer}
        onClose={() => setShowContactDrawer(false)}
        onStartCall={onStartCall}
        onClearChat={onClearChat}
        onAddGroupMembers={onAddGroupMembers}
        onRemoveGroupMember={onRemoveGroupMember}
        onUpdateGroupAvatar={onUpdateGroupAvatar}
        onToggleGroupAdmin={onToggleGroupAdmin}
        onSetGroupKing={onSetGroupKing}
        onOpenGroupElectionModal={() => setShowGroupPostModal(true)}
        onOpenWallpaperSettings={onOpenWallpaperSettings}
      />

      {/* 8. MEDIA LIGHTBOX MODAL */}
      <MediaLightboxModal
        mediaUrl={lightboxMedia?.url || null}
        mediaType={lightboxMedia?.type}
        caption={lightboxMedia?.caption}
        onClose={() => setLightboxMedia(null)}
      />

      {/* 9. CREATE GROUP POST / KING ELECTION MODAL */}
      {chat.type === 'group' && (
        <CreateGroupPostModal
          chat={chat}
          currentUser={currentUser}
          isOpen={showGroupPostModal}
          onClose={() => setShowGroupPostModal(false)}
          onPostElection={(election) => {
            if (onPostElection) onPostElection(election);
          }}
          onPostEvent={(event) => {
            if (onPostEvent) onPostEvent(event);
          }}
          onPostAnnouncement={(title, text) => {
            if (onPostAnnouncement) onPostAnnouncement(title, text);
          }}
        />
      )}
      {/* 10. CREATE CUSTOM STICKER STUDIO */}
      <CreateStickerModal
        isOpen={showCreateStickerModal}
        onClose={() => setShowCreateStickerModal(false)}
        onSaveSticker={(sticker, sendNow) => {
          onCreateCustomSticker?.(sticker);
          if (sendNow) {
            handleSendCustomSticker(sticker);
          } else {
            setShowEmojiPicker(true);
          }
        }}
      />
    </div>
  );
};
