import React, { useState } from 'react';
import { X, Image as ImageIcon, Type, Sparkles, Upload } from 'lucide-react';
import { CurrentUser, Story } from '../../types';
import { readImageFileAsDataUrl } from '../../utils/imageUpload';

interface AddStoryModalProps {
  currentUser: CurrentUser;
  onClose: () => void;
  onAddStory: (newStory: Story) => void;
}

const sampleImages = [
  { label: 'Mountain Vista', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber City', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Ocean Sunset', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tech Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' },
];

const textGradients = [
  'from-[#07151B] via-[#0B1B22] to-[#00AFC2]',
  'from-[#00E5D4]/20 via-[#07151B] to-[#00CFEF]/30',
  'from-[#03090D] via-[#004D40] to-[#00E5D4]/40',
  'from-[#1A1A2E] via-[#16213E] to-[#0F3460]',
];

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  currentUser,
  onClose,
  onAddStory,
}) => {
  const [tab, setTab] = useState<'image' | 'text'>('image');
  const [selectedImage, setSelectedImage] = useState(sampleImages[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(textGradients[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isImage = tab === 'image';
    const finalImageUrl = customImageUrl.trim() || selectedImage;

    if (isImage && !finalImageUrl) return;
    if (!isImage && !textContent.trim()) return;

    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userChatCode: currentUser.chatCode,
      mediaType: isImage ? 'image' : 'text',
      mediaUrl: isImage ? finalImageUrl : undefined,
      text: !isImage ? textContent.trim() : undefined,
      bgGradient: !isImage ? selectedGradient : undefined,
      caption: caption.trim() || undefined,
      timestamp: 'Just now',
      isViewed: false,
      viewsCount: 0,
    };

    onAddStory(newStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md max-h-[88dvh] bg-[#07151B] border border-[#00E5D4]/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,229,212,0.2)] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#00E5D4]/15 bg-[#0B1B22]/70 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#00E5D4]" size={18} />
            <h3 className="font-display font-bold text-white text-base">
              Add Linmax Story
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A8BBC2] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-2 bg-[#03090D]/60 border-b border-[#00E5D4]/10 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab('image')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'image'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40 shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <ImageIcon size={15} />
            Photo Story
          </button>
          <button
            type="button"
            onClick={() => setTab('text')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'text'
                ? 'bg-[#0B1B22] text-[#00E5D4] border border-[#00E5D4]/40 shadow-sm'
                : 'text-[#A8BBC2] hover:text-white'
            }`}
          >
            <Type size={15} />
            Text Thought
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {tab === 'image' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs text-[#A8BBC2] font-medium">
                  Upload Photo or Choose Preset
                </label>
                <label className="px-2.5 py-1 rounded-lg bg-[#0B1B22] hover:bg-[#00E5D4] text-[#00E5D4] hover:text-[#03090D] border border-[#00E5D4]/30 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                  <Upload size={12} />
                  <span>Upload from Files</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const dataUrl = await readImageFileAsDataUrl(file, 1080, 0.85);
                        setCustomImageUrl(dataUrl);
                      } catch {
                        // ignore invalid file
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Active Image Preview */}
              {(customImageUrl || selectedImage) && (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#00E5D4]/25 bg-[#03090D] shrink-0">
                  <img
                    src={customImageUrl.trim() || selectedImage}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomImageUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors cursor-pointer"
                      title="Remove uploaded image"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              )}

              {/* Sample Images Grid */}
              <div className="grid grid-cols-4 gap-2">
                {sampleImages.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => {
                      setSelectedImage(img.url);
                      setCustomImageUrl('');
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === img.url && !customImageUrl
                        ? 'border-[#00E5D4] scale-95 shadow-[0_0_10px_rgba(0,229,212,0.4)]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={customImageUrl.startsWith('data:') ? '' : customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Or paste custom image URL (https://...)"
                className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
              />

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-xs text-[#A8BBC2] font-medium">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share a thought with your photo..."
                  maxLength={120}
                  className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl px-3 py-2 text-xs text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4]"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Text Preview Box */}
              <div
                className={`w-full h-36 rounded-xl p-4 flex items-center justify-center text-center bg-gradient-to-br ${selectedGradient} border border-[#00E5D4]/20 shadow-inner`}
              >
                <p className="font-display font-semibold text-white text-base">
                  {textContent || 'Type your message below...'}
                </p>
              </div>

              {/* Gradient selector */}
              <div className="flex items-center gap-2 justify-center py-1">
                {textGradients.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedGradient(grad)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} border-2 cursor-pointer ${
                      selectedGradient === grad ? 'border-[#00E5D4] scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>

              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="What is happening? Share with your Linmax contacts..."
                maxLength={200}
                rows={3}
                className="w-full bg-[#03090D] border border-[#00E5D4]/20 rounded-xl p-3 text-sm text-white placeholder-[#A8BBC2]/60 focus:outline-none focus:border-[#00E5D4] resize-none"
              />
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-between text-[11px] text-[#A8BBC2] pt-2 border-t border-[#00E5D4]/10">
            <span>Visible to your contacts for 24 hours</span>
            <span className="text-[#00E5D4]">Encrypted</span>
          </div>
        </div>

        {/* Sticky Footer Action Buttons */}
        <div className="px-5 py-3.5 border-t border-[#00E5D4]/15 bg-[#0B1B22] flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-[#A8BBC2] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5D4] to-[#00CFEF] text-[#03090D] text-xs font-bold hover:shadow-[0_0_20px_rgba(0,229,212,0.4)] transition-all cursor-pointer"
          >
            Share Story
          </button>
        </div>
      </form>
    </div>
  );
};
