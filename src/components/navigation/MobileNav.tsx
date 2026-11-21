import React from 'react';
import { MessageSquare, Sparkles, Radio, Phone, User } from 'lucide-react';
import { ActiveNavTab } from '../../types';

interface MobileNavProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  unreadCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  unreadCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#07151B]/95 backdrop-blur-xl border-t border-[#00E5D4]/20 flex items-center justify-around px-2 z-40 select-none pb-safe">
      {/* 1. Home / Chats */}
      <button
        type="button"
        onClick={() => onTabChange('chats')}
        className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer px-2 py-1 ${
          activeTab === 'chats' ? 'text-[#00E5D4]' : 'text-[#A8BBC2]'
        }`}
      >
        <MessageSquare size={20} strokeWidth={activeTab === 'chats' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Home</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#00E5D4] text-[#03090D] text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 2. Linmax Stories */}
      <button
        type="button"
        onClick={() => onTabChange('stories')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-2 py-1 ${
          activeTab === 'stories' ? 'text-[#00E5D4]' : 'text-[#A8BBC2]'
        }`}
      >
        <Sparkles size={20} strokeWidth={activeTab === 'stories' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Stories</span>
      </button>

      {/* 3. Center Channels Action (Replaced + button) */}
      <button
        type="button"
        onClick={() => onTabChange('channels')}
        className={`flex flex-col items-center gap-1 transition-all cursor-pointer px-3 py-1 rounded-2xl ${
          activeTab === 'channels'
            ? 'text-[#00E5D4] bg-[#00E5D4]/12'
            : 'text-[#A8BBC2] hover:text-[#00CFEF]'
        }`}
        aria-label="Channels"
      >
        <div
          className={`w-9 h-9 -mt-3 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'channels'
              ? 'bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-[0_0_18px_rgba(0,229,212,0.5)]'
              : 'bg-[#0B1B22] border border-[#00E5D4]/40 text-[#00E5D4] shadow-[0_0_12px_rgba(0,229,212,0.2)]'
          }`}
        >
          <Radio size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-semibold">Channels</span>
      </button>

      {/* 4. Calls */}
      <button
        type="button"
        onClick={() => onTabChange('calls')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-2 py-1 ${
          activeTab === 'calls' ? 'text-[#00E5D4]' : 'text-[#A8BBC2]'
        }`}
      >
        <Phone size={20} strokeWidth={activeTab === 'calls' ? 2.5 : 2} />
        <span className="text-[10px] font-medium">Calls</span>
      </button>

      {/* 5. Profile */}
      <button
        type="button"
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer px-2 py-1 ${
          activeTab === 'profile' || activeTab === 'settings'
            ? 'text-[#00E5D4]'
            : 'text-[#A8BBC2]'
        }`}
      >
        <User
          size={20}
          strokeWidth={activeTab === 'profile' || activeTab === 'settings' ? 2.5 : 2}
        />
        <span className="text-[10px] font-medium">Profile</span>
      </button>
    </nav>
  );
};
