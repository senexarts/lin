import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Check,
  Copy,
  MessageSquare,
  X,
  CheckCircle2,
  UserRoundSearch,
  Share2,
} from 'lucide-react';
import { CurrentUser, Chat } from '../../types';
import {
  LINMAX_KNOWN_DIRECTORY,
  lookupLinmaxAccount,
  LinmaxDirectoryAccount,
} from '../../data/directory';

interface AddContactModalProps {
  currentUser: CurrentUser;
  existingChats: Chat[];
  onClose: () => void;
  onAddContactAndOpenChat: (newContact: Chat) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  currentUser,
  existingChats,
  onClose,
  onAddContactAndOpenChat,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const normalizedQuery = queryInput.trim().toUpperCase();
  const isOwnCode = Boolean(
    normalizedQuery &&
      (normalizedQuery === currentUser.chatCode.toUpperCase() ||
        (currentUser.email &&
          queryInput.trim().toLowerCase() === currentUser.email.toLowerCase()))
  );

  // Real-time WhatsApp-style resolution of Linmax account + its own DP
  const resolvedAccount: LinmaxDirectoryAccount | null = useMemo(() => {
    if (!queryInput.trim() || isOwnCode) return null;
    return lookupLinmaxAccount(queryInput, existingChats);
  }, [queryInput, isOwnCode, existingChats]);

  const existingSavedChat = useMemo(() => {
    if (!resolvedAccount) return null;
    return (
      existingChats.find(
        (c) =>
          c.type === 'direct' &&
          c.chatCode?.toUpperCase() === resolvedAccount.chatCode.toUpperCase()
      ) || null
    );
  }, [resolvedAccount, existingChats]);

  const handleSelectDirectorySuggestion = (account: LinmaxDirectoryAccount) => {
    setErrorMsg(null);
    setInviteCopied(false);
    setQueryInput(account.chatCode);
    const saved = existingChats.find(
      (c) =>
        c.type === 'direct' &&
        c.chatCode?.toUpperCase() === account.chatCode.toUpperCase()
    );
    setCustomNameInput(saved ? saved.name : '');
  };

  const handleSaveAndOpenChat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isOwnCode) {
      setErrorMsg('This is your own Linmax Chat Code.');
      return;
    }

    if (!queryInput.trim()) {
      setErrorMsg('Enter a Linmax Chat Code or email to find an account.');
      return;
    }

    if (!resolvedAccount) {
      setErrorMsg(
        'No active Linmax account found for this code. They must join Linmax first so their profile & DP load automatically.'
      );
      return;
    }

    const finalName = customNameInput.trim() || resolvedAccount.name;
    const normalizedCode = resolvedAccount.chatCode.trim().toUpperCase();

    if (existingSavedChat) {
      onAddContactAndOpenChat({
        ...existingSavedChat,
        name: finalName,
        avatar: resolvedAccount.avatar,
      });
      onClose();
      return;
    }

    const newContactChat: Chat = {
      id: `chat_${normalizedCode.replace(/[^A-Z0-9]/gi, '').toLowerCase()}`,
      type: 'direct',
      name: finalName,
      chatCode: normalizedCode,
      avatar: resolvedAccount.avatar,
      lastMessage: 'Added via Linmax Contacts',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isOnline: resolvedAccount.isOnline,
      description: resolvedAccount.bio,
    };

    onAddContactAndOpenChat(newContactChat);
    onClose();
  };

  const copyMyCode = () => {
    navigator.clipboard?.writeText(currentUser.chatCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    const inviteText = `Join me on Linmax! Add my Chat Code ${currentUser.chatCode} to connect without limits: https://linmaxchat.lovable.app/`;
    navigator.clipboard?.writeText(inviteText);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };

  const directorySuggestions = LINMAX_KNOWN_DIRECTORY.filter(
    (acc) => acc.chatCode.toUpperCase() !== currentUser.chatCode.toUpperCase()
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <form
        onSubmit={handleSaveAndOpenChat}
        className="w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,229,212,0.18)] flex flex-col"
      >
        {/* Fixed Header */}
        <div className="px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E5D4]/15 border border-[#00E5D4]/25 flex items-center justify-center text-[#00E5D4] shrink-0">
              <UserPlus size={17} />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base leading-tight">
                Add Contact
              </h3>
              <p className="text-[11px] text-[#A8BBC2]">
                Fetches contact&apos;s verified Linmax account &amp; DP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-[#A8BBC2] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable Spacious Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Your Own Chat Code Strip */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-[#0B1B22]/90 border border-[#00E5D4]/20 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] text-[#A8BBC2] uppercase tracking-wider block">
                Your Linmax Chat Code
              </span>
              <span className="text-sm font-mono font-bold text-[#00E5D4]">
                {currentUser.chatCode}
              </span>
            </div>
            <button
              type="button"
              onClick={copyMyCode}
              className="px-3 py-1.5 rounded-xl bg-[#03090D] border border-[#00E5D4]/30 text-xs font-medium text-white hover:text-[#00E5D4] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedCode ? (
                <Check size={13} className="text-[#20E66B]" />
              ) : (
                <Copy size={13} />
              )}
              <span>{copiedCode ? 'Copied' : 'Share'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F33248]/10 border border-[#F33248]/35 text-xs text-[#FF7B89]">
              {errorMsg}
            </div>
          )}

          {/* Field 1: Linmax Chat Code or Email Lookup */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-contact-code"
              className="text-xs text-[#A8BBC2] font-medium"
            >
              Linmax Chat Code or Email
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8BBC2]"
              />
              <input
                id="add-contact-code"
                type="text"
                value={queryInput}
                onChange={(e) => {
                  setQueryInput(e.target.value);
                  setErrorMsg(null);
                  setInviteCopied(false);
                }}
                placeholder="e.g. +LM990142 or email"
                autoFocus
                className="w-full bg-[#03090D] border border-[#00E5D4]/30 rounded-xl pl-10 pr-9 py-2.5 text-sm font-mono text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4] transition-colors"
              />
              {queryInput && (
                <button
                  type="button"
                  onClick={() => {
                    setQueryInput('');
                    setErrorMsg(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8BBC2] hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Linmax Account Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[#A8BBC2]">On Linmax:</span>
              {directorySuggestions.map((acc) => (
                <button
                  key={acc.chatCode}
                  type="button"
                  onClick={() => handleSelectDirectorySuggestion(acc)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                    queryInput.trim().toUpperCase() === acc.chatCode
                      ? 'bg-[#00E5D4]/15 border-[#00E5D4] text-[#00E5D4]'
                      : 'bg-[#0B1B22] border-white/10 text-[#A8BBC2] hover:text-[#00E5D4] hover:border-[#00E5D4]/35'
                  }`}
                >
                  {acc.name.split(' ')[0]} · {acc.chatCode}
                </button>
              ))}
            </div>
          </div>

          {/* Account Status Card (WhatsApp-style automatic Linmax profile + own DP) */}
          {queryInput.trim() && (
            <div className="animate-in fade-in">
              {isOwnCode ? (
                <div className="p-3.5 rounded-2xl bg-[#03090D] border border-amber-400/30 text-xs text-amber-300">
                  That&apos;s your own Linmax Chat Code ({currentUser.chatCode}).
                </div>
              ) : resolvedAccount ? (
                <div className="p-3.5 rounded-2xl bg-[#03090D] border border-[#00E5D4]/40 flex items-center gap-3.5 shadow-[0_0_20px_rgba(0,229,212,0.08)]">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#00E5D4]/60 bg-[#07151B] shrink-0">
                    <img
                      src={resolvedAccount.avatar}
                      alt={resolvedAccount.name}
                      className="w-full h-full object-cover"
                    />
                    {resolvedAccount.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#20E66B] ring-2 ring-[#03090D]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white font-display truncate">
                        {resolvedAccount.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#20E66B]/15 text-[#20E66B] text-[10px] font-semibold shrink-0">
                        <CheckCircle2 size={10} />
                        On Linmax
                      </span>
                    </div>
                    <div className="text-[11px] text-[#00E5D4] font-mono">
                      {resolvedAccount.chatCode}
                    </div>
                    <p className="text-[11px] text-[#A8BBC2] truncate mt-0.5">
                      {resolvedAccount.bio}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#03090D] border border-white/15 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#0B1B22] border border-white/10 flex items-center justify-center text-[#A8BBC2] shrink-0">
                      <UserRoundSearch size={19} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white">
                        Not on Linmax yet
                      </div>
                      <p className="text-[11px] text-[#A8BBC2]">
                        Contacts bring their own profile &amp; DP once registered.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="px-3 py-1.5 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 text-[11px] font-semibold text-[#00E5D4] hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {inviteCopied ? <Check size={12} /> : <Share2 size={12} />}
                    <span>{inviteCopied ? 'Copied' : 'Invite'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Field 2: Save Contact Name As (Custom name like WhatsApp) */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-contact-custom-name"
              className="text-xs text-[#A8BBC2] font-medium"
            >
              Save Name As{' '}
              <span className="text-[11px] text-[#00E5D4]/90">
                (Optional — how you see them)
              </span>
            </label>
            <input
              id="add-contact-custom-name"
              type="text"
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              placeholder={
                resolvedAccount
                  ? `Default: ${resolvedAccount.name}`
                  : 'e.g. Mom, Sarah Work, Coach Kevin...'
              }
              className="w-full bg-[#03090D] border border-[#00E5D4]/25 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4] transition-colors"
            />
            {existingSavedChat && (
              <span className="text-[11px] text-[#00E5D4]">
                Already in your contacts as &ldquo;{existingSavedChat.name}&rdquo; — saving will update their display name.
              </span>
            )}
          </div>
        </div>

        {/* Sticky Non-Clipped Footer */}
        <div className="px-5 py-3.5 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-[#A8BBC2] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!resolvedAccount || isOwnCode}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(0,229,212,0.3)] hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            <MessageSquare size={15} />
            <span>
              {existingSavedChat ? 'Update Name & Open Chat' : 'Save Contact & Start Chat'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
