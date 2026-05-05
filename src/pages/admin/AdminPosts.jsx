import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PostList from '../../components/post/PostList';
import { searchApi } from '../../api/searchApi';
import { Search, FileText } from 'lucide-react';

export default function AdminPosts() {
  const [queryText, setQueryText] = useState('');
  const query = useQuery({
    queryKey: ['admin-posts', queryText],
    queryFn: () => searchApi.adminPosts(queryText),
  });

  const posts = Array.isArray(query.data) ? query.data : query.data?.content || [];

  if (query.isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="glass-card-static p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Post moderation</h1>
            <p className="text-sm text-slate-400">Search any post, add hashtags to the search index, or remove a post.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-glow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={queryText} onChange={(event) => setQueryText(event.target.value)}
              placeholder="Search by content or hashtag…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <div className="cs-badge bg-slate-50 text-slate-600 border border-slate-100 self-center">
            {posts.length} found
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        <PostList posts={posts} postCardProps={{ adminMode: true }} />
      ) : (
        <EmptyState title="No posts found" description="Try a broader search term." />
      )}
    </div>
  );
}