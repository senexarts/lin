import React from 'react';
import { LinmaxSettings } from '../types';

export type ChatThemeId =
  | 'classic_light'
  | 'dark_mode'
  | 'gradient_blue'
  | 'green_nature'
  | 'purple_royal'
  | 'ocean_breeze'
  | 'sunset'
  | 'neon_tech'
  | 'minimalist_white'
  | 'royal_gold'
  | 'live_aurora_borealis'
  | 'live_cyber_pulse'
  | 'live_solar_embers'
  | 'live_starlight_nebula'
  | 'live_royal_stardust'
  | 'live_sakura_breeze'
  | 'live_midnight_meteors'
  | 'live_emerald_fireflies'
  | 'live_synthwave_neon'
  | 'live_arctic_glacier'
  | 'live_matrix_code'
  | 'live_amethyst_prism'
  | 'live_crimson_velvet'
  | 'live_bioluminescent_lagoon'
  | 'live_golden_honeycomb'
  | 'live_cherry_blossom_day'
  | 'live_mint_aurora_light'
  | 'live_lavender_cloud'
  | 'live_volcanic_obsidian'
  | 'live_cosmic_supernova'
  | 'live_midnight_ocean_glow'
  | 'live_jade_dragon'
  | 'live_rose_quartz'
  | 'live_electric_cobalt'
  | 'live_obsidian_diamond'
  | 'custom_uploaded_theme';

export type LiveThemeEffectId =
  | 'aurora'
  | 'cyber_pulse'
  | 'solar_embers'
  | 'starlight_nebula'
  | 'royal_stardust'
  | 'sakura_petals'
  | 'bioluminescent'
  | 'matrix_rain'
  | 'prism_crystal'
  | 'meteor_shower'
  | 'ice_crystals'
  | 'velvet_plasma';

export interface ChatThemeConfig {
  id: ChatThemeId;
  name: string;
  tagline: string;
  isLightSurface: boolean;
  headerIsDark: boolean;
  suitableForHome: boolean;
  homeFallbackId?: Exclude<ChatThemeId, 'custom_uploaded_theme'>;
  hasCrownMotif?: boolean;
  isLive?: boolean;
  liveEffect?: LiveThemeEffectId;
  priceUsd?: number;
  // Panel & Backdrop styling
  panelStyle: React.CSSProperties;
  panelBorderClass: string;
  feedSurfaceClass: string;
  dividerClass: string;
  // Chat Area Inner Surfaces (Pinned Bar, Protocol Pill, Secondary Popovers)
  pinnedBarClass: string;
  pinnedAccentTextClass: string;
  protocolPillClass: string;
  secondarySurfaceClass: string;
  // Header & Logo
  logoTone: 'dark-bg' | 'light-bg' | 'mono-white';
  logoAccentColor: string;
  headerBorderClass: string;
  headerIconBtnClass: string;
  plusBtnStyle: React.CSSProperties;
  plusBtnTextClass: string;
  // Search Bar
  searchInputClass: string;
  searchIconClass: string;
  // Segmented Filter Pills
  tabsContainerClass: string;
  activeTabStyle: React.CSSProperties;
  activeTabTextClass: string;
  inactiveTabClass: string;
  // Chat Rows
  rowActiveClass: string;
  rowActiveBorderColor: string;
  rowHoverClass: string;
  rowTitleClass: string;
  rowSubtitleClass: string;
  rowTimeClass: string;
  avatarBorderClass: string;
  onlineRingClass: string;
  unreadBadgeStyle: React.CSSProperties;
  unreadBadgeTextClass: string;
  verifiedIconClass: string;
  readTickClass: string;
  // ChatWindow Coordination
  chatWindowHeaderStyle: React.CSSProperties;
  chatWindowHeaderTitleClass: string;
  chatWindowHeaderSubStyle: React.CSSProperties;
  chatWindowComposerStyle: React.CSSProperties;
  chatWindowComposerInputClass: string;
  outgoingBubbleStyle: React.CSSProperties;
  outgoingBubbleTextClass: string;
  incomingBubbleClass: string;
  sendBtnStyle: React.CSSProperties;
  sendBtnTextClass: string;
  // Showcase Pill Badge in Picker
  labelPillStyle: React.CSSProperties;
  labelPillTextClass: string;
  swatchGradient: string;
}

export const LINMAX_FONT_OPTIONS: Array<{
  id: NonNullable<LinmaxSettings['chats']['fontFamily']>;
  label: string;
  sample: string;
  bodyFont: string;
  displayFont: string;
}> = [
  {
    id: 'jakarta',
    label: 'Linmax Sans',
    sample: 'Clean & Modern',
    bodyFont: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    displayFont: "'Outfit', 'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'outfit',
    label: 'Outfit Geometric',
    sample: 'Crisp Futuristic',
    bodyFont: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    displayFont: "'Outfit', sans-serif",
  },
  {
    id: 'poppins',
    label: 'Poppins Studio',
    sample: 'Friendly Smooth',
    bodyFont: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    displayFont: "'Poppins', sans-serif",
  },
  {
    id: 'rounded',
    label: 'Nunito Soft',
    sample: 'Warm Rounded',
    bodyFont: "'Nunito', -apple-system, BlinkMacSystemFont, sans-serif",
    displayFont: "'Nunito', sans-serif",
  },
  {
    id: 'serif',
    label: 'Editorial Serif',
    sample: 'Classic Elegance',
    bodyFont: "'Playfair Display', Georgia, serif",
    displayFont: "'Playfair Display', Georgia, serif",
  },
  {
    id: 'mono',
    label: 'JetBrains Cyber',
    sample: 'Terminal Code',
    bodyFont: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
    displayFont: "'JetBrains Mono', ui-monospace, monospace",
  },
];

export function applyFontPreference(fontId?: LinmaxSettings['chats']['fontFamily']) {
  if (typeof document === 'undefined') return;
  const opt = LINMAX_FONT_OPTIONS.find((f) => f.id === fontId) || LINMAX_FONT_OPTIONS[0];
  document.documentElement.style.setProperty('--linmax-font-body', opt.bodyFont);
  document.documentElement.style.setProperty('--linmax-font-display', opt.displayFont);
}

const encodeSvg = (inner: string, width = 400, height = 720) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

export const CHAT_THEMES: ChatThemeConfig[] = [
  {
    id: 'classic_light',
    name: 'Classic Light',
    tagline: 'Bright sky white & azure silk',
    isLightSurface: true,
    headerIsDark: false,
    suitableForHome: true,
    panelStyle: {
      backgroundColor: '#F3F9FF',
      backgroundImage: `${encodeSvg(`
        <defs>
          <linearGradient id='cl1' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='#93C5FD' stop-opacity='0.35'/>
            <stop offset='100%' stop-color='#60A5FA' stop-opacity='0.05'/>
          </linearGradient>
        </defs>
        <path d='M0,0 L400,0 L400,115 C310,60 150,95 0,48 Z' fill='url(#cl1)'/>
        <path d='M0,720 L400,720 L400,635 C290,695 140,655 0,690 Z' fill='#3B82F6' fill-opacity='0.14'/>
      `)}, linear-gradient(180deg, #EAF4FF 0%, #F8FBFF 45%, #EAF3FF 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-sky-200/90',
    feedSurfaceClass: 'bg-white/55 backdrop-blur-xs',
    dividerClass: 'divide-sky-200/60',
    pinnedBarClass: 'bg-white/85 border-sky-200 text-slate-700',
    pinnedAccentTextClass: 'text-[#007BFF]',
    protocolPillClass: 'bg-white/90 border-sky-200 text-slate-600 shadow-xs',
    secondarySurfaceClass: 'bg-white/95 border-sky-200 text-slate-900',
    logoTone: 'light-bg',
    logoAccentColor: '#007BFF',
    headerBorderClass: 'border-sky-200/80 bg-white/75 backdrop-blur-md',
    headerIconBtnClass: 'bg-white/90 text-slate-700 border border-sky-200 hover:bg-sky-50 hover:text-[#007BFF]',
    plusBtnStyle: { background: 'linear-gradient(135deg, #007BFF 0%, #0EA5E9 100%)' },
    plusBtnTextClass: 'text-white',
    searchInputClass: 'bg-white/90 border-sky-200 text-slate-900 placeholder-slate-400 focus:border-[#007BFF]',
    searchIconClass: 'text-slate-400',
    tabsContainerClass: 'bg-sky-100/80 border-sky-200',
    activeTabStyle: { background: 'linear-gradient(90deg, #007BFF 0%, #0284C7 100%)' },
    activeTabTextClass: 'text-white shadow-sm',
    inactiveTabClass: 'text-slate-600 hover:text-slate-900',
    rowActiveClass: 'bg-sky-100/90',
    rowActiveBorderColor: '#007BFF',
    rowHoverClass: 'hover:bg-white/80',
    rowTitleClass: 'text-slate-900',
    rowSubtitleClass: 'text-slate-600',
    rowTimeClass: 'text-slate-500',
    avatarBorderClass: 'border-sky-300 bg-sky-100',
    onlineRingClass: 'ring-white',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #007BFF 0%, #2563EB 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-[#007BFF] fill-sky-200',
    readTickClass: 'text-[#007BFF]',
    chatWindowHeaderStyle: {
      background: 'rgba(248, 251, 255, 0.92)',
      borderColor: 'rgba(147, 197, 253, 0.55)',
    },
    chatWindowHeaderTitleClass: 'text-slate-900 group-hover:text-[#007BFF]',
    chatWindowHeaderSubStyle: { color: '#0284C7' },
    chatWindowComposerStyle: {
      background: 'rgba(248, 251, 255, 0.94)',
      borderColor: 'rgba(147, 197, 253, 0.55)',
    },
    chatWindowComposerInputClass: 'bg-white border-sky-200 text-slate-900 placeholder-slate-400 focus:border-[#007BFF]',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #007BFF 0%, #2563EB 100%)',
      boxShadow: '0 4px 14px rgba(0, 123, 255, 0.25)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-white border border-sky-200 text-slate-900 shadow-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #007BFF 0%, #0EA5E9 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #007BFF 0%, #2563EB 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #DBEAFE 0%, #FFFFFF 55%, #BFDBFE 100%)',
  },

  {
    id: 'dark_mode',
    name: 'Dark Mode',
    tagline: 'Signature obsidian & cyber cyan',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    panelStyle: {
      backgroundColor: '#07151B',
      backgroundImage: `${encodeSvg(`
        <path d='M0,0 Q180,65 400,20 L400,0 Z' fill='#00E5D4' fill-opacity='0.09'/>
        <path d='M0,720 Q210,655 400,700 L400,720 Z' fill='#00CFEF' fill-opacity='0.08'/>
      `)}, linear-gradient(180deg, #051116 0%, #07151B 60%, #040D12 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-[#00E5D4]/15',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-[#00E5D4]/8',
    pinnedBarClass: 'bg-[#0B1B22]/90 border-[#00E5D4]/20 text-[#A8BBC2]',
    pinnedAccentTextClass: 'text-[#00E5D4]',
    protocolPillClass: 'bg-[#07151B]/95 border-[#00E5D4]/20 text-[#A8BBC2]',
    secondarySurfaceClass: 'bg-[#0B1B22] border-[#00E5D4]/25 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#00E5D4',
    headerBorderClass: 'border-[#00E5D4]/12 bg-[#07151B]/90 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#0B1B22] text-[#A8BBC2] hover:text-[#00E5D4] hover:bg-[#102630]',
    plusBtnStyle: { background: 'linear-gradient(90deg, #00E5D4 0%, #00CFEF 100%)' },
    plusBtnTextClass: 'text-[#03090D]',
    searchInputClass: 'bg-[#0B1B22] border-[#00E5D4]/25 text-white placeholder-[#A8BBC2] focus:border-[#00E5D4]',
    searchIconClass: 'text-[#A8BBC2]',
    tabsContainerClass: 'bg-[#03090D]/65 border-[#00E5D4]/12',
    activeTabStyle: { background: 'linear-gradient(90deg, #00E5D4 0%, #00CFEF 100%)' },
    activeTabTextClass: 'text-[#03090D] shadow-sm',
    inactiveTabClass: 'text-[#A8BBC2] hover:text-white',
    rowActiveClass: 'bg-[#0B1B22]',
    rowActiveBorderColor: '#00E5D4',
    rowHoverClass: 'hover:bg-[#0B1B22]/60',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-[#A8BBC2]',
    rowTimeClass: 'text-[#A8BBC2]',
    avatarBorderClass: 'border-[#00E5D4]/25 bg-[#03090D]',
    onlineRingClass: 'ring-[#07151B]',
    unreadBadgeStyle: { background: '#00E5D4', boxShadow: '0 0 10px rgba(0,229,212,0.4)' },
    unreadBadgeTextClass: 'text-[#03090D]',
    verifiedIconClass: 'text-[#00CFEF] fill-[#00CFEF]/20',
    readTickClass: 'text-[#00CFEF]',
    chatWindowHeaderStyle: {
      background: 'rgba(7, 21, 27, 0.92)',
      borderColor: 'rgba(0, 229, 212, 0.16)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-[#00E5D4]',
    chatWindowHeaderSubStyle: { color: '#00E5D4' },
    chatWindowComposerStyle: {
      background: 'rgba(7, 21, 27, 0.95)',
      borderColor: 'rgba(0, 229, 212, 0.16)',
    },
    chatWindowComposerInputClass: 'bg-[#0B1B22] border-[#00E5D4]/20 text-white placeholder-[#A8BBC2] focus:border-[#00E5D4]',
    outgoingBubbleStyle: { background: 'linear-gradient(90deg, #00E5D4 0%, #00CFEF 100%)' },
    outgoingBubbleTextClass: 'text-[#03090D]',
    incomingBubbleClass: 'bg-[#0B1B22] border border-[#00E5D4]/15 text-white',
    sendBtnStyle: { background: 'linear-gradient(90deg, #00E5D4 0%, #00CFEF 100%)' },
    sendBtnTextClass: 'text-[#03090D]',
    labelPillStyle: { background: '#0B1B22', border: '1px solid rgba(0,229,212,0.4)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #03090D 0%, #07151B 65%, #0B262F 100%)',
  },

  {
    id: 'gradient_blue',
    name: 'Gradient Blue',
    tagline: 'Electric azure to royal violet',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    panelStyle: {
      backgroundColor: '#1D4ED8',
      backgroundImage: `${encodeSvg(`
        <path d='M0,120 C140,60 280,175 400,95 L400,0 L0,0 Z' fill='#38BDF8' fill-opacity='0.22'/>
        <path d='M0,620 C130,540 280,690 400,590 L400,720 L0,720 Z' fill='#C084FC' fill-opacity='0.22'/>
      `)}, linear-gradient(165deg, #0284C7 0%, #1D4ED8 45%, #5B21B6 82%, #7C3AED 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-cyan-300/30',
    feedSurfaceClass: 'bg-slate-950/15 backdrop-blur-xs',
    dividerClass: 'divide-white/12',
    pinnedBarClass: 'bg-blue-950/80 border-sky-300/25 text-sky-100',
    pinnedAccentTextClass: 'text-cyan-300',
    protocolPillClass: 'bg-slate-950/55 border-sky-300/25 text-sky-100 backdrop-blur-md',
    secondarySurfaceClass: 'bg-[#172554]/95 border-sky-400/30 text-white',
    logoTone: 'mono-white',
    logoAccentColor: '#7DD3FC',
    headerBorderClass: 'border-white/18 bg-white/10 backdrop-blur-md',
    headerIconBtnClass: 'bg-white/15 text-white border border-white/25 hover:bg-white/25',
    plusBtnStyle: { background: '#FFFFFF' },
    plusBtnTextClass: 'text-[#1D4ED8]',
    searchInputClass: 'bg-white/15 border-white/35 text-white placeholder-sky-100/80 focus:border-cyan-300',
    searchIconClass: 'text-sky-100',
    tabsContainerClass: 'bg-slate-950/25 border-white/20',
    activeTabStyle: { background: 'linear-gradient(90deg, #00E5FF 0%, #38BDF8 100%)' },
    activeTabTextClass: 'text-[#041428] shadow-[0_0_12px_rgba(56,189,248,0.5)]',
    inactiveTabClass: 'text-white/85 hover:text-white',
    rowActiveClass: 'bg-white/20',
    rowActiveBorderColor: '#38BDF8',
    rowHoverClass: 'hover:bg-white/12',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-sky-100/90',
    rowTimeClass: 'text-sky-100/80',
    avatarBorderClass: 'border-cyan-300/50 bg-blue-900',
    onlineRingClass: 'ring-[#1D4ED8]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', border: '1px solid rgba(255,255,255,0.35)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-cyan-200 fill-cyan-300/30',
    readTickClass: 'text-cyan-200',
    chatWindowHeaderStyle: {
      background: 'linear-gradient(90deg, rgba(2,132,199,0.94) 0%, rgba(37,99,235,0.94) 55%, rgba(109,40,217,0.94) 100%)',
      borderColor: 'rgba(186, 230, 253, 0.28)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-cyan-200',
    chatWindowHeaderSubStyle: { color: '#BAE6FD' },
    chatWindowComposerStyle: {
      background: 'linear-gradient(90deg, rgba(29,78,216,0.95) 0%, rgba(91,33,182,0.95) 100%)',
      borderColor: 'rgba(186, 230, 253, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-white/15 border-white/30 text-white placeholder-sky-100/80 focus:border-cyan-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #7C3AED 100%)',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#172554]/92 border border-sky-400/25 text-white shadow-md',
    sendBtnStyle: { background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)' },
    sendBtnTextClass: 'text-[#041428]',
    labelPillStyle: { background: 'linear-gradient(90deg, #0284C7 0%, #6D28D9 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(160deg, #0099FF 0%, #2563EB 50%, #7C3AED 100%)',
  },

  {
    id: 'green_nature',
    name: 'Green Nature',
    tagline: 'Fresh botanical leaves & sunlit dew',
    isLightSurface: true,
    headerIsDark: false,
    suitableForHome: false,
    homeFallbackId: 'classic_light',
    panelStyle: {
      backgroundColor: '#F0FDF4',
      backgroundImage: `${encodeSvg(`
        <g opacity='0.88'>
          <path d='M0,0 C42,6 68,26 88,52 C52,48 26,38 0,24 Z' fill='#22C55E'/>
          <path d='M0,0 C20,38 14,72 -4,94 C-10,64 -8,32 0,0 Z' fill='#16A34A'/>
          <path d='M45,0 C75,28 118,32 148,18 C118,5 85,-2 45,0 Z' fill='#4ADE80'/>
          <path d='M400,0 C350,8 318,28 292,56 C332,52 368,38 400,20 Z' fill='#16A34A'/>
          <path d='M330,0 C295,22 252,25 224,10 C258,-4 295,-4 330,0 Z' fill='#86EFAC'/>
          <path d='M0,720 C45,675 95,665 135,692 C98,712 52,722 0,720 Z' fill='#22C55E'/>
          <path d='M400,720 C355,662 292,658 248,696 C292,718 352,724 400,720 Z' fill='#15803D'/>
          <path d='M165,720 C200,688 238,688 266,720 Z' fill='#4ADE80' fill-opacity='0.7'/>
        </g>
      `)}, linear-gradient(180deg, #DCFCE7 0%, #F4FDF7 48%, #DCFCE7 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-emerald-300/80',
    feedSurfaceClass: 'bg-white/70 backdrop-blur-xs',
    dividerClass: 'divide-emerald-200/70',
    pinnedBarClass: 'bg-[#ECFDF5]/95 border-emerald-200 text-emerald-900',
    pinnedAccentTextClass: 'text-[#15803D]',
    protocolPillClass: 'bg-white/90 border-emerald-200 text-emerald-800 shadow-xs',
    secondarySurfaceClass: 'bg-white/95 border-emerald-200 text-emerald-950',
    logoTone: 'light-bg',
    logoAccentColor: '#15803D',
    headerBorderClass: 'border-emerald-200/80 bg-white/75 backdrop-blur-md',
    headerIconBtnClass: 'bg-white/90 text-emerald-900 border border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700',
    plusBtnStyle: { background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)' },
    plusBtnTextClass: 'text-white',
    searchInputClass: 'bg-white/90 border-emerald-300 text-emerald-950 placeholder-emerald-700/50 focus:border-emerald-600',
    searchIconClass: 'text-emerald-600',
    tabsContainerClass: 'bg-emerald-100/80 border-emerald-200',
    activeTabStyle: { background: 'linear-gradient(90deg, #15803D 0%, #16A34A 100%)' },
    activeTabTextClass: 'text-white shadow-sm',
    inactiveTabClass: 'text-emerald-900/75 hover:text-emerald-950',
    rowActiveClass: 'bg-emerald-100/90',
    rowActiveBorderColor: '#15803D',
    rowHoverClass: 'hover:bg-white/85',
    rowTitleClass: 'text-emerald-950',
    rowSubtitleClass: 'text-emerald-900/70',
    rowTimeClass: 'text-emerald-800/70',
    avatarBorderClass: 'border-emerald-300 bg-emerald-50',
    onlineRingClass: 'ring-white',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-[#007BFF] fill-sky-200',
    readTickClass: 'text-emerald-600',
    chatWindowHeaderStyle: {
      background: 'rgba(240, 253, 244, 0.94)',
      borderColor: 'rgba(134, 239, 172, 0.65)',
    },
    chatWindowHeaderTitleClass: 'text-emerald-950 group-hover:text-emerald-700',
    chatWindowHeaderSubStyle: { color: '#15803D' },
    chatWindowComposerStyle: {
      background: 'rgba(240, 253, 244, 0.94)',
      borderColor: 'rgba(134, 239, 172, 0.65)',
    },
    chatWindowComposerInputClass: 'bg-white border-emerald-300 text-emerald-950 placeholder-emerald-700/50 focus:border-emerald-600',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #16A34A 0%, #059669 100%)',
      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-white border border-emerald-200 text-emerald-950 shadow-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #15803D 0%, #22C55E 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #15803D 0%, #22C55E 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(160deg, #86EFAC 0%, #F0FDF4 45%, #4ADE80 100%)',
  },

  {
    id: 'purple_royal',
    name: 'Purple Royal',
    tagline: 'Imperial amethyst & gilded dusk',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    hasCrownMotif: true,
    panelStyle: {
      backgroundColor: '#160728',
      backgroundImage: `${encodeSvg(`
        <defs>
          <linearGradient id='prG' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stop-color='#F59E0B' stop-opacity='0.35'/>
            <stop offset='50%' stop-color='#A855F7' stop-opacity='0.25'/>
            <stop offset='100%' stop-color='#FDE68A' stop-opacity='0.3'/>
          </linearGradient>
        </defs>
        <path d='M0,65 C140,20 270,85 400,25 L400,0 L0,0 Z' fill='url(#prG)'/>
        <path d='M0,665 C130,705 260,625 400,685 L400,720 L0,720 Z' fill='url(#prG)'/>
      `)}, radial-gradient(circle at 85% 12%, rgba(245, 158, 11, 0.22) 0%, transparent 45%), linear-gradient(180deg, #1B0933 0%, #120521 55%, #1E0A38 100%)`,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-purple-500/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-purple-400/10',
    pinnedBarClass: 'bg-[#210C3C]/95 border-purple-500/25 text-purple-100',
    pinnedAccentTextClass: 'text-amber-300',
    protocolPillClass: 'bg-[#1D0A35]/90 border-purple-400/30 text-purple-200',
    secondarySurfaceClass: 'bg-[#210C3C] border-purple-500/30 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#C084FC',
    headerBorderClass: 'border-purple-500/20 bg-[#18072D]/90 backdrop-blur-md',
    headerIconBtnClass: 'bg-purple-950/70 text-purple-200 border border-purple-500/25 hover:text-amber-300 hover:border-amber-400/40',
    plusBtnStyle: { background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' },
    plusBtnTextClass: 'text-[#1E0A38]',
    searchInputClass: 'bg-[#210C3C]/90 border-purple-500/35 text-white placeholder-purple-200/60 focus:border-purple-400',
    searchIconClass: 'text-purple-300',
    tabsContainerClass: 'bg-[#10041E]/80 border-purple-500/20',
    activeTabStyle: { background: 'linear-gradient(90deg, #8B5CF6 0%, #A855F7 100%)', boxShadow: '0 0 12px rgba(168,85,247,0.45)' },
    activeTabTextClass: 'text-white',
    inactiveTabClass: 'text-purple-200/75 hover:text-white',
    rowActiveClass: 'bg-purple-900/45',
    rowActiveBorderColor: '#A855F7',
    rowHoverClass: 'hover:bg-purple-950/55',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-purple-200/75',
    rowTimeClass: 'text-purple-300/75',
    avatarBorderClass: 'border-purple-400/35 bg-[#120521]',
    onlineRingClass: 'ring-[#160728]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #9333EA 0%, #6D28D9 100%)', boxShadow: '0 0 10px rgba(147,51,234,0.45)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-amber-300 fill-amber-400/20',
    readTickClass: 'text-purple-300',
    chatWindowHeaderStyle: {
      background: 'rgba(24, 7, 45, 0.94)',
      borderColor: 'rgba(168, 85, 247, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-purple-300',
    chatWindowHeaderSubStyle: { color: '#D8B4FE' },
    chatWindowComposerStyle: {
      background: 'rgba(24, 7, 45, 0.95)',
      borderColor: 'rgba(168, 85, 247, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#210C3C] border-purple-500/35 text-white placeholder-purple-200/60 focus:border-purple-400',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 60%, #D946EF 100%)',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#220D3B] border border-purple-500/25 text-white',
    sendBtnStyle: { background: 'linear-gradient(135deg, #FBBF24 0%, #A855F7 100%)' },
    sendBtnTextClass: 'text-[#160728]',
    labelPillStyle: { background: 'linear-gradient(90deg, #581C87 0%, #7E22CE 100%)', border: '1px solid rgba(251,191,36,0.45)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(155deg, #3B0764 0%, #160728 55%, #7E22CE 100%)',
  },

  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    tagline: 'Tropical turquoise lagoon & palm mist',
    isLightSurface: true,
    headerIsDark: true,
    suitableForHome: false,
    homeFallbackId: 'classic_light',
    panelStyle: {
      backgroundColor: '#E0F7FA',
      backgroundImage: `${encodeSvg(`
        <path d='M0,0 L400,0 L400,150 Q200,175 0,145 Z' fill='#00B4D8'/>
        <g fill='#15803D' opacity='0.82'>
          <path d='M0,0 C45,15 88,36 125,75 C82,52 44,34 0,25 Z'/>
          <path d='M0,0 C25,42 30,85 18,125 C8,85 0,48 0,0 Z'/>
          <path d='M30,0 C82,5 128,15 162,38 C115,24 72,18 30,0 Z' fill='#22C55E'/>
        </g>
        <path d='M0,565 Q180,535 400,560 L400,720 L0,720 Z' fill='#06B6D4' fill-opacity='0.35'/>
        <path d='M0,640 Q210,605 400,645 L400,720 L0,720 Z' fill='#FDE68A' fill-opacity='0.55'/>
        <path d='M400,720 C355,668 308,670 272,720 Z' fill='#15803D' fill-opacity='0.8'/>
      `)}, linear-gradient(180deg, #00A8E8 0%, #67E8F9 26%, #E0F7FA 55%, #CFFAFE 82%, #FEF3C7 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-cyan-300/80',
    feedSurfaceClass: 'bg-white/62 backdrop-blur-sm',
    dividerClass: 'divide-cyan-200/70',
    pinnedBarClass: 'bg-white/90 border-cyan-200 text-slate-700',
    pinnedAccentTextClass: 'text-[#0D9488]',
    protocolPillClass: 'bg-white/90 border-cyan-200 text-slate-700 shadow-xs',
    secondarySurfaceClass: 'bg-white/95 border-cyan-200 text-slate-900',
    logoTone: 'mono-white',
    logoAccentColor: '#A5F3FC',
    headerBorderClass: 'border-white/25 bg-[#0284C7]/65 backdrop-blur-md',
    headerIconBtnClass: 'bg-white/20 text-white border border-white/30 hover:bg-white/35',
    plusBtnStyle: { background: 'linear-gradient(135deg, #0D9488 0%, #059669 100%)' },
    plusBtnTextClass: 'text-white',
    searchInputClass: 'bg-white/85 border-white text-slate-900 placeholder-slate-500 focus:border-teal-600',
    searchIconClass: 'text-teal-700',
    tabsContainerClass: 'bg-white/60 border-white/80',
    activeTabStyle: { background: 'linear-gradient(90deg, #0F766E 0%, #0D9488 100%)' },
    activeTabTextClass: 'text-white shadow-sm',
    inactiveTabClass: 'text-slate-700 hover:text-slate-950',
    rowActiveClass: 'bg-white/85',
    rowActiveBorderColor: '#0D9488',
    rowHoverClass: 'hover:bg-white/75',
    rowTitleClass: 'text-slate-900',
    rowSubtitleClass: 'text-slate-700',
    rowTimeClass: 'text-slate-600',
    avatarBorderClass: 'border-cyan-400/60 bg-cyan-50',
    onlineRingClass: 'ring-white',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-[#0284C7] fill-sky-200',
    readTickClass: 'text-teal-600',
    chatWindowHeaderStyle: {
      background: 'linear-gradient(90deg, #0284C7 0%, #0891B2 100%)',
      borderColor: 'rgba(165, 243, 252, 0.35)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-cyan-100',
    chatWindowHeaderSubStyle: { color: '#CFFAFE' },
    chatWindowComposerStyle: {
      background: 'rgba(236, 254, 255, 0.94)',
      borderColor: 'rgba(103, 232, 249, 0.65)',
    },
    chatWindowComposerInputClass: 'bg-white border-cyan-300 text-slate-900 placeholder-slate-400 focus:border-teal-600',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #0891B2 0%, #0D9488 100%)',
      boxShadow: '0 4px 14px rgba(8, 145, 178, 0.28)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-white/95 border border-cyan-200 text-slate-900 shadow-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #0284C7 0%, #0891B2 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(180deg, #00A8E8 0%, #67E8F9 52%, #FDE68A 100%)',
  },

  {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Crimson amber & dusk horizon',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: false,
    homeFallbackId: 'dark_mode',
    panelStyle: {
      backgroundColor: '#B91C1C',
      backgroundImage: `${encodeSvg(`
        <circle cx='315' cy='520' r='54' fill='#FDE047' fill-opacity='0.35'/>
        <path d='M0,650 Q120,625 220,645 T400,635 L400,720 L0,720 Z' fill='#3B0712' fill-opacity='0.78'/>
        <path d='M25,650 L25,585 M25,595 C10,592 5,600 0,608 M25,595 C42,592 48,600 54,610 M25,590 C18,578 32,576 38,582' stroke='#2A050D' stroke-width='2.5' fill='none' opacity='0.65'/>
      `)}, linear-gradient(180deg, #7F1D1D 0%, #C2410C 32%, #EA580C 58%, #DB2777 88%, #831843 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-orange-300/30',
    feedSurfaceClass: 'bg-black/15 backdrop-blur-xs',
    dividerClass: 'divide-orange-200/15',
    pinnedBarClass: 'bg-[#4A1214]/92 border-orange-300/25 text-orange-100',
    pinnedAccentTextClass: 'text-amber-300',
    protocolPillClass: 'bg-[#3B0D14]/85 border-orange-300/30 text-orange-100 backdrop-blur-md',
    secondarySurfaceClass: 'bg-[#450A0A]/95 border-orange-400/30 text-white',
    logoTone: 'mono-white',
    logoAccentColor: '#FDE047',
    headerBorderClass: 'border-white/15 bg-black/15 backdrop-blur-md',
    headerIconBtnClass: 'bg-white/15 text-white border border-white/25 hover:bg-white/25',
    plusBtnStyle: { background: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)' },
    plusBtnTextClass: 'text-[#451A03]',
    searchInputClass: 'bg-black/20 border-white/35 text-white placeholder-orange-100/80 focus:border-amber-300',
    searchIconClass: 'text-orange-100',
    tabsContainerClass: 'bg-black/20 border-white/20',
    activeTabStyle: { background: 'linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)' },
    activeTabTextClass: 'text-[#7C2D12] shadow-sm',
    inactiveTabClass: 'text-orange-50/90 hover:text-white',
    rowActiveClass: 'bg-black/25',
    rowActiveBorderColor: '#FDE047',
    rowHoverClass: 'hover:bg-white/10',
    rowTitleClass: 'text-white drop-shadow-xs',
    rowSubtitleClass: 'text-orange-100/90',
    rowTimeClass: 'text-amber-100/85',
    avatarBorderClass: 'border-amber-200/45 bg-orange-950',
    onlineRingClass: 'ring-[#C2410C]',
    unreadBadgeStyle: { background: '#1C1917', border: '1.5px solid #FDBA74' },
    unreadBadgeTextClass: 'text-amber-200',
    verifiedIconClass: 'text-amber-200 fill-amber-300/20',
    readTickClass: 'text-amber-200',
    chatWindowHeaderStyle: {
      background: 'linear-gradient(90deg, #991B1B 0%, #C2410C 55%, #BE185D 100%)',
      borderColor: 'rgba(253, 186, 116, 0.3)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-amber-200',
    chatWindowHeaderSubStyle: { color: '#FED7AA' },
    chatWindowComposerStyle: {
      background: 'linear-gradient(90deg, rgba(127,29,29,0.95) 0%, rgba(157,23,77,0.95) 100%)',
      borderColor: 'rgba(253, 186, 116, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-black/25 border-white/30 text-white placeholder-orange-100/75 focus:border-amber-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 55%, #DB2777 100%)',
      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#3B0D14]/90 border border-orange-300/25 text-white',
    sendBtnStyle: { background: 'linear-gradient(135deg, #FDE047 0%, #F97316 100%)' },
    sendBtnTextClass: 'text-[#451A03]',
    labelPillStyle: { background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(180deg, #991B1B 0%, #EA580C 48%, #DB2777 100%)',
  },

  {
    id: 'neon_tech',
    name: 'Neon Tech',
    tagline: 'Midnight cyber circuits & electric glow',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    panelStyle: {
      backgroundColor: '#030714',
      backgroundImage: `${encodeSvg(`
        <g fill='none' stroke-width='2' stroke-linecap='round'>
          <path d='M0,65 L68,22 L115,22' stroke='#D946EF' stroke-opacity='0.65'/>
          <path d='M0,92 L52,55 L92,55' stroke='#A855F7' stroke-opacity='0.5'/>
          <path d='M400,35 L335,88 L335,145' stroke='#00F0FF' stroke-opacity='0.65'/>
          <path d='M400,70 L355,108 L355,175' stroke='#38BDF8' stroke-opacity='0.45'/>
          <path d='M0,650 L55,610 L95,610' stroke='#A855F7' stroke-opacity='0.55'/>
          <path d='M400,610 L330,665 L285,665' stroke='#00F0FF' stroke-opacity='0.7'/>
          <path d='M400,645 L350,695 L310,695' stroke='#0EA5E9' stroke-opacity='0.5'/>
          <circle cx='115' cy='22' r='3' fill='#D946EF'/>
          <circle cx='335' cy='145' r='3' fill='#00F0FF'/>
          <circle cx='285' cy='665' r='3' fill='#00F0FF'/>
        </g>
      `)}, radial-gradient(circle at 88% 12%, rgba(0, 240, 255, 0.24) 0%, transparent 40%), radial-gradient(circle at 10% 10%, rgba(217, 70, 239, 0.22) 0%, transparent 40%), linear-gradient(180deg, #04081A 0%, #020510 55%, #050B21 100%)`,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-cyan-400/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-cyan-400/10',
    pinnedBarClass: 'bg-[#070E24]/95 border-[#00F0FF]/25 text-cyan-100',
    pinnedAccentTextClass: 'text-[#00F0FF]',
    protocolPillClass: 'bg-[#070E24]/90 border-[#00F0FF]/30 text-cyan-100',
    secondarySurfaceClass: 'bg-[#070E24] border-[#00F0FF]/35 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#00F0FF',
    headerBorderClass: 'border-cyan-400/20 bg-[#050A1B]/90 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#09122B] text-cyan-200 border border-cyan-400/30 hover:text-[#00F0FF] hover:border-[#00F0FF]',
    plusBtnStyle: { background: 'linear-gradient(135deg, #00F0FF 0%, #00A3FF 100%)', boxShadow: '0 0 14px rgba(0,240,255,0.55)' },
    plusBtnTextClass: 'text-[#020510]',
    searchInputClass: 'bg-[#070E24]/90 border-[#00F0FF]/55 text-white placeholder-cyan-200/60 focus:border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.16)]',
    searchIconClass: 'text-[#00F0FF]',
    tabsContainerClass: 'bg-[#060C20]/90 border-cyan-400/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #00F0FF 0%, #38BDF8 100%)', boxShadow: '0 0 14px rgba(0,240,255,0.5)' },
    activeTabTextClass: 'text-[#020510]',
    inactiveTabClass: 'text-cyan-100/75 hover:text-white',
    rowActiveClass: 'bg-[#0B1738]/85',
    rowActiveBorderColor: '#00F0FF',
    rowHoverClass: 'hover:bg-[#0A1330]/75',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-slate-300',
    rowTimeClass: 'text-cyan-300/80',
    avatarBorderClass: 'border-cyan-400/45 bg-[#020510]',
    onlineRingClass: 'ring-[#030714]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #00F0FF 0%, #2563EB 100%)', boxShadow: '0 0 10px rgba(0,240,255,0.45)' },
    unreadBadgeTextClass: 'text-[#020510]',
    verifiedIconClass: 'text-[#00F0FF] fill-cyan-400/20',
    readTickClass: 'text-[#00F0FF]',
    chatWindowHeaderStyle: {
      background: 'rgba(4, 8, 26, 0.94)',
      borderColor: 'rgba(0, 240, 255, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-[#00F0FF]',
    chatWindowHeaderSubStyle: { color: '#00F0FF' },
    chatWindowComposerStyle: {
      background: 'rgba(4, 8, 26, 0.95)',
      borderColor: 'rgba(0, 240, 255, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#070E24] border-[#00F0FF]/40 text-white placeholder-cyan-200/60 focus:border-[#00F0FF]',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #00F0FF 0%, #3B82F6 60%, #A855F7 100%)',
      boxShadow: '0 4px 18px rgba(0, 240, 255, 0.3)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#09122B] border border-cyan-400/30 text-white',
    sendBtnStyle: { background: 'linear-gradient(135deg, #00F0FF 0%, #A855F7 100%)' },
    sendBtnTextClass: 'text-[#020510]',
    labelPillStyle: { background: 'linear-gradient(90deg, #020617 0%, #1E1B4B 100%)', border: '1px solid #00F0FF' },
    labelPillTextClass: 'text-[#00F0FF]',
    swatchGradient: 'linear-gradient(155deg, #1E1B4B 0%, #030714 55%, #0E7490 100%)',
  },

  {
    id: 'minimalist_white',
    name: 'Minimalist White',
    tagline: 'Crisp studio white & cobalt ink',
    isLightSurface: true,
    headerIsDark: false,
    suitableForHome: true,
    panelStyle: {
      backgroundColor: '#FFFFFF',
      backgroundImage: `${encodeSvg(`
        <path d='M0,85 C135,18 265,98 400,32 L400,0 L0,0 Z' fill='#E2E8F0' fill-opacity='0.55'/>
        <path d='M0,670 C140,705 280,645 400,685 L400,720 L0,720 Z' fill='#DBEAFE' fill-opacity='0.6'/>
      `)}, linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)`,
      backgroundSize: '100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-slate-200',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-slate-200/80',
    pinnedBarClass: 'bg-slate-50 border-slate-200 text-slate-700',
    pinnedAccentTextClass: 'text-[#1E3A8A]',
    protocolPillClass: 'bg-white border-slate-200 text-slate-600 shadow-xs',
    secondarySurfaceClass: 'bg-white border-slate-200 text-slate-900',
    logoTone: 'light-bg',
    logoAccentColor: '#1E3A8A',
    headerBorderClass: 'border-slate-200 bg-white/95 backdrop-blur-md',
    headerIconBtnClass: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-950',
    plusBtnStyle: { background: '#1E3A8A' },
    plusBtnTextClass: 'text-white',
    searchInputClass: 'bg-slate-100/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-800',
    searchIconClass: 'text-slate-400',
    tabsContainerClass: 'bg-slate-100 border-slate-200',
    activeTabStyle: { background: '#1E3A8A' },
    activeTabTextClass: 'text-white shadow-sm',
    inactiveTabClass: 'text-slate-600 hover:text-slate-950',
    rowActiveClass: 'bg-slate-100',
    rowActiveBorderColor: '#1E3A8A',
    rowHoverClass: 'hover:bg-slate-50',
    rowTitleClass: 'text-slate-950',
    rowSubtitleClass: 'text-slate-500',
    rowTimeClass: 'text-slate-400',
    avatarBorderClass: 'border-slate-200 bg-slate-100',
    onlineRingClass: 'ring-white',
    unreadBadgeStyle: { background: '#1D4ED8' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-blue-700 fill-blue-100',
    readTickClass: 'text-blue-700',
    chatWindowHeaderStyle: {
      background: 'rgba(255, 255, 255, 0.96)',
      borderColor: 'rgba(226, 232, 240, 0.9)',
    },
    chatWindowHeaderTitleClass: 'text-slate-950 group-hover:text-blue-800',
    chatWindowHeaderSubStyle: { color: '#1E40AF' },
    chatWindowComposerStyle: {
      background: 'rgba(255, 255, 255, 0.96)',
      borderColor: 'rgba(226, 232, 240, 0.9)',
    },
    chatWindowComposerInputClass: 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-800',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.22)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-white border border-slate-200 text-slate-900 shadow-sm',
    sendBtnStyle: { background: '#1E3A8A' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: '#0F172A' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(155deg, #FFFFFF 0%, #F1F5F9 60%, #E2E8F0 100%)',
  },

  {
    id: 'royal_gold',
    name: 'Royal Gold',
    tagline: 'Obsidian velvet & 24K champagne gold',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    hasCrownMotif: true,
    panelStyle: {
      backgroundColor: '#070604',
      backgroundImage: `${encodeSvg(`
        <defs>
          <linearGradient id='rgS' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stop-color='#FDE68A' stop-opacity='0.42'/>
            <stop offset='50%' stop-color='#F59E0B' stop-opacity='0.14'/>
            <stop offset='100%' stop-color='#78350F' stop-opacity='0'/>
          </linearGradient>
        </defs>
        <path d='M0,78 C110,10 265,62 400,8 L400,0 L0,0 Z' fill='url(#rgS)'/>
        <path d='M0,690 C140,635 280,685 400,605 L400,720 L0,720 Z' fill='url(#rgS)'/>
        <circle cx='335' cy='580' r='1.8' fill='#FDE68A' opacity='0.7'/>
        <circle cx='355' cy='615' r='1.3' fill='#FBBF24' opacity='0.65'/>
        <circle cx='295' cy='640' r='1.5' fill='#FEF3C7' opacity='0.6'/>
        <circle cx='45' cy='55' r='1.4' fill='#FDE68A' opacity='0.6'/>
      `)}, radial-gradient(circle at 85% 8%, rgba(251, 191, 36, 0.2) 0%, transparent 42%), radial-gradient(circle at 82% 88%, rgba(245, 158, 11, 0.16) 0%, transparent 45%), linear-gradient(180deg, #0C0A05 0%, #050402 55%, #0F0B04 100%)`,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      backgroundRepeat: 'no-repeat',
    },
    panelBorderClass: 'border-amber-500/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-amber-500/12',
    pinnedBarClass: 'bg-[#141007]/95 border-amber-500/25 text-amber-100',
    pinnedAccentTextClass: 'text-amber-400',
    protocolPillClass: 'bg-[#141007]/90 border-amber-500/30 text-amber-200',
    secondarySurfaceClass: 'bg-[#141007] border-amber-500/35 text-amber-50',
    logoTone: 'dark-bg',
    logoAccentColor: '#FBBF24',
    headerBorderClass: 'border-amber-500/20 bg-[#0A0804]/90 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#171207] text-amber-200 border border-amber-500/25 hover:text-amber-300 hover:border-amber-400',
    plusBtnStyle: { background: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 100%)', boxShadow: '0 0 14px rgba(245,158,11,0.45)' },
    plusBtnTextClass: 'text-[#1C1202]',
    searchInputClass: 'bg-[#141007]/95 border-amber-500/40 text-amber-50 placeholder-amber-200/50 focus:border-amber-400',
    searchIconClass: 'text-amber-400',
    tabsContainerClass: 'bg-[#120E06]/90 border-amber-500/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #FDE68A 0%, #F59E0B 100%)', boxShadow: '0 0 12px rgba(245,158,11,0.4)' },
    activeTabTextClass: 'text-[#1C1202]',
    inactiveTabClass: 'text-amber-200/75 hover:text-amber-100',
    rowActiveClass: 'bg-amber-500/15',
    rowActiveBorderColor: '#FBBF24',
    rowHoverClass: 'hover:bg-amber-950/35',
    rowTitleClass: 'text-amber-50',
    rowSubtitleClass: 'text-amber-200/70',
    rowTimeClass: 'text-amber-300/80',
    avatarBorderClass: 'border-amber-400/40 bg-[#070604]',
    onlineRingClass: 'ring-[#070604]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #FDE047 0%, #D97706 100%)' },
    unreadBadgeTextClass: 'text-[#1C1202]',
    verifiedIconClass: 'text-amber-400 fill-amber-400/20',
    readTickClass: 'text-amber-400',
    chatWindowHeaderStyle: {
      background: 'rgba(10, 8, 4, 0.94)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-amber-50 group-hover:text-amber-300',
    chatWindowHeaderSubStyle: { color: '#FBBF24' },
    chatWindowComposerStyle: {
      background: 'rgba(10, 8, 4, 0.95)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#141007] border-amber-500/35 text-amber-50 placeholder-amber-200/50 focus:border-amber-400',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)',
      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
    },
    outgoingBubbleTextClass: 'text-[#1C1202]',
    incomingBubbleClass: 'bg-[#141007] border border-amber-500/25 text-amber-50',
    sendBtnStyle: { background: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 100%)' },
    sendBtnTextClass: 'text-[#1C1202]',
    labelPillStyle: { background: '#0A0804', border: '1px solid rgba(251,191,36,0.55)' },
    labelPillTextClass: 'text-amber-300',
    swatchGradient: 'linear-gradient(155deg, #78350F 0%, #070604 50%, #F59E0B 100%)',
  },

  /* ==================== PAID LIVE THEMES ($2.00 USD EACH) ==================== */
  {
    id: 'live_aurora_borealis',
    name: 'Live Aurora Borealis',
    tagline: 'Animated polar northern lights & stars',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    isLive: true,
    liveEffect: 'aurora',
    priceUsd: 2,
    panelStyle: {
      backgroundColor: '#031216',
      backgroundImage:
        'radial-gradient(circle at 20% 18%, rgba(16, 185, 129, 0.24) 0%, transparent 48%), radial-gradient(circle at 82% 84%, rgba(0, 229, 212, 0.18) 0%, transparent 50%), linear-gradient(180deg, #04191D 0%, #020A0E 60%, #04151C 100%)',
    },
    panelBorderClass: 'border-emerald-400/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-emerald-400/12',
    pinnedBarClass: 'bg-[#04181D]/92 border-emerald-400/25 text-emerald-50',
    pinnedAccentTextClass: 'text-emerald-300',
    protocolPillClass: 'bg-[#04181D]/85 border-emerald-400/30 text-emerald-100',
    secondarySurfaceClass: 'bg-[#04181D] border-emerald-400/35 text-emerald-50',
    logoTone: 'dark-bg',
    logoAccentColor: '#34D399',
    headerBorderClass: 'border-emerald-400/20 bg-[#031317]/85 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#08242B] text-emerald-200 border border-emerald-400/25 hover:text-white',
    plusBtnStyle: { background: 'linear-gradient(135deg, #34D399 0%, #00E5D4 100%)', boxShadow: '0 0 14px rgba(52,211,153,0.45)' },
    plusBtnTextClass: 'text-[#021210]',
    searchInputClass: 'bg-[#061D22]/90 border-emerald-400/35 text-white placeholder-emerald-200/50 focus:border-emerald-300',
    searchIconClass: 'text-emerald-300',
    tabsContainerClass: 'bg-[#05181C]/90 border-emerald-400/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #34D399 0%, #00E5D4 100%)' },
    activeTabTextClass: 'text-[#021210]',
    inactiveTabClass: 'text-emerald-200/75 hover:text-white',
    rowActiveClass: 'bg-emerald-400/15',
    rowActiveBorderColor: '#34D399',
    rowHoverClass: 'hover:bg-emerald-950/35',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-emerald-100/75',
    rowTimeClass: 'text-emerald-300/85',
    avatarBorderClass: 'border-emerald-400/40 bg-[#031216]',
    onlineRingClass: 'ring-[#031216]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #34D399 0%, #00E5D4 100%)' },
    unreadBadgeTextClass: 'text-[#021210]',
    verifiedIconClass: 'text-emerald-300 fill-emerald-300/20',
    readTickClass: 'text-emerald-300',
    chatWindowHeaderStyle: {
      background: 'rgba(3, 19, 23, 0.9)',
      borderColor: 'rgba(52, 211, 153, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-emerald-300',
    chatWindowHeaderSubStyle: { color: '#6EE7B7' },
    chatWindowComposerStyle: {
      background: 'rgba(3, 19, 23, 0.92)',
      borderColor: 'rgba(52, 211, 153, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#061D22] border-emerald-400/30 text-white placeholder-emerald-200/50 focus:border-emerald-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #34D399 0%, #00E5D4 100%)',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
    },
    outgoingBubbleTextClass: 'text-[#021210]',
    incomingBubbleClass: 'bg-[#061D22]/90 border border-emerald-400/25 text-white backdrop-blur-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #34D399 0%, #00E5D4 100%)' },
    sendBtnTextClass: 'text-[#021210]',
    labelPillStyle: { background: 'linear-gradient(90deg, #059669 0%, #00B8A9 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #065F46 0%, #031216 55%, #00E5D4 100%)',
  },

  {
    id: 'live_cyber_pulse',
    name: 'Live Cyber Pulse',
    tagline: 'Animated holo grid & laser scanner',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    isLive: true,
    liveEffect: 'cyber_pulse',
    priceUsd: 2,
    panelStyle: {
      backgroundColor: '#040814',
      backgroundImage:
        'radial-gradient(circle at 80% 15%, rgba(0, 207, 239, 0.2) 0%, transparent 45%), radial-gradient(circle at 20% 85%, rgba(168, 85, 247, 0.18) 0%, transparent 45%), linear-gradient(180deg, #060C1E 0%, #03060F 100%)',
    },
    panelBorderClass: 'border-cyan-400/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-cyan-400/12',
    pinnedBarClass: 'bg-[#060D20]/92 border-cyan-400/25 text-cyan-50',
    pinnedAccentTextClass: 'text-cyan-300',
    protocolPillClass: 'bg-[#060D20]/85 border-cyan-400/30 text-cyan-100',
    secondarySurfaceClass: 'bg-[#060D20] border-cyan-400/35 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#00CFEF',
    headerBorderClass: 'border-cyan-400/20 bg-[#050A18]/85 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#0B152C] text-cyan-200 border border-cyan-400/25 hover:text-white',
    plusBtnStyle: { background: 'linear-gradient(135deg, #00E5D4 0%, #00CFEF 100%)', boxShadow: '0 0 14px rgba(0,207,239,0.5)' },
    plusBtnTextClass: 'text-[#03090D]',
    searchInputClass: 'bg-[#091228]/90 border-cyan-400/35 text-white placeholder-cyan-200/45 focus:border-cyan-300',
    searchIconClass: 'text-cyan-300',
    tabsContainerClass: 'bg-[#081024]/90 border-cyan-400/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #00CFEF 0%, #3B82F6 100%)' },
    activeTabTextClass: 'text-white',
    inactiveTabClass: 'text-cyan-200/70 hover:text-white',
    rowActiveClass: 'bg-cyan-400/15',
    rowActiveBorderColor: '#00CFEF',
    rowHoverClass: 'hover:bg-cyan-950/35',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-cyan-100/75',
    rowTimeClass: 'text-cyan-300/85',
    avatarBorderClass: 'border-cyan-400/40 bg-[#040814]',
    onlineRingClass: 'ring-[#040814]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #00E5D4 0%, #3B82F6 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-cyan-300 fill-cyan-300/20',
    readTickClass: 'text-cyan-300',
    chatWindowHeaderStyle: {
      background: 'rgba(5, 10, 24, 0.92)',
      borderColor: 'rgba(0, 207, 239, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-cyan-300',
    chatWindowHeaderSubStyle: { color: '#67E8F9' },
    chatWindowComposerStyle: {
      background: 'rgba(5, 10, 24, 0.94)',
      borderColor: 'rgba(0, 207, 239, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#091228] border-cyan-400/30 text-white placeholder-cyan-200/45 focus:border-cyan-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #00CFEF 0%, #2563EB 100%)',
      boxShadow: '0 4px 16px rgba(0, 207, 239, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#091228]/90 border border-cyan-400/25 text-white backdrop-blur-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #00E5D4 0%, #2563EB 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #0284C7 0%, #6366F1 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #00CFEF 0%, #040814 55%, #7C3AED 100%)',
  },

  {
    id: 'live_solar_embers',
    name: 'Live Solar Embers',
    tagline: 'Animated rising sparks & warm glow',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    isLive: true,
    liveEffect: 'solar_embers',
    priceUsd: 2,
    panelStyle: {
      backgroundColor: '#160807',
      backgroundImage:
        'radial-gradient(circle at 50% 88%, rgba(249, 115, 22, 0.26) 0%, transparent 55%), radial-gradient(circle at 20% 15%, rgba(239, 68, 68, 0.16) 0%, transparent 45%), linear-gradient(180deg, #1E0A08 0%, #0E0505 60%, #240D07 100%)',
    },
    panelBorderClass: 'border-orange-500/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-orange-400/12',
    pinnedBarClass: 'bg-[#220B08]/92 border-orange-500/25 text-orange-50',
    pinnedAccentTextClass: 'text-orange-300',
    protocolPillClass: 'bg-[#220B08]/85 border-orange-500/30 text-orange-100',
    secondarySurfaceClass: 'bg-[#220B08] border-orange-500/35 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#FB923C',
    headerBorderClass: 'border-orange-500/20 bg-[#180807]/85 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#2B100B] text-orange-200 border border-orange-500/25 hover:text-white',
    plusBtnStyle: { background: 'linear-gradient(135deg, #FDBA74 0%, #EA580C 100%)', boxShadow: '0 0 14px rgba(249,115,22,0.45)' },
    plusBtnTextClass: 'text-[#1C0702]',
    searchInputClass: 'bg-[#240D09]/90 border-orange-500/35 text-white placeholder-orange-200/45 focus:border-orange-400',
    searchIconClass: 'text-orange-300',
    tabsContainerClass: 'bg-[#200B08]/90 border-orange-500/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #FB923C 0%, #EF4444 100%)' },
    activeTabTextClass: 'text-white',
    inactiveTabClass: 'text-orange-200/75 hover:text-white',
    rowActiveClass: 'bg-orange-500/15',
    rowActiveBorderColor: '#FB923C',
    rowHoverClass: 'hover:bg-orange-950/35',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-orange-100/75',
    rowTimeClass: 'text-orange-300/85',
    avatarBorderClass: 'border-orange-400/40 bg-[#160807]',
    onlineRingClass: 'ring-[#160807]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #FB923C 0%, #EF4444 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-orange-300 fill-orange-300/20',
    readTickClass: 'text-orange-300',
    chatWindowHeaderStyle: {
      background: 'rgba(24, 8, 7, 0.92)',
      borderColor: 'rgba(249, 115, 22, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-orange-300',
    chatWindowHeaderSubStyle: { color: '#FDBA74' },
    chatWindowComposerStyle: {
      background: 'rgba(24, 8, 7, 0.94)',
      borderColor: 'rgba(249, 115, 22, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#240D09] border-orange-500/30 text-white placeholder-orange-200/45 focus:border-orange-400',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #FB923C 0%, #DC2626 100%)',
      boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#240D09]/90 border border-orange-500/25 text-white backdrop-blur-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #EA580C 0%, #E11D48 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #F97316 0%, #160807 55%, #DC2626 100%)',
  },

  {
    id: 'live_starlight_nebula',
    name: 'Live Starlight Nebula',
    tagline: 'Twinkling cosmic stars & violet mist',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    isLive: true,
    liveEffect: 'starlight_nebula',
    priceUsd: 2,
    panelStyle: {
      backgroundColor: '#0E071B',
      backgroundImage:
        'radial-gradient(circle at 78% 18%, rgba(192, 132, 252, 0.24) 0%, transparent 48%), radial-gradient(circle at 18% 82%, rgba(99, 102, 241, 0.2) 0%, transparent 48%), linear-gradient(180deg, #160B2B 0%, #080412 100%)',
    },
    panelBorderClass: 'border-purple-400/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-purple-400/12',
    pinnedBarClass: 'bg-[#170C2B]/92 border-purple-400/25 text-purple-50',
    pinnedAccentTextClass: 'text-purple-300',
    protocolPillClass: 'bg-[#170C2B]/85 border-purple-400/30 text-purple-100',
    secondarySurfaceClass: 'bg-[#170C2B] border-purple-400/35 text-white',
    logoTone: 'dark-bg',
    logoAccentColor: '#C084FC',
    headerBorderClass: 'border-purple-400/20 bg-[#110821]/85 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#21113B] text-purple-200 border border-purple-400/25 hover:text-white',
    plusBtnStyle: { background: 'linear-gradient(135deg, #E879F9 0%, #8B5CF6 100%)', boxShadow: '0 0 14px rgba(192,132,252,0.45)' },
    plusBtnTextClass: 'text-white',
    searchInputClass: 'bg-[#180C2E]/90 border-purple-400/35 text-white placeholder-purple-200/45 focus:border-purple-300',
    searchIconClass: 'text-purple-300',
    tabsContainerClass: 'bg-[#150A28]/90 border-purple-400/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #C084FC 0%, #6366F1 100%)' },
    activeTabTextClass: 'text-white',
    inactiveTabClass: 'text-purple-200/75 hover:text-white',
    rowActiveClass: 'bg-purple-500/18',
    rowActiveBorderColor: '#C084FC',
    rowHoverClass: 'hover:bg-purple-950/35',
    rowTitleClass: 'text-white',
    rowSubtitleClass: 'text-purple-100/75',
    rowTimeClass: 'text-purple-300/85',
    avatarBorderClass: 'border-purple-400/40 bg-[#0E071B]',
    onlineRingClass: 'ring-[#0E071B]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #D946EF 0%, #7C3AED 100%)' },
    unreadBadgeTextClass: 'text-white',
    verifiedIconClass: 'text-purple-300 fill-purple-300/20',
    readTickClass: 'text-purple-300',
    chatWindowHeaderStyle: {
      background: 'rgba(17, 8, 33, 0.92)',
      borderColor: 'rgba(192, 132, 252, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-white group-hover:text-purple-300',
    chatWindowHeaderSubStyle: { color: '#D8B4FE' },
    chatWindowComposerStyle: {
      background: 'rgba(17, 8, 33, 0.94)',
      borderColor: 'rgba(192, 132, 252, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#180C2E] border-purple-400/30 text-white placeholder-purple-200/45 focus:border-purple-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.35)',
    },
    outgoingBubbleTextClass: 'text-white',
    incomingBubbleClass: 'bg-[#180C2E]/90 border border-purple-400/25 text-white backdrop-blur-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #C084FC 0%, #6366F1 100%)' },
    sendBtnTextClass: 'text-white',
    labelPillStyle: { background: 'linear-gradient(90deg, #9333EA 0%, #4F46E5 100%)' },
    labelPillTextClass: 'text-white',
    swatchGradient: 'linear-gradient(145deg, #A855F7 0%, #0E071B 55%, #4F46E5 100%)',
  },

  {
    id: 'live_royal_stardust',
    name: 'Live Royal Stardust',
    tagline: 'Floating 24K gold dust & crown aura',
    isLightSurface: false,
    headerIsDark: true,
    suitableForHome: true,
    hasCrownMotif: true,
    isLive: true,
    liveEffect: 'royal_stardust',
    priceUsd: 2,
    panelStyle: {
      backgroundColor: '#090703',
      backgroundImage:
        'radial-gradient(circle at 82% 16%, rgba(250, 204, 21, 0.22) 0%, transparent 45%), radial-gradient(circle at 18% 85%, rgba(217, 119, 6, 0.16) 0%, transparent 45%), linear-gradient(180deg, #120E05 0%, #050402 60%, #140F05 100%)',
    },
    panelBorderClass: 'border-amber-400/25',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: 'divide-amber-400/12',
    pinnedBarClass: 'bg-[#151006]/92 border-amber-400/25 text-amber-50',
    pinnedAccentTextClass: 'text-amber-300',
    protocolPillClass: 'bg-[#151006]/85 border-amber-400/30 text-amber-100',
    secondarySurfaceClass: 'bg-[#151006] border-amber-400/35 text-amber-50',
    logoTone: 'dark-bg',
    logoAccentColor: '#FACC15',
    headerBorderClass: 'border-amber-400/20 bg-[#0D0A04]/85 backdrop-blur-md',
    headerIconBtnClass: 'bg-[#1B1508] text-amber-200 border border-amber-400/25 hover:text-amber-300',
    plusBtnStyle: { background: 'linear-gradient(135deg, #FEF08A 0%, #EAB308 100%)', boxShadow: '0 0 14px rgba(250,204,21,0.45)' },
    plusBtnTextClass: 'text-[#1C1302]',
    searchInputClass: 'bg-[#161106]/90 border-amber-400/35 text-amber-50 placeholder-amber-200/45 focus:border-amber-300',
    searchIconClass: 'text-amber-300',
    tabsContainerClass: 'bg-[#130E05]/90 border-amber-400/25',
    activeTabStyle: { background: 'linear-gradient(90deg, #FDE047 0%, #D97706 100%)' },
    activeTabTextClass: 'text-[#1C1302]',
    inactiveTabClass: 'text-amber-200/75 hover:text-amber-100',
    rowActiveClass: 'bg-amber-500/15',
    rowActiveBorderColor: '#FACC15',
    rowHoverClass: 'hover:bg-amber-950/35',
    rowTitleClass: 'text-amber-50',
    rowSubtitleClass: 'text-amber-200/70',
    rowTimeClass: 'text-amber-300/80',
    avatarBorderClass: 'border-amber-400/40 bg-[#090703]',
    onlineRingClass: 'ring-[#090703]',
    unreadBadgeStyle: { background: 'linear-gradient(135deg, #FDE047 0%, #D97706 100%)' },
    unreadBadgeTextClass: 'text-[#1C1302]',
    verifiedIconClass: 'text-amber-300 fill-amber-300/20',
    readTickClass: 'text-amber-300',
    chatWindowHeaderStyle: {
      background: 'rgba(13, 10, 4, 0.92)',
      borderColor: 'rgba(250, 204, 21, 0.25)',
    },
    chatWindowHeaderTitleClass: 'text-amber-50 group-hover:text-amber-300',
    chatWindowHeaderSubStyle: { color: '#FDE047' },
    chatWindowComposerStyle: {
      background: 'rgba(13, 10, 4, 0.94)',
      borderColor: 'rgba(250, 204, 21, 0.25)',
    },
    chatWindowComposerInputClass: 'bg-[#161106] border-amber-400/30 text-amber-50 placeholder-amber-200/45 focus:border-amber-300',
    outgoingBubbleStyle: {
      background: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 60%, #B45309 100%)',
      boxShadow: '0 4px 16px rgba(234, 179, 8, 0.32)',
    },
    outgoingBubbleTextClass: 'text-[#1C1302]',
    incomingBubbleClass: 'bg-[#161106]/90 border border-amber-400/25 text-amber-50 backdrop-blur-sm',
    sendBtnStyle: { background: 'linear-gradient(135deg, #FEF08A 0%, #EAB308 100%)' },
    sendBtnTextClass: 'text-[#1C1302]',
    labelPillStyle: { background: '#0D0A04', border: '1px solid rgba(250,204,21,0.55)' },
    labelPillTextClass: 'text-amber-300',
    swatchGradient: 'linear-gradient(145deg, #FACC15 0%, #090703 55%, #B45309 100%)',
  },
];

interface LiveThemeSpec {
  id: Exclude<ChatThemeId, 'custom_uploaded_theme'>;
  name: string;
  tagline: string;
  liveEffect: LiveThemeEffectId;
  bgBase: string;
  bgDeep: string;
  surfaceTint: string;
  accent: string;
  accentEnd: string;
  isLight?: boolean;
  darkInkOnAccent?: boolean;
  hasCrown?: boolean;
}

function buildPaidLiveTheme(spec: LiveThemeSpec): ChatThemeConfig {
  const isLight = Boolean(spec.isLight);
  const darkInk = spec.darkInkOnAccent ?? false;
  const grad = `linear-gradient(135deg, ${spec.accent} 0%, ${spec.accentEnd} 100%)`;
  const accentTextClass = darkInk ? 'text-[#051014]' : 'text-white';
  return {
    id: spec.id,
    name: spec.name,
    tagline: spec.tagline,
    isLightSurface: isLight,
    headerIsDark: !isLight,
    suitableForHome: true,
    hasCrownMotif: spec.hasCrown,
    isLive: true,
    liveEffect: spec.liveEffect,
    priceUsd: 2,
    panelStyle: {
      backgroundColor: spec.bgBase,
      backgroundImage: `radial-gradient(circle at 20% 18%, ${spec.accent}2E 0%, transparent 48%), radial-gradient(circle at 82% 84%, ${spec.accentEnd}24 0%, transparent 50%), linear-gradient(180deg, ${spec.bgBase} 0%, ${spec.bgDeep} 100%)`,
    },
    panelBorderClass: isLight ? 'border-slate-200' : 'border-white/15',
    feedSurfaceClass: 'bg-transparent',
    dividerClass: isLight ? 'divide-slate-200/70' : 'divide-white/10',
    pinnedBarClass: isLight
      ? 'bg-white/90 border-slate-200 text-slate-800'
      : 'bg-black/45 border-white/15 text-white',
    pinnedAccentTextClass: isLight ? 'text-slate-900' : 'text-white',
    protocolPillClass: isLight
      ? 'bg-white/85 border-slate-200 text-slate-700'
      : 'bg-black/45 border-white/20 text-white/90',
    secondarySurfaceClass: isLight
      ? 'bg-white border-slate-200 text-slate-900'
      : 'bg-black/55 border-white/15 text-white',
    logoTone: isLight ? 'light-bg' : 'dark-bg',
    logoAccentColor: spec.accent,
    headerBorderClass: isLight
      ? 'border-slate-200/80 bg-white/80 backdrop-blur-md'
      : 'border-white/15 bg-black/35 backdrop-blur-md',
    headerIconBtnClass: isLight
      ? 'bg-white/90 text-slate-700 border border-slate-200 hover:bg-white'
      : 'bg-white/10 text-white/90 border border-white/15 hover:bg-white/20',
    plusBtnStyle: { background: grad, boxShadow: `0 0 14px ${spec.accent}66` },
    plusBtnTextClass: accentTextClass,
    searchInputClass: isLight
      ? 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
      : 'bg-black/35 border-white/20 text-white placeholder-white/50 focus:border-white/45',
    searchIconClass: isLight ? 'text-slate-500' : 'text-white/75',
    tabsContainerClass: isLight
      ? 'bg-slate-100/90 border-slate-200'
      : 'bg-black/35 border-white/15',
    activeTabStyle: { background: grad },
    activeTabTextClass: accentTextClass,
    inactiveTabClass: isLight
      ? 'text-slate-600 hover:text-slate-900'
      : 'text-white/70 hover:text-white',
    rowActiveClass: isLight ? 'bg-black/5' : 'bg-white/12',
    rowActiveBorderColor: spec.accent,
    rowHoverClass: isLight ? 'hover:bg-black/[0.03]' : 'hover:bg-white/[0.06]',
    rowTitleClass: isLight ? 'text-slate-900' : 'text-white',
    rowSubtitleClass: isLight ? 'text-slate-600' : 'text-white/70',
    rowTimeClass: isLight ? 'text-slate-500' : 'text-white/75',
    avatarBorderClass: isLight ? 'border-slate-200 bg-white' : 'border-white/25 bg-black/40',
    onlineRingClass: isLight ? 'ring-white' : 'ring-black',
    unreadBadgeStyle: { background: grad },
    unreadBadgeTextClass: accentTextClass,
    verifiedIconClass: isLight ? 'text-sky-600' : 'text-white',
    readTickClass: isLight ? 'text-sky-600' : 'text-white',
    chatWindowHeaderStyle: {
      background: isLight ? 'rgba(255, 255, 255, 0.88)' : spec.surfaceTint,
      borderColor: isLight ? 'rgba(203, 213, 225, 0.85)' : 'rgba(255, 255, 255, 0.14)',
    },
    chatWindowHeaderTitleClass: isLight ? 'text-slate-900' : 'text-white',
    chatWindowHeaderSubStyle: { color: spec.accent },
    chatWindowComposerStyle: {
      background: isLight ? 'rgba(255, 255, 255, 0.92)' : spec.surfaceTint,
      borderColor: isLight ? 'rgba(203, 213, 225, 0.85)' : 'rgba(255, 255, 255, 0.14)',
    },
    chatWindowComposerInputClass: isLight
      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
      : 'bg-black/35 border-white/20 text-white placeholder-white/50 focus:border-white/45',
    outgoingBubbleStyle: { background: grad, boxShadow: `0 4px 16px ${spec.accent}44` },
    outgoingBubbleTextClass: accentTextClass,
    incomingBubbleClass: isLight
      ? 'bg-white/95 border border-slate-200 text-slate-900 shadow-sm backdrop-blur-sm'
      : 'bg-black/45 border border-white/15 text-white backdrop-blur-sm',
    sendBtnStyle: { background: grad },
    sendBtnTextClass: accentTextClass,
    labelPillStyle: { background: grad },
    labelPillTextClass: accentTextClass,
    swatchGradient: `linear-gradient(145deg, ${spec.accent} 0%, ${spec.bgBase} 55%, ${spec.accentEnd} 100%)`,
  };
}

const EXTRA_LIVE_THEMES: ChatThemeConfig[] = (
  [
    {
      id: 'live_sakura_breeze',
      name: 'Live Sakura Breeze',
      tagline: 'Drifting rose petals on twilight plum',
      liveEffect: 'sakura_petals',
      bgBase: '#1C0915',
      bgDeep: '#0B0409',
      surfaceTint: 'rgba(28, 9, 21, 0.9)',
      accent: '#F472B6',
      accentEnd: '#DB2777',
    },
    {
      id: 'live_midnight_meteors',
      name: 'Live Midnight Meteors',
      tagline: 'Shooting stars streaking across deep navy',
      liveEffect: 'meteor_shower',
      bgBase: '#050E24',
      bgDeep: '#020612',
      surfaceTint: 'rgba(5, 14, 36, 0.92)',
      accent: '#38BDF8',
      accentEnd: '#2563EB',
    },
    {
      id: 'live_emerald_fireflies',
      name: 'Live Emerald Fireflies',
      tagline: 'Glowing forest fireflies & jade mist',
      liveEffect: 'bioluminescent',
      bgBase: '#041A11',
      bgDeep: '#020B07',
      surfaceTint: 'rgba(4, 26, 17, 0.9)',
      accent: '#4ADE80',
      accentEnd: '#059669',
      darkInkOnAccent: true,
    },
    {
      id: 'live_synthwave_neon',
      name: 'Live Synthwave Drive',
      tagline: 'Ultraviolet grid with hot magenta laser',
      liveEffect: 'cyber_pulse',
      bgBase: '#18072E',
      bgDeep: '#0A0316',
      surfaceTint: 'rgba(24, 7, 46, 0.92)',
      accent: '#EC4899',
      accentEnd: '#8B5CF6',
    },
    {
      id: 'live_arctic_glacier',
      name: 'Live Arctic Frost',
      tagline: 'Floating ice crystals & glacial cobalt',
      liveEffect: 'ice_crystals',
      bgBase: '#061B2E',
      bgDeep: '#030D18',
      surfaceTint: 'rgba(6, 27, 46, 0.9)',
      accent: '#7DD3FC',
      accentEnd: '#0284C7',
      darkInkOnAccent: true,
    },
    {
      id: 'live_matrix_code',
      name: 'Live Matrix Neon',
      tagline: 'Cascading cyber phosphor code streams',
      liveEffect: 'matrix_rain',
      bgBase: '#021208',
      bgDeep: '#010703',
      surfaceTint: 'rgba(2, 18, 8, 0.92)',
      accent: '#22C55E',
      accentEnd: '#15803D',
      darkInkOnAccent: true,
    },
    {
      id: 'live_amethyst_prism',
      name: 'Live Amethyst Prism',
      tagline: 'Rotating luxury violet crystal rays',
      liveEffect: 'prism_crystal',
      bgBase: '#150729',
      bgDeep: '#090313',
      surfaceTint: 'rgba(21, 7, 41, 0.92)',
      accent: '#C084FC',
      accentEnd: '#7E22CE',
    },
    {
      id: 'live_crimson_velvet',
      name: 'Live Crimson Velvet',
      tagline: 'Rich ruby plasma & glowing rose aura',
      liveEffect: 'velvet_plasma',
      bgBase: '#21060D',
      bgDeep: '#0D0205',
      surfaceTint: 'rgba(33, 6, 13, 0.92)',
      accent: '#FB7185',
      accentEnd: '#BE123C',
    },
    {
      id: 'live_bioluminescent_lagoon',
      name: 'Live Deep Lagoon',
      tagline: 'Bioluminescent ocean teal orbs',
      liveEffect: 'bioluminescent',
      bgBase: '#031821',
      bgDeep: '#010B10',
      surfaceTint: 'rgba(3, 24, 33, 0.92)',
      accent: '#2DD4BF',
      accentEnd: '#0F766E',
      darkInkOnAccent: true,
    },
    {
      id: 'live_golden_honeycomb',
      name: 'Live Amber Honey',
      tagline: 'Warm molten amber prism reflections',
      liveEffect: 'prism_crystal',
      bgBase: '#1B1004',
      bgDeep: '#0B0602',
      surfaceTint: 'rgba(27, 16, 4, 0.92)',
      accent: '#FBBF24',
      accentEnd: '#D97706',
      darkInkOnAccent: true,
    },
    {
      id: 'live_cherry_blossom_day',
      name: 'Live Blossom Silk',
      tagline: 'Soft frosted rose daylight with petals',
      liveEffect: 'sakura_petals',
      bgBase: '#FFF1F5',
      bgDeep: '#FFE4EC',
      surfaceTint: 'rgba(255, 241, 245, 0.92)',
      accent: '#E11D48',
      accentEnd: '#F43F5E',
      isLight: true,
    },
    {
      id: 'live_mint_aurora_light',
      name: 'Live Mint Glass',
      tagline: 'Crisp mint-ice daylight with aurora glow',
      liveEffect: 'aurora',
      bgBase: '#ECFEFF',
      bgDeep: '#E0F2FE',
      surfaceTint: 'rgba(236, 254, 255, 0.92)',
      accent: '#0D9488',
      accentEnd: '#0284C7',
      isLight: true,
    },
    {
      id: 'live_lavender_cloud',
      name: 'Live Lavender Dream',
      tagline: 'Airy pearl lilac sky & pastel plasma',
      liveEffect: 'velvet_plasma',
      bgBase: '#F5F3FF',
      bgDeep: '#EDE9FE',
      surfaceTint: 'rgba(245, 243, 255, 0.92)',
      accent: '#7C3AED',
      accentEnd: '#A855F7',
      isLight: true,
    },
    {
      id: 'live_volcanic_obsidian',
      name: 'Live Magma Core',
      tagline: 'Charred basalt with rising volcanic sparks',
      liveEffect: 'solar_embers',
      bgBase: '#190704',
      bgDeep: '#090201',
      surfaceTint: 'rgba(25, 7, 4, 0.92)',
      accent: '#F97316',
      accentEnd: '#B91C1C',
    },
    {
      id: 'live_cosmic_supernova',
      name: 'Live Supernova',
      tagline: 'Golden meteor shower in deep indigo cosmos',
      liveEffect: 'meteor_shower',
      bgBase: '#090721',
      bgDeep: '#040311',
      surfaceTint: 'rgba(9, 7, 33, 0.92)',
      accent: '#FACC15',
      accentEnd: '#4F46E5',
      darkInkOnAccent: true,
    },
    {
      id: 'live_midnight_ocean_glow',
      name: 'Live Moonlight Cove',
      tagline: 'Silver-blue luminescence over calm sea',
      liveEffect: 'bioluminescent',
      bgBase: '#041326',
      bgDeep: '#020813',
      surfaceTint: 'rgba(4, 19, 38, 0.92)',
      accent: '#60A5FA',
      accentEnd: '#1D4ED8',
    },
    {
      id: 'live_jade_dragon',
      name: 'Live Jade Dragon',
      tagline: 'Imperial emerald gold dust & crown aura',
      liveEffect: 'royal_stardust',
      bgBase: '#041712',
      bgDeep: '#020B08',
      surfaceTint: 'rgba(4, 23, 18, 0.92)',
      accent: '#10B981',
      accentEnd: '#F59E0B',
      hasCrown: true,
    },
    {
      id: 'live_rose_quartz',
      name: 'Live Rose Quartz',
      tagline: 'Dusky rosewood facets & champagne shimmer',
      liveEffect: 'prism_crystal',
      bgBase: '#1F0C15',
      bgDeep: '#0E0509',
      surfaceTint: 'rgba(31, 12, 21, 0.92)',
      accent: '#FDA4AF',
      accentEnd: '#E11D48',
      darkInkOnAccent: true,
    },
    {
      id: 'live_electric_cobalt',
      name: 'Live Electric Cobalt',
      tagline: 'Hyper-blue velocity data rain',
      liveEffect: 'matrix_rain',
      bgBase: '#040D29',
      bgDeep: '#020615',
      surfaceTint: 'rgba(4, 13, 41, 0.92)',
      accent: '#3B82F6',
      accentEnd: '#06B6D4',
    },
    {
      id: 'live_obsidian_diamond',
      name: 'Live Obsidian Diamond',
      tagline: 'Sleek graphite with shimmering frost diamonds',
      liveEffect: 'ice_crystals',
      bgBase: '#0C1017',
      bgDeep: '#05070B',
      surfaceTint: 'rgba(12, 16, 23, 0.92)',
      accent: '#E2E8F0',
      accentEnd: '#64748B',
      darkInkOnAccent: true,
      hasCrown: true,
    },
  ] satisfies LiveThemeSpec[]
).map(buildPaidLiveTheme);

CHAT_THEMES.push(...EXTRA_LIVE_THEMES);

export function buildCustomUploadedTheme(opts: {
  imageUrl: string;
  name?: string;
  isLight?: boolean;
  accent?: string;
}): ChatThemeConfig {
  const isLight = Boolean(opts.isLight);
  const accent = opts.accent || (isLight ? '#0284C7' : '#00E5D4');
  const base = isLight ? CHAT_THEMES[0] : CHAT_THEMES[1];
  return {
    ...base,
    id: 'custom_uploaded_theme',
    name: opts.name || 'Custom Device Theme',
    tagline: 'Uploaded from your device',
    suitableForHome: false,
    homeFallbackId: isLight ? 'classic_light' : 'dark_mode',
    panelStyle: {
      backgroundColor: isLight ? '#F8FAFC' : '#03090D',
      backgroundImage: `url("${opts.imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    feedSurfaceClass: isLight ? 'bg-white/65 backdrop-blur-xs' : 'bg-black/35 backdrop-blur-xs',
    logoAccentColor: accent,
    plusBtnStyle: { background: accent },
    plusBtnTextClass: isLight ? 'text-white' : 'text-[#03090D]',
    activeTabStyle: { background: accent },
    activeTabTextClass: isLight ? 'text-white shadow-sm' : 'text-[#03090D] shadow-sm',
    rowActiveBorderColor: accent,
    outgoingBubbleStyle: { background: accent },
    outgoingBubbleTextClass: isLight ? 'text-white' : 'text-[#03090D]',
    sendBtnStyle: { background: accent },
    sendBtnTextClass: isLight ? 'text-white' : 'text-[#03090D]',
    unreadBadgeStyle: { background: accent },
    unreadBadgeTextClass: isLight ? 'text-white' : 'text-[#03090D]',
    labelPillStyle: { background: accent },
    labelPillTextClass: isLight ? 'text-white' : 'text-[#03090D]',
    swatchGradient: `linear-gradient(135deg, ${accent} 0%, ${isLight ? '#E0F2FE' : '#03090D'} 100%)`,
  };
}

export const HOME_THEMES: ChatThemeConfig[] = CHAT_THEMES.filter((t) => t.suitableForHome);

export const CHAT_AREA_THEMES: ChatThemeConfig[] = CHAT_THEMES;

export const LIVE_THEMES: ChatThemeConfig[] = CHAT_THEMES.filter((t) => Boolean(t.isLive));

export function isLiveThemeUnlocked(
  theme: ChatThemeConfig,
  unlockedIds?: string[]
): boolean {
  if (!theme.priceUsd || theme.priceUsd <= 0) return true;
  return Boolean(unlockedIds && unlockedIds.includes(theme.id));
}

export function getChatTheme(themeId?: string, chatsSettings?: LinmaxSettings['chats']): ChatThemeConfig {
  if (themeId === 'custom_uploaded_theme' && chatsSettings?.customThemeUrl) {
    return buildCustomUploadedTheme({
      imageUrl: chatsSettings.customThemeUrl,
      name: chatsSettings.customThemeName,
      isLight: chatsSettings.customThemeIsLight,
      accent: chatsSettings.customThemeAccent,
    });
  }
  return CHAT_THEMES.find((t) => t.id === themeId) || CHAT_THEMES[1];
}

export function resolveChatAreaTheme(chatsSettings?: LinmaxSettings['chats']): ChatThemeConfig {
  const candidate = getChatTheme(chatsSettings?.chatThemeId, chatsSettings);
  if (!isLiveThemeUnlocked(candidate, chatsSettings?.unlockedLiveThemeIds)) {
    return CHAT_THEMES[1];
  }
  return candidate;
}

export function resolveHomeTheme(chatsSettings?: LinmaxSettings['chats']): ChatThemeConfig {
  const homeId = chatsSettings?.homeThemeId || 'dark_mode';
  const candidate = HOME_THEMES.find((t) => t.id === homeId) || HOME_THEMES.find((t) => t.id === 'dark_mode') || CHAT_THEMES[1];
  if (!isLiveThemeUnlocked(candidate, chatsSettings?.unlockedLiveThemeIds)) {
    return HOME_THEMES.find((t) => t.id === 'dark_mode') || CHAT_THEMES[1];
  }
  return candidate;
}
