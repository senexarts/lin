import React from 'react';
import { LiveThemeEffectId } from '../../data/chatThemes';

interface LiveThemeBackdropProps {
  liveEffect?: LiveThemeEffectId;
  accentColor?: string;
  compact?: boolean;
}

const STAR_POINTS = [
  { top: '10%', left: '14%', delay: '0s', size: 2.5 },
  { top: '18%', left: '78%', delay: '0.7s', size: 2 },
  { top: '28%', left: '42%', delay: '1.3s', size: 2.5 },
  { top: '44%', left: '84%', delay: '0.4s', size: 2 },
  { top: '56%', left: '20%', delay: '1.9s', size: 2.5 },
  { top: '68%', left: '66%', delay: '1.1s', size: 2 },
  { top: '80%', left: '34%', delay: '0.3s', size: 2.5 },
  { top: '88%', left: '82%', delay: '1.6s', size: 2 },
];

const EMBER_POINTS = [
  { bottom: '6%', left: '12%', delay: '0s', dur: '4.6s', size: 5 },
  { bottom: '12%', left: '28%', delay: '1.2s', dur: '5.1s', size: 4 },
  { bottom: '4%', left: '46%', delay: '0.6s', dur: '4.3s', size: 6 },
  { bottom: '15%', left: '64%', delay: '2.1s', dur: '5.4s', size: 4 },
  { bottom: '8%', left: '80%', delay: '1.5s', dur: '4.8s', size: 5 },
  { bottom: '24%', left: '36%', delay: '2.6s', dur: '5.0s', size: 4 },
];

const GOLD_DUST_POINTS = [
  { top: '14%', left: '22%', delay: '0s', size: 4 },
  { top: '26%', left: '74%', delay: '0.8s', size: 5 },
  { top: '42%', left: '52%', delay: '1.5s', size: 3.5 },
  { top: '58%', left: '16%', delay: '0.5s', size: 4.5 },
  { top: '70%', left: '78%', delay: '1.9s', size: 4 },
  { top: '84%', left: '44%', delay: '1.1s', size: 5 },
];

const PETAL_POINTS = [
  { top: '-6%', left: '12%', delay: '0s', dur: '6.4s', size: 9 },
  { top: '-10%', left: '30%', delay: '1.4s', dur: '7.1s', size: 7 },
  { top: '-4%', left: '52%', delay: '0.7s', dur: '5.9s', size: 8 },
  { top: '-8%', left: '72%', delay: '2.3s', dur: '6.8s', size: 9 },
  { top: '-12%', left: '88%', delay: '1.1s', dur: '7.4s', size: 7 },
  { top: '18%', left: '22%', delay: '3.2s', dur: '6.5s', size: 8 },
  { top: '24%', left: '62%', delay: '2.7s', dur: '6.1s', size: 7 },
];

const FIREFLY_POINTS = [
  { top: '18%', left: '16%', delay: '0s', size: 6 },
  { top: '32%', left: '78%', delay: '0.9s', size: 7 },
  { top: '48%', left: '36%', delay: '1.8s', size: 5 },
  { top: '62%', left: '82%', delay: '0.5s', size: 6 },
  { top: '76%', left: '24%', delay: '2.2s', size: 7 },
  { top: '84%', left: '58%', delay: '1.3s', size: 5 },
];

const MATRIX_COLUMNS = [
  { left: '10%', delay: '0s', dur: '4.2s', height: '42%' },
  { left: '26%', delay: '1.3s', dur: '5.0s', height: '50%' },
  { left: '44%', delay: '0.6s', dur: '3.9s', height: '38%' },
  { left: '62%', delay: '2.0s', dur: '4.7s', height: '48%' },
  { left: '78%', delay: '0.9s', dur: '4.4s', height: '40%' },
  { left: '90%', delay: '1.7s', dur: '5.2s', height: '45%' },
];

const METEOR_STREAKS = [
  { top: '8%', left: '8%', delay: '0.2s', width: 68 },
  { top: '22%', left: '44%', delay: '1.9s', width: 54 },
  { top: '48%', left: '16%', delay: '3.2s', width: 62 },
  { top: '62%', left: '52%', delay: '0.9s', width: 50 },
];

export const LiveThemeBackdrop: React.FC<LiveThemeBackdropProps> = ({
  liveEffect,
  accentColor,
  compact = false,
}) => {
  if (!liveEffect) return null;

  const accent = accentColor || '#00E5D4';

  if (liveEffect === 'aurora') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/4 -left-1/4 w-[140%] h-[70%] rounded-full animate-live-aurora blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${accent}55 0%, rgba(0, 229, 212, 0.22) 45%, transparent 72%)`,
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[135%] h-[65%] rounded-full animate-live-aurora-alt blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.28) 0%, rgba(168, 85, 247, 0.16) 50%, transparent 74%)',
          }}
        />
        {!compact &&
          STAR_POINTS.slice(0, 6).map((s, idx) => (
            <span
              key={idx}
              className="absolute rounded-full animate-star-dot"
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: s.delay,
                backgroundColor: accent,
              }}
            />
          ))}
      </div>
    );
  }

  if (liveEffect === 'cyber_pulse') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 animate-grid-shimmer opacity-45"
          style={{
            backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
            backgroundSize: compact ? '14px 14px' : '28px 28px',
          }}
        />
        <div
          className="absolute -inset-x-1/2 top-1/4 h-24 animate-live-cyber-scan blur-xl"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accent}55 50%, transparent 100%)`,
          }}
        />
        <div
          className="absolute -inset-x-1/2 bottom-1/4 h-20 animate-live-cyber-scan blur-xl"
          style={{
            animationDelay: '2.5s',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.28) 50%, transparent 100%)',
          }}
        />
      </div>
    );
  }

  if (liveEffect === 'solar_embers') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -bottom-1/4 left-0 right-0 h-[65%] animate-corner-aurora blur-2xl"
          style={{
            background: `radial-gradient(ellipse at 50% 90%, ${accent}55 0%, rgba(239, 68, 68, 0.22) 50%, transparent 75%)`,
          }}
        />
        {(compact ? EMBER_POINTS.slice(0, 4) : EMBER_POINTS).map((em, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-live-ember"
            style={{
              bottom: em.bottom,
              left: em.left,
              width: `${compact ? Math.max(3, em.size - 1) : em.size}px`,
              height: `${compact ? Math.max(3, em.size - 1) : em.size}px`,
              animationDelay: em.delay,
              animationDuration: em.dur,
              background: `radial-gradient(circle, #FEF08A 0%, ${accent} 70%, transparent 100%)`,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'starlight_nebula') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/4 -right-1/4 w-[130%] h-[70%] rounded-full animate-live-aurora blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${accent}48 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%)`,
          }}
        />
        {(compact ? STAR_POINTS.slice(0, 5) : STAR_POINTS).map((s, idx) => (
          <span
            key={idx}
            className={`absolute rounded-full bg-purple-100 ${
              idx % 2 === 0 ? 'animate-star-flare' : 'animate-star-dot'
            }`}
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
              boxShadow: `0 0 8px ${accent}`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'royal_stardust') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/4 -left-1/4 w-[135%] h-[65%] rounded-full animate-live-aurora-alt blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${accent}38 0%, rgba(217, 119, 6, 0.14) 52%, transparent 75%)`,
          }}
        />
        {(compact ? GOLD_DUST_POINTS.slice(0, 4) : GOLD_DUST_POINTS).map((d, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-live-stardust"
            style={{
              top: d.top,
              left: d.left,
              width: `${compact ? Math.max(2.5, d.size - 1) : d.size}px`,
              height: `${compact ? Math.max(2.5, d.size - 1) : d.size}px`,
              animationDelay: d.delay,
              background: `radial-gradient(circle, #FEF9C3 0%, ${accent} 70%, transparent 100%)`,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'sakura_petals') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/4 -right-1/4 w-[130%] h-[65%] rounded-full animate-live-aurora blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${accent}36 0%, rgba(244, 114, 182, 0.14) 52%, transparent 76%)`,
          }}
        />
        {(compact ? PETAL_POINTS.slice(0, 4) : PETAL_POINTS).map((p, idx) => (
          <span
            key={idx}
            className="absolute animate-live-petal"
            style={{
              top: p.top,
              left: p.left,
              width: `${compact ? Math.max(5, p.size - 3) : p.size}px`,
              height: `${compact ? Math.max(4, p.size - 4) : Math.round(p.size * 0.72)}px`,
              animationDelay: p.delay,
              animationDuration: p.dur,
              borderRadius: '70% 10% 70% 10%',
              background: `linear-gradient(135deg, #FBCFE8 0%, ${accent} 100%)`,
              boxShadow: `0 0 8px ${accent}77`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'bioluminescent') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 animate-corner-aurora blur-2xl"
          style={{
            background: `radial-gradient(circle at 25% 25%, ${accent}2E 0%, transparent 48%), radial-gradient(circle at 75% 78%, ${accent}26 0%, transparent 52%)`,
          }}
        />
        {(compact ? FIREFLY_POINTS.slice(0, 4) : FIREFLY_POINTS).map((f, idx) => (
          <span
            key={idx}
            className="absolute rounded-full animate-live-firefly"
            style={{
              top: f.top,
              left: f.left,
              width: `${compact ? Math.max(3, f.size - 2) : f.size}px`,
              height: `${compact ? Math.max(3, f.size - 2) : f.size}px`,
              animationDelay: f.delay,
              background: accent,
              boxShadow: `0 0 ${compact ? '8px' : '14px'} ${accent}`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'matrix_rain') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {(compact ? MATRIX_COLUMNS.slice(0, 4) : MATRIX_COLUMNS).map((col, idx) => (
          <span
            key={idx}
            className="absolute top-0 w-[2px] rounded-full animate-live-matrix"
            style={{
              left: col.left,
              height: col.height,
              animationDelay: col.delay,
              animationDuration: col.dur,
              background: `linear-gradient(180deg, transparent 0%, ${accent}AA 65%, #FFFFFF 100%)`,
              boxShadow: `0 0 8px ${accent}88`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'meteor_shower') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {!compact &&
          STAR_POINTS.slice(0, 6).map((s, idx) => (
            <span
              key={`st-${idx}`}
              className="absolute rounded-full bg-white/80 animate-star-dot"
              style={{
                top: s.top,
                left: s.left,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDelay: s.delay,
              }}
            />
          ))}
        {(compact ? METEOR_STREAKS.slice(0, 2) : METEOR_STREAKS).map((m, idx) => (
          <span
            key={`mt-${idx}`}
            className="absolute h-[2px] rounded-full animate-live-meteor"
            style={{
              top: m.top,
              left: m.left,
              width: `${compact ? Math.round(m.width * 0.45) : m.width}px`,
              animationDelay: m.delay,
              background: `linear-gradient(90deg, transparent 0%, ${accent} 70%, #FFFFFF 100%)`,
              boxShadow: `0 0 8px ${accent}`,
            }}
          />
        ))}
      </div>
    );
  }

  if (liveEffect === 'prism_crystal') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/3 -left-1/3 w-[160%] h-[160%] animate-live-prism blur-xl"
          style={{
            background: `conic-gradient(from 45deg at 50% 50%, transparent 0deg, ${accent}33 45deg, transparent 110deg, ${accent}26 200deg, transparent 275deg, ${accent}30 330deg, transparent 360deg)`,
          }}
        />
        {!compact &&
          GOLD_DUST_POINTS.slice(0, 4).map((d, idx) => (
            <span
              key={idx}
              className="absolute rotate-45 animate-star-flare"
              style={{
                top: d.top,
                left: d.left,
                width: '4px',
                height: '4px',
                animationDelay: d.delay,
                backgroundColor: accent,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          ))}
      </div>
    );
  }

  if (liveEffect === 'ice_crystals') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-1/4 left-0 right-0 h-[65%] animate-live-aurora blur-2xl"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${accent}38 0%, transparent 72%)`,
          }}
        />
        {(compact ? STAR_POINTS.slice(0, 4) : STAR_POINTS).map((s, idx) => (
          <span
            key={idx}
            className="absolute rotate-45 border animate-live-stardust"
            style={{
              top: s.top,
              left: s.left,
              width: `${compact ? 4 : 6}px`,
              height: `${compact ? 4 : 6}px`,
              animationDelay: s.delay,
              borderColor: accent,
              backgroundColor: `${accent}55`,
              boxShadow: `0 0 8px ${accent}99`,
            }}
          />
        ))}
      </div>
    );
  }

  // velvet_plasma
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute -top-1/4 -left-1/4 w-[125%] h-[65%] rounded-full animate-live-plasma blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${accent}45 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-[120%] h-[60%] rounded-full animate-live-aurora-alt blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${accent}36 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};
