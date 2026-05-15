import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { authApi } from '../../api/authApi';
import UserCard from '../../components/user/UserCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Search, Trash2, Users, Ban, RotateCcw } from 'lucide-react';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [queryText, setQueryText] = useState('');
  const query = useQuery({ queryKey: ['admin-users-list', queryText], queryFn: () => authApi.adminUsers(queryText) });
  const users = Array.isArray(query.data) ? query.data : query.data?.content || [];

  const suspendMutation = useMutation({
    mutationFn: (userId) => authApi.suspendUserById(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User suspended');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (userId) => authApi.reactivateUserById(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User reactivated');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId) => authApi.deleteUserById(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
    },
  });

  if (query.isLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard-surface space-y-5 animate-fade-in">
      <div className="glass-card-static p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Users</h1>
            <p className="text-sm text-slate-400">Review current accounts and manage access.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 transition-all focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={queryText} onChange={(event) => setQueryText(event.target.value)}
              placeholder="Search users by username or name…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {users.length > 0 ? users.map((user) => (
          <UserCard
            key={user.userId || user.id}
            user={user}
            action={
              user.role === 'ADMIN' ? (
                <span className="cs-badge bg-sky-50 text-sky-700 border border-sky-100">Protected admin</span>
              ) : (
                <div className="flex items-center gap-2">
                  {user.active === false ? (
                    <button type="button"
                      onClick={() => reactivateMutation.mutate(user.userId || user.id)}
                      className="cs-btn cs-btn-secondary text-xs py-1.5 px-3">
                      <RotateCcw className="h-3 w-3" /> Reactivate
                    </button>
                  ) : (
                    <button type="button"
                      onClick={() => suspendMutation.mutate(user.userId || user.id)}
                      className="cs-btn cs-btn-secondary text-xs py-1.5 px-3">
                      <Ban className="h-3 w-3" /> Suspend
                    </button>
                  )}
                  <button type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${user.username || user.fullName || 'this user'}?`)) {
                        deactivateMutation.mutate(user.userId || user.id);
                      }
                    }}
                    className="cs-btn cs-btn-danger text-xs py-1.5 px-3">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )
            }
          />
        )) : <EmptyState title="No users found" description="Try another search term." />}
      </div>
    </div>
  );
}
