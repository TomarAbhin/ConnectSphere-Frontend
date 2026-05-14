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
  LogIn,
  LogOut,
  Search,
  Settings2,
  Sparkles,
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
  { to: '/search', label: 'Search', icon: Search },
  { to: '/stories', label: 'Stories', icon: Sparkles, authOnly: true },
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
  const countsQuery = useQuery({
    queryKey: ['follow-counts', user?.userId],
    queryFn: () => followApi.counts(user?.userId),
    enabled: Boolean(isLoggedIn && user?.userId),
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
  const counts = countsQuery.data || {};
  const isAdmin = user?.role === 'ADMIN';
  const profileName = user?.fullName || user?.username || 'Guest user';
  const profileHandle = user?.username ? `@${user.username}` : isLoggedIn ? 'Active account' : 'Public visitor';
  const totalFollowing = Number(counts.followingCount ?? 0);
  const totalFollowers = Number(counts.followerCount ?? 0);

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
        to: authorId ? `/profile/${authorId}` : '/stories',
        storyId: story.storyId || story.id,
      };
    });

    return [
      {
        key: 'add-story',
        label: 'Add story',
        caption: 'Open stories',
        to: '/stories',
        isAdd: true,
      },
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
      return {
        key: item?.hashtagId || tag,
        tag,
        count: getTagCount(item),
        rank: index + 1,
      };
    })
    .filter(Boolean);
  const suggestedCards = suggestedUsers.slice(0, 3);

  return (
    <div className="dashboard-surface min-h-[calc(100vh-6rem)] rounded-[32px] border border-white/10 bg-[#0f1115] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.42)] lg:p-5">
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
          <div className="flex h-full min-h-0 flex-col gap-4">
            <section className="glass-card-static flex-1 min-h-0 overflow-y-auto p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold">CS</span>
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-white">ConnectSphere</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Social feed</p>
                </div>
              </div>

              <nav className="mt-5 grid gap-2">
                {sidebarLinksVisible.map(({ to, label, icon: Icon }) => {
                  const active = location.pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        active
                          ? 'border-white/10 bg-white/10 text-white'
                          : 'border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  );
                })}

                {isLoggedIn && !isGuest ? (
                  <button
                    type="button"
                    onClick={handleComposeClick}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-brand-500 hover:to-cyan-500"
                  >
                    <ImagePlus className="h-4 w-4 shrink-0" />
                    <span>{showComposer ? 'Close composer' : 'Compose post'}</span>
                  </button>
                ) : null}
              </nav>
            </section>

            <section className="glass-card-static p-4">
              {isLoggedIn ? (
                <>
                  <Link to={user?.userId ? `/profile/${user.userId}` : '/profile'} className="block rounded-2xl transition hover:bg-white/5">
                    <div className="flex items-center gap-3 p-1">
                      <UserAvatar name={profileName} src={user?.profilePicUrl} size="lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{profileName}</p>
                        <p className="truncate text-xs text-slate-400">{profileHandle}</p>
                        <p className="mt-1 text-[0.7rem] text-slate-500">
                          {totalFollowers} followers · {totalFollowing} following
                        </p>
                        <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-brand-300">View profile</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={profileName} src={user?.profilePicUrl} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{profileName}</p>
                      <p className="truncate text-xs text-slate-400">Sign in for the full feed</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to="/login" className="cs-btn cs-btn-secondary flex-1 text-xs">
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </Link>
                    <Link to="/register" className="cs-btn cs-btn-primary flex-1 text-xs">
                      Register
                    </Link>
                  </div>
                </>
              )}
            </section>

          </div>
        </aside>

        <section className="space-y-4 min-w-0">
          <div className="glass-card-static p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-slate-400">Stories</p>
                <h2 className="mt-1 text-sm font-semibold text-white">Open and add stories</h2>
              </div>
              <Link to="/stories" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 transition hover:text-white">
                Open stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {storyItems.map((story) => (
                <Link key={story.key} to={story.to} className="group flex w-24 shrink-0 flex-col items-center text-center">
                  <span className="rounded-full bg-gradient-to-br from-brand-500 via-cyan-400 to-teal-400 p-[2px]">
                    {story.isAdd ? (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#111319] text-white">
                        <ImagePlus className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-[#111319]">
                        <UserAvatar name={story.label} src={story.avatar} size="lg" storyRing />
                      </span>
                    )}
                  </span>
                  <span className="mt-2 truncate text-xs font-medium text-white group-hover:text-brand-200">{story.label}</span>
                  <span className="truncate text-[0.68rem] text-slate-500">{story.caption}</span>
                </Link>
              ))}
              {storyItems.length === 1 ? <p className="self-center text-sm text-slate-500">No active stories yet.</p> : null}
            </div>
          </div>

          {isLoggedIn && !isGuest && showComposer ? (
            <CreatePostForm />
          ) : !isLoggedIn || isGuest ? (
            <div className="glass-card-static p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-300">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-white">Sign in to post</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    Login to share updates, react to posts, and follow accounts.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/login" className="cs-btn cs-btn-primary flex-1 text-xs">
                  Login
                </Link>
                <Link to="/register" className="cs-btn cs-btn-secondary flex-1 text-xs">
                  Register
                </Link>
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

        <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">
          <section className="glass-card-static p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Hashtags</p>
                <h2 className="mt-1 text-sm font-semibold text-white">Trending</h2>
              </div>
              <span className="cs-badge bg-white/5 text-slate-200 border border-white/10">{trendingCards.length} tags</span>
            </div>

            <div className="mt-4 space-y-2">
              {trendingCards.length > 0 ? trendingCards.map((item) => (
                <Link
                  key={item.key}
                  to={`/hashtag/${encodeURIComponent(item.tag)}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <Hash className="h-4 w-4 text-brand-300" />
                    #{item.tag}
                  </span>
                  <span className="text-xs text-slate-400">{formatCount(item.count)} posts</span>
                </Link>
              )) : <p className="text-sm text-slate-500">No trending hashtags yet.</p>}
            </div>
          </section>

          <section className="glass-card-static p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400">Suggested</p>
                <h2 className="mt-1 text-sm font-semibold text-white">People to follow</h2>
              </div>
              <span className="cs-badge bg-white/5 text-slate-200 border border-white/10">{suggestedCards.length} accounts</span>
            </div>

            <div className="mt-4 space-y-2">
              {isLoggedIn && !isGuest ? (
                suggestedCards.length > 0 ? suggestedCards.map((candidate) => {
                  const userId = candidate.userId || candidate.id;
                  const mutualConnections = Number(candidate.mutualCount ?? candidate.mutualConnections ?? 0);
                  return (
                    <div key={userId || candidate.username} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                      <Link to={userId ? `/profile/${userId}` : '/search'} className="flex min-w-0 flex-1 items-center gap-3">
                        <UserAvatar name={getDisplayName(candidate)} src={candidate.profilePicUrl} size="md" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{getDisplayName(candidate)}</p>
                          <p className="truncate text-xs text-slate-400">
                            {mutualConnections > 0 ? `${mutualConnections} mutual connections` : getHandle(candidate)}
                          </p>
                        </div>
                      </Link>
                      <button
                        type="button"
                        onClick={() => userId && followMutation.mutate(userId)}
                        disabled={!userId || followMutation.isPending}
                        className="cs-btn cs-btn-secondary shrink-0 px-3 py-2 text-xs"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Follow
                      </button>
                    </div>
                  );
                }) : <p className="text-sm text-slate-500">No suggestions right now.</p>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
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
