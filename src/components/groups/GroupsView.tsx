import React, { useState } from 'react';
import { Users, Plus, Search, Pin, MessageSquare, Crown, Vote, Calendar, Sparkles } from 'lucide-react';
import { Chat, CurrentUser, GroupElection } from '../../types';
import { CreateGroupModal } from './CreateGroupModal';

interface GroupsViewProps {
  groups: Chat[];
  currentUser: CurrentUser;
  availableContacts: Chat[];
  onSelectGroup: (group: Chat) => void;
  onCreateGroup: (newGroup: Chat, scheduledElection?: GroupElection) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  currentUser,
  availableContacts,
  onSelectGroup,
  onCreateGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'my_groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (g.president && g.president.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#00E5D4]/15 bg-[#07151B]/80 backdrop-blur-md flex flex-wrap items-center justify-between shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
            Linmax Groups
            <span className="text-xs font-mono text-[#00E5D4] bg-[#0B1B22] px-2 py-0.5 rounded border border-[#00E5D4]/20">
              {groups.length}
            </span>
          </h1>
          <p className="text-xs text-[#A8BBC2]">
            Collaborative spaces with democratic leadership, group elections & royal posts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,212,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create Group</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#00E5D4]/10 bg-[#07151B]/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            All Groups ({groups.length})
          </button>
          <button
            onClick={() => setActiveTab('my_groups')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'my_groups'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            My Groups
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by group or king name..."
            className="w-full bg-[#0B1B22] border border-[#00E5D4]/20 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder-[#A8BBC2] focus:outline-none focus:border-[#00E5D4]"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 pb-28 md:pb-10 flex flex-col gap-3 max-w-4xl mx-auto w-full">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <Users size={32} className="text-[#A8BBC2]/40" />
            <p className="text-sm text-[#A8BBC2]">No groups match your search.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-xs text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors"
            >
              Create New Group
            </button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className="shrink-0 p-4 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 hover:border-[#00E5D4]/40 hover:bg-[#0B1B22] transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#00E5D4]/30 shrink-0 bg-[#03090D]">
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {group.president && (
                    <div className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-amber-400">
                      <Crown size={12} className="fill-amber-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-white text-base truncate group-hover:text-[#00E5D4] transition-colors">
                      {group.name}
                    </h3>

                    {/* Group King / President Badge */}
                    {group.president && (
                      <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold flex items-center gap-1 shrink-0">
                        <Crown size={11} className="fill-amber-400" />
                        <span>King: {group.president}</span>
                      </span>
                    )}

                    {/* Election Badge */}
                    {group.election?.electionDate && (
                      <span className="text-[10px] text-[#00CFEF] bg-[#00CFEF]/10 px-2 py-0.5 rounded-full border border-[#00CFEF]/30 font-semibold flex items-center gap-1 shrink-0">
                        <Vote size={11} />
                        <span>Election: {group.election.electionDate}</span>
                      </span>
                    )}

                    {group.isPinned && (
                      <Pin size={12} className="text-[#00E5D4] fill-[#00E5D4]" />
                    )}
                  </div>

                  <p className="text-xs text-[#A8BBC2] truncate mt-1">
                    {group.description || group.lastMessage}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#A8BBC2] mt-2">
                    <span className="flex items-center gap-1 text-[#00CFEF]">
                      <Users size={12} />
                      {group.membersCount || (group.members ? group.members.length : 2)} members
                    </span>
                    <span>·</span>
                    <span>{group.lastMessageTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {group.unreadCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#00E5D4] text-[#03090D] text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(0,229,212,0.4)]">
                    {group.unreadCount}
                  </span>
                )}
                <button className="p-2.5 rounded-xl bg-[#0B1B22] text-[#A8BBC2] group-hover:text-[#00E5D4] group-hover:bg-[#102630] transition-colors cursor-pointer">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* WHATSAPP-STYLE 2-STEP CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        availableContacts={availableContacts}
        onCreateGroup={(newGroup, scheduledElection) => {
          onCreateGroup(newGroup, scheduledElection);
          onSelectGroup(newGroup);
        }}
      />
    </div>
  );
};
