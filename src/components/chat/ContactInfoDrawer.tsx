import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  ShieldCheck,
  Users,
  Bell,
  BellOff,
  FileText,
  Copy,
  Check,
  Trash2,
  Crown,
  Camera,
  UserPlus,
  UserMinus,
  Shield,
  Palette,
  Vote,
  Search,
} from 'lucide-react';
import { Chat, CurrentUser } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';

interface ContactInfoDrawerProps {
  chat: Chat;
  currentUser: CurrentUser;
  availableContacts?: Chat[];
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (
    contact: { name: string; avatar: string; chatCode: string },
    type: 'voice' | 'video'
  ) => void;
  onClearChat?: () => void;
  onAddGroupMembers?: (chatId: string, memberNames: string[]) => void;
  onRemoveGroupMember?: (chatId: string, memberName: string) => void;
  onUpdateGroupAvatar?: (chatId: string, avatarUrl: string) => void;
  onToggleGroupAdmin?: (chatId: string, memberName: string) => void;
  onSetGroupKing?: (chatId: string, memberName: string) => void;
  onOpenGroupElectionModal?: () => void;
  onOpenWallpaperSettings?: () => void;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  chat,
  currentUser,
  availableContacts = [],
  isOpen,
  onClose,
  onStartCall,
  onClearChat,
  onAddGroupMembers,
  onRemoveGroupMember,
  onUpdateGroupAvatar,
  onToggleGroupAdmin,
  onSetGroupKing,
  onOpenGroupElectionModal,
  onOpenWallpaperSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'members'>('info');
  const [isMuted, setIsMuted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Add Member Drawer state
  const [showAddMemberBox, setShowAddMemberBox] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [customMemberName, setCustomMemberName] = useState('');

  if (!isOpen) return null;

  const isGroup = chat.type === 'group';
  const membersList =
    chat.members || ['Senate Agaba', 'Kevin', 'Peace', 'David', 'Jane Doe'];
  const adminsList = chat.admins || [chat.president || currentUser.name];

  const isGroupLeader =
    isGroup &&
    (chat.president === currentUser.name ||
      adminsList.includes(currentUser.name) ||
      membersList[0] === currentUser.name);

  // Direct contacts not yet in the group
  const candidateContacts = availableContacts.filter(
    (c) =>
      c.type === 'direct' &&
      !membersList.some((m) => m.toLowerCase() === c.name.toLowerCase()) &&
      (c.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (c.chatCode && c.chatCode.toLowerCase().includes(memberSearch.toLowerCase())))
  );

  const handleCopyCode = () => {
    if (chat.chatCode) {
      navigator.clipboard?.writeText(chat.chatCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGroupAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateGroupAvatar) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 600, 0.85);
      onUpdateGroupAvatar(chat.id, dataUrl);
    } catch {
      // ignore invalid file
    }
    e.target.value = '';
  };

  const handleToggleCandidate = (name: string) => {
    setSelectedToAdd((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleConfirmAddMembers = () => {
    if (!onAddGroupMembers) return;
    const toAdd = [...selectedToAdd];
    const trimmedCustom = customMemberName.trim();
    if (
      trimmedCustom &&
      !membersList.some((m) => m.toLowerCase() === trimmedCustom.toLowerCase()) &&
      !toAdd.some((m) => m.toLowerCase() === trimmedCustom.toLowerCase())
    ) {
      toAdd.push(trimmedCustom);
    }

    if (toAdd.length > 0) {
      onAddGroupMembers(chat.id, toAdd);
    }
    setSelectedToAdd([]);
    setCustomMemberName('');
    setMemberSearch('');
    setShowAddMemberBox(false);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-[#07151B] border-l border-[#00E5D4]/20 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-base">
            {isGroup ? 'Group Information' : 'Contact Details'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8BBC2] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Main Avatar & Name Lockup */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#03090D] border border-[#00E5D4]/20">
            <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#00E5D4] via-[#00CFEF] to-[#00AFC2] shadow-[0_0_20px_rgba(0,229,212,0.3)] mb-3 group">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-full h-full object-cover rounded-full bg-[#07151B]"
              />
              {chat.type === 'direct' && chat.isOnline && (
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#20E66B] ring-2 ring-[#07151B]" />
              )}
              {isGroup && isGroupLeader && onUpdateGroupAvatar && (
                <label
                  className="absolute inset-1 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload new group photo from local files"
                >
                  <Camera size={18} className="text-[#00E5D4]" />
                  <span className="text-[9px] text-white font-semibold mt-0.5">
                    Change
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGroupAvatarUpload}
                  />
                </label>
              )}
            </div>

            <h2 className="text-xl font-bold font-display text-white mb-0.5">
              {chat.name}
            </h2>

            {/* Linmax Chat Code Pill */}
            {chat.chatCode && (
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-[#0B1B22] hover:bg-[#102630] border border-[#00E5D4]/25 px-3 py-1 rounded-full text-xs font-mono text-[#00E5D4] transition-colors mt-1 cursor-pointer"
              >
                <span>{chat.chatCode}</span>
                {copiedCode ? (
                  <Check size={12} className="text-[#20E66B]" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            )}

            <p className="text-xs text-[#A8BBC2] mt-2 max-w-xs">
              {chat.description ||
                (isGroup
                  ? `${chat.membersCount || membersList.length} active participants`
                  : 'Available on Linmax messaging')}
            </p>

            {/* Group King & Elections Summary */}
            {isGroup && (
              <div className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#00E5D4]/10 to-transparent border border-amber-400/35 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                    <Crown size={16} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-amber-300 uppercase font-bold tracking-wider block">
                      Group King / President
                    </span>
                    <span className="text-xs font-bold text-white">
                      {chat.president || 'Senate Agaba'}
                    </span>
                  </div>
                </div>
                {chat.election?.electionDate && (
                  <div className="text-right pl-2">
                    <span className="text-[9px] text-[#A8BBC2] block">
                      Next Election
                    </span>
                    <span className="text-[10px] text-[#00E5D4] font-mono font-bold">
                      {chat.election.electionDate}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Call & Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() =>
                  onStartCall(
                    {
                      name: chat.name,
                      avatar: chat.avatar,
                      chatCode: chat.chatCode || '+LM-GROUP',
                    },
                    'voice'
                  )
                }
                className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 transition-all cursor-pointer shadow-md"
                title="Voice Call"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() =>
                  onStartCall(
                    {
                      name: chat.name,
                      avatar: chat.avatar,
                      chatCode: chat.chatCode || '+LM-GROUP',
                    },
                    'video'
                  )
                }
                className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#00CFEF] text-[#00CFEF] hover:text-[#03090D] border border-[#00CFEF]/30 transition-all cursor-pointer shadow-md"
                title="Video Call"
              >
                <Video size={18} />
              </button>
              {isGroup && onOpenGroupElectionModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenGroupElectionModal();
                  }}
                  className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-amber-400 text-amber-400 hover:text-[#03090D] border border-amber-400/30 transition-all cursor-pointer shadow-md"
                  title="Schedule King Election or Group Post"
                >
                  <Vote size={18} />
                </button>
              )}
              {onOpenWallpaperSettings && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWallpaperSettings();
                  }}
                  className="p-3 rounded-2xl bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 transition-all cursor-pointer shadow-md"
                  title="Chat Wallpaper & Theme"
                >
                  <Palette size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Segmented Detail Tabs */}
          <div className="flex p-1 bg-[#03090D] rounded-xl border border-[#00E5D4]/15">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/30'
                  : 'text-[#A8BBC2]'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/30'
                  : 'text-[#A8BBC2]'
              }`}
            >
              Shared Media
            </button>
            {isGroup && (
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'members'
                    ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/30'
                    : 'text-[#A8BBC2]'
                }`}
              >
                Members ({membersList.length})
              </button>
            )}
          </div>

          {/* Tab 1: Security & Encryption */}
          {activeTab === 'info' && (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-[#03090D] border border-[#00E5D4]/15 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#00E5D4]">
                  <ShieldCheck size={16} />
                  <span>Linmax End-to-End Encryption</span>
                </div>
                <p className="text-[11px] text-[#A8BBC2] leading-relaxed">
                  Messages and calls in this conversation are secured end-to-end with
                  forward secrecy. No third party or intermediary can intercept content.
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#A8BBC2] font-mono">
                  <span>KEY: 48B9-01FA-E42C</span>
                  <span className="text-[#20E66B]">VERIFIED</span>
                </div>
              </div>

              {/* Mute Notifications Toggle */}
              <label className="p-3.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/15 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  {isMuted ? (
                    <BellOff size={16} className="text-[#A8BBC2]" />
                  ) : (
                    <Bell size={16} className="text-[#00E5D4]" />
                  )}
                  <span className="text-xs text-white font-medium">
                    Mute Notifications
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => setIsMuted(e.target.checked)}
                  className="w-4 h-4 accent-[#00E5D4]"
                />
              </label>

              {onOpenWallpaperSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWallpaperSettings();
                  }}
                  className="p-3.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/15 hover:border-[#00E5D4]/40 flex items-center justify-between cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette size={16} className="text-[#00CFEF]" />
                    <span className="text-xs text-white font-medium">
                      Wallpaper & Pattern Theme
                    </span>
                  </div>
                  <span className="text-[11px] text-[#00E5D4] font-semibold">
                    Change
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Tab 2: Shared Media Gallery */}
          {activeTab === 'media' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#A8BBC2] font-medium">
                Photos & Documents
              </span>
              <div className="grid grid-cols-3 gap-2">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                  alt="Shared media"
                  className="aspect-square object-cover rounded-xl border border-[#00E5D4]/20 hover:scale-105 transition-transform"
                />
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80"
                  alt="Shared media"
                  className="aspect-square object-cover rounded-xl border border-[#00E5D4]/20 hover:scale-105 transition-transform"
                />
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80"
                  alt="Shared media"
                  className="aspect-square object-cover rounded-xl border border-[#00E5D4]/20 hover:scale-105 transition-transform"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#03090D] border border-[#00E5D4]/15 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-white">
                  <FileText size={16} className="text-[#00CFEF]" />
                  <span>Physics_notes.pdf</span>
                </div>
                <span className="text-[10px] text-[#A8BBC2]">2.4 MB</span>
              </div>
            </div>
          )}

          {/* Tab 3: Group Members (Leader Management: Add & Remove) */}
          {activeTab === 'members' && isGroup && (
            <div className="flex flex-col gap-3">
              {/* Group Leader Controls Header */}
              {isGroupLeader ? (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#00E5D4] font-semibold flex items-center gap-1">
                    <Shield size={12} />
                    Leader Controls Active
                  </span>
                  {onAddGroupMembers && (
                    <button
                      type="button"
                      onClick={() => setShowAddMemberBox(!showAddMemberBox)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,212,0.3)] hover:opacity-95 transition-all cursor-pointer"
                    >
                      <UserPlus size={13} />
                      <span>{showAddMemberBox ? 'Close' : 'Add Members'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#03090D] border border-white/10 text-[11px] text-[#A8BBC2]">
                  Only group leaders (King or Admins) can add or remove members.
                </div>
              )}

              {/* Add Members Panel */}
              {isGroupLeader && showAddMemberBox && (
                <div className="p-3.5 rounded-2xl bg-[#03090D] border border-[#00E5D4]/35 flex flex-col gap-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users size={14} className="text-[#00E5D4]" />
                      Add Contacts to {chat.name}
                    </span>
                    <span className="text-[10px] text-[#00E5D4] font-mono">
                      {selectedToAdd.length} selected
                    </span>
                  </div>

                  {/* Search existing contacts */}
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]"
                    />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search contacts..."
                      className="w-full bg-[#07151B] border border-[#00E5D4]/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>

                  {/* Available Contacts not yet in group */}
                  {candidateContacts.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5">
                      {candidateContacts.map((contact) => {
                        const checked = selectedToAdd.includes(contact.name);
                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => handleToggleCandidate(contact.name)}
                            className={`p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                              checked
                                ? 'bg-[#0B1B22] border-[#00E5D4]'
                                : 'bg-[#07151B] border-transparent hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={contact.avatar}
                                alt={contact.name}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-white truncate">
                                  {contact.name}
                                </div>
                                <div className="text-[10px] text-[#00E5D4] font-mono">
                                  {contact.chatCode}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                checked
                                  ? 'bg-[#00E5D4] text-[#03090D]'
                                  : 'border border-white/25 text-transparent'
                              }`}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#A8BBC2]">
                      All saved contacts are already members. Add a new person below:
                    </p>
                  )}

                  {/* Add by custom Name / +LM Code */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#A8BBC2]">
                      Or add someone by Name / +LM Code
                    </label>
                    <input
                      type="text"
                      value={customMemberName}
                      onChange={(e) => setCustomMemberName(e.target.value)}
                      placeholder="e.g. Alex Mercer or +LM559102"
                      className="w-full bg-[#07151B] border border-[#00E5D4]/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={
                      selectedToAdd.length === 0 && !customMemberName.trim()
                    }
                    onClick={handleConfirmAddMembers}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    Confirm & Add to Group
                  </button>
                </div>
              )}

              {/* Members Roster */}
              <div className="flex flex-col gap-2">
                {membersList.map((memberName, idx) => {
                  const isMeMember = memberName === currentUser.name;
                  const isKing =
                    memberName === (chat.president || 'Senate Agaba');
                  const isAdmin = adminsList.includes(memberName) || idx === 0;

                  return (
                    <div
                      key={`${memberName}_${idx}`}
                      className="p-2.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/10 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B22] border border-[#00E5D4]/20 flex items-center justify-center text-xs font-bold text-[#00E5D4] shrink-0">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            {memberName} {isMeMember && '(You)'}
                          </span>
                          <span className="text-[10px] text-[#A8BBC2]">
                            {isKing
                              ? 'Reigning King 👑'
                              : isAdmin
                              ? 'Group Leader'
                              : 'Linmax Member'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isKing && (
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown size={10} className="fill-amber-400" />
                            King
                          </span>
                        )}
                        {isAdmin && !isKing && (
                          <span className="text-[9px] font-bold text-[#00E5D4] bg-[#00E5D4]/10 border border-[#00E5D4]/30 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}

                        {/* Leader Member Controls (Cannot remove self directly here) */}
                        {isGroupLeader && !isMeMember && (
                          <div className="flex items-center gap-1 ml-1">
                            {onSetGroupKing && !isKing && (
                              <button
                                type="button"
                                onClick={() => onSetGroupKing(chat.id, memberName)}
                                className="p-1.5 rounded-lg bg-[#0B1B22] text-amber-400/70 hover:text-amber-400 hover:bg-amber-400/15 transition-colors cursor-pointer"
                                title={`Crown ${memberName} as Group King`}
                              >
                                <Crown size={12} />
                              </button>
                            )}
                            {onToggleGroupAdmin && !isKing && (
                              <button
                                type="button"
                                onClick={() =>
                                  onToggleGroupAdmin(chat.id, memberName)
                                }
                                className={`p-1.5 rounded-lg bg-[#0B1B22] transition-colors cursor-pointer ${
                                  isAdmin
                                    ? 'text-[#00E5D4] hover:bg-[#00E5D4]/15'
                                    : 'text-[#A8BBC2] hover:text-[#00E5D4]'
                                }`}
                                title={
                                  isAdmin
                                    ? `Remove Admin from ${memberName}`
                                    : `Make ${memberName} Admin`
                                }
                              >
                                <Shield size={12} />
                              </button>
                            )}
                            {onRemoveGroupMember && (
                              <button
                                type="button"
                                onClick={() =>
                                  onRemoveGroupMember(chat.id, memberName)
                                }
                                className="p-1.5 rounded-lg bg-[#0B1B22] text-red-400/80 hover:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                                title={`Remove ${memberName} from group`}
                              >
                                <UserMinus size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Danger Actions */}
        <div className="p-5 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex flex-col gap-2">
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Conversation History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
