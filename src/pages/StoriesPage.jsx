import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/mediaApi';
import toast from 'react-hot-toast';
import UserAvatar from '../components/user/UserAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Plus, Eye, Clock } from 'lucide-react';

function detectStoryMediaType(file) {
  return file?.type?.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

function StoryThumb({ story, active, onClick }) {
  const authorId = story?.authorId || story?.userId;
  const author = story?.user || story?.author || story || {};
  const name = author.fullName || author.username || author.name || (authorId ? `User #${authorId}` : 'Story');
  return (
    <button type="button" onClick={onClick} className="group shrink-0 flex flex-col items-center gap-1.5">
      <UserAvatar name={name} src={author.profilePicUrl || author.profilePicture || author.avatar} storyRing={active} ring={!active} />
      <p className={`max-w-16 truncate text-[0.7rem] font-medium ${active ? 'text-brand-600' : 'text-slate-500 group-hover:text-slate-700'}`}>{name}</p>
    </button>
  );
}

export default function StoriesPage() {
  const storiesQuery = useQuery({ queryKey: ['stories'], queryFn: () => mediaApi.getActiveStories() });
  const stories = Array.isArray(storiesQuery.data) ? storiesQuery.data : storiesQuery.data?.content || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!stories.length) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % stories.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [stories.length]);

  if (storiesQuery.isLoading) return <LoadingSpinner />;

  const activeStory = stories[activeIndex];

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const mediaType = detectStoryMediaType(file);
      const upload = await mediaApi.uploadMedia(file, { linkedPostId: null, mediaType });
      const url = upload?.url || upload?.mediaUrl || upload?.path || upload?.data || null;
      if (url) {
        await mediaApi.createStory({ mediaUrl: url, mediaType });
        toast.success('Story uploaded');
      }
    } catch (err) {
      toast.error('Unable to upload story');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Story strip */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          {/* Add story button */}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="group flex shrink-0 flex-col items-center gap-1.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-glow-sm transition group-hover:shadow-glow">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-[0.7rem] font-medium text-slate-500">Add story</p>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />

          {/* Story thumbs */}
          {stories.map((story, index) => (
            <StoryThumb key={story.storyId || story.id || index} story={story} active={index === activeIndex} onClick={() => setActiveIndex(index)} />
          ))}

          {stories.length === 0 ? <p className="text-sm text-slate-400 ml-2">No stories from your network right now.</p> : null}
        </div>
      </div>

      {/* Active story viewer */}
      {activeStory ? (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
            <StoryThumb story={activeStory} active onClick={() => {}} />
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {activeStory.viewsCount != null ? (
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {activeStory.viewsCount} views
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 24h
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-3">
            <div className="flex gap-1">
              {stories.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${i <= activeIndex ? 'bg-gradient-to-r from-brand-500 to-purple-500 w-full' : 'w-0'}`} />
                </div>
              ))}
            </div>
          </div>

          {resolveMediaUrl(activeStory.mediaUrl) ? (
            activeStory.mediaType === 'VIDEO' ? (
              <video controls playsInline src={resolveMediaUrl(activeStory.mediaUrl)}
                className="w-full border-t border-slate-100 object-cover" style={{ maxHeight: '70vh' }} />
            ) : (
              <img src={resolveMediaUrl(activeStory.mediaUrl)} alt="Story"
                className="w-full border-t border-slate-100 object-cover" style={{ maxHeight: '70vh' }} />
            )
          ) : (
            <div className="border-t border-slate-100 bg-slate-50 p-16 text-center text-slate-400">Story content</div>
          )}
        </div>
      ) : null}

      {stories.length === 0 ? <EmptyState title="No stories" description="Stories from people you follow will appear here. Upload one to get started!" /> : null}
    </div>
  );
}
