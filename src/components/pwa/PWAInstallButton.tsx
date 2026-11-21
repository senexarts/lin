import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold shadow-[0_0_14px_rgba(0,229,212,0.35)] hover:opacity-95 active:scale-95 transition-all cursor-pointer ${
          compact ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2 text-xs'
        } ${className}`}
        title="Install Linmax App"
      >
        <Download size={14} strokeWidth={2.5} />
        {!compact && <span>Install Linmax App</span>}
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center justify-center gap-2 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-[#00E5D4] font-semibold hover:bg-[#00E5D4] hover:text-[#03090D] transition-all cursor-pointer ${
            compact ? 'px-2.5 py-2 text-xs' : 'px-3.5 py-2 text-xs'
          } ${className}`}
          title="Install Linmax on iOS"
        >
          <Share size={14} />
          {!compact && <span>Install on iOS</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold font-display text-white">
                  Install Linmax on iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#A8BBC2] hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[#A8BBC2] leading-relaxed">
                1. Tap the <strong className="text-white">Share</strong> button
                in Safari's toolbar.
                <br />
                2. Scroll down and tap{' '}
                <strong className="text-[#00E5D4]">Add to Home Screen</strong>.
                <br />
                3. Launch Linmax from your Home Screen like a native app.
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] py-2.5 text-xs font-bold text-[#03090D] cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
