import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Flag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { reportApi } from '../../api/reportApi';
import { promptForReportReason } from '../../utils/reportPrompt';
import UserAvatar from './UserAvatar';

export default function UserCard({ user, action }) {
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const isAdminAccount = user?.role === 'ADMIN';
  const canReport = Boolean(currentUserId && currentUserRole !== 'GUEST' && user?.userId && String(currentUserId) !== String(user.userId));

  const reportMutation = useMutation({
    mutationFn: (payload) => reportApi.createReport(payload),
    onSuccess: () => toast.success('Report submitted'),
  });

  const handleReportUser = () => {
    if (!canReport) return;
    const reason = promptForReportReason('account');
    if (!reason) return;
    reportMutation.mutate({ targetType: 'USER', targetId: user.userId, targetUserId: user.userId, reason });
  };

  const displayName = user?.fullName || user?.username || 'Removed user';
  return (
    <div className="glass-card flex items-center justify-between gap-3 p-4 animate-fade-in">
      <div className="flex items-center gap-3 min-w-0">
        <UserAvatar name={user?.fullName || user?.username} src={user?.profilePicUrl} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">{displayName}</p>
          {user?.username ? <p className="truncate text-sm text-slate-400">@{user.username}</p> : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {user?.role ? (
              <span className={`cs-badge ${isAdminAccount ? 'bg-sky-50 text-sky-600 border border-sky-200' : 'bg-indigo-50 text-indigo-600'}`}>
                {user.role}
              </span>
            ) : null}
            <span className={`cs-badge ${user?.active === false ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
              {user?.active === false ? 'Suspended' : 'Active'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        {canReport ? (
          <button type="button" onClick={handleReportUser} className="cs-btn cs-btn-secondary text-xs">
            <Flag className="h-3.5 w-3.5" /> Report
          </button>
        ) : null}
        {user?.userId ? (
          <Link to={`/profile/${user.userId}`} className="cs-btn cs-btn-primary text-xs">View</Link>
        ) : null}
      </div>
    </div>
  );
}
