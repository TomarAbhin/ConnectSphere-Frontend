import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import UserCard from '../components/user/UserCard';
import PostList from '../components/post/PostList';
import EmptyState from '../components/common/EmptyState';
import { Search as SearchIcon, Hash } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const normalizedQuery = query.trim();
  const hashtagQuery = normalizedQuery.replace(/^#/, '').trim();
  const searchMode = normalizedQuery.startsWith('#') && hashtagQuery ? 'hashtag' : 'keyword';
  const postsQuery = useQuery({
    queryKey: ['search-posts', query, searchMode],
    queryFn: () => (searchMode === 'hashtag' ? searchApi.hashtagPosts(hashtagQuery) : searchApi.searchPosts(query)),
    enabled: Boolean(query),
  });
  const usersQuery = useQuery({ queryKey: ['search-users', query], queryFn: () => searchApi.searchUsers(query), enabled: Boolean(query) });
  const hashtagsQuery = useQuery({ queryKey: ['trending-hashtags'], queryFn: searchApi.trendingHashtags });

  const posts = Array.isArray(postsQuery.data) ? postsQuery.data : postsQuery.data?.content || [];
  const users = Array.isArray(usersQuery.data) ? usersQuery.data : usersQuery.data?.content || [];
  const hashtags = Array.isArray(hashtagsQuery.data) ? hashtagsQuery.data : hashtagsQuery.data?.content || [];

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(query ? { query } : {});
  };

  const hasQuery = Boolean(query.trim());

  const tabs = useMemo(() => [
    { key: 'posts', label: 'Posts', count: posts.length },
    { key: 'users', label: 'Users', count: users.length },
    { key: 'hashtags', label: 'Hashtags', count: hashtags.length },
  ], [posts.length, users.length, hashtags.length]);

  return (
    <div className="dashboard-surface space-y-5 animate-fade-in">
      {/* Hero */}
      <div className="hero-card p-6 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
            <SearchIcon className="h-3 w-3" /> Search
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Find posts, people, and hashtags fast.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/80">Search updates instantly in one place and switch tabs without losing context.</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="glass-card-static p-4">
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-glow-sm">
            <SearchIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Search…" />
          </div>
          <button type="submit" className="cs-btn cs-btn-primary">Search</button>
        </div>
        {!hasQuery ? <p className="mt-2 text-xs text-slate-400">Enter a search term to populate posts, users, and hashtags.</p> : null}
      </form>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((item) => (
          <button key={item.key} type="button" onClick={() => setTab(item.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              tab === item.key
                ? 'border-white/10 bg-white/10 text-white shadow-md shadow-black/20'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.label}
            {hasQuery ? <span className="text-xs opacity-70">({item.count})</span> : null}
          </button>
        ))}
      </div>

      {/* Results */}
      {tab === 'posts' ? (
        posts.length > 0 ? <PostList posts={posts} /> : hasQuery ? <EmptyState title="No posts found" /> : null
      ) : null}
      {tab === 'users' ? (
        users.length > 0 ? (
          <div className="space-y-3">{users.map((user) => <UserCard key={user.userId || user.id} user={user} />)}</div>
        ) : hasQuery ? <EmptyState title="No users found" /> : null
      ) : null}
      {tab === 'hashtags' ? (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((item) => {
            const tag = typeof item === 'string' ? item : item?.tag;
            return tag ? (
              <Link key={tag} to={`/hashtag/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100 hover:shadow-sm">
                <Hash className="h-3.5 w-3.5" /> {tag}
              </Link>
            ) : null;
          })}
          {hashtags.length === 0 ? <EmptyState title="No hashtags found" /> : null}
        </div>
      ) : null}
    </div>
  );
}
