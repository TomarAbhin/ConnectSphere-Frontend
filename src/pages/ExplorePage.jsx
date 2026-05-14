import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PostList from '../components/post/PostList';
import { postApi } from '../api/postApi';
import { searchApi } from '../api/searchApi';
import { TrendingUp, Search, UserPlus } from 'lucide-react';

export default function ExplorePage() {
  const postsQuery = useQuery({ queryKey: ['explore-posts-public'], queryFn: () => postApi.getFeed() });
  const tagsQuery = useQuery({ queryKey: ['trending-hashtags'], queryFn: searchApi.trendingHashtags });

  const posts = Array.isArray(postsQuery.data) ? postsQuery.data : postsQuery.data?.content || [];
  const hashtags = Array.isArray(tagsQuery.data) ? tagsQuery.data : tagsQuery.data?.content || [];
  const totalTags = hashtags.length;

  return (
    <div className="dashboard-surface grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="space-y-5">
        {/* Hero */}
        <div className="hero-card p-6 text-white animate-fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
              <TrendingUp className="h-3 w-3" /> Explore
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Browse public activity across ConnectSphere.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/80">Discover posts, trends, and people without signing in.</p>
          </div>
        </div>
        {postsQuery.isLoading ? <LoadingSpinner /> : <PostList posts={posts} />}
        {!postsQuery.isLoading && posts.length === 0 ? <EmptyState title="No public posts found" /> : null}
      </section>

      <aside className="space-y-5">
        {/* Trending */}
        <div className="glass-card-static p-5 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800">Trending hashtags</h2>
            <span className="cs-badge bg-emerald-50 text-emerald-700 border border-emerald-100">{totalTags} live</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {hashtags.map((item) => {
              const tag = typeof item === 'string' ? item : item?.tag;
              return tag ? (
                <Link key={tag} to={`/hashtag/${encodeURIComponent(tag)}`}
                  className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 hover:shadow-sm">
                  #{tag}
                </Link>
              ) : null;
            })}
            {!tagsQuery.isLoading && hashtags.length === 0 ? <span className="text-sm text-slate-400">No trending tags yet.</span> : null}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card-static p-5 animate-fade-in">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <Link to="/search" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 transition hover:bg-white hover:border-brand-200 hover:shadow-sm">
              <Search className="h-4 w-4 text-slate-400" /> Open search
            </Link>
            <Link to="/register" className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 transition hover:bg-white hover:border-brand-200 hover:shadow-sm">
              <UserPlus className="h-4 w-4 text-slate-400" /> Create an account
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
