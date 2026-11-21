import React from 'react';
import {
  MessageSquare,
  Sparkles,
  Radio,
  Users,
  Phone,
  User,
  Settings,
  Megaphone,
} from 'lucide-react';
import { ActiveNavTab, CurrentUser } from '../../types';
import { LinmaxLogo } from '../LinmaxLogo';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  currentUser: CurrentUser;
  unreadMessagesCount: number;
  unreadCallsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  unreadMessagesCount,
  unreadCallsCount,
}) => {
  const navItems = [
    {
      id: 'chats' as ActiveNavTab,
      label: 'Chats',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'stories' as ActiveNavTab,
      label: 'Stories',
      icon: Sparkles,
      badge: '24h',
    },
    {
      id: 'advertise' as ActiveNavTab,
      label: 'Advertise',
      icon: Megaphone,
    },
    {
      id: 'groups' as ActiveNavTab,
      label: 'Groups',
      icon: Users,
    },
    {
      id: 'channels' as ActiveNavTab,
      label: 'Channels',
      icon: Radio,
    },
    {
      id: 'calls' as ActiveNavTab,
      label: 'Calls',
      icon: Phone,
      badge: unreadCallsCount > 0 ? unreadCallsCount : undefined,
    },
    {
      id: 'profile' as ActiveNavTab,
      label: 'Profile',
      icon: User,
    },
    {
      id: 'settings' as ActiveNavTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-20 lg:w-64 h-full bg-[#03090D] border-r border-[#00E5D4]/15 flex flex-col justify-between shrink-0 select-none z-30 transition-all">
      {/* Top Branding Section */}
      <div className="p-3 lg:p-6 lg:pb-4 flex justify-center lg:justify-start">
        <div className="lg:hidden">
          <LinmaxLogo size="sm" showText={false} showTagline={false} />
        </div>
        <div className="hidden lg:block">
          <LinmaxLogo size="md" showText={true} showTagline={true} />
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="px-2.5 lg:px-3 flex-1 flex flex-col gap-1.5 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              title={item.label}
              className={`relative w-full flex items-center justify-center lg:justify-between px-2.5 lg:px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#00E5D4]/15 to-transparent text-white lg:border-l-3 border-[#00E5D4] shadow-[inset_0_0_15px_rgba(0,229,212,0.06)]'
                  : 'text-[#A8BBC2] hover:text-white hover:bg-[#07151B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#00E5D4] text-[#03090D] shadow-[0_0_10px_rgba(0,229,212,0.4)]'
                      : 'text-[#00E5D4] group-hover:bg-[#0B1B22]'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`hidden lg:inline ${isActive ? 'font-semibold text-white' : ''}`}>
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <>
                  <span
                    className={`hidden lg:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      typeof item.badge === 'number'
                        ? 'bg-[#00E5D4] text-[#03090D]'
                        : 'bg-[#0B1B22] text-[#00CFEF] border border-[#00CFEF]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {typeof item.badge === 'number' && (
                    <span className="lg:hidden absolute top-1.5 right-2 min-w-4 h-4 px-1 rounded-full bg-[#00E5D4] text-[#03090D] text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Install & User Presence Bar */}
      <div className="p-2.5 lg:p-4 border-t border-[#00E5D4]/15 bg-[#07151B]/50 flex flex-col gap-2">
        <div className="flex justify-center lg:block">
          <div className="lg:hidden">
            <PWAInstallButton compact={true} />
          </div>
          <div className="hidden lg:block">
            <PWAInstallButton className="w-full" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onTabChange('profile')}
          title={`${currentUser.name} (${currentUser.chatCode})`}
          className="w-full flex items-center justify-center lg:justify-start gap-3 p-1.5 lg:p-2 rounded-xl hover:bg-[#0B1B22] transition-colors cursor-pointer text-left"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00E5D4]/40 bg-[#03090D]">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#20E66B] ring-2 ring-[#03090D]" />
          </div>

          <div className="hidden lg:block min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate font-display">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-[#00E5D4] font-mono truncate">
              {currentUser.chatCode}
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
};
