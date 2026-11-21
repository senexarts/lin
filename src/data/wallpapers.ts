import React from 'react';
import { LinmaxSettings } from '../types';

export interface ChatWallpaperPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  previewColor: string;
  style: React.CSSProperties;
}

const makeSvgPattern = (svgInner: string, width = 96, height = 96) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${svgInner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const CHAT_WALLPAPERS: ChatWallpaperPreset[] = [
  {
    id: 'cyber_doodles',
    name: 'Linmax Doodles',
    description: 'Signature glowing messaging glyphs & icons',
    badge: 'Popular',
    previewColor: '#051E28',
    style: {
      backgroundColor: '#041219',
      backgroundImage: `${makeSvgPattern(
        `<g fill='none' stroke='%2300E5D4' stroke-opacity='0.28' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'>
          <path d='M12 18h16a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H19l-7 5v-5a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z'/>
          <path d='M62 14l4 8 8 1.5-6 5.5 1.5 8-7.5-4-7.5 4 1.5-8-6-5.5 8-1.5z' stroke='%2300CFEF' stroke-opacity='0.3'/>
          <path d='M72 64a8 8 0 1 1-16 0 8 8 0 0 1 16 0z'/>
          <path d='M14 72c6-7 13-7 19 0s13 7 19 0' stroke='%2300CFEF' stroke-opacity='0.26'/>
          <path d='M44 45l7-9 7 9-7 9z' fill='%2300E5D4' fill-opacity='0.08'/>
          <path d='M76 42l12-6-5 13-3-4z'/>
          <circle cx='44' cy='18' r='2.5' fill='%2300E5D4' fill-opacity='0.35'/>
          <circle cx='20' cy='52' r='2' fill='%2300CFEF' fill-opacity='0.35'/>
        </g>`,
        96,
        96
      )}, radial-gradient(circle at 20% 15%, rgba(0, 229, 212, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(0, 140, 255, 0.18) 0%, transparent 55%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '96px 96px, 100% 100%',
    },
  },
  {
    id: 'aurora_cosmos',
    name: 'Starry Aurora',
    description: 'Cosmic nebula mist & twinkling star charts',
    badge: 'Cosmos',
    previewColor: '#071B2C',
    style: {
      backgroundColor: '#040B16',
      backgroundImage: `${makeSvgPattern(
        `<g>
          <path d='M18 18 L52 34 L82 16 M52 34 L38 78 L80 68' fill='none' stroke='%2300E5D4' stroke-opacity='0.22' stroke-width='1' stroke-dasharray='3 4'/>
          <path d='M18 11 L19.2 16.8 L25 18 L19.2 19.2 L18 25 L16.8 19.2 L11 18 L16.8 16.8 Z' fill='%23FFFFFF' fill-opacity='0.55'/>
          <path d='M82 10 L83 15 L88 16 L83 17 L82 22 L81 17 L76 16 L81 15 Z' fill='%2300F5FF' fill-opacity='0.52'/>
          <circle cx='52' cy='34' r='2.3' fill='%2300E5D4' fill-opacity='0.55'/>
          <circle cx='38' cy='78' r='1.8' fill='%23A5F3FC' fill-opacity='0.48'/>
          <circle cx='80' cy='68' r='2' fill='%23FFFFFF' fill-opacity='0.42'/>
          <circle cx='14' cy='58' r='1.3' fill='%2300CFEF' fill-opacity='0.4'/>
        </g>`,
        96,
        96
      )}, radial-gradient(ellipse at 18% 20%, rgba(0, 229, 212, 0.28) 0%, transparent 52%), radial-gradient(ellipse at 82% 28%, rgba(99, 102, 241, 0.28) 0%, transparent 50%), radial-gradient(ellipse at 50% 88%, rgba(0, 207, 239, 0.24) 0%, transparent 55%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '110px 110px, 100% 100%',
    },
  },
  {
    id: 'hex_matrix',
    name: 'Neon Honeycombs',
    description: 'Precision glowing cyan geometric lattice',
    badge: 'Geometric',
    previewColor: '#06202B',
    style: {
      backgroundColor: '#030E16',
      backgroundImage: `${makeSvgPattern(
        `<g>
          <path d='M28 0L56 16V48L28 64L0 48V16Z' fill='%2300E5D4' fill-opacity='0.04' stroke='%2300CFEF' stroke-opacity='0.34' stroke-width='1.35'/>
          <path d='M28 8L49 20V44L28 56L7 44V20Z' fill='none' stroke='%2300E5D4' stroke-opacity='0.16' stroke-width='1'/>
          <circle cx='28' cy='32' r='2.6' fill='%2300F5E4' fill-opacity='0.45'/>
          <circle cx='56' cy='16' r='2' fill='%2300CFEF' fill-opacity='0.4'/>
        </g>`,
        56,
        64
      )}, radial-gradient(circle at 50% 45%, rgba(0, 207, 239, 0.24) 0%, transparent 65%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '56px 64px, 100% 100%',
    },
  },
  {
    id: 'topographic_waves',
    name: 'Aurora Contours',
    description: 'Glowing electric teal topographic contours',
    badge: 'Organic',
    previewColor: '#042228',
    style: {
      backgroundColor: '#031015',
      backgroundImage: `${makeSvgPattern(
        `<g fill='none' stroke-width='1.5'>
          <path d='M0 18 Q 25 2, 50 18 T 100 18' stroke='%2300E5D4' stroke-opacity='0.34'/>
          <path d='M0 38 Q 25 22, 50 38 T 100 38' stroke='%2300CFEF' stroke-opacity='0.28'/>
          <path d='M0 58 Q 25 42, 50 58 T 100 58' stroke='%2320E66B' stroke-opacity='0.22'/>
          <path d='M0 78 Q 25 62, 50 78 T 100 78' stroke='%2300E5D4' stroke-opacity='0.3'/>
          <path d='M0 98 Q 25 82, 50 98 T 100 98' stroke='%2300CFEF' stroke-opacity='0.24'/>
        </g>`,
        100,
        100
      )}, linear-gradient(135deg, rgba(0, 229, 212, 0.22) 0%, rgba(3, 16, 21, 0) 48%, rgba(0, 175, 194, 0.24) 100%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '120px 120px, 100% 100%',
    },
  },
  {
    id: 'neural_circuit',
    name: 'Quantum Circuit',
    description: 'Luminous cyber processor pathways & nodes',
    badge: 'Cyber',
    previewColor: '#051B26',
    style: {
      backgroundColor: '#030C14',
      backgroundImage: `${makeSvgPattern(
        `<g fill='none' stroke-width='1.45'>
          <path d='M0 16h26l14 14h26' stroke='%2300E5D4' stroke-opacity='0.34'/>
          <path d='M18 88V56l14-14h32l14 14v32' stroke='%2300CFEF' stroke-opacity='0.28'/>
          <path d='M60 0v14l16 16h12' stroke='%2300E5D4' stroke-opacity='0.24'/>
          <circle cx='26' cy='16' r='3.2' fill='%2300F5E4' fill-opacity='0.52'/>
          <circle cx='66' cy='30' r='3.2' fill='%2300CFEF' fill-opacity='0.48'/>
          <circle cx='18' cy='56' r='3' fill='%23F59E0B' fill-opacity='0.45'/>
          <circle cx='78' cy='56' r='3' fill='%2300E5D4' fill-opacity='0.48'/>
        </g>`,
        88,
        88
      )}, radial-gradient(circle at 80% 20%, rgba(0, 229, 212, 0.2) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(0, 140, 255, 0.18) 0%, transparent 55%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '88px 88px, 100% 100%',
    },
  },
  {
    id: 'prism_facets',
    name: 'Crystal Shards',
    description: 'Illuminated low-poly obsidian diamond facets',
    badge: 'Abstract',
    previewColor: '#091D2B',
    style: {
      backgroundColor: '#040D16',
      backgroundImage: `${makeSvgPattern(
        `<g stroke='%2300E5D4' stroke-opacity='0.28' stroke-width='1.15'>
          <polygon points='0,0 44,22 0,66' fill='%2300E5D4' fill-opacity='0.11'/>
          <polygon points='44,22 88,0 88,54' fill='%2300CFEF' fill-opacity='0.13'/>
          <polygon points='0,66 44,22 54,88' fill='%230099FF' fill-opacity='0.09'/>
          <polygon points='44,22 88,54 54,88' fill='%2300F5E4' fill-opacity='0.05'/>
          <polygon points='0,66 54,88 0,88' fill='%2300CFEF' fill-opacity='0.1'/>
        </g>`,
        88,
        88
      )}, radial-gradient(circle at 50% 20%, rgba(0, 229, 212, 0.2) 0%, transparent 65%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '96px 96px, 100% 100%',
    },
  },
  {
    id: 'royal_aurora',
    name: 'Solaris Nebula',
    description: 'Vibrant gold, violet & electric cyan gradients',
    badge: 'Gradient',
    previewColor: '#13182B',
    style: {
      backgroundColor: '#060B14',
      backgroundImage: `${makeSvgPattern(
        `<g>
          <path d='M48 12 L64 48 L48 84 L32 48 Z' fill='none' stroke='%23FFFFFF' stroke-opacity='0.14' stroke-width='1'/>
          <circle cx='48' cy='48' r='2' fill='%23FBBF24' fill-opacity='0.45'/>
          <circle cx='12' cy='12' r='1.6' fill='%2300E5D4' fill-opacity='0.45'/>
        </g>`,
        96,
        96
      )}, radial-gradient(circle at 16% 22%, rgba(0, 229, 212, 0.34) 0%, transparent 48%), radial-gradient(circle at 86% 26%, rgba(245, 158, 11, 0.28) 0%, transparent 45%), radial-gradient(circle at 52% 85%, rgba(168, 85, 247, 0.28) 0%, transparent 52%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '96px 96px, 100% 100%',
    },
  },
  {
    id: 'obsidian_default',
    name: 'Cyber Grid & Glow',
    description: 'Sleek dark architectural grid with cyan horizon',
    badge: 'Classic',
    previewColor: '#05151E',
    style: {
      backgroundColor: '#030B10',
      backgroundImage: `${makeSvgPattern(
        `<g>
          <path d='M48 0V48M0 48H48' fill='none' stroke='%2300E5D4' stroke-opacity='0.22' stroke-width='1'/>
          <circle cx='48' cy='48' r='2.2' fill='%2300F5FF' fill-opacity='0.48'/>
        </g>`,
        48,
        48
      )}, radial-gradient(circle at 22% 20%, rgba(0, 229, 212, 0.22) 0%, transparent 52%), radial-gradient(circle at 80% 82%, rgba(0, 207, 239, 0.2) 0%, transparent 52%)`,
      backgroundRepeat: 'repeat, no-repeat',
      backgroundSize: '48px 48px, 100% 100%',
    },
  },
];

export function getWallpaperStyle(
  wallpaperId: string,
  customWallpaperUrl?: string
): React.CSSProperties {
  if (wallpaperId === 'custom_uploaded' && customWallpaperUrl) {
    return {
      backgroundColor: '#03090D',
      backgroundImage: `url("${customWallpaperUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }
  const found = CHAT_WALLPAPERS.find((w) => w.id === wallpaperId);
  return found ? found.style : CHAT_WALLPAPERS[0].style;
}

export const defaultSettings: LinmaxSettings = {
  account: {
    securityNotifications: true,
    twoStepEnabled: false,
    twoStepPin: '',
  },
  privacy: {
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    statusShare: 'contacts',
    readReceipts: true,
    defaultMessageTimer: 'off',
    blockedChatIds: [],
    appLockEnabled: false,
    appLockPin: '',
    blockScreenshots: false,
    groupAddPermission: 'everyone',
  },
  chats: {
    homeThemeId: 'dark_mode',
    chatThemeId: 'dark_mode',
    unlockedLiveThemeIds: [],
    chatAreaUseThemeBg: true,
    fontFamily: 'jakarta',
    bubbleStyle: 'classic',
    compactList: false,
    wallpaperId: 'cyber_doodles',
    wallpaperDimming: 8,
    enterIsSend: true,
    mediaVisibility: true,
    fontSize: 'medium',
  },
  notifications: {
    conversationTones: true,
    messageTone: 'Cyber Chime',
    groupNotifications: true,
    callRingtone: 'Linmax Pulse',
    highPriority: true,
    vibrate: true,
    showPreviews: true,
    tabBadge: true,
  },
  storage: {
    autoDownloadPhotos: true,
    autoDownloadVideos: true,
    autoDownloadAudio: true,
    autoDownloadDocs: false,
    uploadQuality: 'auto',
    lowDataCalls: false,
  },
};
