import React from 'react';

export interface LiveSticker {
  id: string;
  name: string;
  pack: string;
  animationClass: string;
  emojiFallback: string;
  svgContent?: React.ReactNode;
  badgeText?: string;
  bgGradient?: string;
  ringColor?: string;
  shapeStyle?: 'circle' | 'hex' | 'pill' | 'squircle';
}

export const EMOJI_CATEGORIES = [
  { id: 'smileys', name: 'Smileys & Emotion', icon: '😀' },
  { id: 'gestures', name: 'Gestures & People', icon: '👋' },
  { id: 'hearts', name: 'Hearts & Symbols', icon: '💙' },
  { id: 'animals', name: 'Animals & Nature', icon: '🐱' },
  { id: 'food', name: 'Food & Drinks', icon: '🍔' },
  { id: 'activities', name: 'Activities & Sports', icon: '⚽️' },
  { id: 'travel', name: 'Travel & Places', icon: '🚀' },
  { id: 'objects', name: 'Objects & Tech', icon: '💻' },
  { id: 'flags', name: 'Flags', icon: '🏁' },
];

export const EMOJI_DATABASE: Record<string, string[]> = {
  smileys: [
    '😀', '😃', '😄', '😁', '😆', '🥹', '😅', '😂', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉',
    '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
    '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺',
    '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🫣', '🤭', '🥱', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲',
    '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿',
    '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃',
  ],
  gestures: [
    '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫷', '🫸', '👌', '🤌', '🤏', '✌️', '🤞',
    '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜',
    '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '👀', '🧠', '🦸',
    '🧙', '🧝', '🥷', '🧑', '👩', '👨', '🙋', '🙆', '🙅', '🤷', '🤦',
  ],
  hearts: [
    '💙', '🩵', '🤍', '🖤', '❤️', '🧡', '💛', '💚', '💜', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞',
    '💓', '💗', '💖', '💘', '💝', '💟', '💯', '✨', '⚡', '🔥', '💫', '🌟', '💥', '💢', '💠', '👑',
  ],
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐧', '🐦', '🦅', '🦉', '🐺', '🦄', '🐝', '🦋', '🐢', '🐍', '🦖', '🐙',
    '🐬', '🐳', '🦈', '🐊', '🐆', '🦓', '🐘', '🦒', '🦘', '🦜', '🦚', '🦩', '🐉', '🌵', '🌲', '🌴',
    '🌿', '🍀', '🌹', '🌸', '🌻', '🌈', '☀️', '🌙', '⭐️', '❄️', '🌊',
  ],
  food: [
    '🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥑', '🌶️',
    '🥐', '🍞', '🧀', '🍳', '🥞', '🥓', '🍔', '🍟', '🍕', '🌮', '🌯', '🍜', '🍝', '🍛', '🍣', '🍱',
    '🥟', '🍤', '🍰', '🎂', '🧁', '🍩', '🍪', '🍫', '🍿', '☕️', '🍵', '🧃', '🧋', '🥤', '🥂', '🍾',
  ],
  activities: [
    '⚽️', '🏀', '🏈', '⚾️', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '⛳️', '🏹', '🥊', '🥋',
    '🛹', '🏂', '🏋️', '🤸', '🏄', '🏊', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎨', '🎬', '🎤',
    '🎧', '🎼', '🎹', '🥁', '🎸', '🎲', '🎯', '🎮', '🧩',
  ],
  travel: [
    '🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚲', '🛵', '🏍️', '✈️', '🚀', '🛸', '🚁', '⛵️', '🚤',
    '🚢', '🗺️', '🗿', '🗽', '🗼', '🏰', '🎡', '🏖️', '🏝️', '🏔️', '🏕️', '🏡', '🏙️',
  ],
  objects: [
    '⌚️', '📱', '💻', '⌨️', '🖥️', '🖱️', '🕹️', '📷', '📹', '🎥', '☎️', '📺', '📻', '🎙️', '⏰', '📡',
    '🔋', '💡', '🔦', '💸', '💵', '🪙', '💰', '💳', '💎', '🔧', '🔨', '⚙️', '🛡️', '🔮', '🔭', '🔬',
    '🔑', '🗝️', '📦', '📊', '📈', '📚', '📖', '🔖', '📎', '📌', '✂️', '📝', '🔍', '🔒', '🔓',
  ],
  flags: [
    '🏁', '🚩', '🏴‍☠️', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇨🇳', '🇮🇳', '🇧🇷', '🇿🇦',
    '🇺🇬', '🇰🇪', '🇳🇬', '🇬🇭', '🇪🇬', '🇷🇼', '🇹🇿', '🇦🇪', '🇸🇦', '🇰🇷', '🇮🇹', '🇪🇸', '🇲🇽', '🇸🇬',
  ],
};

// Base Hero Vector Live Stickers (Preserved for existing chat history IDs)
const HERO_VECTOR_STICKERS: LiveSticker[] = [
  {
    id: 'st_cyber_bot',
    name: 'Linmax Bot',
    pack: 'Linmax Cyber',
    animationClass: 'animate-sticker-bounce',
    emojiFallback: '🤖',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,229,212,0.6)]">
        <defs>
          <linearGradient id="stCyberGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5D4" />
            <stop offset="100%" stopColor="#00CFEF" />
          </linearGradient>
        </defs>
        <line x1="50" y1="18" x2="50" y2="28" stroke="#00E5D4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="14" r="5" fill="#76FFF5" />
        <rect x="22" y="28" width="56" height="48" rx="14" fill="#0B1B22" stroke="url(#stCyberGrad)" strokeWidth="4" />
        <rect x="30" y="42" width="40" height="14" rx="7" fill="#00E5D4" opacity="0.9" />
        <circle cx="40" cy="49" r="3" fill="#03090D" />
        <circle cx="60" cy="49" r="3" fill="#03090D" />
        <path d="M 40 64 Q 50 71 60 64" stroke="#76FFF5" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="62" r="3" fill="#00CFEF" opacity="0.7" />
        <circle cx="70" cy="62" r="3" fill="#00CFEF" opacity="0.7" />
      </svg>
    ),
  },
  {
    id: 'st_neon_heart',
    name: 'Neon Pulse',
    pack: 'Linmax Cyber',
    animationClass: 'animate-sticker-heartbeat',
    emojiFallback: '💙',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_18px_rgba(0,229,212,0.8)]">
        <defs>
          <linearGradient id="stHeartGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E5D4" />
            <stop offset="60%" stopColor="#00CFEF" />
            <stop offset="100%" stopColor="#00838F" />
          </linearGradient>
        </defs>
        <path
          d="M 50 82 C 18 58 10 38 18 24 C 26 12 42 14 50 28 C 58 14 74 12 82 24 C 90 38 82 58 50 82 Z"
          fill="url(#stHeartGrad)"
        />
        <path
          d="M 28 32 C 34 22 44 26 48 36"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <circle cx="68" cy="34" r="3.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: 'st_rocket_blast',
    name: 'Linmax Rocket',
    pack: 'Linmax Cyber',
    animationClass: 'animate-sticker-rocket',
    emojiFallback: '🚀',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="stRocketGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#00E5D4" />
            <stop offset="100%" stopColor="#00CFEF" />
          </linearGradient>
        </defs>
        <path
          d="M 50 15 C 65 30 70 58 65 72 L 35 72 C 30 58 35 30 50 15 Z"
          fill="url(#stRocketGrad)"
        />
        <path d="M 35 55 L 20 70 L 35 70 Z" fill="#00838F" />
        <path d="M 65 55 L 80 70 L 65 70 Z" fill="#00838F" />
        <circle cx="50" cy="42" r="9" fill="#07151B" stroke="#00E5D4" strokeWidth="3" />
        <circle cx="50" cy="42" r="4" fill="#76FFF5" />
        <path d="M 40 73 Q 50 95 60 73 Z" fill="#FF8A00" className="animate-pulse" />
        <path d="M 44 73 Q 50 88 56 73 Z" fill="#FFD600" />
      </svg>
    ),
  },
  {
    id: 'st_fire_hype',
    name: 'Cyber Flame',
    pack: 'Linmax Cyber',
    animationClass: 'animate-sticker-flame',
    emojiFallback: '🔥',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="stFireGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#FF3300" />
            <stop offset="40%" stopColor="#FF8800" />
            <stop offset="80%" stopColor="#00E5D4" />
            <stop offset="100%" stopColor="#76FFF5" />
          </linearGradient>
        </defs>
        <path
          d="M 50 12 C 58 28 78 38 78 62 C 78 78 65 88 50 88 C 35 88 22 78 22 62 C 22 45 40 32 42 22 Z"
          fill="url(#stFireGrad)"
        />
        <path
          d="M 50 42 C 55 52 64 58 64 70 C 64 78 58 82 50 82 C 42 82 36 78 36 70 C 36 60 46 54 48 48 Z"
          fill="#FFE600"
        />
      </svg>
    ),
  },
  {
    id: 'st_dancing_cat',
    name: 'Party Cat',
    pack: 'Expressions',
    animationClass: 'animate-sticker-dance',
    emojiFallback: '🐱',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,180,0,0.5)]">
        <circle cx="50" cy="52" r="32" fill="#FFA726" />
        <polygon points="26,30 38,12 48,26" fill="#FFA726" />
        <polygon points="30,28 38,18 44,26" fill="#FF7043" />
        <polygon points="74,30 62,12 52,26" fill="#FFA726" />
        <polygon points="70,28 62,18 56,26" fill="#FF7043" />
        <path d="M 36 48 Q 42 40 48 48" stroke="#3E2723" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 52 48 Q 58 40 64 48" stroke="#3E2723" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <polygon points="48,56 52,56 50,59" fill="#D84315" />
        <path d="M 44 60 Q 50 64 50 60 Q 50 64 56 60" stroke="#3E2723" strokeWidth="2.5" fill="none" />
        <circle cx="34" cy="58" r="4" fill="#FF5722" opacity="0.6" />
        <circle cx="66" cy="58" r="4" fill="#FF5722" opacity="0.6" />
        <text x="75" y="24" fontSize="18" fill="#00E5D4">🎵</text>
      </svg>
    ),
  },
  {
    id: 'st_laughing_tears',
    name: 'Dead Laughing',
    pack: 'Expressions',
    animationClass: 'animate-sticker-laugh',
    emojiFallback: '🤣',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,200,0,0.6)]">
        <circle cx="50" cy="50" r="38" fill="#FFD600" />
        <path d="M 28 38 L 42 45 L 28 52" stroke="#37474F" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 72 38 L 58 45 L 72 52" stroke="#37474F" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 32 58 Q 50 90 68 58 Z" fill="#6A1B9A" />
        <path d="M 40 78 Q 50 68 60 78 Z" fill="#E91E63" />
        <path d="M 20 44 Q 10 54 20 62 Q 26 54 20 44 Z" fill="#00CFEF" className="animate-pulse" />
        <path d="M 80 44 Q 90 54 80 62 Q 74 54 80 44 Z" fill="#00CFEF" className="animate-pulse" />
      </svg>
    ),
  },
  {
    id: 'st_mind_blown',
    name: 'Mind Blown',
    pack: 'Expressions',
    animationClass: 'animate-sticker-wiggle',
    emojiFallback: '🤯',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M 22 55 C 22 75 35 88 50 88 C 65 88 78 75 78 55 Z" fill="#FFCA28" />
        <circle cx="38" cy="62" r="7" fill="#FFFFFF" />
        <circle cx="38" cy="62" r="3" fill="#212121" />
        <circle cx="62" cy="62" r="7" fill="#FFFFFF" />
        <circle cx="62" cy="62" r="3" fill="#212121" />
        <circle cx="50" cy="76" r="6" fill="#37474F" />
        <path
          d="M 50 14 C 38 14 30 22 34 32 C 24 34 20 42 26 50 C 35 52 65 52 74 50 C 80 42 76 34 66 32 C 70 22 62 14 50 14 Z"
          fill="#FF5722"
          className="animate-pulse"
        />
        <polygon points="50,6 52,11 57,11 53,14 55,19 50,16 45,19 47,14 43,11 48,11" fill="#FFEB3B" />
      </svg>
    ),
  },
  {
    id: 'st_flex_bicep',
    name: 'Sure Bro Flex',
    pack: 'Expressions',
    animationClass: 'animate-sticker-bounce',
    emojiFallback: '💪',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(0,229,212,0.5)]">
        <defs>
          <linearGradient id="stFlexGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFA726" />
            <stop offset="100%" stopColor="#FF7043" />
          </linearGradient>
        </defs>
        <path
          d="M 28 75 C 25 55 35 32 50 32 C 65 32 72 45 68 55 C 75 50 84 55 82 68 C 80 78 70 82 58 80 C 44 80 32 82 28 75 Z"
          fill="url(#stFlexGrad)"
        />
        <path d="M 45 42 Q 52 35 60 44" stroke="#D84315" strokeWidth="3" fill="none" strokeLinecap="round" />
        <text x="64" y="28" fontSize="18">✨</text>
      </svg>
    ),
  },
  {
    id: 'st_cool_shades',
    name: 'Pure Swagger',
    pack: 'Vibes & Memes',
    animationClass: 'animate-sticker-float',
    emojiFallback: '😎',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,207,239,0.5)]">
        <circle cx="50" cy="50" r="38" fill="#FFCA28" />
        <path d="M 22 42 Q 35 38 48 42 L 52 42 Q 65 38 78 42 L 74 54 Q 62 60 52 52 L 48 52 Q 38 60 26 54 Z" fill="#07151B" stroke="#00E5D4" strokeWidth="2.5" />
        <line x1="30" y1="46" x2="40" y2="52" stroke="#00CFEF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="46" x2="70" y2="52" stroke="#00CFEF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 36 65 Q 50 78 64 65" stroke="#37474F" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'st_party_celebrate',
    name: 'Celebration',
    pack: 'Vibes & Memes',
    animationClass: 'animate-sticker-dance',
    emojiFallback: '🎉',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="30,78 60,78 75,32 15,32" fill="#E91E63" />
        <polygon points="18,32 72,32 45,84" fill="#FFC107" />
        <circle cx="25" cy="20" r="4" fill="#00E5D4" className="animate-ping" />
        <circle cx="50" cy="12" r="5" fill="#E91E63" />
        <circle cx="75" cy="18" r="4" fill="#00CFEF" className="animate-ping" />
        <path d="M 35 24 Q 45 10 55 24" stroke="#9C27B0" strokeWidth="3" fill="none" />
        <polygon points="68,8 72,14 78,14 74,18 76,24 70,20 64,24 66,18 62,14 68,14" fill="#FFEB3B" />
      </svg>
    ),
  },
  {
    id: 'st_flying_cash',
    name: 'Making Bank',
    pack: 'Vibes & Memes',
    animationClass: 'animate-sticker-float',
    emojiFallback: '💸',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(32,230,107,0.5)]">
        <rect x="24" y="36" width="52" height="32" rx="5" fill="#20E66B" stroke="#004D40" strokeWidth="3" />
        <circle cx="50" cy="52" r="10" fill="#07151B" opacity="0.3" />
        <text x="44" y="58" fontSize="16" fontWeight="bold" fill="#07151B">$</text>
        <path d="M 24 44 Q 8 32 12 56 Q 22 54 24 50" fill="#FFFFFF" stroke="#B2DFDB" strokeWidth="1.5" />
        <path d="M 76 44 Q 92 32 88 56 Q 78 54 76 50" fill="#FFFFFF" stroke="#B2DFDB" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'st_thumbs_up_gigachad',
    name: '100% Approved',
    pack: 'Vibes & Memes',
    animationClass: 'animate-sticker-bounce',
    emojiFallback: '👍',
    svgContent: (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,229,212,0.7)]">
        <circle cx="50" cy="50" r="38" fill="#00E5D4" />
        <path
          d="M 38 46 L 38 68 L 46 68 L 46 46 Z M 48 46 L 48 68 C 55 68 64 68 67 62 C 70 56 68 50 68 50 C 72 48 72 44 70 42 C 68 40 68 38 64 38 L 56 38 C 56 38 58 26 52 24 C 48 22 46 28 46 36 L 44 46 Z"
          fill="#03090D"
        />
        <text x="32" y="85" fontSize="11" fontWeight="bold" fill="#FF1744">💯 LINMAX</text>
      </svg>
    ),
  },
];

// 10 Fresh Curated Pack Definitions totaling 1,000+ Animated Live Stickers
interface PackBluePrint {
  pack: string;
  emojis: string[];
  words: string[];
  gradients: string[];
  rings: string[];
  anims: string[];
  shapes: Array<'circle' | 'hex' | 'pill' | 'squircle'>;
}

const PACK_BLUEPRINTS: PackBluePrint[] = [
  {
    pack: 'Linmax Cyber',
    emojis: ['🤖', '⚡', '💠', '🛸', '🚀', '🔋', '🛰️', '🧿', '🎧', '🌐', '💎'],
    words: ['CYBER', 'ONLINE', 'NITRO', 'SYNC', 'PULSE', 'TURBO', 'MAX', 'QUANTUM', 'NEON', 'PING', 'BOSS'],
    gradients: [
      'linear-gradient(135deg, #00E5D4 0%, #0284C7 100%)',
      'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
      'linear-gradient(135deg, #06B6D4 0%, #10B981 100%)',
      'linear-gradient(135deg, #0F172A 0%, #00E5D4 100%)',
    ],
    rings: ['#00E5D4', '#38BDF8', '#76FFF5', '#22D3EE'],
    anims: ['animate-sticker-bounce', 'animate-sticker-float', 'animate-sticker-heartbeat', 'animate-sticker-wiggle'],
    shapes: ['squircle', 'hex', 'circle'],
  },
  {
    pack: 'Expressions',
    emojis: ['😂', '🥹', '😎', '🤩', '🥳', '🤯', '😱', '🫣', '🫡', '😏', '😇'],
    words: ['LOL', 'REAL', 'NO WAY', 'MOOD', 'SHEESH', 'FR FR', 'OKAY', 'WINK', 'LEGIT', 'WHOA', 'SAME'],
    gradients: [
      'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
      'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
      'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    ],
    rings: ['#FDE047', '#FB7185', '#FDBA74', '#F472B6'],
    anims: ['animate-sticker-laugh', 'animate-sticker-dance', 'animate-sticker-wiggle', 'animate-sticker-bounce'],
    shapes: ['circle', 'squircle', 'pill'],
  },
  {
    pack: 'Vibes & Memes',
    emojis: ['🔥', '💯', '💸', '🎉', '🙌', '🫶', '✨', '👑', '💥', '🧨', '🪩'],
    words: ['HYPE', 'FACTS', 'GOAT', 'WIN', 'SLAY', 'VIBE', 'BOOM', 'CHILL', 'ICONIC', 'FLEX', 'W'],
    gradients: [
      'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
      'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)',
      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'linear-gradient(135deg, #D946EF 0%, #6366F1 100%)',
    ],
    rings: ['#C084FC', '#34D399', '#F472B6', '#FBBF24'],
    anims: ['animate-sticker-flame', 'animate-sticker-dance', 'animate-sticker-bounce', 'animate-sticker-float'],
    shapes: ['pill', 'squircle', 'circle'],
  },
  {
    pack: 'Love & Hearts',
    emojis: ['❤️', '💖', '💘', '💝', '🫶', '😘', '🥰', '🌹', '💐', '💓', '🩵'],
    words: ['LOVE', 'XOXO', 'MISS U', 'BAE', 'ADORE', 'YOURS', 'CUTIE', 'SWEET', 'HEART', 'HUGS', 'FOREVER'],
    gradients: [
      'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      'linear-gradient(135deg, #FB7185 0%, #A855F7 100%)',
      'linear-gradient(135deg, #FF5E7E 0%, #FF99AC 100%)',
    ],
    rings: ['#FDA4AF', '#F9A8D4', '#FFFFFF', '#F43F5E'],
    anims: ['animate-sticker-heartbeat', 'animate-sticker-float', 'animate-sticker-dance', 'animate-sticker-bounce'],
    shapes: ['circle', 'squircle'],
  },
  {
    pack: 'Royal & VIP',
    emojis: ['👑', '🏆', '💎', '⚜️', '🦁', '🎖️', '🪩', '🥂', '🪄', '🗝️', '✨'],
    words: ['KING', 'ROYAL', 'VIP', 'ELITE', 'GOLD', 'CROWN', 'BOSS', 'APEX', 'STAR', 'NOBLE', 'PRIME'],
    gradients: [
      'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
      'linear-gradient(135deg, #1C1917 0%, #D97706 100%)',
      'linear-gradient(135deg, #4C1D95 0%, #F59E0B 100%)',
      'linear-gradient(135deg, #FDE047 0%, #EA580C 100%)',
    ],
    rings: ['#FDE68A', '#FBBF24', '#F59E0B', '#FFFBEB'],
    anims: ['animate-sticker-float', 'animate-sticker-heartbeat', 'animate-sticker-bounce', 'animate-sticker-wiggle'],
    shapes: ['hex', 'circle', 'squircle'],
  },
  {
    pack: 'Animals & Pets',
    emojis: ['🦁', '🐱', '🐶', '🐼', '🦊', '🐯', '🦄', '🐸', '🐧', '🦋', '🐉'],
    words: ['ROAR', 'MEOW', 'WOOF', 'CUTE', 'WILD', 'FROG', 'LUCKY', 'PANDA', 'FOXY', 'CUB', 'SWIFT'],
    gradients: [
      'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
      'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
      'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
      'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    ],
    rings: ['#86EFAC', '#FDBA74', '#7DD3FC', '#E9D5FF'],
    anims: ['animate-sticker-bounce', 'animate-sticker-wiggle', 'animate-sticker-dance', 'animate-sticker-float'],
    shapes: ['circle', 'squircle'],
  },
  {
    pack: 'Space & Gaming',
    emojis: ['🎮', '🕹️', '👾', '🌌', '🪐', '☄️', '🌟', '🛸', '🎯', '⚔️', '🛡️'],
    words: ['GG', 'LVL UP', 'PRO', 'MVP', 'ORBIT', 'CLUTCH', 'WIN', 'COMBO', 'HYPER', 'XP+', 'WARP'],
    gradients: [
      'linear-gradient(135deg, #1E1B4B 0%, #06B6D4 100%)',
      'linear-gradient(135deg, #312E81 0%, #A855F7 100%)',
      'linear-gradient(135deg, #020617 0%, #2563EB 100%)',
      'linear-gradient(135deg, #0F172A 0%, #EC4899 100%)',
    ],
    rings: ['#00F0FF', '#A855F7', '#38BDF8', '#F43F5E'],
    anims: ['animate-sticker-rocket', 'animate-sticker-bounce', 'animate-sticker-wiggle', 'animate-sticker-heartbeat'],
    shapes: ['hex', 'squircle'],
  },
  {
    pack: 'Food & Party',
    emojis: ['🍕', '🍔', '🍟', '🌮', '🍩', '🧋', '☕️', '🍰', '🍓', '🍉', '🍿'],
    words: ['YUM', 'SNACK', 'CHILL', 'COFFEE', 'TREAT', 'PARTY', 'TASTY', 'SWEET', 'LUNCH', 'CHEERS', 'FRESH'],
    gradients: [
      'linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)',
      'linear-gradient(135deg, #F472B6 0%, #FB7185 100%)',
      'linear-gradient(135deg, #10B981 0%, #84CC16 100%)',
      'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)',
    ],
    rings: ['#FDE047', '#FBCFE8', '#BEF264', '#FED7AA'],
    anims: ['animate-sticker-dance', 'animate-sticker-bounce', 'animate-sticker-float', 'animate-sticker-laugh'],
    shapes: ['circle', 'pill', 'squircle'],
  },
  {
    pack: 'Hustle & Sports',
    emojis: ['⚽️', '🏀', '🏅', '🏋️', '💪', '🏃', '📈', '💼', '💰', '⏱️', '🎯'],
    words: ['GOAL', 'GRIND', 'HUSTLE', 'CHAMP', 'WORK', 'FOCUS', 'WIN', 'POWER', 'SPEED', 'DREAM', 'PUSH'],
    gradients: [
      'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
      'linear-gradient(135deg, #1D4ED8 0%, #0284C7 100%)',
      'linear-gradient(135deg, #D97706 0%, #DC2626 100%)',
      'linear-gradient(135deg, #111827 0%, #10B981 100%)',
    ],
    rings: ['#34D399', '#60A5FA', '#FBBF24', '#FFFFFF'],
    anims: ['animate-sticker-bounce', 'animate-sticker-flame', 'animate-sticker-wiggle', 'animate-sticker-dance'],
    shapes: ['hex', 'squircle', 'circle'],
  },
  {
    pack: 'Quick Phrases',
    emojis: ['👋', '🙏', '✅', '👌', '👍', '🤝', '💬', '📢', '🔔', '🌙', '☀️'],
    words: ['GM!', 'GN!', 'ON MY WAY', 'BRB', 'THANK U', 'SORRY', 'YES!', 'NOPE', 'CALL ME', 'READY', 'PEACE'],
    gradients: [
      'linear-gradient(135deg, #00AFC2 0%, #007BFF 100%)',
      'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      'linear-gradient(135deg, #14B8A6 0%, #22C55E 100%)',
      'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    ],
    rings: ['#E0F2FE', '#C7D2FE', '#BBF7D0', '#FED7AA'],
    anims: ['animate-sticker-float', 'animate-sticker-bounce', 'animate-sticker-wiggle', 'animate-sticker-heartbeat'],
    shapes: ['pill', 'squircle'],
  },
];

// Generate 1,000 fresh procedurally styled stickers + 12 Hero vector SVGs = 1,012 Total Live Stickers
const ADJECTIVES = [
  'Fresh', 'Neon', 'Cosmic', 'Turbo', 'Hyper', 'Golden', 'Frost', 'Solar', 'Electric', 'Velvet',
];

function generate1000FreshStickers(): LiveSticker[] {
  const result: LiveSticker[] = [...HERO_VECTOR_STICKERS];
  let serial = 1;

  for (const bp of PACK_BLUEPRINTS) {
    // 100 stickers per pack * 10 packs = 1,000 fresh stickers
    for (let i = 0; i < 100; i++) {
      const emoji = bp.emojis[i % bp.emojis.length];
      const baseWord = bp.words[Math.floor(i / bp.emojis.length) % bp.words.length];
      const variant = ADJECTIVES[(i + Math.floor(i / 11)) % ADJECTIVES.length];
      const gradient = bp.gradients[i % bp.gradients.length];
      const ring = bp.rings[(i + 1) % bp.rings.length];
      const anim = bp.anims[(i + 2) % bp.anims.length];
      const shape = bp.shapes[i % bp.shapes.length];

      result.push({
        id: `st_live_${serial}`,
        name: `${variant} ${baseWord}`,
        pack: bp.pack,
        animationClass: anim,
        emojiFallback: emoji,
        badgeText: baseWord,
        bgGradient: gradient,
        ringColor: ring,
        shapeStyle: shape,
      });
      serial += 1;
    }
  }

  return result;
}

export const LIVE_STICKERS: LiveSticker[] = generate1000FreshStickers();

export const LIVE_STICKER_PACKS: string[] = PACK_BLUEPRINTS.map((b) => b.pack);

export const LiveStickerRenderer: React.FC<{
  sticker: LiveSticker;
  size?: 'picker' | 'chat';
}> = ({ sticker, size = 'picker' }) => {
  if (sticker.svgContent) {
    return (
      <div
        className={`${
          size === 'chat' ? 'w-28 h-28 sm:w-32 sm:h-32 p-1' : 'w-14 h-14'
        } ${sticker.animationClass}`}
      >
        {sticker.svgContent}
      </div>
    );
  }

  const shapeClass =
    sticker.shapeStyle === 'circle'
      ? 'rounded-full'
      : sticker.shapeStyle === 'pill'
      ? 'rounded-3xl'
      : sticker.shapeStyle === 'hex'
      ? 'rounded-2xl rotate-3'
      : 'rounded-2xl';

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${shapeClass} ${
        sticker.animationClass
      } ${
        size === 'chat'
          ? 'w-28 h-28 sm:w-32 sm:h-32 border-[3px] shadow-xl'
          : 'w-14 h-14 border-2 shadow-md'
      }`}
      style={{
        background: sticker.bgGradient || 'linear-gradient(135deg, #00E5D4 0%, #007BFF 100%)',
        borderColor: sticker.ringColor || '#FFFFFF',
        boxShadow: `0 6px 18px rgba(0, 0, 0, 0.35), 0 0 12px ${sticker.ringColor || '#00E5D4'}55`,
      }}
    >
      <span
        className={
          size === 'chat' ? 'text-4xl sm:text-5xl leading-none drop-shadow-md' : 'text-2xl leading-none drop-shadow-sm'
        }
      >
        {sticker.emojiFallback}
      </span>
      {sticker.badgeText && (
        <span
          className={`mt-1 px-1.5 py-0.5 rounded-full bg-black/70 text-white font-extrabold tracking-wider uppercase border border-white/25 ${
            size === 'chat' ? 'text-[10px]' : 'text-[7px] leading-none max-w-[90%] truncate'
          }`}
        >
          {sticker.badgeText}
        </span>
      )}
    </div>
  );
};
