import React, { useState } from 'react';
import { 
  X, 
  Vote, 
  Crown, 
  Calendar, 
  Megaphone, 
  Users, 
  CheckCircle2, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { Chat, CurrentUser, GroupElection, GroupEvent } from '../../types';

interface CreateGroupPostModalProps {
  chat: Chat;
  currentUser: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
  onPostElection: (election: GroupElection) => void;
  onPostEvent: (event: GroupEvent) => void;
  onPostAnnouncement: (title: string, text: string) => void;
}

export const CreateGroupPostModal: React.FC<CreateGroupPostModalProps> = ({
  chat,
  currentUser,
  isOpen,
  onClose,
  onPostElection,
  onPostEvent,
  onPostAnnouncement,
}) => {
  const [tab, setTab] = useState<'election' | 'event' | 'announcement'>('election');

  // Election state
  const [electionRole, setElectionRole] = useState<'king' | 'president'>('king');
  const [electionTitle, setElectionTitle] = useState(`Official Election for Group ${chat.name} King 👑`);
  const [electionDate, setElectionDate] = useState('Friday at 7:00 PM');
  const [selectedCandidateNames, setSelectedCandidateNames] = useState<string[]>(
    chat.members ? chat.members.slice(0, 3) : [currentUser.name, 'David', 'Peace']
  );

  // Event state
  const [eventTitle, setEventTitle] = useState('Weekend Group Retreat & Barbecue');
  const [eventDate, setEventDate] = useState('Saturday at 2:00 PM');
  const [eventLocation, setEventLocation] = useState('Linmax Highlands Resort');

  // Announcement state
  const [announceTitle, setAnnounceTitle] = useState('Important Community Decree');
  const [announceText, setAnnounceText] = useState('');

  if (!isOpen) return null;

  const handleToggleCandidate = (name: string) => {
    setSelectedCandidateNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleCreateElection = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateNames.length === 0) return;

    const candidates = selectedCandidateNames.map((name, i) => ({
      id: `cand_${i}_${Date.now()}`,
      name,
      votes: i === 0 ? 1 : 0,
      voters: i === 0 ? [currentUser.name] : [],
    }));

    const election: GroupElection = {
      id: `elec_${Date.now()}`,
      title: electionTitle.trim() || `Election for Group ${electionRole === 'king' ? 'King 👑' : 'President 🏛️'}`,
      role: electionRole,
      electionDate: electionDate.trim() || 'Friday at 7:00 PM',
      description: `Members of ${chat.name}, vote for your leader! Voting is open to all verified members.`,
      status: 'voting',
      candidates,
    };

    onPostElection(election);
    onClose();
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const event: GroupEvent = {
      id: `event_${Date.now()}`,
      title: eventTitle.trim(),
      date: eventDate.trim() || 'Saturday at 2:00 PM',
      location: eventLocation.trim() || 'Online Video Room',
      description: 'Group meetup & celebration.',
      attendees: [currentUser.name],
    };

    onPostEvent(event);
    onClose();
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceText.trim()) return;

    onPostAnnouncement(announceTitle.trim(), announceText.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,229,212,0.2)] flex flex-col max-h-[88dvh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#00E5D4]" />
            <h3 className="font-display font-bold text-white text-base">
              Create Group Post
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#A8BBC2] hover:text-white rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1.5 bg-[#03090D] border-b border-[#00E5D4]/15 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setTab('election')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'election'
                ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Crown size={13} />
            <span>Election</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('event')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'event'
                ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>Event</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('announcement')}
            className={`flex-1 py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              tab === 'announcement'
                ? 'bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Megaphone size={13} />
            <span>Decree</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'election' && (
            <form onSubmit={handleCreateElection} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#A8BBC2] font-medium">Elect Role:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setElectionRole('king');
                      setElectionTitle(`Official Election for Group ${chat.name} King 👑`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      electionRole === 'king'
                        ? 'bg-[#00E5D4] text-[#03090D] shadow-sm'
                        : 'bg-[#0B1B22] text-[#A8BBC2]'
                    }`}
                  >
                    👑 Group King
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setElectionRole('president');
                      setElectionTitle(`Official Election for Group ${chat.name} President 🏛️`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      electionRole === 'president'
                        ? 'bg-[#00CFEF] text-[#03090D] shadow-sm'
                        : 'bg-[#0B1B22] text-[#A8BBC2]'
                    }`}
                  >
                    🏛️ Group President
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Election Title</label>
                <input
                  type="text"
                  value={electionTitle}
                  onChange={(e) => setElectionTitle(e.target.value)}
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Date & Time to Hold Election</label>
                <input
                  type="text"
                  value={electionDate}
                  onChange={(e) => setElectionDate(e.target.value)}
                  placeholder="e.g. Next Friday at 8:00 PM"
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-[#A8BBC2] font-medium">
                  Nominate Candidates from Group Members:
                </label>
                <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 p-2 rounded-xl bg-[#03090D] border border-[#00E5D4]/15">
                  {(chat.members || [currentUser.name, 'Peace', 'Kevin', 'David', 'Jane Doe']).map((memberName) => {
                    const isCandidate = selectedCandidateNames.includes(memberName);

                    return (
                      <div
                        key={memberName}
                        onClick={() => handleToggleCandidate(memberName)}
                        className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isCandidate ? 'bg-[#0B1B22] text-[#00E5D4] font-semibold' : 'text-[#A8BBC2] hover:bg-[#07151B]'
                        }`}
                      >
                        <span>{memberName} {memberName === currentUser.name && '(You)'}</span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isCandidate ? 'bg-[#00E5D4] text-[#03090D] font-bold' : 'border border-white/20'
                          }`}
                        >
                          {isCandidate && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedCandidateNames.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,212,0.4)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-40 mt-2"
              >
                <Vote size={15} />
                <span>Publish Election & Royal Voting Card</span>
              </button>
            </form>
          )}

          {tab === 'event' && (
            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Event / Meetup Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Group Meetup"
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Date & Time</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Saturday at 2:00 PM"
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Venue / Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Kampala City Hub or Linmax Video Call"
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,212,0.4)] hover:opacity-95 transition-all cursor-pointer mt-2"
              >
                <Calendar size={15} />
                <span>Post Event & Open RSVP</span>
              </button>
            </form>
          )}

          {tab === 'announcement' && (
            <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Announcement Headline</label>
                <input
                  type="text"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#A8BBC2] font-medium">Announcement Message</label>
                <textarea
                  value={announceText}
                  onChange={(e) => setAnnounceText(e.target.value)}
                  placeholder="Official statement or decree to all group members..."
                  rows={4}
                  required
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl p-3 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,212,0.4)] hover:opacity-95 transition-all cursor-pointer mt-2"
              >
                <Megaphone size={15} />
                <span>Broadcast Official Decree</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
