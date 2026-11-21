import React, { useId } from 'react';

interface LinmaxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  layout?: 'row' | 'column';
  className?: string;
  animated?: boolean;
  taglineVariant?: 'clean' | 'uppercase';
  tone?: 'dark-bg' | 'light-bg' | 'mono-white';
  accentColor?: string;
}

export const LinmaxLogo: React.FC<LinmaxLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  layout = 'row',
  className = '',
  animated = false,
  taglineVariant = 'clean',
  tone = 'dark-bg',
  accentColor,
}) => {
  const uid = useId().replace(/:/g, '');
  const gradMainId = `lmGradMain_${uid}`;
  const gradAccentId = `lmGradAccent_${uid}`;

  const sizeMap = {
    sm: { icon: 30, text: 'text-lg', tagline: 'text-[10px]' },
    md: { icon: 42, text: 'text-2xl', tagline: 'text-[11px]' },
    lg: { icon: 64, text: 'text-[34px]', tagline: 'text-xs' },
    xl: { icon: 96, text: 'text-[46px]', tagline: 'text-base' },
  };

  const currentSize = sizeMap[size];
  const isColumn = layout === 'column';

  const resolvedAccent =
    accentColor ||
    (tone === 'light-bg' ? '#007BFF' : tone === 'mono-white' ? '#E0F2FE' : '#00E5D4');

  const svgMainStart =
    tone === 'mono-white' ? '#FFFFFF' : tone === 'light-bg' ? '#0066FF' : '#00A8FF';
  const svgMainMid =
    tone === 'mono-white' ? '#E0F2FE' : resolvedAccent;
  const svgMainEnd =
    tone === 'mono-white' ? '#BAE6FD' : resolvedAccent;

  return (
    <div
      className={`inline-flex ${
        isColumn ? 'flex-col items-center text-center gap-2' : 'items-center gap-2.5'
      } ${className}`}
    >
      {/* Ultra-Crisp Vector LM Speech Monogram matching the official Linmax mark */}
      <div
        className={`relative shrink-0 flex items-center justify-center ${
          animated ? 'animate-pulse-subtle' : ''
        }`}
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          shapeRendering="geometricPrecision"
          className="w-full h-full"
          style={{
            filter:
              tone === 'light-bg'
                ? 'drop-shadow(0 2px 6px rgba(0, 123, 255, 0.22))'
                : 'drop-shadow(0 0 10px rgba(0, 229, 212, 0.38))',
          }}
          role="img"
          aria-label="Linmax Official Logo"
        >
          <defs>
            <linearGradient id={gradMainId} x1="15%" y1="10%" x2="85%" y2="85%">
              <stop offset="0%" stopColor={svgMainStart} />
              <stop offset="45%" stopColor={svgMainMid} />
              <stop offset="100%" stopColor={svgMainEnd} />
            </linearGradient>
            <linearGradient id={gradAccentId} x1="25%" y1="15%" x2="90%" y2="95%">
              <stop offset="0%" stopColor={svgMainMid} />
              <stop offset="55%" stopColor={svgMainEnd} />
              <stop offset="100%" stopColor={tone === 'light-bg' ? '#0EA5E9' : svgMainEnd} />
            </linearGradient>
          </defs>

          {/* Left "L" pillar */}
          <path
            d="M 24 16 V 58 H 58"
            fill="none"
            stroke={`url(#${gradMainId})`}
            strokeWidth="12.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interlocking "M" peak + descending right arm + chat tail */}
          <path
            d="M 41 25 L 56 41 L 73 24 V 66 C 73 75 66 80 56 80 H 43 L 35 89"
            fill="none"
            stroke={`url(#${gradAccentId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div
          className={`flex flex-col justify-center leading-none ${
            isColumn ? 'items-center' : ''
          }`}
        >
          <span
            className={`font-display font-extrabold tracking-tight ${currentSize.text} inline-flex items-baseline`}
          >
            <span className={tone === 'light-bg' ? 'text-slate-900' : 'text-white'}>
              Linm
            </span>
            <span style={{ color: tone === 'mono-white' ? '#FFFFFF' : resolvedAccent }}>
              ax
            </span>
          </span>
          {showTagline && (
            <span
              className={`font-sans mt-1.5 ${currentSize.tagline} ${
                taglineVariant === 'uppercase'
                  ? 'tracking-wider uppercase font-semibold'
                  : 'tracking-normal font-medium'
              }`}
              style={{
                color:
                  taglineVariant === 'uppercase'
                    ? resolvedAccent
                    : tone === 'light-bg'
                    ? '#475569'
                    : 'rgba(255,255,255,0.9)',
              }}
            >
              Connect without limits
            </span>
          )}
        </div>
      )}
    </div>
  );
};
