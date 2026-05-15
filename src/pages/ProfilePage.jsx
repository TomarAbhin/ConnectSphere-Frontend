import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { postApi } from '../api/postApi';
import { followApi } from '../api/followApi';
import { reportApi } from '../api/reportApi';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/user/UserAvatar';
import PostList from '../components/post/PostList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import UserCard from '../components/user/UserCard';
import { Pencil, UserPlus, UserMinus, Users, Heart, Flag } from 'lucide-react';
import { promptForReportReason } from '../utils/reportPrompt';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({ queryKey: ['profile', userId], queryFn: () => authApi.getUserById(userId), enabled: Boolean(userId) });
  const postsQuery = useQuery({ queryKey: ['profile-posts', userId], queryFn: () => postApi.getPostsByUser(userId), enabled: Boolean(userId) });
  const followingQuery = useQuery({ queryKey: ['following-status', userId, currentUser?.userId], queryFn: () => followApi.isFollowing(userId), enabled: Boolean(currentUser?.userId && userId) });
  const countsQuery = useQuery({ queryKey: ['follow-counts', userId], queryFn: () => followApi.counts(userId), enabled: Boolean(userId) });
  const followersQuery = useQuery({ queryKey: ['profile-followers', userId], queryFn: () => followApi.followers(userId), enabled: Boolean(userId) });
  const followingListQuery = useQuery({ queryKey: ['profile-following-list', userId], queryFn: () => followApi.following(userId), enabled: Boolean(userId) });
  const mutualQuery = useQuery({ queryKey: ['profile-mutual', userId, currentUser?.userId], queryFn: () => followApi.mutual(userId), enabled: Boolean(currentUser?.userId && userId) });

  const followMutation = useMutation({ mutationFn: () => followApi.follow(Number(userId)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['following'] }); queryClient.invalidateQueries({ queryKey: ['following-status', userId] }); queryClient.invalidateQueries({ queryKey: ['follow-counts', userId] }); toast.success('Following updated'); } });
  const unfollowMutation = useMutation({ mutationFn: () => followApi.unfollow(Number(userId)), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['following'] }); queryClient.invalidateQueries({ queryKey: ['following-status', userId] }); queryClient.invalidateQueries({ queryKey: ['follow-counts', userId] }); toast.success('Following updated'); } });
  const reportMutation = useMutation({ mutationFn: (p) => reportApi.createReport(p), onSuccess: () => { toast.success('Report submitted'); } });

  const handleReportProfile = () => {
    if (!userId || !currentUser || currentUser.role === 'GUEST' || isOwnProfile) return;
    const reason = promptForReportReason('account');
    if (!reason) return;
    reportMutation.mutate({ targetType: 'USER', targetId: Number(userId), targetUserId: Number(userId), reason });
  };

  if (profileQuery.isLoading) return <LoadingSpinner />;
  if (profileQuery.isError) return <EmptyState title="Profile unavailable" description="Could not load this profile." />;

  const profile = profileQuery.data || {};
  const isProfileActive = profile.active !== false;
  const posts = Array.isArray(postsQuery.data) ? postsQuery.data : postsQuery.data?.content || [];
  const isOwnProfile = String(currentUser?.userId) === String(userId);
  const isGuest = currentUser?.role === 'GUEST';
  const isFollowing = Boolean(followingQuery.data?.following ?? followingQuery.data?.isFollowing ?? followingQuery.data);
  const counts = countsQuery.data || {};
  const followers = Array.isArray(followersQuery.data) ? followersQuery.data : followersQuery.data?.content || [];
  const following = Array.isArray(followingListQuery.data) ? followingListQuery.data : followingListQuery.data?.content || [];
  const mutual = Array.isArray(mutualQuery.data) ? mutualQuery.data : mutualQuery.data?.content || [];
  const profileName = profile.fullName || profile.username || `User #${userId}`;

  const statCards = [
    { label: 'Followers', value: counts.followerCount ?? followers.length, icon: Users, color: 'from-indigo-500 to-purple-500' },
    { label: 'Following', value: counts.followingCount ?? following.length, icon: UserPlus, color: 'from-cyan-500 to-blue-500' },
    { label: 'Mutual', value: counts.mutualCount ?? mutual.length, icon: Heart, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="dashboard-surface space-y-5 animate-fade-in">
      <section className="glass-card overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />
        <div className="px-6 pb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between -mt-10">
            <div className="flex items-end gap-4">
              <div className="rounded-full ring-4 ring-white shadow-md"><UserAvatar name={profile.fullName || profile.username} src={profile.profilePicUrl} size="xl" /></div>
              <div className="pb-1">
                <h1 className="text-2xl font-extrabold text-slate-800">{profileName}</h1>
                <p className="text-sm text-slate-400">{profile.username ? `@${profile.username}` : 'Profile'}</p>
                {!isProfileActive ? <span className="cs-badge mt-2 bg-rose-50 text-rose-600 border border-rose-200">Suspended</span> : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwnProfile ? (isGuest ? <span className="cs-badge bg-slate-100 text-slate-500">Guest</span> : <Link to="/profile/edit" className="cs-btn cs-btn-primary text-xs"><Pencil className="h-3.5 w-3.5" /> Edit Profile</Link>)
                : isGuest || !isProfileActive ? <span className="cs-badge bg-slate-100 text-slate-500">Read-only</span>
                : isFollowing ? (<><button onClick={() => unfollowMutation.mutate()} className="cs-btn cs-btn-secondary text-xs"><UserMinus className="h-3.5 w-3.5" /> Unfollow</button><button onClick={handleReportProfile} className="cs-btn cs-btn-secondary text-xs"><Flag className="h-3.5 w-3.5" /> Report</button></>)
                : (<><button onClick={() => followMutation.mutate()} className="cs-btn cs-btn-primary text-xs"><UserPlus className="h-3.5 w-3.5" /> Follow</button><button onClick={handleReportProfile} className="cs-btn cs-btn-secondary text-xs"><Flag className="h-3.5 w-3.5" /> Report</button></>)}
            </div>
          </div>
          {profile.bio ? <p className="mt-4 text-sm text-slate-500 max-w-2xl">{profile.bio}</p> : null}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white shadow-sm`}><Icon className="h-5 w-5" /></div>
                <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="text-xl font-bold text-slate-800">{value}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section><h2 className="mb-3 text-lg font-bold text-slate-700">Posts</h2><PostList posts={posts} />{!postsQuery.isLoading && posts.length === 0 ? <EmptyState title="No posts yet" description="Posts will appear here." /> : null}</section>
      <section className="grid gap-4 lg:grid-cols-3">
        {[{ title: 'Followers', data: followers, et: 'No followers yet', ed: 'Followers will appear here.' },{ title: 'Following', data: following, et: 'Not following anyone', ed: 'Followed accounts appear here.' },{ title: 'Mutual', data: mutual, et: 'No mutual follows', ed: 'Mutual follows appear here.' }].map(({ title, data, et, ed }) => (
          <div key={title} className="glass-card-static p-4"><h2 className="text-sm font-bold text-slate-700 mb-3">{title}</h2><div className="space-y-2">{data.length > 0 ? data.slice(0, 6).map((u) => <UserCard key={u.userId || u.id} user={u} />) : <EmptyState title={et} description={ed} />}</div></div>
        ))}
      </section>
    </div>
  );
}
