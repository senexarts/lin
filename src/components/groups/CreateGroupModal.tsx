import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Search, 
  Users, 
  Camera, 
  Crown, 
  Shield, 
  Sparkles, 
  Calendar,
  Vote,
  Upload
} from 'lucide-react';
import { Chat, CurrentUser, GroupElection } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';

interface CreateGroupModalProps {
  currentUser: CurrentUser;
  availableContacts: Chat[];
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (newGroup: Chat, scheduledElection?: GroupElection) => void;
}

const PRESET_GROUP_AVATARS = [
  { label: 'Linmax Squad', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80' },
  { label: 'Royal Crown', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80' },
  { label: 'Cyber Lounge', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=400&q=80' },
  { label: 'Tech Architects', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80' },
  { label: 'Creative Studio', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80' },
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  currentUser,
  availableContacts,
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Chat[]>([]);
  
  // Step 2 Fields
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(PRESET_GROUP_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupPresident, setGroupPresident] = useState<string>(currentUser.name);
  const [scheduleElectionNow, setScheduleElectionNow] = useState(false);
  const [electionDate, setElectionDate] = useState('Next Sunday at 4:00 PM');
  const [electionRole, setElectionRole] = useState<'king' | 'president'>('king');

  if (!isOpen) return null;

  // Filter contacts by name or chat code
  const filteredContacts = availableContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.chatCode && c.chatCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelectContact = (contact: Chat) => {
    setSelectedContacts((prev) => {
      const exists = prev.some((c) => c.id === contact.id);
      if (exists) {
        return prev.filter((c) => c.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const handleFinishCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const allMemberNames = [currentUser.name, ...selectedContacts.map((c) => c.name)];
    const finalAvatar = customAvatarUrl.trim() || groupAvatar;

    let election: GroupElection | undefined;
    if (scheduleElectionNow) {
      // Build candidate list from group members
      const candidateList = allMemberNames.slice(0, 4).map((name, i) => ({
        id: `cand_${i}`,
        name,
        votes: i === 0 ? 1 : 0,
        voters: i === 0 ? [currentUser.name] : [],
      }));

      election = {
        id: `elec_${Date.now()}`,
        title: `Official Group ${electionRole === 'king' ? 'King 👑' : 'President 🏛️'} Election`,
        role: electionRole,
        electionDate: electionDate.trim() || 'Sunday at 4:00 PM',
        description: `Cast your vote for who should rule as the Group ${electionRole === 'king' ? 'King' : 'President'}!`,
        status: 'voting',
        candidates: candidateList,
      };
    }

    const newGroup: Chat = {
      id: `group_${Date.now()}`,
      type: 'group',
      name: groupName.trim(),
      avatar: finalAvatar,
      lastMessage: scheduleElectionNow 
        ? `🗳️ Scheduled Election for Group ${electionRole === 'king' ? 'King' : 'President'}`
        : `${currentUser.name} created group "${groupName.trim()}"`,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      membersCount: allMemberNames.length,
      members: allMemberNames,
      president: groupPresident,
      admins: [currentUser.name],
      election,
      description: groupDesc.trim() || 'Linmax private group for collaboration and discussion.',
    };

    onCreateGroup(newGroup, election);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,229,212,0.2)] flex flex-col max-h-[88dvh]">
        
        {/* ================= STEP 1: ADD MEMBERS FROM CONTACTS ================= */}
        {step === 1 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-white text-base">
                  Add Group Members
                </h3>
                <span className="text-xs text-[#00E5D4] font-medium">
                  {selectedContacts.length} of {availableContacts.length} selected
                </span>
              </div>
              <button onClick={onClose} className="p-1.5 text-[#A8BBC2] hover:text-white rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Selected Members Chip Tray (like WhatsApp) */}
            {selectedContacts.length > 0 && (
              <div className="px-4 py-2.5 bg-[#03090D] border-b border-[#00E5D4]/10 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
                {selectedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-[#0B1B22] border border-[#00E5D4]/30 shrink-0 animate-in zoom-in-95"
                  >
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-xs text-white truncate max-w-[80px]">
                      {contact.name.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => toggleSelectContact(contact)}
                      className="p-0.5 rounded-full hover:bg-white/20 text-[#A8BBC2] hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Contacts Bar */}
            <div className="p-3 bg-[#07151B] border-b border-[#00E5D4]/10 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts by name or +LM code..."
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                />
              </div>
            </div>

            {/* Contact List with Checkboxes */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {filteredContacts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#A8BBC2]">
                  No contacts found. Use Add Contact (+LM...) first to expand your network.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContacts.some((c) => c.id === contact.id);

                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleSelectContact(contact)}
                      className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#0B1B22] border-[#00E5D4]/40 shadow-sm'
                          : 'bg-[#07151B] hover:bg-[#0B1B22]/60 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover bg-[#03090D]"
                          />
                          {contact.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#20E66B] ring-2 ring-[#07151B]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-white font-display">
                            {contact.name}
                          </h4>
                          <span className="text-[11px] text-[#00E5D4] font-mono">
                            {contact.chatCode || 'Linmax Contact'}
                          </span>
                        </div>
                      </div>

                      {/* Checkbox indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-[0_0_10px_rgba(0,229,212,0.4)]'
                            : 'border-2 border-[#A8BBC2]/40 text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Step 1 Footer */}
            <div className="p-4 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#A8BBC2]">
                {selectedContacts.length === 0 ? 'Select at least 1 member' : `${selectedContacts.length} members ready`}
              </span>
              <button
                type="button"
                disabled={selectedContacts.length === 0}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-2 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <span>Next: Group Profile</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: GROUP PROFILE, PRESIDENT & ELECTIONS ================= */}
        {step === 2 && (
          <form onSubmit={handleFinishCreate} className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="p-1.5 rounded-lg text-[#A8BBC2] hover:text-white hover:bg-white/5"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Group Profile & Leadership
                  </h3>
                  <span className="text-xs text-[#A8BBC2]">
                    Step 2 of 2 · {selectedContacts.length + 1} total members
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-[#A8BBC2] hover:text-white rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Group Avatar & Name Section */}
              <div className="flex items-center gap-4">
                {/* Avatar Preview & Click to Upload */}
                <label
                  className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00E5D4]/40 shadow-[0_0_15px_rgba(0,229,212,0.3)] shrink-0 bg-[#03090D] cursor-pointer group"
                  title="Upload Group Profile Photo from Device"
                >
                  <img
                    src={customAvatarUrl.trim() || groupAvatar}
                    alt="Group profile"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={16} className="text-[#00E5D4]" />
                    <span className="text-[9px] text-white font-semibold mt-0.5">Upload</span>
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
                        setCustomAvatarUrl(dataUrl);
                      } catch {
                        // ignore invalid file
                      }
                      e.target.value = '';
                    }}
                  />
                </label>

                {/* Name Input */}
                <div className="flex-1">
                  <label className="text-xs text-[#A8BBC2] font-medium block mb-1">
                    Group Subject / Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g. Royal Syndicate 2026"
                    maxLength={32}
                    required
                    autoFocus
                    className="w-full bg-[#03090D] border border-[#00E5D4]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                  />
                  <div className="text-right text-[10px] text-[#A8BBC2] mt-0.5">
                    {groupName.length}/32
                  </div>
                </div>
              </div>

              {/* Preset Avatar Palette + Upload Button */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A8BBC2] font-medium">
                    Choose Group Profile Picture
                  </span>
                  <label className="px-2.5 py-1 rounded-lg bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload size={12} />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await readImageFileAsDataUrl(file, 600, 0.85);
                          setCustomAvatarUrl(dataUrl);
                        } catch {
                          // ignore invalid file
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {PRESET_GROUP_AVATARS.map((av) => (
                    <button
                      key={av.label}
                      type="button"
                      onClick={() => {
                        setGroupAvatar(av.url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        groupAvatar === av.url && !customAvatarUrl
                          ? 'border-[#00E5D4] scale-105 shadow-[0_0_12px_rgba(0,229,212,0.5)]'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Group Description & Charter</label>
                <textarea
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Describe the mission, guidelines, or royal decrees of this group..."
                  rows={2}
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl p-3 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4] resize-none"
                />
              </div>

              {/* GROUP PRESIDENT / KING DESIGNATION */}
              <div className="p-4 rounded-2xl bg-[#03090D] border border-[#00E5D4]/25 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={18} className="text-[#00E5D4]" />
                    <span className="text-xs font-bold text-white font-display">
                      Group President / King Designation
                    </span>
                  </div>
                  <span className="text-[10px] text-[#00E5D4] bg-[#0B1B22] px-2 py-0.5 rounded-full border border-[#00E5D4]/20">
                    Leader Role
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#A8BBC2]">Current Leader / Inaugural President</label>
                  <select
                    value={groupPresident}
                    onChange={(e) => setGroupPresident(e.target.value)}
                    className="w-full bg-[#07151B] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    <option value={currentUser.name}>👑 {currentUser.name} (Creator & King)</option>
                    {selectedContacts.map((c) => (
                      <option key={c.id} value={c.name}>
                        👑 {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SCHEDULE ROYAL ELECTIONS CHECKBOX */}
                <div className="pt-2 border-t border-[#00E5D4]/10 flex flex-col gap-2.5">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Vote size={15} className="text-[#00CFEF]" />
                      <span className="text-xs font-semibold text-white">
                        Schedule Democratic King Elections
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={scheduleElectionNow}
                      onChange={(e) => setScheduleElectionNow(e.target.checked)}
                      className="w-4 h-4 accent-[#00E5D4]"
                    />
                  </label>

                  {scheduleElectionNow && (
                    <div className="p-3 rounded-xl bg-[#07151B] border border-[#00CFEF]/25 flex flex-col gap-2.5 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#A8BBC2]">Election For:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setElectionRole('king')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              electionRole === 'king'
                                ? 'bg-[#00E5D4] text-[#03090D]'
                                : 'bg-[#0B1B22] text-[#A8BBC2]'
                            }`}
                          >
                            👑 Group King
                          </button>
                          <button
                            type="button"
                            onClick={() => setElectionRole('president')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              electionRole === 'president'
                                ? 'bg-[#00CFEF] text-[#03090D]'
                                : 'bg-[#0B1B22] text-[#A8BBC2]'
                            }`}
                          >
                            🏛️ Group President
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-[#A8BBC2]">Date & Time to Hold Election</label>
                        <input
                          type="text"
                          value={electionDate}
                          onChange={(e) => setElectionDate(e.target.value)}
                          placeholder="e.g. Next Sunday at 4:00 PM"
                          className="w-full bg-[#03090D] border border-[#00CFEF]/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00CFEF]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 Footer */}
            <div className="p-4 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-[#A8BBC2] hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!groupName.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,212,0.4)] active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              >
                <Crown size={15} />
                <span>Create Group</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
