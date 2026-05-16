import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import CreatePostForm from '../components/post/CreatePostForm';
import PostList from '../components/post/PostList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import UserAvatar from '../components/user/UserAvatar';
import { postApi } from '../api/postApi';
import { followApi } from '../api/followApi';
import { mediaApi } from '../api/mediaApi';
import { searchApi } from '../api/searchApi';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight,
  Bell,
  Compass,
  Hash,
  Home,
  ImagePlus,
  Settings2,
  Shield,
  UserPlus,
} from 'lucide-react';

function asArray(data) {
  return Array.isArray(data) ? data : data?.content || [];
}

function formatCount(value) {
  const count = Number(value || 0);
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  return `${count}`;
}

function getTagLabel(item) {
  if (typeof item === 'string') return item;
  return item?.tag || item?.name || item?.hashtag || '';
}

function getTagCount(item) {
  if (typeof item === 'string') return 0;
  return Number(item?.count ?? item?.postCount ?? item?.posts ?? 0);
}

function getDisplayName(user) {
  return user?.fullName || user?.username || 'Suggested user';
}

function getHandle(user) {
  return user?.username ? `@${user.username}` : 'Suggested account';
}

const sidebarLinks = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Notifications', icon: Bell, authOnly: true },
  { to: '/profile/edit', label: 'Settings', icon: Settings2, authOnly: true },
  { to: '/admin', label: 'Admin', icon: Shield, authOnly: true, adminOnly: true },
];

export default function FeedPage() {
  const { isLoggedIn, user, logout, hasHydrated } = useAuth();
  const isGuest = user?.role === 'GUEST';
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showComposer, setShowComposer] = useState(false);

  const feedQuery = useQuery({
    queryKey: ['feed', isLoggedIn ? 'signed-in' : 'public', user?.userId || 'guest'],
    queryFn: postApi.getFeed,
  });
  const storiesQuery = useQuery({
    queryKey: ['active-stories', user?.userId],
    queryFn: () => mediaApi.getActiveStories(user?.userId),
    enabled: Boolean(hasHydrated && isLoggedIn && !isGuest),
    retry: false,
  });
  const hashtagsQuery = useQuery({ queryKey: ['trending-hashtags'], queryFn: searchApi.trendingHashtags });
  const suggestionsQuery = useQuery({
    queryKey: ['follow-suggestions', user?.userId],
    queryFn: followApi.suggested,
    enabled: Boolean(isLoggedIn && !isGuest),
  });

  const followMutation = useMutation({
    mutationFn: (followeeId) => followApi.follow(followeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success('Followed user');
    },
  });

  const posts = asArray(feedQuery.data);
  const stories = asArray(storiesQuery.data);
  const hashtags = asArray(hashtagsQuery.data);
  const suggestedUsers = asArray(suggestionsQuery.data);
  const isAdmin = user?.role === 'ADMIN';

  const storyItems = useMemo(() => {
    const activeStories = stories.slice(0, 7).map((story, index) => {
      const author = story?.author || story?.user || {};
      const authorId = story?.authorId || story?.userId || author.userId || author.id;
      const name = story?.authorFullName || story?.authorUsername || author.fullName || author.username || `Story ${index + 1}`;
      return {
        key: story.storyId || story.id || `${name}-${index}`,
        label: name,
        caption: story?.authorUsername ? `@${story.authorUsername}` : 'Story',
        avatar: story?.authorProfilePicUrl || author.profilePicUrl || author.avatar,
        to: '/stories',
        storyId: story.storyId || story.id,
      };
    });
    return [
      { key: 'add-story', label: 'Add story', caption: 'Open stories', to: '/stories', isAdd: true },
      ...activeStories,
    ];
  }, [stories]);

  const sidebarLinksVisible = sidebarLinks.filter((item) => (!item.authOnly || isLoggedIn) && (!item.adminOnly || isAdmin));
  const handleComposeClick = () => {
    setShowComposer((current) => {
      const next = !current;
      if (next) {
        window.setTimeout(() => {
          const composer = document.getElementById('compose-post');
          if (!composer) return;
          composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          composer.querySelector('textarea')?.focus();
        }, 0);
      }
      return next;
    });
  };
  const trendingCards = hashtags
    .slice(0, 6)
    .map((item, index) => {
      const tag = getTagLabel(item);
      if (!tag) return null;
      return { key: item?.hashtagId || tag, tag, count: getTagCount(item), rank: index + 1 };
    })
    .filter(Boolean);
  const suggestedCards = suggestedUsers.slice(0, 3);

  return (
    <div className="dashboard-surface">
      <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left sidebar */}
        <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6rem)]">
          <div className="flex h-full min-h-0 flex-col gap-4">
            <section className="glass-card-static flex-1 min-h-0 overflow-y-auto p-4">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
                  <span className="text-xs font-bold text-white">CS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ConnectSphere</p>
                  <p className="text-[0.65rem] text-slate-400">Social feed</p>
                </div>
              </div>

              <nav className="grid gap-1">
                {sidebarLinksVisible.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-indigo-500' : ''}`} />
                      <span>{label}</span>
                    </Link>
                  );
                })}

                {isLoggedIn && !isGuest ? (
                  <button
                    type="button"
                    onClick={handleComposeClick}
                    className="mt-2 flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                  >
                    <ImagePlus className="h-[18px] w-[18px] shrink-0" />
                    <span>{showComposer ? 'Close composer' : 'Compose post'}</span>
                  </button>
                ) : null}
              </nav>
            </section>


          </div>
        </aside>

        {/* Center content */}
        <section className="space-y-4 min-w-0">
          <div className="glass-card-static p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stories</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-700">Open and add stories</h2>
              </div>
              <Link to="/stories" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 transition hover:text-indigo-600">
                Open stories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {storyItems.map((story) => (
                <Link key={story.key} to={story.to} className="group flex w-[68px] shrink-0 flex-col items-center text-center">
                  <span className="rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-[2px]">
                    {story.isAdd ? (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 transition group-hover:text-indigo-500">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                        <UserAvatar name={story.label} src={story.avatar} size="lg" storyRing />
                      </span>
                    )}
                  </span>
                  <span className="mt-1 w-full truncate text-[0.68rem] font-medium text-slate-500 group-hover:text-slate-700">{story.label}</span>
                </Link>
              ))}
              {storyItems.length === 1 ? <p className="self-center text-sm text-slate-400">No active stories yet.</p> : null}
            </div>
          </div>

          {isLoggedIn && !isGuest && showComposer ? (
            <CreatePostForm />
          ) : !isLoggedIn || isGuest ? (
            <div className="glass-card-static p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-slate-800">Sign in to post</p>
                  <p className="mt-1 text-sm text-slate-400">Login to share updates, react to posts, and follow accounts.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/login" className="cs-btn cs-btn-primary flex-1 text-xs">Login</Link>
                <Link to="/register" className="cs-btn cs-btn-secondary flex-1 text-xs">Register</Link>
              </div>
            </div>
          ) : null}

          {feedQuery.isLoading ? <LoadingSpinner label="Loading feed" /> : <PostList posts={posts} />}

          {!feedQuery.isLoading && posts.length === 0 ? (
            <EmptyState
              title={isLoggedIn ? (isGuest ? 'Guest feed is read-only' : 'Your feed is empty') : 'No public posts yet'}
              description={isLoggedIn ? (isGuest ? 'Guest accounts can browse public posts only.' : 'Follow people to see their posts here.') : 'Public posts will appear here when available.'}
            />
          ) : null}
        </section>

        {/* Right sidebar */}
        <aside className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
          <section className="glass-card-static p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hashtags</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-700">Trending</h2>
              </div>
              <span className="cs-badge bg-slate-100 text-slate-500">{trendingCards.length} tags</span>
            </div>

            <div className="mt-3 space-y-1.5">
              {trendingCards.length > 0 ? trendingCards.map((item) => (
                <Link
                  key={item.key}
                  to={`/hashtag/${encodeURIComponent(item.tag)}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 transition hover:bg-indigo-50"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Hash className="h-4 w-4 text-indigo-400" />
                    #{item.tag}
                  </span>
                  <span className="text-xs text-slate-400">{formatCount(item.count)} posts</span>
                </Link>
              )) : <p className="text-sm text-slate-400">No trending hashtags yet.</p>}
            </div>
          </section>

          <section className="glass-card-static p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested</p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-700">People to follow</h2>
              </div>
              <span className="cs-badge bg-slate-100 text-slate-500">{suggestedCards.length}</span>
            </div>

            <div className="mt-3 space-y-2">
              {isLoggedIn && !isGuest ? (
                suggestedCards.length > 0 ? suggestedCards.map((candidate) => {
                  const userId = candidate.userId || candidate.id;
                  const mutualConnections = Number(candidate.mutualCount ?? candidate.mutualConnections ?? 0);
                  return (
                    <div key={userId || candidate.username} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
                      <Link to={userId ? `/profile/${userId}` : '/search'} className="flex min-w-0 flex-1 items-center gap-2.5">
                        <UserAvatar name={getDisplayName(candidate)} src={candidate.profilePicUrl} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-700">{getDisplayName(candidate)}</p>
                          <p className="truncate text-xs text-slate-400">
                            {mutualConnections > 0 ? `${mutualConnections} mutual` : getHandle(candidate)}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => userId && followMutation.mutate(userId)}
                        disabled={!userId || followMutation.isPending}
                        className="cs-btn cs-btn-primary shrink-0 px-3 py-1.5 text-xs"
                      >
                        <UserPlus className="h-3.5 w-3.5" /> Follow
                      </button>
                    </div>
                  );
                }) : <p className="text-sm text-slate-400">No suggestions right now.</p>
              ) : (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-400">
                  Sign in to get personalized follow suggestions.
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
