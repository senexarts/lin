import React, { useState } from 'react';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Link as LinkIcon, 
  Search, 
  Plus, 
  Sparkles,
  X
} from 'lucide-react';
import { CallLog, Chat } from '../../types';

interface CallsViewProps {
  callLogs: CallLog[];
  contacts: Chat[];
  onStartCall: (contact: { name: string; avatar: string; chatCode: string }, type: 'voice' | 'video') => void;
  onJoinMeeting: (code: string) => void;
}

export const CallsView: React.FC<CallsViewProps> = ({
  callLogs,
  contacts,
  onStartCall,
  onJoinMeeting,
}) => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = callLogs.filter(
    (log) =>
      log.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.contactChatCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onJoinMeeting(joinCode.trim());
    setShowJoinModal(false);
    setJoinCode('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] overflow-hidden">
      {/* Top Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#00E5D4]/15 bg-[#07151B]/70 backdrop-blur-md flex flex-wrap items-center justify-between shrink-0 gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-white flex items-center gap-2">
            Linmax Calls
            <span className="w-2 h-2 rounded-full bg-[#20E66B]" />
          </h1>
          <p className="text-xs text-[#A8BBC2]">Stay connected wherever you are.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8BBC2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search calls & contacts..."
            className="w-full bg-[#0B1B22] border border-[#00E5D4]/20 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder-[#A8BBC2] focus:outline-none focus:border-[#00E5D4]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 pb-28 md:pb-10 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Two Prominent Action Cards */}
        <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. START A CALL */}
          <button
            onClick={() => setShowStartModal(true)}
            className="p-5 rounded-2xl bg-[#0B1B22] border border-[#00E5D4]/25 hover:border-[#00E5D4]/60 transition-all text-left flex items-start gap-4 group hover:shadow-[0_0_25px_rgba(0,229,212,0.15)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] text-[#03090D] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <PhoneCall size={24} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-[#00E5D4] transition-colors">
                Create Call
              </h3>
              <p className="text-xs text-[#A8BBC2] mt-0.5">
                Start a voice or video call with any contact or group
              </p>
            </div>
          </button>

          {/* 2. JOIN A CALL */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="p-5 rounded-2xl bg-[#0B1B22] border border-[#00CFEF]/25 hover:border-[#00CFEF]/60 transition-all text-left flex items-start gap-4 group hover:shadow-[0_0_25px_rgba(0,207,239,0.15)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00CFEF] to-[#00AFC2] text-[#03090D] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <LinkIcon size={24} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base group-hover:text-[#00CFEF] transition-colors">
                Join Call
              </h3>
              <p className="text-xs text-[#A8BBC2] mt-0.5">
                Use a meeting link or 6-digit Linmax room code
              </p>
            </div>
          </button>
        </div>

        {/* Recent Calls Section */}
        <div className="shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00E5D4] font-display">
              Recent Calls
            </span>
            <span className="text-xs text-[#A8BBC2]">{filteredLogs.length} logged</span>
          </div>

          <div className="flex flex-col gap-2">
            {filteredLogs.map((log) => {
              const isMissed = log.type === 'missed';
              const isIncoming = log.type === 'incoming';

              return (
                <div
                  key={log.id}
                  className="shrink-0 p-3.5 rounded-2xl bg-[#07151B] border border-[#00E5D4]/15 hover:border-[#00E5D4]/35 hover:bg-[#0B1B22] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="relative w-12 h-12 rounded-full p-0.5 bg-[#162E38] shrink-0">
                      <img
                        src={log.contactAvatar}
                        alt={log.contactName}
                        className="w-full h-full object-cover rounded-full bg-[#03090D]"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isMissed
                            ? 'bg-[#F33248] text-white'
                            : isIncoming
                            ? 'bg-[#20E66B] text-[#03090D]'
                            : 'bg-[#00E5D4] text-[#03090D]'
                        }`}
                      >
                        {isMissed ? (
                          <PhoneMissed size={9} />
                        ) : isIncoming ? (
                          <PhoneIncoming size={9} />
                        ) : (
                          <PhoneOutgoing size={9} />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm text-white truncate">
                        {log.contactName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#A8BBC2] mt-0.5">
                        <span
                          className={`capitalize font-medium ${
                            isMissed ? 'text-[#F33248]' : 'text-[#A8BBC2]'
                          }`}
                        >
                          {log.type}
                        </span>
                        <span>·</span>
                        <span>{log.timestamp}</span>
                        {log.duration && log.duration !== 'Missed' && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[#00E5D4]">{log.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Call Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        onStartCall(
                          {
                            name: log.contactName,
                            avatar: log.contactAvatar,
                            chatCode: log.contactChatCode,
                          },
                          'voice'
                        )
                      }
                      className="p-2.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/25 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                      title="Quick Voice Call"
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      onClick={() =>
                        onStartCall(
                          {
                            name: log.contactName,
                            avatar: log.contactAvatar,
                            chatCode: log.contactChatCode,
                          },
                          'video'
                        )
                      }
                      className="p-2.5 rounded-xl bg-[#0B1B22] border border-[#00CFEF]/25 text-[#00CFEF] hover:bg-[#00CFEF] hover:text-[#03090D] transition-colors cursor-pointer"
                      title="Quick Video Call"
                    >
                      <Video size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* START CALL MODAL (Select contact) */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <PhoneCall size={18} className="text-[#00E5D4]" />
                Select Contact to Call
              </h3>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0B1B22]/70 hover:bg-[#0B1B22] border border-transparent hover:border-[#00E5D4]/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover bg-[#03090D]"
                    />
                    <div>
                      <h4 className="font-medium text-sm text-white">{c.name}</h4>
                      <span className="text-[11px] text-[#00E5D4] font-mono">
                        {c.chatCode || 'GROUP'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowStartModal(false);
                        onStartCall(
                          { name: c.name, avatar: c.avatar, chatCode: c.chatCode || '+LM-CALL' },
                          'voice'
                        );
                      }}
                      className="p-2 rounded-lg bg-[#00E5D4]/10 text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors"
                      title="Voice Call"
                    >
                      <Phone size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setShowStartModal(false);
                        onStartCall(
                          { name: c.name, avatar: c.avatar, chatCode: c.chatCode || '+LM-CALL' },
                          'video'
                        );
                      }}
                      className="p-2 rounded-lg bg-[#00CFEF]/10 text-[#00CFEF] hover:bg-[#00CFEF] hover:text-[#03090D] transition-colors"
                      title="Video Call"
                    >
                      <Video size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* JOIN CALL MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-sm max-h-[88dvh] bg-[#07151B] border border-[#00CFEF]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#00CFEF]/15 bg-[#0B1B22] shrink-0">
              <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                <LinkIcon size={18} className="text-[#00CFEF]" />
                Join Linmax Call
              </h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              <p className="text-xs text-[#A8BBC2]">
                Enter the meeting link or 6-digit call code (e.g. <span className="font-mono text-[#00E5D4]">LM-492-811</span>) to join the room.
              </p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="LM-xxx-xxx or https://..."
                required
                className="w-full bg-[#03090D] border border-[#00CFEF]/30 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00CFEF]"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00CFEF] to-[#00AFC2] text-[#03090D] text-xs font-bold"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
