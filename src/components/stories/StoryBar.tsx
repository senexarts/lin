import React from 'react';
import { Plus } from 'lucide-react';
import { Story, CurrentUser } from '../../types';

interface StoryBarProps {
  stories: Story[];
  currentUser: CurrentUser;
  onSelectStory: (story: Story) => void;
  onOpenAddStory: () => void;
  onSeeAll?: () => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({
  stories,
  currentUser,
  onSelectStory,
  onOpenAddStory,
  onSeeAll,
}) => {
  return (
    <div className="px-4 py-3 border-b border-[#00E5D4]/10 bg-[#07151B]/60 backdrop-blur-md">
      {/* Stories Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider text-[#00E5D4] uppercase font-display">
            Linmax Stories
          </span>
          <span className="text-[10px] text-[#A8BBC2] bg-[#0B1B22] px-1.5 py-0.5 rounded border border-[#00E5D4]/15">
            24h Ephemeral
          </span>
        </div>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs text-[#00CFEF] hover:text-[#00E5D4] transition-colors font-medium hover:underline"
          >
            See All
          </button>
        )}
      </div>

      {/* Horizontal Story Scroller */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenAddStory}
            aria-label="Add Linmax Story"
            className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-[#00E5D4] to-[#00CFEF] hover:scale-105 active:scale-95 transition-all group flex items-center justify-center shadow-[0_0_12px_rgba(0,229,212,0.3)] cursor-pointer"
          >
            <div className="w-full h-full rounded-full bg-[#07151B] p-0.5 flex items-center justify-center overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            {/* Cyan Plus Badge */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00E5D4] text-[#03090D] flex items-center justify-center font-bold text-xs ring-2 ring-[#07151B] shadow-sm">
              <Plus size={11} strokeWidth={3.5} />
            </div>
          </button>
          <span className="text-[11px] text-[#A8BBC2] font-medium truncate w-14 text-center">
            Add Story
          </span>
        </div>

        {/* Stories from Contacts */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <button
              onClick={() => onSelectStory(story)}
              aria-label={`View ${story.userName}'s Story`}
              className={`relative w-14 h-14 rounded-full p-[2.5px] transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                story.isViewed
                  ? 'bg-[#162E38]'
                  : 'bg-gradient-to-tr from-[#00E5D4] via-[#00CFEF] to-[#00AFC2] shadow-[0_0_14px_rgba(0,229,212,0.4)]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-[#03090D] p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback to stylized initial
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-bold text-[#00E5D4] bg-[#0B1B22]">${story.userName.charAt(0)}</div>`;
                    }
                  }}
                />
              </div>
            </button>
            <span
              className={`text-[11px] font-medium truncate w-14 text-center ${
                story.isViewed ? 'text-[#A8BBC2]' : 'text-white'
              }`}
            >
              {story.userName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
