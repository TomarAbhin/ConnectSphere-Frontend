import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/searchApi';
import PostList from '../components/post/PostList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Hash } from 'lucide-react';

export default function HashtagPage() {
  const { tag } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['hashtag-posts', tag],
    queryFn: () => searchApi.hashtagPosts(tag),
    enabled: Boolean(tag),
  });

  const posts = Array.isArray(data) ? data : data?.content || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="hero-card p-6 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
            <Hash className="h-3 w-3" /> Hashtag
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight">#{tag}</h1>
          <p className="mt-2 text-sm text-indigo-100/80">{posts.length} post{posts.length !== 1 ? 's' : ''} tagged with #{tag}</p>
        </div>
      </div>

      {posts.length > 0 ? <PostList posts={posts} /> : <EmptyState title="No posts with this hashtag" description="Posts tagged with this hashtag will appear here." />}
    </div>
  );
}
