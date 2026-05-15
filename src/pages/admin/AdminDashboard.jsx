import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { authApi } from '../../api/authApi';
import { postApi } from '../../api/postApi';
import { searchApi } from '../../api/searchApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, FileText, Hash, Shield, Compass, BarChart3, Flag, Plus, Activity, Layers3 } from 'lucide-react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [tagText, setTagText] = useState('');
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: () => authApi.searchUsers('') });
  const postsQuery = useQuery({ queryKey: ['admin-post-count'], queryFn: postApi.getCount });
  const hashtagsQuery = useQuery({ queryKey: ['admin-trending-tags'], queryFn: searchApi.trendingHashtags });
  const analyticsQuery = useQuery({ queryKey: ['admin-analytics'], queryFn: () => authApi.adminAnalytics() });
  const createTagMutation = useMutation({
    mutationFn: () => searchApi.adminUpsertHashtag(tagText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trending-tags'] });
      setTagText('');
      toast.success('Hashtag added');
    },
  });

  const totalUsers = Array.isArray(usersQuery.data) ? usersQuery.data.length : usersQuery.data?.content?.length || 0;
  const totalPosts = postsQuery.data?.count ?? postsQuery.data?.total ?? 0;
  const totalTags = Array.isArray(hashtagsQuery.data) ? hashtagsQuery.data.length : hashtagsQuery.data?.content?.length || 0;
  const analytics = analyticsQuery.data || {};
  const trendingHashtags = Array.isArray(analytics.trendingHashtags) ? analytics.trendingHashtags : [];

  const stats = [
    { label: 'Total users', value: analytics.totalUsers ?? totalUsers, icon: Users, color: 'from-indigo-500 to-purple-500' },
    { label: 'Total posts', value: analytics.totalPosts ?? totalPosts, icon: FileText, color: 'from-cyan-500 to-blue-500' },
    { label: 'Daily active', value: analytics.dailyActiveUsers ?? 0, icon: Activity, color: 'from-emerald-500 to-teal-500' },
    { label: 'Trending tags', value: analytics.trendingHashtags?.length ?? totalTags, icon: Hash, color: 'from-amber-500 to-orange-500' },
  ];

  const quickLinks = [
    { to: '/admin/users', label: 'Manage users', icon: Users },
    { to: '/admin/posts', label: 'Manage posts', icon: FileText },
    { to: '/admin/reports', label: 'Review reports', icon: Flag },
    { to: '/feed', label: 'Open feed', icon: BarChart3 },
    { to: '/explore', label: 'Open explore', icon: Compass },
  ];

  return (
    <div className="dashboard-surface space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="hero-card p-6 text-white">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
            <Shield className="h-3 w-3" /> Admin
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Monitor users, posts, and platform health.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/80">Use these controls to review the network and keep the core services visible from one dashboard.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="group glass-card-static relative overflow-hidden p-5">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-5`} />
            <div className="relative flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-3xl font-extrabold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-static p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Trending hashtags</h2>
            <p className="mt-1 text-sm text-slate-400">Top hashtags with their post counts.</p>
          </div>
          <span className="cs-badge bg-slate-50 text-slate-600 border border-slate-100">{trendingHashtags.length} tags</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {trendingHashtags.length > 0 ? trendingHashtags.map((tag) => (
            <span key={tag.hashtagId || tag.tag} className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              #{tag.tag}
              <span className="rounded-full bg-white px-2 py-0.5 text-[0.7rem] font-bold text-slate-500">{tag.postCount}</span>
            </span>
          )) : <p className="text-sm text-slate-400">No trending hashtags yet.</p>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Quick actions */}
        <div className="glass-card-static p-5">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Quick actions</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:border-indigo-200 hover:shadow-sm">
                <Icon className="h-4 w-4 text-slate-400" /> {label}
              </Link>
            ))}
          </div>
        </div>

        {/* System hashtags */}
        <div className="glass-card-static p-5">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">System hashtags</h2>
          <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4">
            <p className="text-sm text-slate-600">Create a system tag available across search and moderation.</p>
            <div className="mt-3 flex gap-2">
              <input value={tagText} onChange={(event) => setTagText(event.target.value)}
                placeholder="#announcement" className="cs-input flex-1" />
              <button type="button" onClick={() => createTagMutation.mutate()}
                disabled={createTagMutation.isPending || !tagText.trim()} className="cs-btn cs-btn-primary text-xs shrink-0">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
