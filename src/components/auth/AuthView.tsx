import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  ArrowRight,
  QrCode,
  User,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { LinmaxLogo } from '../LinmaxLogo';
import { CurrentUser } from '../../types';

interface AuthViewProps {
  onLoginSuccess: (user: CurrentUser) => void;
}

interface StoredAccount {
  id: string;
  name: string;
  chatCode: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  status: string;
  provider?: 'linmax' | 'google' | 'apple';
}

const ACCOUNTS_STORAGE_KEY = 'linmax_accounts';

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'user_me',
    name: 'Senate Agaba',
    chatCode: '+LM123456',
    email: 'senate.agaba@linmax.network',
    password: 'password123',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Connect without limits... 💙 | Linmax Pioneer',
    status: 'Available on Linmax',
    provider: 'linmax',
  },
];

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw) as StoredAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function toCurrentUser(acc: StoredAccount): CurrentUser {
  // Preserve latest profile edits if this user matches saved linmax_user
  try {
    const savedRaw = localStorage.getItem('linmax_user');
    if (savedRaw) {
      const saved = JSON.parse(savedRaw) as CurrentUser;
      if (
        saved.id === acc.id ||
        saved.chatCode?.toUpperCase() === acc.chatCode.toUpperCase()
      ) {
        return {
          ...saved,
          isOnline: true,
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    id: acc.id,
    name: acc.name,
    chatCode: acc.chatCode,
    avatar: acc.avatar,
    bio: acc.bio,
    email: acc.email,
    isOnline: true,
    status: acc.status,
  };
}

interface StarDot {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  cyan?: boolean;
}

const PINPRICK_STARS: StarDot[] = [
  { top: '6%', left: '18%', size: 2, delay: '0.1s', duration: '2.1s' },
  { top: '8%', left: '54%', size: 2.5, delay: '0.7s', duration: '2.7s', cyan: true },
  { top: '10%', left: '84%', size: 2, delay: '1.3s', duration: '1.9s' },
  { top: '13%', left: '72%', size: 2.5, delay: '0.4s', duration: '2.5s', cyan: true },
  { top: '17%', left: '28%', size: 2, delay: '1.6s', duration: '2.2s' },
  { top: '21%', left: '91%', size: 2, delay: '0.9s', duration: '2.8s' },
  { top: '24%', left: '11%', size: 2.5, delay: '0.2s', duration: '2.3s', cyan: true },
  { top: '27%', left: '80%', size: 2, delay: '1.9s', duration: '2.0s' },
  { top: '31%', left: '16%', size: 2, delay: '1.1s', duration: '2.6s' },
  { top: '35%', left: '89%', size: 2.5, delay: '0.5s', duration: '2.1s', cyan: true },
  { top: '41%', left: '6%', size: 2, delay: '1.5s', duration: '2.4s' },
  { top: '46%', left: '94%', size: 2, delay: '0.8s', duration: '2.9s' },
  { top: '53%', left: '8%', size: 2.5, delay: '0.3s', duration: '2.2s', cyan: true },
  { top: '58%', left: '92%', size: 2, delay: '1.4s', duration: '2.5s' },
  { top: '66%', left: '12%', size: 2, delay: '0.6s', duration: '2.0s' },
  { top: '71%', left: '86%', size: 2.5, delay: '1.2s', duration: '2.4s', cyan: true },
  { top: '76%', left: '24%', size: 2, delay: '0.4s', duration: '2.6s' },
  { top: '81%', left: '76%', size: 2, delay: '1.8s', duration: '2.1s' },
  { top: '85%', left: '17%', size: 2.5, delay: '0.9s', duration: '2.3s', cyan: true },
  { top: '88%', left: '42%', size: 2, delay: '1.5s', duration: '2.7s' },
  { top: '91%', left: '62%', size: 2, delay: '0.2s', duration: '1.9s' },
  { top: '94%', left: '25%', size: 2.5, delay: '1.1s', duration: '2.4s', cyan: true },
  { top: '93%', left: '88%', size: 2, delay: '0.5s', duration: '2.2s' },
  { top: '4%', left: '36%', size: 2, delay: '1.7s', duration: '2.6s' },
];

interface FlareStar {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
}

const HERO_FLARE_STARS: FlareStar[] = [
  { top: '5%', left: '68%', size: 15, delay: '0.2s', duration: '3.8s' },
  { top: '16%', left: '92%', size: 18, delay: '1.1s', duration: '4.4s' },
  { top: '19%', left: '20%', size: 13, delay: '0.6s', duration: '3.6s' },
  { top: '28%', left: '12%', size: 15, delay: '1.5s', duration: '4.2s' },
  { top: '34%', left: '88%', size: 16, delay: '0.4s', duration: '4.0s' },
  { top: '77%', left: '14%', size: 15, delay: '0.9s', duration: '3.9s' },
  { top: '78%', left: '84%', size: 17, delay: '1.7s', duration: '4.3s' },
  { top: '94%', left: '15%', size: 18, delay: '0.3s', duration: '4.1s' },
];

/**
 * Soft 4-point cosmic star SVG with gentle twinkle
 */
const BrightStarFlare: React.FC<FlareStar> = ({ top, left, size, delay, duration }) => {
  const gradId = `starRayGrad_${React.useId().replace(/:/g, '')}`;
  return (
    <div
      className="animate-star-flare absolute pointer-events-none"
      style={{
        top,
        left,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        animationDelay: delay,
        animationDuration: duration,
      }}
    >
      {/* Subtle soft radial star halo */}
      <div
        className="absolute inset-0 rounded-full blur-[2px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.42) 0%, rgba(0,229,212,0.2) 40%, rgba(0,229,212,0) 75%)',
        }}
      />
      <svg viewBox="0 0 40 40" className="relative w-full h-full overflow-visible">
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="38%" stopColor="#9EFFFF" stopOpacity="0.52" />
            <stop offset="75%" stopColor="#00E5D4" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00E5D4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          d="M20 0 Q21.1 18.9 40 20 Q21.1 21.1 20 40 Q18.9 21.1 0 20 Q18.9 18.9 20 0 Z"
          fill={`url(#${gradId})`}
        />
        <circle cx="20" cy="20" r="1.9" fill="#FFFFFF" fillOpacity="0.82" />
      </svg>
    </div>
  );
};

/**
 * Deep obsidian cosmic starfield with bright twinkling 4-point flare stars & subtle cyan corner light arcs
 */
const StarryAuroraBackdrop: React.FC<{ variant?: 'splash' | 'auth' }> = ({
  variant = 'splash',
}) => {
  const isSplash = variant === 'splash';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none bg-[#010609]">
      {/* Subtle deep-space ambient cyan/teal glows */}
      <div className="animate-corner-aurora absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#00E5D4]/18 blur-3xl" />
      <div
        className="animate-corner-aurora absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#00CFEF]/18 blur-3xl"
        style={{ animationDelay: '2.5s' }}
      />
      {isSplash && (
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#00E5D4]/12 blur-3xl" />
      )}

      {/* Corner luminous cyan aurora ribbons (top-left & bottom-right framing, open starfield center) */}
      <svg
        viewBox="0 0 400 840"
        preserveAspectRatio="none"
        className="animate-corner-aurora absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="cornerAuroraTL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#00CFEF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#010609" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cornerAuroraBR" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00F5FF" stopOpacity="0.62" />
            <stop offset="55%" stopColor="#00CFEF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#010609" stopOpacity="0" />
          </linearGradient>
          <filter id="auroraCornerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Top-left delicate aurora veil */}
        <path
          d="M -10 155 C 55 110, 125 65, 200 -10 L -10 -10 Z"
          fill="url(#cornerAuroraTL)"
          opacity="0.55"
        />
        <path
          d="M -10 155 C 55 110, 125 65, 205 -10"
          fill="none"
          stroke="#00F5FF"
          strokeOpacity="0.65"
          strokeWidth="1.8"
          filter="url(#auroraCornerGlow)"
        />
        <path
          d="M -10 215 C 35 130, 95 70, 155 -10"
          fill="none"
          stroke="#00E5D4"
          strokeOpacity="0.42"
          strokeWidth="1.3"
        />

        {/* Bottom-right delicate aurora veil */}
        <path
          d="M 410 660 C 330 715, 250 770, 180 850 L 410 850 Z"
          fill="url(#cornerAuroraBR)"
          opacity="0.6"
        />
        <path
          d="M 410 662 C 330 718, 250 772, 185 850"
          fill="none"
          stroke="#00F5FF"
          strokeOpacity="0.72"
          strokeWidth="1.9"
          filter="url(#auroraCornerGlow)"
        />
        <path
          d="M 410 715 C 355 760, 295 800, 245 850"
          fill="none"
          stroke="#00E5D4"
          strokeOpacity="0.48"
          strokeWidth="1.3"
        />
      </svg>

      {/* Sparkling cosmic pinprick stars (soft subtle shimmer) */}
      {PINPRICK_STARS.map((star, idx) => (
        <span
          key={idx}
          className="animate-star-dot absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: `${Math.max(1.5, star.size - 0.5)}px`,
            height: `${Math.max(1.5, star.size - 0.5)}px`,
            backgroundColor: star.cyan ? 'rgba(124, 249, 255, 0.72)' : 'rgba(255, 255, 255, 0.72)',
            boxShadow: star.cyan
              ? '0 0 3px rgba(0, 229, 212, 0.38)'
              : '0 0 3px rgba(255, 255, 255, 0.32)',
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}

      {/* Soft twinkling 4-point hero stars */}
      {HERO_FLARE_STARS.map((flare, idx) => (
        <BrightStarFlare key={idx} {...flare} />
      ))}
    </div>
  );
};

/**
 * WhatsApp-style "from Appix Platforms" brand attribution footer using the official white Appix emblem
 */
const AppixAttribution: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="flex flex-col items-center justify-center select-none pointer-events-none">
    <span
      className={`${
        compact ? 'text-[10px]' : 'text-[11px]'
      } font-medium text-[#9FB3BA] tracking-wide leading-none mb-1`}
    >
      from
    </span>
    <img
      src="/assets/aistudio/image_de613826.png"
      alt="Appix Platforms"
      className={`${
        compact ? 'h-8' : 'h-11'
      } w-auto object-contain mix-blend-screen brightness-110`}
    />
    <span
      className={`${
        compact ? 'text-[9px]' : 'text-[10px]'
      } font-display font-semibold tracking-[0.26em] uppercase text-[#00E5D4]/90 mt-0.5 leading-none`}
    >
      Platforms
    </span>
  </div>
);

const GoogleColorIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
    <path
      fill="#4285F4"
      d="M23.64 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.55c-.29 1.52-1.14 2.82-2.4 3.68l3.7 2.87c2.16-1.99 3.79-4.92 3.79-8.79z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.7-2.87c-1.08.72-2.45 1.16-4.23 1.16-3.44 0-6.37-2.32-7.42-5.44l-3.66 2.84C2.73 19.33 7.03 23 12 23z"
    />
  </svg>
);

const AppleWhiteIcon: React.FC = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isSplash, setIsSplash] = useState(true);
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [accounts, setAccounts] = useState<StoredAccount[]>(() => loadAccounts());

  // Login fields & feedback
  const [identifier, setIdentifier] = useState('+LM123456');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);

  // Signup fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot Password functional reset flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('+LM123456');
  const [recoveryStep, setRecoveryStep] = useState<'lookup' | 'verify' | 'done'>('lookup');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newResetPassword, setNewResetPassword] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  // Social Connect (Google / Apple) functional modal
  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'apple' | null>(null);
  const [socialName, setSocialName] = useState('');
  const [socialEmail, setSocialEmail] = useState('');

  // QR Login functional modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrToken, setQrToken] = useState(() => `LMQR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [qrSelectedAccountId, setQrSelectedAccountId] = useState<string>(accounts[0]?.id || 'user_me');

  // Auto-finish splash screen after 1.9s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 1900);
    return () => clearTimeout(timer);
  }, []);

  // Rotate QR token every 30s while open
  useEffect(() => {
    if (!showQrModal) return;
    const id = window.setInterval(() => {
      setQrToken(`LMQR-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 30000);
    return () => clearInterval(id);
  }, [showQrModal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || !password) {
      setAuthError('Please enter your Linmax Chat Code (or email) and password.');
      return;
    }

    const latestAccounts = loadAccounts();
    setAccounts(latestAccounts);

    const matched = latestAccounts.find(
      (acc) =>
        acc.chatCode.toLowerCase() === cleanId ||
        acc.email.toLowerCase() === cleanId
    );

    if (!matched) {
      setAuthError('Account not found. Check your Chat Code / email or create an account.');
      return;
    }

    if (matched.password !== password) {
      setAuthError('Incorrect password. Try again or click "Forgot Password?".');
      return;
    }

    onLoginSuccess(toCurrentUser(matched));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);

    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (cleanName.length < 2) {
      setAuthError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    const latestAccounts = loadAccounts();
    if (latestAccounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setAuthError('An account with this email already exists. Please login instead.');
      return;
    }

    // Generate unique non-colliding +LMxxxxxx Chat Code
    let randomCode = `+LM${Math.floor(100000 + Math.random() * 900000)}`;
    while (latestAccounts.some((a) => a.chatCode === randomCode)) {
      randomCode = `+LM${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const newAccount: StoredAccount = {
      id: `user_${Date.now()}`,
      name: cleanName,
      chatCode: randomCode,
      email: cleanEmail,
      password: signUpPassword,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: 'Connect without limits on Linmax.',
      status: 'Available on Linmax',
      provider: 'linmax',
    };

    const updatedAccounts = [newAccount, ...latestAccounts];
    saveAccounts(updatedAccounts);
    setAccounts(updatedAccounts);

    // Log directly into newly created account
    onLoginSuccess(toCurrentUser(newAccount));
  };

  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    const clean = recoveryIdentifier.trim().toLowerCase();
    const latest = loadAccounts();
    const found = latest.find(
      (a) => a.chatCode.toLowerCase() === clean || a.email.toLowerCase() === clean
    );
    if (!found) {
      setRecoveryError('No registered Linmax account matches that Chat Code or email.');
      return;
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setNewResetPassword('');
    setRecoveryStep('verify');
  };

  const handleForgotVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    if (enteredOtp.trim() !== generatedOtp) {
      setRecoveryError('Verification code does not match. Check the 6-digit code shown above.');
      return;
    }
    if (newResetPassword.length < 6) {
      setRecoveryError('New password must be at least 6 characters.');
      return;
    }
    const clean = recoveryIdentifier.trim().toLowerCase();
    const latest = loadAccounts();
    const updated = latest.map((a) =>
      a.chatCode.toLowerCase() === clean || a.email.toLowerCase() === clean
        ? { ...a, password: newResetPassword }
        : a
    );
    saveAccounts(updated);
    setAccounts(updated);
    setIdentifier(
      updated.find(
        (a) => a.chatCode.toLowerCase() === clean || a.email.toLowerCase() === clean
      )?.chatCode || recoveryIdentifier
    );
    setPassword(newResetPassword);
    setRecoveryStep('done');
  };

  const handleSocialContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialModalProvider) return;
    const cleanEmail = socialEmail.trim().toLowerCase();
    const cleanName = socialName.trim();
    if (!cleanName || !cleanEmail.includes('@')) return;

    const latest = loadAccounts();
    const existing = latest.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      onLoginSuccess(toCurrentUser(existing));
      return;
    }

    const randomCode = `+LM${Math.floor(100000 + Math.random() * 900000)}`;
    const newAcc: StoredAccount = {
      id: `user_${Date.now()}`,
      name: cleanName,
      chatCode: randomCode,
      email: cleanEmail,
      password: `oauth_${Date.now()}`,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: `Connected via ${socialModalProvider === 'google' ? 'Google' : 'Apple'}`,
      status: 'Available on Linmax',
      provider: socialModalProvider,
    };
    const updated = [newAcc, ...latest];
    saveAccounts(updated);
    setAccounts(updated);
    onLoginSuccess(toCurrentUser(newAcc));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#010608] flex items-center justify-center sm:p-4 overflow-y-auto select-none">
      {/* Ambient glow behind frame */}
      <div className="hidden sm:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[780px] bg-[#00E5D4]/15 blur-[90px] rounded-full pointer-events-none" />

      {isSplash ? (
        /* 1. SPLASH / LOADING SCREEN */
        <div
          onClick={() => setIsSplash(false)}
          className="relative w-full h-full sm:h-[780px] sm:max-h-[92vh] sm:max-w-[395px] bg-[#02080C] sm:rounded-[2.25rem] sm:border sm:border-[#00E5D4]/85 sm:shadow-[0_0_45px_rgba(0,229,212,0.32),inset_0_0_24px_rgba(0,229,212,0.08)] flex flex-col items-center justify-between pt-14 pb-9 px-6 text-center overflow-hidden cursor-pointer animate-in fade-in"
        >
          <StarryAuroraBackdrop variant="splash" />

          <div className="h-8 relative z-10" />

          {/* Centered Crisp Vector Logo + Linmax + Connect without limits */}
          <div className="relative z-10 flex flex-col items-center -mt-4">
            <LinmaxLogo
              size="xl"
              showText={true}
              showTagline={true}
              layout="column"
              animated={true}
              taglineVariant="clean"
            />
          </div>

          {/* Bottom Ring Spinner + "Loading your world..." + "from Appix Platforms" */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3.5">
              <div className="relative w-11 h-11 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full border-[4px] border-[#0E2630] border-t-[#00F0DF] border-r-[#00CFEF] border-l-[#00E5D4]/70 animate-spin shadow-[0_0_18px_rgba(0,229,212,0.45)]" />
              </div>
              <span className="text-sm font-medium text-[#E2EEF2] tracking-wide">
                Loading your world...
              </span>
            </div>

            <AppixAttribution />
          </div>
        </div>
      ) : (
        /* 2. FUNCTIONAL LOGIN / SIGN UP SCREEN */
        <div className="relative w-full min-h-full sm:min-h-0 sm:max-h-[94vh] sm:max-w-[395px] bg-[#02080C] sm:rounded-[2.25rem] sm:border sm:border-[#00E5D4]/85 sm:shadow-[0_0_45px_rgba(0,229,212,0.32),inset_0_0_24px_rgba(0,229,212,0.08)] px-6 pt-6 pb-4 flex flex-col justify-between overflow-y-auto overflow-x-hidden">
          <StarryAuroraBackdrop variant="auth" />

          <div className="relative z-10 flex flex-col">
            {/* Top Crisp Brand Logo & Wordmark */}
            <div className="flex flex-col items-center text-center mb-5">
              <LinmaxLogo
                size="lg"
                showText={true}
                showTagline={true}
                layout="column"
                taglineVariant="clean"
              />
            </div>

            {/* Underline Login | Sign Up Tabs with glowing center bead indicator */}
            <div className="grid grid-cols-2 border-b border-[#00E5D4]/20 mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`relative pb-3 text-[15px] font-semibold transition-colors cursor-pointer ${
                  tab === 'login'
                    ? 'text-[#00F0FF]'
                    : 'text-[#B6C7CE] hover:text-white'
                }`}
              >
                Login
                {tab === 'login' && (
                  <>
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-gradient-to-r from-[#00E5D4] via-[#00F5FF] to-[#00E5D4] shadow-[0_0_14px_rgba(0,245,255,0.95)]" />
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-[4.5px] w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_12px_#00F5FF,0_0_22px_#00E5D4]" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className={`relative pb-3 text-[15px] font-semibold transition-colors cursor-pointer ${
                  tab === 'signup'
                    ? 'text-[#00F0FF]'
                    : 'text-[#B6C7CE] hover:text-white'
                }`}
              >
                Sign Up
                {tab === 'signup' && (
                  <>
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-gradient-to-r from-[#00E5D4] via-[#00F5FF] to-[#00E5D4] shadow-[0_0_14px_rgba(0,245,255,0.95)]" />
                    <span className="absolute left-1/2 -translate-x-1/2 -bottom-[4.5px] w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_12px_#00F5FF,0_0_22px_#00E5D4]" />
                  </>
                )}
              </button>
            </div>

            {/* Inline Validation / Success Feedback */}
            {authError && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#F33248]/12 border border-[#F33248]/40 text-[#FF7B89] text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccessMsg && (
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#20E66B]/12 border border-[#20E66B]/40 text-[#20E66B] text-xs flex items-start gap-2">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{authSuccessMsg}</span>
              </div>
            )}

            {tab === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                {/* Input 1: Linmax Chat Code or Email */}
                <div className="rounded-2xl bg-[#041016]/75 backdrop-blur-md border border-[#00E5D4]/75 shadow-[0_0_14px_rgba(0,229,212,0.16),inset_0_0_10px_rgba(0,229,212,0.05)] focus-within:border-[#00F5FF] focus-within:shadow-[0_0_20px_rgba(0,245,255,0.34)] px-4 py-2.5 flex items-center gap-3.5 transition-all">
                  <User size={21} strokeWidth={1.75} className="text-white shrink-0" />
                  <div className="w-[1px] h-8 bg-white/28 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <label
                      htmlFor="login-chat-code"
                      className="text-[11px] font-medium text-[#A8BBC2] leading-tight"
                    >
                      Linmax Chat Code
                    </label>
                    <input
                      id="login-chat-code"
                      type="text"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="+LM123456 or email"
                      required
                      className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#A8BBC2]/40 focus:outline-none leading-snug mt-0.5"
                    />
                  </div>
                </div>

                {/* Input 2: Password */}
                <div className="rounded-2xl bg-[#041016]/75 backdrop-blur-md border border-[#00E5D4]/75 shadow-[0_0_14px_rgba(0,229,212,0.16),inset_0_0_10px_rgba(0,229,212,0.05)] focus-within:border-[#00F5FF] focus-within:shadow-[0_0_20px_rgba(0,245,255,0.34)] px-4 py-2.5 flex items-center gap-3.5 transition-all">
                  <Lock size={21} strokeWidth={1.75} className="text-white shrink-0" />
                  <div className="w-[1px] h-8 bg-white/28 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <label
                      htmlFor="login-password"
                      className="text-[11px] font-medium text-[#A8BBC2] leading-tight"
                    >
                      Password
                    </label>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="••••••••"
                      required
                      className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#A8BBC2]/40 focus:outline-none leading-snug mt-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-white/90 hover:text-[#00F5FF] transition-colors shrink-0 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {/* Full-width Pill CTA Button */}
                <button
                  type="submit"
                  className="relative w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#00E4FF] via-[#00F5FE] to-[#00E5D4] text-[#02080C] text-[16px] font-bold flex items-center justify-center shadow-[0_0_26px_rgba(0,240,255,0.46)] hover:shadow-[0_0_34px_rgba(0,245,255,0.68)] active:scale-[0.985] transition-all cursor-pointer mt-1.5"
                >
                  <span>Login</span>
                  <ArrowRight size={19} strokeWidth={2.4} className="absolute right-5" />
                </button>

                {/* Divider: or continue with */}
                <div className="flex items-center gap-3.5 mt-2 mb-0.5">
                  <div className="flex-1 h-px bg-white/25" />
                  <span className="text-xs font-medium text-[#E2EFF3]">or continue with</span>
                  <div className="flex-1 h-px bg-white/25" />
                </div>

                {/* 3 Circular Connect Options with glowing cyan rings: Google, Apple, QR Code */}
                <div className="flex items-center justify-center gap-4 my-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSocialName('');
                      setSocialEmail('');
                      setSocialModalProvider('google');
                    }}
                    className="w-12 h-12 rounded-full bg-[#041016]/85 border-[1.5px] border-[#00E5D4]/85 shadow-[0_0_15px_rgba(0,229,212,0.28)] hover:border-[#00F5FF] hover:shadow-[0_0_22px_rgba(0,245,255,0.55)] hover:scale-105 flex items-center justify-center transition-all cursor-pointer"
                    title="Continue with Google"
                  >
                    <GoogleColorIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSocialName('');
                      setSocialEmail('');
                      setSocialModalProvider('apple');
                    }}
                    className="w-12 h-12 rounded-full bg-[#041016]/85 border-[1.5px] border-[#00E5D4]/85 shadow-[0_0_15px_rgba(0,229,212,0.28)] hover:border-[#00F5FF] hover:shadow-[0_0_22px_rgba(0,245,255,0.55)] hover:scale-105 flex items-center justify-center transition-all cursor-pointer"
                    title="Continue with Apple"
                  >
                    <AppleWhiteIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrSelectedAccountId(accounts[0]?.id || 'user_me');
                      setShowQrModal(true);
                    }}
                    className="w-12 h-12 rounded-full bg-[#041016]/85 border-[1.5px] border-[#00E5D4]/85 shadow-[0_0_15px_rgba(0,229,212,0.28)] hover:border-[#00F5FF] hover:shadow-[0_0_22px_rgba(0,245,255,0.55)] hover:scale-105 flex items-center justify-center text-white transition-all cursor-pointer"
                    title="Linmax QR Login"
                  >
                    <QrCode size={20} strokeWidth={1.85} />
                  </button>
                </div>

                {/* Forgot Password? */}
                <div className="flex justify-center mt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryIdentifier(identifier || '+LM123456');
                      setRecoveryStep('lookup');
                      setRecoveryError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-[#00F0FF] hover:text-[#7CF9FF] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                {/* Full Name */}
                <div className="rounded-2xl bg-[#041016]/75 backdrop-blur-md border border-[#00E5D4]/75 shadow-[0_0_14px_rgba(0,229,212,0.16),inset_0_0_10px_rgba(0,229,212,0.05)] focus-within:border-[#00F5FF] focus-within:shadow-[0_0_20px_rgba(0,245,255,0.34)] px-4 py-2.5 flex items-center gap-3.5 transition-all">
                  <User size={20} strokeWidth={1.75} className="text-white shrink-0" />
                  <div className="w-[1px] h-8 bg-white/28 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <label
                      htmlFor="signup-name"
                      className="text-[11px] font-medium text-[#A8BBC2] leading-tight"
                    >
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={signUpName}
                      onChange={(e) => {
                        setSignUpName(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="e.g. Maya Lin"
                      required
                      className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#A8BBC2]/40 focus:outline-none leading-snug mt-0.5"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="rounded-2xl bg-[#041016]/75 backdrop-blur-md border border-[#00E5D4]/75 shadow-[0_0_14px_rgba(0,229,212,0.16),inset_0_0_10px_rgba(0,229,212,0.05)] focus-within:border-[#00F5FF] focus-within:shadow-[0_0_20px_rgba(0,245,255,0.34)] px-4 py-2.5 flex items-center gap-3.5 transition-all">
                  <Mail size={20} strokeWidth={1.75} className="text-white shrink-0" />
                  <div className="w-[1px] h-8 bg-white/28 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <label
                      htmlFor="signup-email"
                      className="text-[11px] font-medium text-[#A8BBC2] leading-tight"
                    >
                      Email Address
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="maya@linmax.chat"
                      required
                      className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#A8BBC2]/40 focus:outline-none leading-snug mt-0.5"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="rounded-2xl bg-[#041016]/75 backdrop-blur-md border border-[#00E5D4]/75 shadow-[0_0_14px_rgba(0,229,212,0.16),inset_0_0_10px_rgba(0,229,212,0.05)] focus-within:border-[#00F5FF] focus-within:shadow-[0_0_20px_rgba(0,245,255,0.34)] px-4 py-2.5 flex items-center gap-3.5 transition-all">
                  <Lock size={20} strokeWidth={1.75} className="text-white shrink-0" />
                  <div className="w-[1px] h-8 bg-white/28 shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <label
                      htmlFor="signup-password"
                      className="text-[11px] font-medium text-[#A8BBC2] leading-tight"
                    >
                      Create Password (min 6 chars)
                    </label>
                    <input
                      id="signup-password"
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => {
                        setSignUpPassword(e.target.value);
                        setAuthError(null);
                      }}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-transparent text-[15px] font-semibold text-white placeholder-[#A8BBC2]/40 focus:outline-none leading-snug mt-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="text-white/90 hover:text-[#00F5FF] transition-colors shrink-0 cursor-pointer p-1"
                  >
                    {showSignUpPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                <p className="text-[11px] text-[#00E5D4]/90 text-center px-2">
                  A unique <span className="font-mono font-semibold">+LMxxxxxx</span> Chat Code will be issued & saved for you.
                </p>

                <button
                  type="submit"
                  className="relative w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#00E4FF] via-[#00F5FE] to-[#00E5D4] text-[#02080C] text-[16px] font-bold flex items-center justify-center shadow-[0_0_26px_rgba(0,240,255,0.46)] hover:shadow-[0_0_34px_rgba(0,245,255,0.68)] active:scale-[0.985] transition-all cursor-pointer mt-1"
                >
                  <span>Create Account</span>
                  <ArrowRight size={19} strokeWidth={2.4} className="absolute right-5" />
                </button>
              </form>
            )}
          </div>

          {/* Bottom Divider, Account Switcher & Appix Platforms Attribution */}
          <div className="relative z-10 mt-3.5 pt-3 border-t border-[#00E5D4]/30 text-center shrink-0 flex flex-col items-center gap-2.5">
            {tab === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className="text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                New to Linmax?{' '}
                <span className="text-[#00E5D4] font-semibold hover:underline">
                  Create Account
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setAuthError(null);
                  setAuthSuccessMsg(null);
                }}
                className="text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                Already have an account?{' '}
                <span className="text-[#00E5D4] font-semibold hover:underline">
                  Login
                </span>
              </button>
            )}

            <AppixAttribution compact={true} />
          </div>

          {/* FUNCTIONAL FORGOT PASSWORD / OTP RESET MODAL */}
          {showForgotModal && (
            <div className="absolute inset-0 z-30 bg-[#02080C]/94 backdrop-blur-md p-6 flex flex-col justify-center">
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/45 p-5 shadow-[0_0_30px_rgba(0,229,212,0.22)] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-[#00E5D4]" />
                    <h3 className="text-sm font-bold text-white">Reset Password</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {recoveryError && (
                  <div className="px-3 py-2 rounded-xl bg-[#F33248]/12 border border-[#F33248]/40 text-[#FF7B89] text-xs">
                    {recoveryError}
                  </div>
                )}

                {recoveryStep === 'lookup' && (
                  <form onSubmit={handleForgotLookup} className="flex flex-col gap-3">
                    <p className="text-xs text-[#A8BBC2]">
                      Enter your registered Linmax Chat Code or email to verify ownership and reset your password.
                    </p>
                    <input
                      type="text"
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      placeholder="+LM123456 or email"
                      required
                      className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Send Verification Code
                    </button>
                  </form>
                )}

                {recoveryStep === 'verify' && (
                  <form onSubmit={handleForgotVerifyAndReset} className="flex flex-col gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00E5D4]/10 border border-[#00E5D4]/30 text-[11px] text-[#00E5D4] flex items-center justify-between">
                      <span>Security Verification Code:</span>
                      <span className="font-mono font-bold text-sm tracking-widest text-white">
                        {generatedOtp}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00E5D4]"
                    />
                    <input
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="New password (min 6 chars)"
                      required
                      minLength={6}
                      className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                )}

                {recoveryStep === 'done' && (
                  <div className="flex flex-col items-center text-center gap-2.5 py-2">
                    <CheckCircle2 size={34} className="text-[#20E66B]" />
                    <p className="text-xs text-white font-semibold">
                      Password updated! Your new credentials are pre-filled.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setAuthSuccessMsg('Password reset complete. Click Login to sign in.');
                      }}
                      className="mt-1 w-full py-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                    >
                      Return to Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FUNCTIONAL GOOGLE / APPLE ACCOUNT CONNECT MODAL */}
          {socialModalProvider && (
            <div className="absolute inset-0 z-30 bg-[#02080C]/94 backdrop-blur-md p-6 flex flex-col justify-center">
              <form
                onSubmit={handleSocialContinue}
                className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/45 p-5 shadow-[0_0_30px_rgba(0,229,212,0.22)] flex flex-col gap-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {socialModalProvider === 'google' ? (
                      <GoogleColorIcon />
                    ) : (
                      <AppleWhiteIcon />
                    )}
                    <h3 className="text-sm font-bold text-white capitalize">
                      Continue with {socialModalProvider}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSocialModalProvider(null)}
                    className="text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quick 1-tap if any accounts already exist */}
                {accounts.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-[#A8BBC2]">
                      Saved accounts on this device:
                    </span>
                    {accounts.slice(0, 3).map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => onLoginSuccess(toCurrentUser(acc))}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-[#03090D] border border-white/10 hover:border-[#00E5D4] text-left transition-colors cursor-pointer"
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-[#00E5D4] truncate">
                            {acc.email} · {acc.chatCode}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="h-px bg-white/10" />

                <span className="text-[11px] text-[#A8BBC2]">
                  Or link another {socialModalProvider === 'google' ? 'Google' : 'Apple'} account:
                </span>
                <input
                  type="text"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                />
                <input
                  type="email"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder={
                    socialModalProvider === 'google'
                      ? 'name@gmail.com'
                      : 'name@icloud.com'
                  }
                  required
                  className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                >
                  Authorize & Sign In
                </button>
              </form>
            </div>
          )}

          {/* FUNCTIONAL QR CONNECT MODAL */}
          {showQrModal && (
            <div className="absolute inset-0 z-30 bg-[#02080C]/94 backdrop-blur-md p-6 flex flex-col justify-center">
              <div className="rounded-2xl bg-[#07151B] border border-[#00E5D4]/45 p-5 shadow-[0_0_30px_rgba(0,229,212,0.22)] flex flex-col items-center text-center gap-3">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#00E5D4]" />
                    <h3 className="text-sm font-bold text-white">Linmax QR Connect</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQrModal(false)}
                    className="text-[#A8BBC2] hover:text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-white text-[#03090D]">
                  <QrCode size={104} strokeWidth={1.5} />
                </div>

                <span className="text-[11px] font-mono text-[#00E5D4] bg-[#03090D] px-3 py-1 rounded-full border border-[#00E5D4]/25">
                  Pairing Token: {qrToken}
                </span>

                <div className="w-full text-left flex flex-col gap-1">
                  <label className="text-[10px] text-[#A8BBC2]">
                    Approve scan for account:
                  </label>
                  <select
                    value={qrSelectedAccountId}
                    onChange={(e) => setQrSelectedAccountId(e.target.value)}
                    className="w-full bg-[#03090D] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5D4]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.chatCode})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target =
                      accounts.find((a) => a.id === qrSelectedAccountId) ||
                      accounts[0];
                    setShowQrModal(false);
                    if (target) onLoginSuccess(toCurrentUser(target));
                  }}
                  className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold cursor-pointer"
                >
                  Approve QR Sign-In
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
