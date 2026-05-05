import { useQuery } from '@tanstack/react-query';
import CreatePostForm from '../components/post/CreatePostForm';
import PostList from '../components/post/PostList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { postApi } from '../api/postApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Compass, BookOpen, Bell, Rss } from 'lucide-react';

export default function FeedPage() {
  const { isLoggedIn, user } = useAuth();
  const isGuest = user?.role === 'GUEST';
  const { data, isLoading } = useQuery({ queryKey: ['feed'], queryFn: postApi.getFeed });
  const posts = Array.isArray(data) ? data : data?.content || [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="space-y-5">
        {/* Hero */}
        <div className="hero-card p-6 text-white animate-fade-in">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
              <Rss className="h-3 w-3" />
              {isLoggedIn ? 'Your feed' : 'Public feed'}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
              {isLoggedIn ? 'See what your network is sharing.' : 'Browse public posts from the community.'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/80">
              {isLoggedIn ? 'Create a post, tune visibility, and keep up with reactions and comments.' : 'Sign in to follow people, react, and post your own updates.'}
            </p>
          </div>
        </div>

        {isLoggedIn && !isGuest ? <CreatePostForm /> : null}
        {isLoading ? <LoadingSpinner /> : <PostList posts={posts} />}
        {!isLoading && posts.length === 0 ? (
          <EmptyState
            title={isLoggedIn ? (isGuest ? 'Guest feed is read-only' : 'Your feed is empty') : 'No public posts yet'}
            description={isLoggedIn ? (isGuest ? 'Guest accounts can browse public posts only.' : 'Follow people to see their posts here.') : 'Public posts will appear here when available.'}
          />
        ) : null}
      </section>

      <aside className="space-y-5">
        <div className="glass-card-static p-5 animate-fade-in">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Quick links</h2>
          <div className="mt-4 grid gap-2">
            {[
              { to: '/explore', label: 'Explore public posts', icon: Compass },
              { to: '/stories', label: 'Open stories', icon: BookOpen },
              { to: '/notifications', label: 'View notifications', icon: Bell },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 transition hover:bg-white hover:border-brand-200 hover:shadow-sm">
                <Icon className="h-4 w-4 text-slate-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
