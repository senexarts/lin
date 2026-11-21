import React, { useMemo, useRef, useState } from 'react';
import {
  Megaphone,
  Plus,
  BarChart3,
  ShieldCheck,
  Upload,
  Film,
  Image as ImageIcon,
  MapPin,
  Users,
  KeyRound,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Receipt,
  Download,
  Smartphone,
  CreditCard,
  Sliders,
  Eye,
  MousePointerClick,
  X,
  Edit3,
  Trash2,
} from 'lucide-react';
import {
  AdAudienceType,
  AdCategory,
  AdCtaLabel,
  AdPaymentEvent,
  AdPaymentProvider,
  AdPriceRules,
  AdReportRecord,
  AdReviewRecord,
  CurrentUser,
  SponsoredStoryCampaign,
} from '../../types';
import {
  AD_CATEGORIES,
  AD_CTA_OPTIONS,
  PAYMENT_PROVIDERS_UGANDA,
  SUPPORTED_AD_LOCATIONS,
  calculateCampaignPricing,
  formatUgx,
  isValidDestinationUrl,
  parseLmCodesInput,
} from '../../data/sponsoredStories';
import {
  readImageFileAsDataUrl,
  readVideoFileAsPlayableUrl,
} from '../../utils/imageUpload';

interface SponsoredStoriesStudioProps {
  currentUser: CurrentUser;
  campaigns: SponsoredStoryCampaign[];
  priceRules: AdPriceRules;
  paymentEvents: AdPaymentEvent[];
  reviewRecords: AdReviewRecord[];
  adReports: AdReportRecord[];
  onCreatePaidCampaign: (
    campaign: SponsoredStoryCampaign,
    paymentEvent: AdPaymentEvent
  ) => void;
  onResubmitCampaign: (
    campaignId: string,
    updates: Partial<SponsoredStoryCampaign>
  ) => void;
  onTogglePauseCampaign: (campaignId: string) => void;
  onModerateCampaign: (
    campaignId: string,
    decision: 'approved' | 'rejected' | 'changes_requested' | 'paused' | 'resumed' | 'terminated',
    reason?: string,
    notes?: string
  ) => void;
  onUpdatePriceRules: (nextRules: AdPriceRules) => void;
  onResolveReport: (reportId: string) => void;
  onOpenStoriesFeed: (campaignId?: string) => void;
}

type StudioTab = 'create' | 'my_ads' | 'admin';

const CREATIVE_STARTER_PRESETS = [
  {
    label: 'Concert Stage',
    url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Street Food',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Tech Summit',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1080&q=80',
  },
  {
    label: 'Fashion Pop-Up',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1080&q=80',
  },
];

export const SponsoredStoriesStudio: React.FC<SponsoredStoriesStudioProps> = ({
  currentUser,
  campaigns,
  priceRules,
  paymentEvents,
  reviewRecords,
  adReports,
  onCreatePaidCampaign,
  onResubmitCampaign,
  onTogglePauseCampaign,
  onModerateCampaign,
  onUpdatePriceRules,
  onResolveReport,
  onOpenStoriesFeed,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('create');

  // Create / Edit Wizard Form State
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AdCategory>('Entertainment & Events');
  const [advertiserName, setAdvertiserName] = useState(currentUser.name);
  const [advertiserContact, setAdvertiserContact] = useState(currentUser.email || '+256 770 000 000');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState(CREATIVE_STARTER_PRESETS[0].url);
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [ctaLabel, setCtaLabel] = useState<AdCtaLabel>('Learn More');
  const [destinationUrl, setDestinationUrl] = useState('https://');
  const [targetType, setTargetType] = useState<AdAudienceType>('all_users');
  const [targetLocation, setTargetLocation] = useState<string>('Kampala');
  const [targetCodesRaw, setTargetCodesRaw] = useState('');
  const [durationHours, setDurationHours] = useState<24 | 48 | 72>(24);
  const [formError, setFormError] = useState<string | null>(null);

  // Uganda Payment Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<AdPaymentProvider>('mtn_momo');
  const [paymentAccountInput, setPaymentAccountInput] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // My Ads & Receipt Modal State
  const [receiptCampaign, setReceiptCampaign] = useState<SponsoredStoryCampaign | null>(null);

  // Admin Moderation & Rules State
  const [adminFilter, setAdminFilter] = useState<'pending_review' | 'active' | 'reports' | 'all'>('pending_review');
  const [adminDecisionReason, setAdminDecisionReason] = useState<Record<string, string>>({});
  const [draftRules, setDraftRules] = useState<AdPriceRules>(priceRules);
  const [rulesSavedNote, setRulesSavedNote] = useState(false);

  // Toast
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    window.setTimeout(() => {
      setBannerNotice((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const pricing = useMemo(
    () => calculateCampaignPricing(priceRules, targetType, durationHours),
    [priceRules, targetType, durationHours]
  );

  const parsedTargetCodes = useMemo(
    () => parseLmCodesInput(targetCodesRaw, priceRules.maxTargetCodesPerCampaign),
    [targetCodesRaw, priceRules.maxTargetCodesPerCampaign]
  );

  const myCampaigns = useMemo(
    () => campaigns.filter((c) => c.advertiserUserId === currentUser.id),
    [campaigns, currentUser.id]
  );

  const kpiTotals = useMemo(() => {
    const list = myCampaigns.length > 0 ? myCampaigns : campaigns;
    let activeCount = 0;
    let pendingCount = 0;
    let impressions = 0;
    let uniqueViewers = 0;
    let ctaClicks = 0;
    let totalSpendUgx = 0;

    for (const c of list) {
      if (c.deliveryStatus === 'active' && c.approvalStatus === 'approved') activeCount += 1;
      if (c.approvalStatus === 'pending_review') pendingCount += 1;
      impressions += c.impressions;
      uniqueViewers += c.uniqueViewerIds.length;
      ctaClicks += c.ctaClicks;
      if (c.paymentStatus === 'paid') totalSpendUgx += c.amountPaidUgx;
    }

    const ctr = impressions > 0 ? ((ctaClicks / impressions) * 100).toFixed(1) : '0.0';
    return { activeCount, pendingCount, impressions, uniqueViewers, ctaClicks, ctr, totalSpendUgx };
  }, [myCampaigns, campaigns]);

  const pendingQueueCount = useMemo(
    () => campaigns.filter((c) => c.paymentStatus === 'paid' && c.approvalStatus === 'pending_review').length,
    [campaigns]
  );

  const openReportsCount = useMemo(
    () => adReports.filter((r) => r.status === 'open').length,
    [adReports]
  );

  const filteredAdminCampaigns = useMemo(() => {
    if (adminFilter === 'pending_review') {
      return campaigns.filter((c) => c.paymentStatus === 'paid' && c.approvalStatus === 'pending_review');
    }
    if (adminFilter === 'active') {
      return campaigns.filter((c) => c.deliveryStatus === 'active' || c.deliveryStatus === 'scheduled');
    }
    return campaigns;
  }, [campaigns, adminFilter]);

  const handleUploadCreativeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 1080, 0.85);
      setMediaType('image');
      setMediaUrl(dataUrl);
      setFormError(null);
    } catch {
      setFormError('Could not load selected image file.');
    }
    e.target.value = '';
  };

  const handleUploadCreativeVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await readVideoFileAsPlayableUrl(file);
      setMediaType('video');
      setMediaUrl(url);
      setFormError(null);
    } catch {
      setFormError('Could not load selected video file (MP4, WebM, MOV).');
    }
    e.target.value = '';
  };

  const validateWizardForm = (): string | null => {
    if (!title.trim()) return 'Enter a campaign headline.';
    if (!advertiserName.trim()) return 'Enter your business or advertiser name.';
    if (!description.trim()) return 'Enter a short description of your promotion or event.';
    if (!mediaUrl.trim()) return 'Upload an image/video creative or choose a visual template.';
    if (!isValidDestinationUrl(destinationUrl)) {
      return 'Enter a valid destination URL (starting with https://, http://, or tel:+256...).';
    }
    if (targetType === 'specific_codes' && parsedTargetCodes.length === 0) {
      return 'Enter at least one valid +LM Chat Code for code-targeted delivery.';
    }
    return null;
  };

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateWizardForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);

    if (editingCampaignId) {
      onResubmitCampaign(editingCampaignId, {
        title: title.trim(),
        category,
        advertiserName: advertiserName.trim(),
        advertiserContact: advertiserContact.trim(),
        description: description.trim(),
        mediaType,
        mediaUrl,
        eventDate: eventDate.trim() || undefined,
        venue: venue.trim() || undefined,
        ctaLabel,
        destinationUrl: destinationUrl.trim(),
        targetType,
        targetLocation: targetType === 'location' ? targetLocation : undefined,
        targetUserCodes: targetType === 'specific_codes' ? parsedTargetCodes : undefined,
        approvalStatus: 'pending_review',
        deliveryStatus: 'scheduled',
      });
      setEditingCampaignId(null);
      resetWizardFields();
      setActiveTab('my_ads');
      showNotice('Updated campaign resubmitted to Moderation Queue.');
      return;
    }

    setCheckoutError(null);
    setShowCheckoutModal(true);
  };

  const resetWizardFields = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setVenue('');
    setDestinationUrl('https://');
    setTargetCodesRaw('');
    setMediaType('image');
    setMediaUrl(CREATIVE_STARTER_PRESETS[0].url);
  };

  const handleConfirmUgandaPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const acct = paymentAccountInput.trim();
    if (paymentProvider === 'mtn_momo' || paymentProvider === 'airtel_money') {
      const digits = acct.replace(/\D/g, '');
      if (digits.length < 9) {
        setCheckoutError('Enter a valid Ugandan Mobile Money number (e.g. 0772 123 456).');
        return;
      }
    } else if (acct.length < 4) {
      setCheckoutError('Enter your card last 4 digits or billing email.');
      return;
    }

    setCheckoutError(null);
    setIsProcessingPayment(true);

    window.setTimeout(() => {
      const now = Date.now();
      const campaignId = `ad_${now}`;
      const prefix =
        paymentProvider === 'mtn_momo'
          ? 'MOMO'
          : paymentProvider === 'airtel_money'
          ? 'AIRTEL'
          : paymentProvider === 'pesapal'
          ? 'PESAPAL'
          : 'FLW';
      const ref = `LMX-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
      const masked =
        acct.length > 5
          ? `${acct.slice(0, 3)}***${acct.slice(-3)}`
          : `•••• ${acct.slice(-4)}`;

      const newCampaign: SponsoredStoryCampaign = {
        id: campaignId,
        advertiserUserId: currentUser.id,
        advertiserName: advertiserName.trim(),
        advertiserAvatar: currentUser.avatar,
        advertiserContact: advertiserContact.trim(),
        title: title.trim(),
        category,
        description: description.trim(),
        mediaType,
        mediaUrl,
        ctaLabel,
        destinationUrl: destinationUrl.trim(),
        eventDate: eventDate.trim() || undefined,
        venue: venue.trim() || undefined,
        targetType,
        targetLocation: targetType === 'location' ? targetLocation : undefined,
        targetUserCodes: targetType === 'specific_codes' ? parsedTargetCodes : undefined,
        durationHours,
        basePriceUgx: pricing.basePriceUgx,
        feeUgx: pricing.feeUgx,
        amountPaidUgx: pricing.totalDueUgx,
        currency: 'UGX',
        paymentProvider,
        paymentAccount: masked,
        paymentReference: ref,
        paymentStatus: 'paid',
        approvalStatus: 'pending_review',
        deliveryStatus: 'scheduled',
        createdAt: now,
        impressions: 0,
        uniqueViewerIds: [],
        storyCompletions: 0,
        videoViews: 0,
        ctaClicks: 0,
      };

      const paymentEvent: AdPaymentEvent = {
        id: `pay_${now}`,
        campaignId,
        campaignTitle: newCampaign.title,
        provider: paymentProvider,
        reference: ref,
        eventType: 'checkout_verified',
        amountUgx: pricing.totalDueUgx,
        currency: 'UGX',
        accountMasked: masked,
        createdAt: now,
      };

      onCreatePaidCampaign(newCampaign, paymentEvent);
      setIsProcessingPayment(false);
      setShowCheckoutModal(false);
      setPaymentAccountInput('');
      resetWizardFields();
      setActiveTab('my_ads');
      showNotice(
        `Payment verified (${ref}). Campaign queued for admin review before Stories launch.`
      );
    }, 650);
  };

  const handleLoadForEdit = (c: SponsoredStoryCampaign) => {
    setEditingCampaignId(c.id);
    setTitle(c.title);
    setCategory(c.category);
    setAdvertiserName(c.advertiserName);
    setAdvertiserContact(c.advertiserContact);
    setDescription(c.description);
    setMediaType(c.mediaType);
    setMediaUrl(c.mediaUrl);
    setEventDate(c.eventDate || '');
    setVenue(c.venue || '');
    setCtaLabel(c.ctaLabel);
    setDestinationUrl(c.destinationUrl);
    setTargetType(c.targetType);
    if (c.targetLocation) setTargetLocation(c.targetLocation);
    setTargetCodesRaw((c.targetUserCodes || []).join(', '));
    setDurationHours(c.durationHours);
    setActiveTab('create');
  };

  const handleDownloadReport = (c: SponsoredStoryCampaign) => {
    const ctr =
      c.impressions > 0 ? ((c.ctaClicks / c.impressions) * 100).toFixed(2) : '0.00';
    const content = [
      'LINMAX SPONSORED STORIES — CAMPAIGN REPORT & RECEIPT',
      '====================================================',
      `Campaign ID: ${c.id}`,
      `Title: ${c.title}`,
      `Advertiser: ${c.advertiserName} (${c.advertiserContact})`,
      `Category: ${c.category}`,
      `Payment Reference: ${c.paymentReference}`,
      `Payment Status: ${c.paymentStatus.toUpperCase()}`,
      `Approval Status: ${c.approvalStatus.toUpperCase()}`,
      `Delivery Status: ${c.deliveryStatus.toUpperCase()}`,
      `Duration Package: ${c.durationHours} hours`,
      `Base Price: ${formatUgx(c.basePriceUgx)}`,
      `Platform Fee: ${formatUgx(c.feeUgx)}`,
      `Total Paid: ${formatUgx(c.amountPaidUgx)}`,
      '----------------------------------------------------',
      `Impressions: ${c.impressions}`,
      `Unique Viewers: ${c.uniqueViewerIds.length}`,
      `Story Completions: ${c.storyCompletions}`,
      `CTA Clicks (${c.ctaLabel}): ${c.ctaClicks}`,
      `Click-Through Rate (CTR): ${ctr}%`,
      `Destination URL: ${c.destinationUrl}`,
      `Generated: ${new Date().toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linmax-ad-report-${c.paymentReference}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#03090D] text-white overflow-hidden">
      {/* Hidden Creative Upload Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadCreativeImage}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleUploadCreativeVideo}
      />

      {/* Top Studio Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-[#00E5D4]/15 bg-[#07151B]/85 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] text-[#03090D] flex items-center justify-center shrink-0">
            <Megaphone size={20} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold font-display text-white truncate">
              Advertise on Linmax
            </h1>
            <p className="text-xs text-[#A8BBC2] truncate">
              Sponsored Stories · Verified UGX Mobile Money & Card Checkout · Privacy-Safe Delivery
            </p>
          </div>
        </div>

        {/* Segmented Navigation Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#03090D] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#00E5D4] text-[#03090D]'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Plus size={14} />
            <span>{editingCampaignId ? 'Edit Ad' : 'Create Ad'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my_ads')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'my_ads'
                ? 'bg-[#00E5D4] text-[#03090D]'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>My Ads ({campaigns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-400 text-[#1C1202]'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <ShieldCheck size={14} />
            <span>
              Moderation{pendingQueueCount + openReportsCount > 0 ? ` (${pendingQueueCount + openReportsCount})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-6">
          {bannerNotice && (
            <div className="px-4 py-3 rounded-xl bg-[#07151B] border border-[#00E5D4]/40 text-xs text-[#00E5D4] flex items-center justify-between gap-3">
              <span className="font-medium">{bannerNotice}</span>
              <button
                type="button"
                onClick={() => setBannerNotice(null)}
                className="text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* TAB 1: CREATE CAMPAIGN WIZARD + LIVE 9:16 STORIES FRAME PREVIEW */}
          {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Campaign Form */}
              <form
                onSubmit={handleProceedToCheckout}
                className="lg:col-span-7 rounded-2xl bg-[#07151B] border border-white/10 p-5 sm:p-6 flex flex-col gap-5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-display text-white">
                      {editingCampaignId ? 'Update Returned Campaign' : 'Create Sponsored Story'}
                    </h2>
                    <p className="text-xs text-[#A8BBC2]">
                      Appears in Linmax Stories only after payment verification &amp; admin approval
                    </p>
                  </div>
                  {editingCampaignId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCampaignId(null);
                        resetWizardFields();
                      }}
                      className="text-xs text-[#A8BBC2] hover:text-white cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* Creative Upload */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-white">
                    1. Story Creative (9:16 Image or Short Video)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1B22] border border-[#00E5D4]/30 hover:border-[#00E5D4] text-xs font-semibold text-[#00E5D4] flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon size={14} />
                      <span>Upload Poster / Flyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-[#0B1B22] border border-[#00CFEF]/30 hover:border-[#00CFEF] text-xs font-semibold text-[#00CFEF] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Film size={14} />
                      <span>Upload Story Video</span>
                    </button>
                  </div>

                  {/* Quick Starter Creative Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {CREATIVE_STARTER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setMediaType('image');
                          setMediaUrl(preset.url);
                        }}
                        className={`shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          mediaType === 'image' && mediaUrl === preset.url
                            ? 'border-[#00E5D4] bg-[#00E5D4]/10 text-white'
                            : 'border-white/10 bg-[#03090D] text-[#A8BBC2] hover:text-white'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt=""
                          className="w-5 h-5 rounded object-cover"
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Campaign Headline *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={70}
                      placeholder="e.g. Kampala Food & Music Fest"
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AdCategory)}
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                    >
                      {AD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advertiser Identity & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Business / Promoter Name *
                    </label>
                    <input
                      type="text"
                      value={advertiserName}
                      onChange={(e) => setAdvertiserName(e.target.value)}
                      placeholder="Your business or event name"
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Verified Contact (Phone or Email) *
                    </label>
                    <input
                      type="text"
                      value={advertiserContact}
                      onChange={(e) => setAdvertiserContact(e.target.value)}
                      placeholder="+256 772 ... or email"
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#A8BBC2]">
                    Story Caption / Offer Details *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={180}
                    placeholder="Clear details, offer terms, ticket pricing, or schedule..."
                    className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4] resize-none"
                  />
                </div>

                {/* Event Date & Venue */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Event Date / Hours (Optional)
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="e.g. Sat 28 Nov · 7 PM"
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Venue / Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Acacia Mall, Kampala"
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                </div>

                {/* CTA + Validated URL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Call-to-Action Button
                    </label>
                    <select
                      value={ctaLabel}
                      onChange={(e) => setCtaLabel(e.target.value as AdCtaLabel)}
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                    >
                      {AD_CTA_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#A8BBC2]">
                      Destination URL or Phone Link *
                    </label>
                    <input
                      type="text"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder="https://yoursite.ug/tickets or tel:+256772..."
                      className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10">
                  <label className="text-xs font-semibold text-white">
                    2. Audience Targeting (Privacy-Safe)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('all_users')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        targetType === 'all_users'
                          ? 'border-[#00E5D4] bg-[#00E5D4]/10'
                          : 'border-white/10 bg-[#03090D] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Users size={14} className="text-[#00E5D4]" />
                        <span>All Users Blast</span>
                      </div>
                      <p className="text-[11px] text-[#A8BBC2] mt-1">
                        {formatUgx(priceRules.allUsers24hUgx)} / 24h
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('location')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        targetType === 'location'
                          ? 'border-[#00E5D4] bg-[#00E5D4]/10'
                          : 'border-white/10 bg-[#03090D] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <MapPin size={14} className="text-[#00CFEF]" />
                        <span>City / Region</span>
                      </div>
                      <p className="text-[11px] text-[#A8BBC2] mt-1">
                        {formatUgx(priceRules.location24hUgx)} / 24h
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('specific_codes')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        targetType === 'specific_codes'
                          ? 'border-[#00E5D4] bg-[#00E5D4]/10'
                          : 'border-white/10 bg-[#03090D] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <KeyRound size={14} className="text-amber-400" />
                        <span>Selected +LM Codes</span>
                      </div>
                      <p className="text-[11px] text-[#A8BBC2] mt-1">
                        {formatUgx(priceRules.specificCodes24hUgx)} / 24h
                      </p>
                    </button>
                  </div>

                  {targetType === 'location' && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-xs text-[#A8BBC2]">Select City / District</label>
                      <select
                        value={targetLocation}
                        onChange={(e) => setTargetLocation(e.target.value)}
                        className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#00E5D4]"
                      >
                        {SUPPORTED_AD_LOCATIONS.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {targetType === 'specific_codes' && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-xs text-[#A8BBC2]">
                        Opted-in +LM Chat Codes (comma or space separated, max {priceRules.maxTargetCodesPerCampaign})
                      </label>
                      <input
                        type="text"
                        value={targetCodesRaw}
                        onChange={(e) => setTargetCodesRaw(e.target.value)}
                        placeholder="+LM123456, +LM884920"
                        className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2 text-sm font-mono text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                      />
                      <span className="text-[11px] text-[#A8BBC2]">
                        Parsed codes: {parsedTargetCodes.length} · Harassment &amp; unsolicited bulk targeting prohibited
                      </span>
                    </div>
                  )}
                </div>

                {/* Duration & Price Summary */}
                <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-white">
                      3. Campaign Duration (starts on admin approval)
                    </label>
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#03090D] border border-white/10">
                      {([24, 48, 72] as const).map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDurationHours(hrs)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                            durationHours === hrs
                              ? 'bg-[#00E5D4] text-[#03090D]'
                              : 'text-[#A8BBC2] hover:text-white'
                          }`}
                        >
                          {hrs}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transparent Price Breakdown */}
                  <div className="rounded-xl bg-[#03090D] border border-white/10 p-3.5 flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#A8BBC2]">
                      <span>
                        Base Placement ({durationHours}h ·{' '}
                        {targetType === 'all_users'
                          ? 'All Eligible Users'
                          : targetType === 'location'
                          ? targetLocation
                          : `${parsedTargetCodes.length} +LM Codes`}
                        )
                      </span>
                      <span className="font-mono text-white">
                        {formatUgx(pricing.basePriceUgx)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#A8BBC2]">
                      <span>Platform &amp; Gateway Fee ({priceRules.platformFeePercent}%)</span>
                      <span className="font-mono text-white">
                        {formatUgx(pricing.feeUgx)}
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                    <div className="flex items-center justify-between text-sm font-bold text-[#00E5D4]">
                      <span>Total Due</span>
                      <span className="font-mono">{formatUgx(pricing.totalDueUgx)}</span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#F33248]/15 border border-[#F33248]/40 text-xs text-red-200 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#F33248] shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  {editingCampaignId
                    ? 'Resubmit Updated Campaign'
                    : `Continue to Payment (${formatUgx(pricing.totalDueUgx)})`}
                </button>
              </form>

              {/* Right Column: Live 9:16 Linmax Story Frame Preview */}
              <div className="lg:col-span-5 flex flex-col gap-3 lg:sticky lg:top-4">
                <div className="flex items-center justify-between text-xs text-[#A8BBC2]">
                  <span className="font-semibold text-white">Live Stories Frame Preview</span>
                  <span>9:16 Vertical Canvas</span>
                </div>

                <div className="mx-auto w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden border border-[#00E5D4]/30 bg-[#07151B] relative shadow-[0_16px_50px_rgba(0,0,0,0.65)] flex flex-col justify-between">
                  {/* Media layer */}
                  {mediaType === 'video' ? (
                    <video
                      src={mediaUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="Sponsored Story Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/90" />

                  {/* Top Story Progress + Sponsored Identity */}
                  <div className="relative z-10 p-3.5 flex flex-col gap-2.5">
                    <div className="h-1 w-full rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full w-2/3 bg-[#00E5D4] rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={currentUser.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {advertiserName.trim() || currentUser.name}
                          </div>
                          <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1.5">
                            <span>Sponsored</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-white/75 truncate">{category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Ad Copy + Venue + CTA Button */}
                  <div className="relative z-10 p-4 flex flex-col gap-2.5">
                    {(eventDate.trim() || venue.trim()) && (
                      <div className="text-[11px] text-[#00E5D4] font-medium flex items-center gap-1.5">
                        <Clock size={12} className="shrink-0" />
                        <span className="truncate">
                          {[eventDate.trim(), venue.trim()].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}
                    <h3 className="text-base font-bold font-display text-white leading-snug">
                      {title.trim() || 'Your Campaign Headline'}
                    </h3>
                    <p className="text-xs text-white/85 line-clamp-3">
                      {description.trim() ||
                        'Your promotion description, pricing highlights, and key info appear cleanly here.'}
                    </p>
                    <div className="pt-1">
                      <span className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-xs flex items-center justify-center gap-1.5">
                        <span>{ctaLabel}</span>
                        <ExternalLink size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ADS & REAL ANALYTICS */}
          {activeTab === 'my_ads' && (
            <div className="flex flex-col gap-5">
              {/* Real Aggregate KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-[#07151B] border border-white/10 p-4">
                  <div className="text-xs text-[#A8BBC2]">Active / Pending</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {kpiTotals.activeCount} / {kpiTotals.pendingCount}
                  </div>
                </div>
                <div className="rounded-xl bg-[#07151B] border border-white/10 p-4">
                  <div className="text-xs text-[#A8BBC2]">Impressions · Unique</div>
                  <div className="text-xl font-bold font-mono text-[#00E5D4] mt-1">
                    {kpiTotals.impressions} · {kpiTotals.uniqueViewers}
                  </div>
                </div>
                <div className="rounded-xl bg-[#07151B] border border-white/10 p-4">
                  <div className="text-xs text-[#A8BBC2]">CTA Clicks · CTR</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {kpiTotals.ctaClicks} · {kpiTotals.ctr}%
                  </div>
                </div>
                <div className="rounded-xl bg-[#07151B] border border-white/10 p-4">
                  <div className="text-xs text-[#A8BBC2]">Verified Spend</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    {formatUgx(kpiTotals.totalSpendUgx)}
                  </div>
                </div>
              </div>

              {/* Campaigns List */}
              {campaigns.length === 0 ? (
                <div className="rounded-2xl bg-[#07151B] border border-white/10 p-10 text-center flex flex-col items-center gap-3">
                  <Megaphone size={28} className="text-[#00E5D4]" />
                  <p className="text-sm text-[#A8BBC2]">No Sponsored Story campaigns created yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {campaigns.map((c) => {
                    const ctr =
                      c.impressions > 0
                        ? ((c.ctaClicks / c.impressions) * 100).toFixed(1)
                        : '0.0';
                    const isLive =
                      c.paymentStatus === 'paid' &&
                      c.approvalStatus === 'approved' &&
                      c.deliveryStatus === 'active';

                    return (
                      <div
                        key={c.id}
                        className="rounded-2xl bg-[#07151B] border border-white/10 p-4 flex flex-col md:flex-row gap-4 justify-between"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-16 h-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                            {c.mediaType === 'video' ? (
                              <video
                                src={c.mediaUrl}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <img
                                src={c.mediaUrl}
                                alt={c.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex flex-col gap-1.5">
                            <div className="text-sm font-bold text-white truncate">
                              {c.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#A8BBC2]">
                              <span>{c.advertiserName}</span>
                              <span aria-hidden="true">·</span>
                              <span>{c.category}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {c.targetType === 'all_users'
                                  ? 'All Eligible Users'
                                  : c.targetType === 'location'
                                  ? `Location: ${c.targetLocation}`
                                  : `${c.targetUserCodes?.length || 0} +LM Codes`}
                              </span>
                            </div>

                            {/* Independent Payment / Approval / Delivery State Readout */}
                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium mt-0.5">
                              <span className="text-white/90">
                                Payment:{' '}
                                <span
                                  className={
                                    c.paymentStatus === 'paid'
                                      ? 'text-[#20E66B]'
                                      : c.paymentStatus === 'refunded'
                                      ? 'text-amber-300'
                                      : 'text-red-400'
                                  }
                                >
                                  {c.paymentStatus}
                                </span>
                              </span>
                              <span className="text-white/40">/</span>
                              <span className="text-white/90">
                                Review:{' '}
                                <span
                                  className={
                                    c.approvalStatus === 'approved'
                                      ? 'text-[#00E5D4]'
                                      : c.approvalStatus === 'pending_review'
                                      ? 'text-amber-300'
                                      : 'text-red-400'
                                  }
                                >
                                  {c.approvalStatus.replace('_', ' ')}
                                </span>
                              </span>
                              <span className="text-white/40">/</span>
                              <span className="text-white/90">
                                Delivery:{' '}
                                <span
                                  className={
                                    isLive ? 'text-[#20E66B]' : 'text-[#A8BBC2]'
                                  }
                                >
                                  {c.deliveryStatus}
                                </span>
                              </span>
                            </div>

                            {(c.rejectionReason || c.moderationNotes) && (
                              <p className="text-xs text-amber-300">
                                Moderator note: {c.rejectionReason || c.moderationNotes}
                              </p>
                            )}

                            {/* Live Event Metrics */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-[#A8BBC2] pt-1">
                              <span className="flex items-center gap-1">
                                <Eye size={13} className="text-[#00E5D4]" />
                                <strong className="text-white font-mono">{c.impressions}</strong> impressions
                              </span>
                              <span>
                                <strong className="text-white font-mono">{c.uniqueViewerIds.length}</strong> unique viewers
                              </span>
                              <span>
                                <strong className="text-white font-mono">{c.storyCompletions}</strong> completions
                              </span>
                              <span className="flex items-center gap-1">
                                <MousePointerClick size={13} className="text-[#00CFEF]" />
                                <strong className="text-white font-mono">{c.ctaClicks}</strong> clicks ({ctr}% CTR)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Column */}
                        <div className="flex flex-row md:flex-col items-end justify-between gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-bold font-mono text-amber-300">
                              {formatUgx(c.amountPaidUgx)}
                            </div>
                            <div className="text-[11px] font-mono text-[#A8BBC2]">
                              {c.paymentReference} · {c.durationHours}h
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isLive && (
                              <button
                                type="button"
                                onClick={() => onOpenStoriesFeed(c.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#00E5D4]/15 border border-[#00E5D4]/40 text-[#00E5D4] text-xs font-semibold hover:bg-[#00E5D4] hover:text-[#03090D] transition-colors cursor-pointer"
                              >
                                Watch Live
                              </button>
                            )}
                            {c.approvalStatus === 'approved' &&
                              (c.deliveryStatus === 'active' || c.deliveryStatus === 'paused') && (
                                <button
                                  type="button"
                                  onClick={() => onTogglePauseCampaign(c.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#0B1B22] border border-white/15 text-xs text-white hover:border-[#00E5D4] flex items-center gap-1 cursor-pointer"
                                >
                                  {c.deliveryStatus === 'active' ? (
                                    <>
                                      <PauseCircle size={13} />
                                      <span>Pause</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlayCircle size={13} />
                                      <span>Resume</span>
                                    </>
                                  )}
                                </button>
                              )}
                            {c.approvalStatus === 'changes_requested' && (
                              <button
                                type="button"
                                onClick={() => handleLoadForEdit(c)}
                                className="px-3 py-1.5 rounded-lg bg-amber-400 text-[#1C1202] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={13} />
                                <span>Fix &amp; Resubmit</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setReceiptCampaign(c)}
                              className="px-3 py-1.5 rounded-lg bg-[#0B1B22] border border-white/15 text-xs text-[#A8BBC2] hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt size={13} />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN MODERATION QUEUE & CONFIGURABLE PRICING RULES */}
          {activeTab === 'admin' && (
            <div className="flex flex-col gap-6">
              {/* Admin Pricing & Frequency Configurator */}
              <div className="rounded-2xl bg-[#07151B] border border-white/10 p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders size={18} className="text-[#00E5D4]" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Admin Pricing &amp; Frequency Rules
                      </h3>
                      <p className="text-xs text-[#A8BBC2]">
                        Configure UGX package rates &amp; Stories frequency caps dynamically
                      </p>
                    </div>
                  </div>
                  {rulesSavedNote && (
                    <span className="text-xs font-semibold text-[#20E66B]">
                      Pricing &amp; cap rules saved
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#A8BBC2]">All Users 24h (UGX)</label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={draftRules.allUsers24hUgx}
                      onChange={(e) =>
                        setDraftRules((prev) => ({
                          ...prev,
                          allUsers24hUgx: Number(e.target.value) || 0,
                        }))
                      }
                      className="bg-[#03090D] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#A8BBC2]">Location 24h (UGX)</label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={draftRules.location24hUgx}
                      onChange={(e) =>
                        setDraftRules((prev) => ({
                          ...prev,
                          location24hUgx: Number(e.target.value) || 0,
                        }))
                      }
                      className="bg-[#03090D] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#A8BBC2]">+LM Codes 24h (UGX)</label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={draftRules.specificCodes24hUgx}
                      onChange={(e) =>
                        setDraftRules((prev) => ({
                          ...prev,
                          specificCodes24hUgx: Number(e.target.value) || 0,
                        }))
                      }
                      className="bg-[#03090D] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#A8BBC2]">Platform Fee (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={draftRules.platformFeePercent}
                      onChange={(e) =>
                        setDraftRules((prev) => ({
                          ...prev,
                          platformFeePercent: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="bg-[#03090D] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#A8BBC2]">Stories Between Ads</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={draftRules.frequencyCapOrganicStories}
                      onChange={(e) =>
                        setDraftRules((prev) => ({
                          ...prev,
                          frequencyCapOrganicStories: Math.max(1, Number(e.target.value) || 3),
                        }))
                      }
                      className="bg-[#03090D] border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00E5D4]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdatePriceRules({ ...draftRules, updatedAt: Date.now() });
                      setRulesSavedNote(true);
                      window.setTimeout(() => setRulesSavedNote(false), 2400);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
                  >
                    Save Pricing &amp; Frequency Rules
                  </button>
                </div>
              </div>

              {/* Filter Tabs for Moderation Queue */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#07151B] border border-white/10 w-fit">
                {(
                  [
                    { id: 'pending_review', label: `Pending Review (${pendingQueueCount})` },
                    { id: 'active', label: 'Active & Scheduled' },
                    { id: 'reports', label: `Ad Reports (${openReportsCount})` },
                    { id: 'all', label: `All (${campaigns.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      adminFilter === tab.id
                        ? 'bg-[#00E5D4] text-[#03090D]'
                        : 'text-[#A8BBC2] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Reports View vs Moderation Campaign Queue */}
              {adminFilter === 'reports' ? (
                <div className="flex flex-col gap-3">
                  {adReports.length === 0 ? (
                    <div className="rounded-2xl bg-[#07151B] border border-white/10 p-8 text-center text-xs text-[#A8BBC2]">
                      No user ad reports submitted yet.
                    </div>
                  ) : (
                    adReports.map((rep) => (
                      <div
                        key={rep.id}
                        className="rounded-2xl bg-[#07151B] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{rep.campaignTitle}</div>
                          <div className="text-xs text-[#F33248] font-semibold mt-0.5">
                            {rep.reason}
                          </div>
                          {rep.details && (
                            <p className="text-xs text-[#A8BBC2] mt-1">{rep.details}</p>
                          )}
                          <div className="text-[11px] text-[#A8BBC2] mt-1">
                            Submitted {new Date(rep.createdAt).toLocaleString()} · Status: {rep.status}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onModerateCampaign(
                                rep.campaignId,
                                'terminated',
                                `Terminated following user report: ${rep.reason}`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#F33248]/20 border border-[#F33248]/40 text-red-300 text-xs font-semibold cursor-pointer"
                          >
                            Terminate Ad
                          </button>
                          {rep.status === 'open' && (
                            <button
                              type="button"
                              onClick={() => onResolveReport(rep.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#00E5D4] text-[#03090D] text-xs font-bold cursor-pointer"
                            >
                              Mark Reviewed
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredAdminCampaigns.length === 0 ? (
                    <div className="rounded-2xl bg-[#07151B] border border-white/10 p-8 text-center text-xs text-[#A8BBC2]">
                      No campaigns match this moderation filter.
                    </div>
                  ) : (
                    filteredAdminCampaigns.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-2xl bg-[#07151B] border border-white/10 p-4 flex flex-col gap-3"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="flex items-start gap-3.5">
                            <div className="w-16 h-24 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                              {c.mediaType === 'video' ? (
                                <video src={c.mediaUrl} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={c.mediaUrl} alt={c.title} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm font-bold text-white">{c.title}</div>
                              <div className="text-xs text-[#A8BBC2]">
                                {c.advertiserName} ({c.advertiserContact}) · {c.category}
                              </div>
                              <p className="text-xs text-white/85">{c.description}</p>
                              <div className="text-xs text-[#00CFEF] break-all">
                                CTA: {c.ctaLabel} → {c.destinationUrl}
                              </div>
                              <div className="text-xs text-[#A8BBC2]">
                                Payment: <strong className="text-[#20E66B]">{c.paymentStatus}</strong> ({c.paymentReference} · {formatUgx(c.amountPaidUgx)}) · Approval:{' '}
                                <strong className="text-white">{c.approvalStatus}</strong> · Delivery:{' '}
                                <strong className="text-white">{c.deliveryStatus}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Moderator Checklist & Action Controls */}
                        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                          <input
                            type="text"
                            value={adminDecisionReason[c.id] || ''}
                            onChange={(e) =>
                              setAdminDecisionReason((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            placeholder="Moderation note or rejection reason..."
                            className="flex-1 bg-[#03090D] border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                          />

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {c.approvalStatus !== 'approved' && c.paymentStatus === 'paid' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onModerateCampaign(
                                    c.id,
                                    'approved',
                                    undefined,
                                    adminDecisionReason[c.id] || 'Approved for Stories delivery'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-[#20E66B] text-[#03090D] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve &amp; Launch</span>
                              </button>
                            )}

                            {c.approvalStatus === 'pending_review' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onModerateCampaign(
                                      c.id,
                                      'changes_requested',
                                      adminDecisionReason[c.id] ||
                                        'Please clarify offer copy or creative legibility.'
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold cursor-pointer"
                                >
                                  Request Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = (adminDecisionReason[c.id] || '').trim();
                                    if (!reason) {
                                      showNotice('Enter a rejection reason before rejecting & refunding.');
                                      return;
                                    }
                                    onModerateCampaign(c.id, 'rejected', reason);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#F33248]/20 border border-[#F33248]/40 text-red-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle size={13} />
                                  <span>Reject &amp; Refund</span>
                                </button>
                              </>
                            )}

                            {c.deliveryStatus === 'active' && (
                              <button
                                type="button"
                                onClick={() => onModerateCampaign(c.id, 'paused', adminDecisionReason[c.id])}
                                className="px-3 py-1.5 rounded-lg bg-[#0B1B22] border border-white/15 text-xs text-white cursor-pointer"
                              >
                                Pause
                              </button>
                            )}

                            {c.deliveryStatus === 'paused' && (
                              <button
                                type="button"
                                onClick={() => onModerateCampaign(c.id, 'resumed', adminDecisionReason[c.id])}
                                className="px-3 py-1.5 rounded-lg bg-[#00E5D4]/20 border border-[#00E5D4]/40 text-xs text-[#00E5D4] cursor-pointer"
                              >
                                Resume
                              </button>
                            )}

                            {c.deliveryStatus !== 'terminated' && (
                              <button
                                type="button"
                                onClick={() =>
                                  onModerateCampaign(
                                    c.id,
                                    'terminated',
                                    adminDecisionReason[c.id] || 'Policy enforcement termination'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-black/50 border border-red-500/30 text-xs text-red-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Terminate</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Payment & Review Audit Trail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#07151B] border border-white/10 p-4 flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00E5D4]">
                    Payment Event Ledger ({paymentEvents.length})
                  </h4>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {paymentEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="text-xs py-2 border-b border-white/5 last:border-0 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">
                            {ev.campaignTitle}
                          </div>
                          <div className="text-[11px] text-[#A8BBC2] font-mono">
                            {ev.reference} · {ev.provider} · {ev.eventType}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-300 shrink-0">
                          {formatUgx(ev.amountUgx)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#07151B] border border-white/10 p-4 flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#00CFEF]">
                    Moderation Audit Log ({reviewRecords.length})
                  </h4>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {reviewRecords.length === 0 ? (
                      <p className="text-xs text-[#A8BBC2]">
                        Moderator actions appear here automatically.
                      </p>
                    ) : (
                      reviewRecords.map((rev) => (
                        <div
                          key={rev.id}
                          className="text-xs py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white truncate">
                              {rev.campaignTitle}
                            </span>
                            <span className="font-mono text-[#00E5D4] uppercase text-[10px]">
                              {rev.decision}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#A8BBC2] mt-0.5">
                            By {rev.adminName} · {new Date(rev.createdAt).toLocaleString()}
                            {rev.reason ? ` · ${rev.reason}` : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* UGANDA CHECKOUT MODAL (MTN MoMo / Airtel Money / Flutterwave / Pesapal) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmUgandaPayment}
            className="w-full max-w-md rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-white">
                  Sponsored Story Checkout
                </h3>
                <p className="text-xs text-[#A8BBC2]">
                  {title} · {durationHours}h campaign
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="p-1.5 rounded-lg text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[78dvh] overflow-y-auto">
              <div className="rounded-xl bg-[#03090D] border border-white/10 p-3.5 flex items-center justify-between">
                <div className="text-xs text-[#A8BBC2]">
                  <div>Total Payable</div>
                  <div className="text-[11px]">Includes {priceRules.platformFeePercent}% gateway fee</div>
                </div>
                <div className="text-lg font-bold font-mono text-[#00E5D4]">
                  {formatUgx(pricing.totalDueUgx)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-white">Select Payment Provider</label>
                {PAYMENT_PROVIDERS_UGANDA.map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setPaymentProvider(prov.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      paymentProvider === prov.id
                        ? 'border-[#00E5D4] bg-[#00E5D4]/10'
                        : 'border-white/10 bg-[#03090D] hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {prov.id === 'mtn_momo' || prov.id === 'airtel_money' ? (
                        <Smartphone size={17} className="text-[#00E5D4] shrink-0" />
                      ) : (
                        <CreditCard size={17} className="text-[#00CFEF] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{prov.label}</div>
                        <div className="text-[11px] text-[#A8BBC2] truncate">{prov.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#00E5D4] shrink-0">
                      {prov.badgeText}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#A8BBC2]">
                  {paymentProvider === 'mtn_momo' || paymentProvider === 'airtel_money'
                    ? 'Mobile Money Phone Number'
                    : 'Card Last 4 Digits / Billing Email'}
                </label>
                <input
                  type="text"
                  value={paymentAccountInput}
                  onChange={(e) => setPaymentAccountInput(e.target.value)}
                  placeholder={
                    paymentProvider === 'mtn_momo'
                      ? '0772 123 456'
                      : paymentProvider === 'airtel_money'
                      ? '0752 123 456'
                      : '4242 or billing@business.ug'
                  }
                  className="bg-[#03090D] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#A8BBC2]/50 focus:outline-none focus:border-[#00E5D4]"
                />
              </div>

              {checkoutError && (
                <p className="text-xs text-red-400 font-medium">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] font-bold text-sm disabled:opacity-60 cursor-pointer"
              >
                {isProcessingPayment
                  ? 'Verifying Payment...'
                  : `Verify & Submit for Review (${formatUgx(pricing.totalDueUgx)})`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIPT & PERFORMANCE REPORT MODAL */}
      {receiptCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#07151B] border border-[#00E5D4]/30 overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-white">
                Campaign Receipt &amp; Report
              </h3>
              <button
                type="button"
                onClick={() => setReceiptCampaign(null)}
                className="p-1 text-[#A8BBC2] hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3 text-xs">
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Campaign</span>
                <span className="font-bold text-white text-right">{receiptCampaign.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Payment Reference</span>
                <span className="font-mono text-[#00E5D4]">{receiptCampaign.paymentReference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Provider / Account</span>
                <span className="font-mono text-white">
                  {receiptCampaign.paymentProvider} · {receiptCampaign.paymentAccount || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Base + Fee</span>
                <span className="font-mono text-white">
                  {formatUgx(receiptCampaign.basePriceUgx)} + {formatUgx(receiptCampaign.feeUgx)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Total Paid</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatUgx(receiptCampaign.amountPaidUgx)} ({receiptCampaign.paymentStatus})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/10">
                <span className="text-[#A8BBC2]">Impressions / Unique</span>
                <span className="font-mono text-white">
                  {receiptCampaign.impressions} / {receiptCampaign.uniqueViewerIds.length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#A8BBC2]">Completions / CTA Clicks</span>
                <span className="font-mono text-white">
                  {receiptCampaign.storyCompletions} / {receiptCampaign.ctaClicks}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadReport(receiptCampaign)}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#00E5D4] text-[#03090D] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download Receipt &amp; Metrics (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
