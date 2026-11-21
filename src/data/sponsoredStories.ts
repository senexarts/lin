import {
  AdAudienceType,
  AdCategory,
  AdCtaLabel,
  AdPaymentEvent,
  AdPaymentProvider,
  AdPriceRules,
  SponsoredStoryCampaign,
} from '../types';

export const DEFAULT_AD_PRICE_RULES: AdPriceRules = {
  currency: 'UGX',
  allUsers24hUgx: 35000,
  location24hUgx: 15000,
  specificCodes24hUgx: 10000,
  duration48hMultiplier: 1.85,
  duration72hMultiplier: 2.6,
  platformFeePercent: 5,
  frequencyCapOrganicStories: 3,
  maxTargetCodesPerCampaign: 50,
  updatedAt: Date.now(),
};

export const SUPPORTED_AD_LOCATIONS = [
  'Kampala',
  'Mbarara',
  'Wakiso',
  'Entebbe',
  'Jinja',
  'Gulu',
  'Mbale',
  'Lira',
  'Fort Portal',
  'Masaka',
] as const;

export const AD_CATEGORIES: AdCategory[] = [
  'Entertainment & Events',
  'Concerts & Nightlife',
  'Food & Dining',
  'Retail & Fashion',
  'Education & Campus',
  'Community & Faith',
  'Tech & Business',
];

export const AD_CTA_OPTIONS: AdCtaLabel[] = [
  'Learn More',
  'Buy Tickets',
  'Book Now',
  'Register',
  'Contact Us',
  'WhatsApp Us',
  'Visit Website',
];

export const PAYMENT_PROVIDERS_UGANDA: Array<{
  id: AdPaymentProvider;
  label: string;
  subtitle: string;
  gateway: string;
  badgeText: string;
}> = [
  {
    id: 'mtn_momo',
    label: 'MTN Mobile Money (MoMo)',
    subtitle: 'Instant Uganda prompt to 077 / 078 / 076',
    gateway: 'MarzPay / Flutterwave UG',
    badgeText: 'MTN MoMo',
  },
  {
    id: 'airtel_money',
    label: 'Airtel Money Uganda',
    subtitle: 'Instant PIN approval to 070 / 075 / 074',
    gateway: 'MarzPay / Pesapal UG',
    badgeText: 'Airtel',
  },
  {
    id: 'flutterwave_card',
    label: 'Visa / Mastercard',
    subtitle: 'UGX local & international cards',
    gateway: 'Flutterwave Checkout',
    badgeText: 'Card',
  },
  {
    id: 'pesapal',
    label: 'Pesapal Multi-Pay',
    subtitle: 'Mobile Money + East Africa Bank',
    gateway: 'Pesapal Gateway',
    badgeText: 'Pesapal',
  },
];

export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString('en-US')}`;
}

export function calculateCampaignPricing(
  rules: AdPriceRules,
  targetType: AdAudienceType,
  durationHours: 24 | 48 | 72
): {
  basePriceUgx: number;
  feeUgx: number;
  totalDueUgx: number;
} {
  const base24h =
    targetType === 'all_users'
      ? rules.allUsers24hUgx
      : targetType === 'location'
      ? rules.location24hUgx
      : rules.specificCodes24hUgx;

  const mult =
    durationHours === 72
      ? rules.duration72hMultiplier
      : durationHours === 48
      ? rules.duration48hMultiplier
      : 1;

  const basePriceUgx = Math.round((base24h * mult) / 500) * 500;
  const feeUgx = Math.round((basePriceUgx * (rules.platformFeePercent / 100)) / 100) * 100;
  const totalDueUgx = basePriceUgx + feeUgx;

  return { basePriceUgx, feeUgx, totalDueUgx };
}

export function isValidDestinationUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (/^tel:\+?[0-9]{7,15}$/i.test(trimmed)) return true;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(trimmed)) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function parseLmCodesInput(raw: string, maxCount = 50): string[] {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
  const valid: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const normalized = token.startsWith('+') ? token : `+${token}`;
    if (/^\+LM[A-Z0-9]{2,16}$/.test(normalized) && !seen.has(normalized)) {
      seen.add(normalized);
      valid.push(normalized);
      if (valid.length >= maxCount) break;
    }
  }
  return valid;
}

export function isCampaignEligibleForFeed(
  campaign: SponsoredStoryCampaign,
  viewerChatCode: string,
  hiddenCampaignIds: string[],
  nowMs = Date.now()
): boolean {
  if (hiddenCampaignIds.includes(campaign.id)) return false;
  if (campaign.paymentStatus !== 'paid') return false;
  if (campaign.approvalStatus !== 'approved') return false;
  if (campaign.deliveryStatus !== 'active') return false;
  if (campaign.startsAt && nowMs < campaign.startsAt) return false;
  if (campaign.expiresAt && nowMs > campaign.expiresAt) return false;

  if (campaign.targetType === 'specific_codes') {
    const allowed = campaign.targetUserCodes || [];
    const normalizedViewer = viewerChatCode.trim().toUpperCase();
    return allowed.some((c) => c.trim().toUpperCase() === normalizedViewer);
  }

  return true;
}

export function buildInitialSponsoredCampaigns(): SponsoredStoryCampaign[] {
  const now = Date.now();
  const hourMs = 3600 * 1000;
  return [
    {
      id: 'ad_kampala_fest_2026',
      advertiserUserId: 'biz_uganda_live',
      advertiserName: 'Pearl Beats Live',
      advertiserAvatar:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      advertiserContact: '+256 772 480 910',
      title: 'Kampala Sunset Acoustic Night',
      category: 'Concerts & Nightlife',
      description:
        'Live afro-fusion, acoustic sets, and rooftop street food this Saturday at Kololo Terrace. Early bird passes live now.',
      mediaType: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1080&q=80',
      ctaLabel: 'Buy Tickets',
      destinationUrl: 'https://pearlbeats.example.ug/sunset-tickets',
      eventDate: 'Sat, 28 Nov · 6:00 PM EAT',
      venue: 'Kololo Sky Terrace, Kampala',
      targetType: 'location',
      targetLocation: 'Kampala',
      durationHours: 48,
      basePriceUgx: 27750,
      feeUgx: 1400,
      amountPaidUgx: 29150,
      currency: 'UGX',
      paymentProvider: 'mtn_momo',
      paymentAccount: '25677***910',
      paymentReference: 'LMX-MOMO-849201',
      paymentStatus: 'paid',
      approvalStatus: 'approved',
      deliveryStatus: 'active',
      createdAt: now - 5 * hourMs,
      startsAt: now - 4 * hourMs,
      expiresAt: now + 44 * hourMs,
      impressions: 0,
      uniqueViewerIds: [],
      storyCompletions: 0,
      videoViews: 0,
      ctaClicks: 0,
    },
    {
      id: 'ad_mbarara_roastery',
      advertiserUserId: 'biz_ankole_roast',
      advertiserName: 'Ankole Highlands Coffee',
      advertiserAvatar:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
      advertiserContact: '+256 752 330 214',
      title: '2-for-1 Cold Brew & Pastry Fridays',
      category: 'Food & Dining',
      description:
        'Single-origin Ugandan Arabica brewed fresh every morning. Order pickup or reserve a study booth across all branches.',
      mediaType: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1080&q=80',
      ctaLabel: 'Book Now',
      destinationUrl: 'https://ankoleroast.example.ug/friday-menu',
      eventDate: 'Every Friday · 8 AM – 7 PM',
      venue: 'Mbarara & Kampala Hubs',
      targetType: 'all_users',
      durationHours: 72,
      basePriceUgx: 91000,
      feeUgx: 4550,
      amountPaidUgx: 95550,
      currency: 'UGX',
      paymentProvider: 'airtel_money',
      paymentAccount: '25675***214',
      paymentReference: 'LMX-AIRTEL-552819',
      paymentStatus: 'paid',
      approvalStatus: 'approved',
      deliveryStatus: 'active',
      createdAt: now - 8 * hourMs,
      startsAt: now - 6 * hourMs,
      expiresAt: now + 66 * hourMs,
      impressions: 0,
      uniqueViewerIds: [],
      storyCompletions: 0,
      videoViews: 0,
      ctaClicks: 0,
    },
    {
      id: 'ad_pending_tech_summit',
      advertiserUserId: 'biz_makerere_dev',
      advertiserName: 'East Africa Builders Guild',
      advertiserAvatar:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      advertiserContact: 'hello@eabuilders.org',
      title: 'Kampala Mobile & Web Builders Hackathon',
      category: 'Tech & Business',
      description:
        '48-hour product sprint for student and indie engineers. Free workshops, mentors, and UGX 10M prize pool.',
      mediaType: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1080&q=80',
      ctaLabel: 'Register',
      destinationUrl: 'https://eabuilders.example.ug/hackathon',
      eventDate: '5–7 Dec 2026',
      venue: 'Innovation Village, Ntinda',
      targetType: 'all_users',
      durationHours: 24,
      basePriceUgx: 35000,
      feeUgx: 1750,
      amountPaidUgx: 36750,
      currency: 'UGX',
      paymentProvider: 'flutterwave_card',
      paymentAccount: 'VISA •••• 4242',
      paymentReference: 'LMX-FLW-991042',
      paymentStatus: 'paid',
      approvalStatus: 'pending_review',
      deliveryStatus: 'scheduled',
      createdAt: now - 1 * hourMs,
      impressions: 0,
      uniqueViewerIds: [],
      storyCompletions: 0,
      videoViews: 0,
      ctaClicks: 0,
    },
  ];
}

export function buildInitialPaymentEvents(): AdPaymentEvent[] {
  const now = Date.now();
  const hourMs = 3600 * 1000;
  return [
    {
      id: 'pay_ev_1',
      campaignId: 'ad_kampala_fest_2026',
      campaignTitle: 'Kampala Sunset Acoustic Night',
      provider: 'mtn_momo',
      reference: 'LMX-MOMO-849201',
      eventType: 'checkout_verified',
      amountUgx: 29150,
      currency: 'UGX',
      accountMasked: '25677***910',
      createdAt: now - 5 * hourMs,
    },
    {
      id: 'pay_ev_2',
      campaignId: 'ad_mbarara_roastery',
      campaignTitle: '2-for-1 Cold Brew & Pastry Fridays',
      provider: 'airtel_money',
      reference: 'LMX-AIRTEL-552819',
      eventType: 'checkout_verified',
      amountUgx: 95550,
      currency: 'UGX',
      accountMasked: '25675***214',
      createdAt: now - 8 * hourMs,
    },
    {
      id: 'pay_ev_3',
      campaignId: 'ad_pending_tech_summit',
      campaignTitle: 'Kampala Mobile & Web Builders Hackathon',
      provider: 'flutterwave_card',
      reference: 'LMX-FLW-991042',
      eventType: 'checkout_verified',
      amountUgx: 36750,
      currency: 'UGX',
      accountMasked: 'VISA •••• 4242',
      createdAt: now - 1 * hourMs,
    },
  ];
}
