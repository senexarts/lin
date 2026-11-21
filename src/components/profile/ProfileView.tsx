import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Database, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Copy, 
  Check, 
  Edit3, 
  X,
  Camera,
  Upload,
  Settings,
  CheckCircle2,
  Crown,
  Megaphone,
} from 'lucide-react';
import { CurrentUser } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import type { SettingsSectionId } from '../settings/SettingsView';

interface ProfileViewProps {
  currentUser: CurrentUser;
  onUpdateUser: (updated: Partial<CurrentUser>) => void;
  onOpenSettings?: (section?: SettingsSectionId) => void;
  onOpenAdvertise?: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenSettings,
  onOpenAdvertise,
  onLogout,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [inlineUsername, setInlineUsername] = useState(currentUser.name);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeSubModal, setActiveSubModal] = useState<
    'edit_profile' | 'privacy' | 'notifications' | 'appearance' | 'data' | 'help' | null
  >(null);

  // Edit profile state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  useEffect(() => {
    setEditName(currentUser.name);
    setEditBio(currentUser.bio);
    setEditAvatar(currentUser.avatar);
    setInlineUsername(currentUser.name);
  }, [currentUser]);

  // Settings states
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatusPublic, setOnlineStatusPublic] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [callAlerts, setCallAlerts] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  const handleCopyChatCode = () => {
    navigator.clipboard?.writeText(currentUser.chatCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveInlineUsername = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inlineUsername.trim();
    if (!trimmed) return;
    onUpdateUser({ name: trimmed });
    setIsEditingUsername(false);
    showToast(`Username updated to ${trimmed}`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    onUpdateUser({
      name: editName.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim() || currentUser.avatar,
    });
    setActiveSubModal(null);
    showToast('Profile updated!');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden relative">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4] text-xs font-semibold text-[#00E5D4] shadow-[0_0_20px_rgba(0,229,212,0.35)] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header matching showcase Panel 4 (Profile + Settings Gear) */}
      <div className="px-6 py-4 border-b border-[#00E5D4]/15 bg-[#07151B]/70 backdrop-blur-md flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Profile
          </h1>
          <p className="text-xs text-[#A8BBC2]">Your Linmax Identity & Privacy Controls</p>
        </div>
        <button
          type="button"
          onClick={() => (onOpenSettings ? onOpenSettings('chats') : setActiveSubModal('appearance'))}
          className="p-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-all cursor-pointer shrink-0"
          title="Open Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 pb-28 md:pb-10 flex flex-col gap-6 max-w-xl mx-auto w-full">
        {/* Main User Card — shrink-0 prevents vertical squashing/clipping on short screens */}
        <div className="shrink-0 p-6 sm:p-8 rounded-3xl bg-[#07151B] border border-[#00E5D4]/25 shadow-[0_0_30px_rgba(0,229,212,0.1)] flex flex-col items-center text-center relative">
          {/* Subtle cyan glow behind avatar */}
          <div className="absolute top-6 inset-x-10 h-28 bg-[#00E5D4]/10 blur-3xl pointer-events-none rounded-full" />

          {/* Avatar with cyan ring & local file upload */}
          <div className="relative mb-5">
            <label
              className="block w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#00E5D4] via-[#00CFEF] to-[#00AFC2] shadow-[0_0_20px_rgba(0,229,212,0.4)] cursor-pointer group relative"
              title="Click to upload profile photo from local files"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full bg-[#03090D]"
              />
              <div className="absolute inset-1 rounded-full bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-[#00E5D4]" />
                <span className="text-[10px] text-white font-semibold mt-0.5">Change</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await readImageFileAsDataUrl(file, 600, 0.85);
                    setEditAvatar(dataUrl);
                    onUpdateUser({ avatar: dataUrl });
                  } catch {
                    // ignore
                  }
                  e.target.value = '';
                }}
              />
            </label>
            {/* Online Indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#20E66B] border-2 border-[#07151B] shadow-sm pointer-events-none" />
          </div>

          {isEditingUsername ? (
            <form
              onSubmit={handleSaveInlineUsername}
              className="flex items-center gap-2 mb-2 w-full max-w-xs"
            >
              <input
                type="text"
                value={inlineUsername}
                onChange={(e) => setInlineUsername(e.target.value)}
                placeholder="Enter new username..."
                required
                autoFocus
                className="flex-1 bg-[#03090D] border border-[#00E5D4]/40 rounded-xl px-3 py-1.5 text-sm text-white text-center font-display font-semibold focus:outline-none focus:border-[#00E5D4]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingUsername(false);
                  setInlineUsername(currentUser.name);
                }}
                className="p-1.5 rounded-xl bg-[#0B1B22] text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-xl font-bold font-display text-white">
                {currentUser.name} 👑
              </h2>
              <button
                type="button"
                onClick={() => {
                  setInlineUsername(currentUser.name);
                  setIsEditingUsername(true);
                }}
                className="p-1.5 rounded-lg bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                title="Change Username"
                aria-label="Change Username"
              >
                <Edit3 size={13} />
              </button>
            </div>
          )}

          {/* Unique Linmax Chat Code & Custom +LMNAME Shortcut */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 mb-3">
            <button
              type="button"
              onClick={handleCopyChatCode}
              className="flex items-center gap-2 bg-[#0B1B22] hover:bg-[#102630] border border-[#00E5D4]/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-[#00E5D4] transition-all cursor-pointer group"
              title="Click to copy Chat Code"
            >
              <span>{currentUser.chatCode}</span>
              {copiedCode ? (
                <Check size={13} className="text-[#20E66B]" />
              ) : (
                <Copy size={13} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
            {onOpenSettings && (
              <button
                type="button"
                onClick={() => onOpenSettings('account')}
                className="flex items-center gap-1.5 bg-[#00E5D4]/12 hover:bg-[#00E5D4]/22 border border-[#00E5D4]/35 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#00E5D4] transition-colors cursor-pointer"
                title="Buy unique +LMNAME Chat Code for $5.00 USD"
              >
                <Crown size={12} />
                <span>Custom +LMNAME · $5</span>
              </button>
            )}
          </div>

          <p className="text-xs text-[#A8BBC2] max-w-sm px-2 leading-relaxed">
            {currentUser.bio}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setActiveSubModal('edit_profile')}
              className="px-4 py-2 rounded-full bg-[#0B1B22] border border-[#00E5D4]/30 text-xs text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={13} />
              Edit Profile & Username
            </button>
            <PWAInstallButton />
          </div>
        </div>

        {/* Settings Navigation Menu Items */}
        <div className="shrink-0 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 overflow-hidden flex flex-col divide-y divide-[#00E5D4]/10">
          {/* 1. My Profile */}
          <button
            onClick={() => setActiveSubModal('edit_profile')}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                <User size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Personal Profile</h4>
                <p className="text-[11px] text-[#A8BBC2]">Name, avatar, bio and Chat Code</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A8BBC2]" />
          </button>

          {/* 2. Privacy & Security */}
          <button
            onClick={() => (onOpenSettings ? onOpenSettings('privacy') : setActiveSubModal('privacy'))}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00CFEF]">
                <Shield size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Privacy & Security</h4>
                <p className="text-[11px] text-[#A8BBC2]">Read receipts, blocked contacts, E2EE</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A8BBC2]" />
          </button>

          {/* 3. Notifications */}
          <button
            onClick={() => (onOpenSettings ? onOpenSettings('notifications') : setActiveSubModal('notifications'))}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Notifications</h4>
                <p className="text-[11px] text-[#A8BBC2]">Message tones, call ringtones, alerts</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A8BBC2]" />
          </button>

          {/* 4. Chats & Wallpaper */}
          <button
            onClick={() => (onOpenSettings ? onOpenSettings('chats') : setActiveSubModal('appearance'))}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00CFEF]">
                <Moon size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Chats & Wallpaper</h4>
                <p className="text-[11px] text-[#A8BBC2]">Abstract pattern wallpapers, font size, Enter is send</p>
              </div>
            </div>
            <span className="text-xs text-[#00E5D4] font-medium pr-1">Customize</span>
          </button>

          {/* 5. Data & Storage */}
          <button
            onClick={() => (onOpenSettings ? onOpenSettings('storage') : setActiveSubModal('data'))}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#00E5D4]">
                <Database size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Storage and Data</h4>
                <p className="text-[11px] text-[#A8BBC2]">Storage usage, media auto-download</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A8BBC2]" />
          </button>

          {/* 5B. Advertise on Linmax (Sponsored Stories) */}
          {onOpenAdvertise && (
            <button
              onClick={onOpenAdvertise}
              className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#0B1B22] text-amber-400">
                  <Megaphone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Advertise on Linmax</h4>
                  <p className="text-[11px] text-[#A8BBC2]">Sponsored Stories · Campaigns, Uganda MoMo checkout &amp; analytics</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#A8BBC2]" />
            </button>
          )}

          {/* 6. Help & Support */}
          <button
            onClick={() => (onOpenSettings ? onOpenSettings('help') : setActiveSubModal('help'))}
            className="p-4 flex items-center justify-between hover:bg-[#0B1B22] transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0B1B22] text-[#A8BBC2]">
                <HelpCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Help & Support</h4>
                <p className="text-[11px] text-[#A8BBC2]">FAQ, security audits, about Linmax</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#A8BBC2]" />
          </button>

          {/* 7. Log Out */}
          <button
            onClick={onLogout}
            className="p-4 flex items-center justify-between hover:bg-[#F33248]/10 transition-colors text-left cursor-pointer text-[#F33248]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F33248]/10 text-[#F33248]">
                <LogOut size={18} />
              </div>
              <div>
                <h4 className="text-sm font-medium">Log Out</h4>
                <p className="text-[11px] opacity-80">Disconnect current session</p>
              </div>
            </div>
          </button>
        </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {activeSubModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base">Edit Linmax Profile</h3>
              <button onClick={() => setActiveSubModal(null)} className="text-[#A8BBC2] hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">About / Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00E5D4] resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-[#A8BBC2] font-medium">Profile Photo</label>
                  <label className="px-2.5 py-1 rounded-lg bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload size={12} />
                    <span>Upload from Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await readImageFileAsDataUrl(file, 600, 0.85);
                          setEditAvatar(dataUrl);
                        } catch {
                          // ignore
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={editAvatar || currentUser.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-[#00E5D4]/30 shrink-0"
                  />
                  <input
                    type="url"
                    value={editAvatar.startsWith('data:') ? '' : editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="flex-1 bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {activeSubModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base">Privacy & Security</h3>
              <button onClick={() => setActiveSubModal(null)} className="text-[#A8BBC2] hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-sm text-white">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]">
                <div>
                  <div className="font-medium">End-to-End Encryption</div>
                  <div className="text-xs text-[#A8BBC2]">Encrypt all 1-to-1 chats and calls</div>
                </div>
                <input
                  type="checkbox"
                  checked={encryptionEnabled}
                  onChange={(e) => setEncryptionEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]">
                <div>
                  <div className="font-medium">Read Receipts</div>
                  <div className="text-xs text-[#A8BBC2]">Show double checkmarks when messages read</div>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]">
                <div>
                  <div className="font-medium">Online Status Visibility</div>
                  <div className="text-xs text-[#A8BBC2]">Allow contacts to see when you are active</div>
                </div>
                <input
                  type="checkbox"
                  checked={onlineStatusPublic}
                  onChange={(e) => setOnlineStatusPublic(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              <button
                onClick={() => setActiveSubModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#00E5D4] text-[#03090D] font-bold text-xs mt-2"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {activeSubModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base">Notifications & Sounds</h3>
              <button onClick={() => setActiveSubModal(null)} className="text-[#A8BBC2] hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-sm text-white">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]">
                <div>
                  <div className="font-medium">Message Chime</div>
                  <div className="text-xs text-[#A8BBC2]">Play cyber chime on new messages</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]">
                <div>
                  <div className="font-medium">Calling Ringtone</div>
                  <div className="text-xs text-[#A8BBC2]">Audio bell on incoming voice/video calls</div>
                </div>
                <input
                  type="checkbox"
                  checked={callAlerts}
                  onChange={(e) => setCallAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              <button
                onClick={() => setActiveSubModal(null)}
                className="w-full py-2.5 rounded-xl bg-[#00E5D4] text-[#03090D] font-bold text-xs mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DATA & STORAGE MODAL */}
      {activeSubModal === 'data' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base">Data & Cache</h3>
              <button onClick={() => setActiveSubModal(null)} className="text-[#A8BBC2] hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-sm text-white">
              <div className="p-3 rounded-xl bg-[#0B1B22] flex justify-between items-center text-xs">
                <span>Cached media & offline chats:</span>
                <span className="font-mono text-[#00E5D4]">14.2 MB</span>
              </div>
              <button
                onClick={() => {
                  showToast('Linmax offline cache cleaned successfully.');
                  setActiveSubModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold cursor-pointer"
              >
                Clear Local Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELP MODAL */}
      {activeSubModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base">About Linmax</h3>
              <button onClick={() => setActiveSubModal(null)} className="text-[#A8BBC2] hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 text-xs text-[#A8BBC2]">
              <p className="text-white font-medium">Linmax v2.4 — Connect without limits.</p>
              <p>A private messaging, voice/video calling, and communication platform designed to connect people seamlessly without relying on telephone numbers as public identities.</p>
              <div className="pt-2 border-t border-[#00E5D4]/15 flex justify-between text-[11px] text-[#00E5D4]">
                <span>Official Web: linmaxchat.lovable.app</span>
                <span>Encrypted 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
