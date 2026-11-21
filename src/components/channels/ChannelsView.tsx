import React, { useState } from 'react';
import { Radio, Search, Plus, CheckCircle2, Users, X, ArrowLeft, Send, Camera, Image as ImageIcon, Inbox } from 'lucide-react';
import { Channel, CurrentUser } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';

interface ChannelsViewProps {
  channels: Channel[];
  currentUser: CurrentUser;
  onToggleFollow: (channelId: string) => void;
  onCreateChannel: (newChannel: Channel) => void;
  onAddChannelPost?: (channelId: string, text: string, imageUrl?: string) => void;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  currentUser,
  onToggleFollow,
  onCreateChannel,
  onAddChannelPost,
}) => {
  const [activeTab, setActiveTab] = useState<'popular' | 'following'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [channelAvatar, setChannelAvatar] = useState('https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80');
  const [channelCategory, setChannelCategory] = useState('Technology');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastImage, setBroadcastImage] = useState('');

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || null;

  const filteredChannels = channels.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'following') {
      return matchesQuery && c.isFollowing;
    }
    return matchesQuery;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    const newChannel: Channel = {
      id: `ch_${Date.now()}`,
      name: channelName.trim(),
      avatar: channelAvatar || 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
      verified: true,
      subscribers: '1 subscriber',
      isFollowing: true,
      category: channelCategory,
      description: channelDesc.trim() || 'Linmax Broadcast Channel.',
      posts: [
        {
          id: `cp_${Date.now()}`,
          text: `Welcome to the official ${channelName} channel on Linmax! Stay tuned for broadcasts.`,
          timestamp: 'Just now',
          views: '1',
          reactionsCount: 1,
        },
      ],
    };

    onCreateChannel(newChannel);
    setShowCreateModal(false);
    setChannelName('');
    setChannelDesc('');
    setSelectedChannelId(newChannel.id);
  };

  // Channel Broadcast Post Viewer
  if (selectedChannel) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden">
        {/* Channel Header */}
        <div className="px-6 py-4 border-b border-[#00E5D4]/15 bg-[#07151B]/80 backdrop-blur-md flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedChannelId(null)}
              className="p-1.5 rounded-lg bg-[#0B1B22] text-[#A8BBC2] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#00E5D4]/30 shrink-0">
              <img
                src={selectedChannel.avatar}
                alt={selectedChannel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold text-white text-base">
                  {selectedChannel.name}
                </h2>
                {selectedChannel.verified && (
                  <CheckCircle2 size={15} className="text-[#00CFEF] fill-[#00CFEF]/20" />
                )}
              </div>
              <span className="text-xs text-[#00E5D4]">
                Channel Inbox · {selectedChannel.subscribers} subscribers · {selectedChannel.posts.length} posts
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleFollow(selectedChannel.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedChannel.isFollowing
                ? 'bg-[#0B1B22] text-[#A8BBC2] border border-[#00E5D4]/20 hover:text-white'
                : 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D]'
            }`}
          >
            {selectedChannel.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Channel Description Banner */}
        <div className="px-6 py-3 bg-[#0B1B22]/50 border-b border-[#00E5D4]/10 text-xs text-[#A8BBC2] shrink-0">
          {selectedChannel.description}
        </div>

        {/* Channel Posts */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-2xl mx-auto w-full">
          {selectedChannel.posts.length === 0 ? (
            <div className="text-center py-12 text-[#A8BBC2] text-xs">
              No broadcast posts in this channel yet.
            </div>
          ) : (
            selectedChannel.posts.map((post) => (
              <div
                key={post.id}
                className="shrink-0 p-4 sm:p-5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/20 shadow-md flex flex-col gap-3"
              >
                <div className="flex items-center justify-between text-xs text-[#A8BBC2]">
                  <span className="font-medium text-[#00E5D4]">{selectedChannel.name}</span>
                  <span>{post.timestamp}</span>
                </div>
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>
                {post.image && (
                  <div className="rounded-xl overflow-hidden border border-[#00E5D4]/20 max-h-72">
                    <img src={post.image} alt="Broadcast media" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#00E5D4]/10 text-xs text-[#A8BBC2]">
                  <span>{post.views} views</span>
                  <div className="flex items-center gap-1.5 text-[#00E5D4]">
                    <span>🔥 {post.reactionsCount || 42}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        {/* Channel Broadcast Composer */}
        {onAddChannelPost && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!broadcastText.trim() && !broadcastImage) return;
              onAddChannelPost(selectedChannel.id, broadcastText.trim() || 'Photo Broadcast', broadcastImage || undefined);
              setBroadcastText('');
              setBroadcastImage('');
            }}
            className="p-4 pb-20 md:pb-4 border-t border-[#00E5D4]/15 bg-[#07151B]/90 backdrop-blur-md shrink-0"
          >
            <div className="max-w-2xl mx-auto flex flex-col gap-2">
              {broadcastImage && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-[#00E5D4]/30">
                  <img src={broadcastImage} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBroadcastImage('')}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <label
                  className="p-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                  title="Upload Broadcast Image"
                >
                  <ImageIcon size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await readImageFileAsDataUrl(file, 1080, 0.85);
                        setBroadcastImage(dataUrl);
                      } catch {
                        // ignore
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="text"
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder={`Broadcast an update to ${selectedChannel.name}...`}
                  className="flex-1 bg-[#0B1B22] border border-[#00E5D4]/20 rounded-full px-4 py-2 text-xs text-white placeholder-[#A8BBC2] focus:outline-none focus:border-[#00E5D4]"
                />
                <button
                  type="submit"
                  disabled={!broadcastText.trim() && !broadcastImage}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#00E5D4]/15 bg-[#07151B]/70 backdrop-blur-md flex flex-wrap items-center justify-between shrink-0 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
            Linmax Channels
            <Radio size={18} className="text-[#00CFEF] animate-pulse shrink-0" />
          </h1>
          <p className="text-xs text-[#A8BBC2]">Broadcast updates, technology alerts and communities.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,212,0.3)] hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Channel
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#00E5D4]/10 bg-[#07151B]/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'popular'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'following'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            Following
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-[#0B1B22] border border-[#00E5D4]/20 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder-[#A8BBC2] focus:outline-none focus:border-[#00E5D4]"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 pb-28 md:pb-10 flex flex-col gap-3 max-w-4xl mx-auto w-full">
        {filteredChannels.map((ch) => (
          <div
            key={ch.id}
            className="shrink-0 p-4 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 hover:border-[#00E5D4]/40 hover:bg-[#0B1B22] transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 shadow-sm"
          >
            <div
              onClick={() => setSelectedChannelId(ch.id)}
              className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer"
            >
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#00E5D4]/30 shrink-0">
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-full h-full object-cover bg-[#03090D]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-white text-base truncate hover:text-[#00E5D4] transition-colors">
                    {ch.name}
                  </h3>
                  {ch.verified && (
                    <CheckCircle2 size={15} className="text-[#00CFEF] fill-[#00CFEF]/20 shrink-0" />
                  )}
                  <span className="text-[10px] text-[#A8BBC2] bg-[#0B1B22] px-2 py-0.5 rounded border border-white/5">
                    {ch.category}
                  </span>
                </div>
                <p className="text-xs text-[#A8BBC2] truncate mt-0.5">
                  {ch.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[#00E5D4] mt-1">
                  <Users size={12} />
                  <span>{ch.subscribers} subscribers</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannelId(ch.id)}
                className="px-3.5 py-1.5 rounded-full bg-[#0B1B22] border border-[#00E5D4]/35 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Open ${ch.name} Inbox`}
              >
                <Inbox size={14} />
                <span>Open Inbox</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleFollow(ch.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  ch.isFollowing
                    ? 'bg-[#0B1B22] text-[#A8BBC2] border border-[#00E5D4]/25 hover:border-red-400 hover:text-red-400'
                    : 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-[0_0_12px_rgba(0,229,212,0.3)]'
                }`}
              >
                {ch.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* CREATE CHANNEL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <Radio size={18} className="text-[#00CFEF]" />
                Create Linmax Broadcast Channel
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#00E5D4]/40 bg-[#03090D] shrink-0 cursor-pointer group">
                  <img src={channelAvatar} alt="Channel avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={15} className="text-[#00E5D4]" />
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
                        setChannelAvatar(dataUrl);
                      } catch {
                        // ignore
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-[#A8BBC2] font-medium">Channel Name</label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="e.g. Daily Tech Radar"
                    required
                    className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-sm text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Category</label>
                <select
                  value={channelCategory}
                  onChange={(e) => setChannelCategory(e.target.value)}
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                >
                  <option value="Technology">Technology & AI</option>
                  <option value="Business">Business & Finance</option>
                  <option value="Community">Community & Living</option>
                  <option value="News">News & Announcements</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music & Culture</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Description</label>
                <textarea
                  value={channelDesc}
                  onChange={(e) => setChannelDesc(e.target.value)}
                  placeholder="What will you broadcast to subscribers?"
                  rows={2}
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl p-3 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold"
                >
                  Launch Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
