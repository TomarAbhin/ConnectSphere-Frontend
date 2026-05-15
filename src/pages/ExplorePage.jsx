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

  return (
    <div className="dashboard-surface grid gap-5 lg:grid-cols-[1fr_300px]">
      <section className="space-y-4">
        <div className="hero-card p-6 text-white animate-fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest"><TrendingUp className="h-3 w-3" /> Explore</div>
            <h1 className="mt-3 text-2xl font-extrabold">Browse public activity across ConnectSphere.</h1>
            <p className="mt-1 max-w-2xl text-sm text-white/70">Discover posts, trends, and people without signing in.</p>
          </div>
        </div>
        {postsQuery.isLoading ? <LoadingSpinner /> : <PostList posts={posts} />}
        {!postsQuery.isLoading && posts.length === 0 ? <EmptyState title="No public posts found" /> : null}
      </section>
      <aside className="space-y-4">
        <div className="glass-card-static p-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700">Trending hashtags</h2>
            <span className="cs-badge bg-emerald-50 text-emerald-600 border border-emerald-200">{hashtags.length} live</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hashtags.map((item) => { const tag = typeof item === 'string' ? item : item?.tag; return tag ? <Link key={tag} to={`/hashtag/${encodeURIComponent(tag)}`} className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100">#{tag}</Link> : null; })}
            {!tagsQuery.isLoading && hashtags.length === 0 ? <span className="text-sm text-slate-400">No trending tags yet.</span> : null}
          </div>
        </div>
        <div className="glass-card-static p-4 animate-fade-in">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quick actions</h2>
          <div className="mt-3 grid gap-2">
            <Link to="/search" className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"><Search className="h-4 w-4 text-slate-400" /> Open search</Link>
            <Link to="/register" className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"><UserPlus className="h-4 w-4 text-slate-400" /> Create an account</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
