import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../hooks/useAuth';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatDate';

const TYPE_STYLES = {
  LIKE: 'bg-rose-50 text-rose-500 border-rose-200',
  COMMENT: 'bg-blue-50 text-blue-500 border-blue-200',
  REPLY: 'bg-cyan-50 text-cyan-500 border-cyan-200',
  FOLLOW: 'bg-emerald-50 text-emerald-500 border-emerald-200',
  MENTION: 'bg-amber-50 text-amber-500 border-amber-200',
  SYSTEM: 'bg-indigo-50 text-indigo-500 border-indigo-200',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const navigate = useNavigate();

  const notificationsQuery = useQuery({ queryKey: ['notifications', user?.userId], queryFn: () => notificationApi.getByRecipient(user?.userId), enabled: Boolean(user?.userId) });
  const markAllRead = useMutation({ mutationFn: () => notificationApi.markAllRead(user?.userId), onSuccess: () => { setUnreadCount(0); queryClient.invalidateQueries({ queryKey: ['notifications'] }); } });
  const markRead = useMutation({ mutationFn: (id) => notificationApi.markRead(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });

  const notifications = Array.isArray(notificationsQuery.data) ? notificationsQuery.data : notificationsQuery.data?.content || [];
  if (notificationsQuery.isLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard-surface space-y-4 animate-fade-in">
      <div className="glass-card-static flex items-center justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Notifications</h1>
          <p className="mt-0.5 text-sm text-slate-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => markAllRead.mutate()} className="cs-btn cs-btn-secondary text-xs"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>
      </div>
      {notifications.length === 0 ? <EmptyState title="No notifications" icon={Bell} description="You're all caught up!" /> : null}
      <div className="space-y-2">
        {notifications.map((n) => {
          const typeStyle = TYPE_STYLES[n.type] || TYPE_STYLES.SYSTEM;
          const isRead = n.isRead || n.read;
          return (
            <button key={n.id || n.notificationId} onClick={async () => { await markRead.mutateAsync(n.id || n.notificationId); if (n.deepLink) navigate(n.deepLink); }}
              className={`glass-card w-full p-4 text-left transition ${isRead ? 'opacity-50' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${typeStyle}`}><Bell className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
                {!isRead ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
