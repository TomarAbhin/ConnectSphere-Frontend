import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../api/mediaApi';
import { likeApi } from '../api/likeApi';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import UserAvatar from '../components/user/UserAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ReactionPicker from '../components/common/ReactionPicker';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { Plus, Eye, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';

function detectStoryMediaType(file) {
  return file?.type?.startsWith('video/') ? 'VIDEO' : 'IMAGE';
}

function StoryThumb({ story, active, onClick }) {
  const authorId = story?.authorId || story?.userId;
  const author = story?.user || story?.author || story || {};
  const name = story?.authorFullName || story?.authorUsername || author.fullName || author.username || author.name || (authorId ? `User #${authorId}` : 'Story');
  return (
    <button type="button" onClick={onClick} className="group shrink-0 flex flex-col items-center gap-1.5">
      <UserAvatar name={name} src={story?.authorProfilePicUrl || author.profilePicUrl || author.profilePicture || author.avatar} storyRing={active} ring={!active} />
      <p className={`max-w-16 truncate text-[0.7rem] font-medium ${active ? 'text-brand-300' : 'text-slate-400 group-hover:text-white'}`}>{name}</p>
    </button>
  );
}

export default function StoriesPage() {
  const queryClient = useQueryClient();
  const { user, accessToken, isLoggedIn, hasHydrated } = useAuth();
  const storiesQuery = useQuery({
    queryKey: ['stories'],
    queryFn: () => mediaApi.getActiveStories(),
    enabled: Boolean(hasHydrated && isLoggedIn),
    retry: false,
  });
  const stories = Array.isArray(storiesQuery.data) ? storiesQuery.data : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const viewedStoryIdsRef = useRef(new Set());

  useEffect(() => {
    if (!stories.length || !isViewerOpen) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % stories.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [stories.length, isViewerOpen]);

  useEffect(() => {
    if (!stories.length) return;
    if (activeIndex >= stories.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, stories.length]);

  useEffect(() => {
    if (!isViewerOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsViewerOpen(false);
      }
      if (event.key === 'ArrowLeft' && stories.length > 1) {
        setActiveIndex((value) => (value - 1 + stories.length) % stories.length);
      }
      if (event.key === 'ArrowRight' && stories.length > 1) {
        setActiveIndex((value) => (value + 1) % stories.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isViewerOpen, stories.length]);

  const activeStory = isViewerOpen ? stories[activeIndex] : null;
  const activeStoryId = activeStory?.storyId || activeStory?.id;
  const currentUserId = user?.userId;
  const activeStoryAuthorId = activeStory?.authorId || activeStory?.userId;
  const isStoryOwner = Boolean(currentUserId && activeStoryAuthorId && String(currentUserId) === String(activeStoryAuthorId));
  const canReactToStory = Boolean(isLoggedIn && accessToken && activeStoryId);

  const reactionsQuery = useQuery({
    queryKey: ['story-reactions', activeStoryId],
    queryFn: async () => {
      if (!activeStoryId) return { likes: [], users: [] };
      const likes = await likeApi.getLikesByTarget('STORY', activeStoryId);
      const uniqueUserIds = [...new Set((Array.isArray(likes) ? likes : []).map((like) => like?.userId).filter(Boolean))];
      const users = await Promise.all(uniqueUserIds.map(async (userId) => {
        try {
          return await authApi.getUserById(userId);
        } catch {
          return { userId };
        }
      }));
      return { likes: Array.isArray(likes) ? likes : [], users };
    },
    enabled: Boolean(activeStoryId),
  });

  const currentStoryLike = useMemo(() => {
    const likes = Array.isArray(reactionsQuery.data?.likes) ? reactionsQuery.data.likes : [];
    if (!currentUserId) return null;
    return likes.find((like) => String(like?.userId) === String(currentUserId));
  }, [currentUserId, reactionsQuery.data]);

  const storyReactMutation = useMutation({
    mutationFn: async (reactionType) => {
      if (!activeStoryId) return 'none';
      if (currentStoryLike?.likeId) {
        if (currentStoryLike.reactionType === reactionType) {
          await likeApi.unlike(activeStoryId, 'STORY');
          return 'unliked';
        }
        await likeApi.changeReaction(currentStoryLike.likeId, { reactionType });
        return 'changed';
      }
      await likeApi.like({ targetType: 'STORY', targetId: activeStoryId, reactionType });
      return 'liked';
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['story-reactions', activeStoryId] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.success(result === 'unliked' ? 'Story unliked' : 'Story updated');
    },
  });

  useEffect(() => {
    if (!activeStoryId) return;
    if (viewedStoryIdsRef.current.has(activeStoryId)) return;
    viewedStoryIdsRef.current.add(activeStoryId);
    mediaApi.viewStory(activeStoryId)
      .then(() => queryClient.invalidateQueries({ queryKey: ['stories'] }))
      .catch(() => {});
  }, [activeStoryId, queryClient]);

  const storyReactorUsers = reactionsQuery.data?.users || [];
  const isLoadingStories = storiesQuery.isLoading;
  const openStoryViewer = (index) => {
    setActiveIndex(index);
    setIsViewerOpen(true);
  };

  const closeStoryViewer = () => {
    setIsViewerOpen(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const mediaType = detectStoryMediaType(file);
      const upload = await mediaApi.uploadMedia(file, { linkedPostId: null, mediaType });
      const url = upload?.url || upload?.mediaUrl || upload?.path || upload?.data || null;
      if (url) {
        await mediaApi.createStory({ mediaUrl: url, mediaType });
        await queryClient.invalidateQueries({ queryKey: ['stories'] });
        toast.success('Story uploaded');
      }
    } catch (err) {
      toast.error('Unable to upload story');
    }
  };

  if (isLoadingStories) return <LoadingSpinner />;

  return (
    <div className="dashboard-surface space-y-5 animate-fade-in">
      {/* Story strip */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-4 overflow-x-auto pb-1">
          {/* Add story button */}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="group flex shrink-0 flex-col items-center gap-1.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm transition hover:shadow-md">
              <Plus className="h-6 w-6" />
            </div>
            <p className="text-[0.7rem] font-medium text-slate-500">Add story</p>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />

          {/* Story thumbs */}
          {stories.map((story, index) => (
            <StoryThumb
              key={story.storyId || story.id || index}
              story={story}
              active={index === activeIndex && isViewerOpen}
              onClick={() => openStoryViewer(index)}
            />
          ))}

          {stories.length === 0 ? <p className="text-sm text-slate-400 ml-2">No stories from your network right now.</p> : null}
        </div>
      </div>

      {isViewerOpen && activeStory ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeStoryViewer();
            }
          }}
        >
          <div className="relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <button
              type="button"
              onClick={closeStoryViewer}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
              aria-label="Close story viewer"
            >
              <X className="h-5 w-5" />
            </button>

            {stories.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((value) => (value - 1 + stories.length) % stories.length)}
                  className="absolute left-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((value) => (value + 1) % stories.length)}
                  className="absolute right-4 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:bg-slate-50"
                  aria-label="Next story"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
              <StoryThumb story={activeStory} active onClick={() => {}} />
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {activeStory.viewsCount != null ? (
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {activeStory.viewsCount} views
                  </span>
                ) : null}
                {activeStory.likesCount != null ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="text-base leading-none">♥</span> {activeStory.likesCount} reactions
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 24h
                </span>
              </div>
            </div>

            <div className="px-5 pb-3">
              <div className="flex gap-1">
                {stories.map((_, i) => (
                  <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all duration-500 ${i <= activeIndex ? 'w-full bg-gradient-to-r from-indigo-500 to-purple-500' : 'w-0'}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-900">
              {resolveMediaUrl(activeStory.mediaUrl) ? (
                activeStory.mediaType === 'VIDEO' ? (
                  <video controls playsInline autoPlay src={resolveMediaUrl(activeStory.mediaUrl)} className="h-full w-full object-contain" />
                ) : (
                  <img src={resolveMediaUrl(activeStory.mediaUrl)} alt="Story" className="h-full w-full object-contain" />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">Story content</div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{activeStory.authorFullName || activeStory.authorUsername || `User #${activeStory.authorId}`}</p>
                  <p className="text-xs text-slate-500">{activeStory.authorUsername ? `@${activeStory.authorUsername}` : 'Story author'}</p>
                  {activeStory.caption ? <p className="mt-2 max-w-2xl text-sm text-slate-500">{activeStory.caption}</p> : null}
                </div>

                {canReactToStory ? (
                  <ReactionPicker
                    currentReaction={currentStoryLike?.reactionType || null}
                    onSelect={(reactionType) => storyReactMutation.mutate(reactionType)}
                  />
                ) : null}
              </div>

              {isStoryOwner ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Who reacted</p>
                  {storyReactorUsers.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {storyReactorUsers.map((reactor) => (
                        <div key={reactor.userId} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 pr-3 text-xs text-slate-600">
                          <UserAvatar name={reactor.fullName || reactor.username} src={reactor.profilePicUrl} size="sm" />
                          <span>{reactor.fullName || reactor.username || `User #${reactor.userId}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">No reactions yet.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {stories.length === 0 ? <EmptyState title="No stories" description="Stories from people you follow will appear here. Upload one to get started!" /> : null}
    </div>
  );
}
