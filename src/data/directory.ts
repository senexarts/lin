import { Chat } from '../types';

export interface LinmaxDirectoryAccount {
  chatCode: string;
  name: string;
  email?: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
}

export const LINMAX_KNOWN_DIRECTORY: LinmaxDirectoryAccount[] = [
  {
    chatCode: '+LM990142',
    name: 'Kevin',
    email: 'kevin@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Software engineer & trail runner.',
    isOnline: true,
  },
  {
    chatCode: '+LM773120',
    name: 'Jane Doe',
    email: 'jane.doe@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Product Designer & UI Engineer',
    isOnline: true,
  },
  {
    chatCode: '+LM442991',
    name: 'David Kato',
    email: 'david.kato@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Full-stack Systems Architect',
    isOnline: false,
  },
  {
    chatCode: '+LM884920',
    name: 'Peace',
    email: 'peace@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Nature photographer & traveler',
    isOnline: true,
  },
  {
    chatCode: '+LM556211',
    name: 'Alex Morgan',
    email: 'alex.morgan@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    bio: 'Crypto analyst & Linmax channel editor',
    isOnline: true,
  },
  {
    chatCode: '+LM310482',
    name: 'Sarah Chen',
    email: 'sarah.chen@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Digital artist & AI researcher ✨',
    isOnline: true,
  },
  {
    chatCode: '+LM602195',
    name: 'Daniel Okafor',
    email: 'daniel.okafor@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Mobile systems developer | Connecting without limits',
    isOnline: true,
  },
  {
    chatCode: '+LM248910',
    name: 'Maya Lin',
    email: 'maya.lin@linmax.network',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Music producer & sound designer 🎧',
    isOnline: false,
  },
];

interface StoredAuthAccount {
  id: string;
  name: string;
  chatCode: string;
  email: string;
  avatar: string;
  bio: string;
}

/**
 * Looks up a real Linmax account by Chat Code (+LM...) or Email
 * across device-registered accounts, active contacts, and the Linmax directory.
 * Always returns the account's own official profile DP.
 */
export function lookupLinmaxAccount(
  rawQuery: string,
  existingChats: Chat[]
): LinmaxDirectoryAccount | null {
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return null;

  const stripped = clean.replace(/^\+?lm-?/i, '');
  const candidates = Array.from(
    new Set([clean, `+lm${stripped}`, `+lm-${stripped}`])
  );

  // 1. Check real accounts registered on this device (linmax_accounts)
  try {
    const rawAccounts = localStorage.getItem('linmax_accounts');
    if (rawAccounts) {
      const parsed = JSON.parse(rawAccounts) as StoredAuthAccount[];
      if (Array.isArray(parsed)) {
        const foundAuth = parsed.find(
          (a) =>
            candidates.includes(a.chatCode?.toLowerCase() || '') ||
            a.email?.toLowerCase() === clean
        );
        if (foundAuth) {
          return {
            chatCode: foundAuth.chatCode,
            name: foundAuth.name,
            email: foundAuth.email,
            avatar: foundAuth.avatar,
            bio: foundAuth.bio || 'Available on Linmax',
            isOnline: true,
          };
        }
      }
    }
  } catch {
    // ignore storage parse error
  }

  // 2. Check Linmax global directory
  const foundDir = LINMAX_KNOWN_DIRECTORY.find(
    (u) =>
      candidates.includes(u.chatCode.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === clean)
  );
  if (foundDir) {
    return foundDir;
  }

  // 3. Check existing direct chats (preserving their existing DP)
  const foundChat = existingChats.find(
    (c) =>
      c.type === 'direct' &&
      c.chatCode &&
      candidates.includes(c.chatCode.toLowerCase())
  );
  if (foundChat) {
    return {
      chatCode: foundChat.chatCode || rawQuery.trim().toUpperCase(),
      name: foundChat.name,
      avatar: foundChat.avatar,
      bio: foundChat.description || 'Existing Linmax contact',
      isOnline: Boolean(foundChat.isOnline),
    };
  }

  return null;
}
