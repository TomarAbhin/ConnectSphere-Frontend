import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { notificationApi } from '../../api/notificationApi';
import { postApi } from '../../api/postApi';
import { reportApi } from '../../api/reportApi';
import { searchApi } from '../../api/searchApi';
import { Users, FileText, Hash, Send, Mail, Flag, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function AdminReports() {
  const queryClient = useQueryClient();
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [subject, setSubject] = useState('Platform update');
  const [message, setMessage] = useState('');

  const usersQuery = useQuery({ queryKey: ['admin-reports-users'], queryFn: () => authApi.searchUsers('') });
  const postsQuery = useQuery({ queryKey: ['admin-reports-post-count'], queryFn: postApi.getCount });
  const tagsQuery = useQuery({ queryKey: ['admin-reports-tags'], queryFn: searchApi.trendingHashtags });
  const reportsQuery = useQuery({ queryKey: ['admin-reports-list'], queryFn: () => reportApi.getAllReports() });

  const users = Array.isArray(usersQuery.data) ? usersQuery.data : usersQuery.data?.content || [];
  const topUsers = useMemo(() => users.slice(0, 8), [users]);
  const reports = Array.isArray(reportsQuery.data) ? reportsQuery.data : reportsQuery.data?.content || [];
  const reportStats = useMemo(() => ({
    total: reports.length,
    open: reports.filter((item) => (item.status || 'OPEN') === 'OPEN').length,
    reviewed: reports.filter((item) => item.status === 'REVIEWED').length,
    resolved: reports.filter((item) => item.status === 'RESOLVED').length,
  }), [reports]);

  const sendBulkMutation = useMutation({
    mutationFn: () => notificationApi.sendBulkNotification({
      recipientIds: selectedRecipients,
      actorId: null,
      actionType: 'SYSTEM',
      targetType: 'SYSTEM',
      targetId: null,
      message: message.trim(),
    }),
    onSuccess: () => {
      toast.success('Bulk notification sent');
      setMessage('');
      setSelectedRecipients([]);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: () => notificationApi.sendEmailAlert({
      recipientId: selectedRecipients[0],
      subject: subject.trim(),
      body: message.trim(),
    }),
    onSuccess: () => {
      toast.success('Email alert sent');
      setMessage('');
      setSelectedRecipients([]);
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, status, adminNotes }) => reportApi.updateReportStatus(reportId, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports-list'] });
      toast.success('Report updated');
    },
  });

  const totalPosts = postsQuery.data?.count ?? postsQuery.data?.total ?? 0;
  const trendingTags = Array.isArray(tagsQuery.data) ? tagsQuery.data : tagsQuery.data?.content || [];
  const statusBadgeClass = {
    OPEN: 'bg-amber-50 text-amber-700 border-amber-100',
    REVIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const toggleRecipient = (userId) => {
    setSelectedRecipients((current) => (
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    ));
  };

  const stats = [
    { label: 'Active users', value: users.length, icon: Users, color: 'from-indigo-500 to-purple-500' },
    { label: 'Posts', value: totalPosts, icon: FileText, color: 'from-cyan-500 to-blue-500' },
    { label: 'Trending tags', value: trendingTags.length, icon: Hash, color: 'from-amber-500 to-orange-500' },
    { label: 'Open reports', value: reportStats.open, icon: ShieldAlert, color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="dashboard-surface space-y-6 animate-fade-in">
      <div className="glass-card-static p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Moderation Console</h1>
            <p className="text-sm text-slate-400">Broadcast alerts, email escalations, and review operational signals.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card-static relative overflow-hidden p-5 group">
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
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Incoming reports</h2>
            <p className="mt-1 text-sm text-slate-400">Review content reports submitted by registered users.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="cs-badge bg-slate-50 text-slate-600 border border-slate-100">{reportStats.total} total</span>
            <span className="cs-badge bg-amber-50 text-amber-700 border border-amber-100">{reportStats.open} open</span>
            <span className="cs-badge bg-indigo-50 text-indigo-700 border border-indigo-100">{reportStats.reviewed} reviewed</span>
            <span className="cs-badge bg-emerald-50 text-emerald-700 border border-emerald-100">{reportStats.resolved} resolved</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {reportsQuery.isLoading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-400">Loading reports…</div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.reportId} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`cs-badge border ${statusBadgeClass[report.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {report.status || 'OPEN'}
                      </span>
                      <span className="cs-badge bg-slate-50 text-slate-600 border border-slate-100">{report.targetType}</span>
                      <span className="text-xs text-slate-400">Target #{report.targetId}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">Reason</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{report.reason}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      Reporter #{report.reporterId}
                      {report.targetUserId != null ? ` · User #${report.targetUserId}` : ''}
                      {report.createdAt ? ` · ${new Date(report.createdAt).toLocaleString()}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => updateReportMutation.mutate({ reportId: report.reportId, status: 'REVIEWED' })}
                      className="cs-btn cs-btn-secondary text-xs" disabled={updateReportMutation.isPending}>
                      <AlertTriangle className="h-3.5 w-3.5" /> Mark reviewed
                    </button>
                    <button type="button" onClick={() => updateReportMutation.mutate({ reportId: report.reportId, status: 'RESOLVED' })}
                      className="cs-btn cs-btn-primary text-xs" disabled={updateReportMutation.isPending}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                    <button type="button" onClick={() => updateReportMutation.mutate({ reportId: report.reportId, status: 'REJECTED' })}
                      className="cs-btn cs-btn-danger text-xs" disabled={updateReportMutation.isPending}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </div>

                {report.adminNotes ? (
                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">Admin notes:</span> {report.adminNotes}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-400">
              No user reports yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Escalation workflow */}
        <div className="glass-card-static p-5">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-4">Escalation workflow</h2>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Email subject" className="cs-input" />
              <input value={selectedRecipients.join(', ')} readOnly placeholder="Selected recipient ids" className="cs-input opacity-70" />
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5}
              placeholder="Write the alert or escalation message…" className="cs-input resize-none" />
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={!selectedRecipients.length || !message.trim()}
                onClick={() => sendBulkMutation.mutate()} className="cs-btn cs-btn-primary text-xs">
                <Send className="h-3.5 w-3.5" /> Send bulk notification
              </button>
              <button type="button" disabled={selectedRecipients.length !== 1 || !subject.trim() || !message.trim()}
                onClick={() => sendEmailMutation.mutate()} className="cs-btn cs-btn-secondary text-xs">
                <Mail className="h-3.5 w-3.5" /> Send email alert
              </button>
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="glass-card-static p-5">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 mb-4">Recipients</h2>
          <div className="max-h-[28rem] space-y-2 overflow-auto pr-1">
            {topUsers.map((user) => (
              <label key={user.userId || user.id}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                  selectedRecipients.includes(user.userId || user.id)
                    ? 'border-indigo-300 bg-indigo-50/60 text-indigo-800'
                    : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-white'
                }`}
              >
                <span>
                  <span className="font-semibold text-slate-800">{user.fullName || user.username}</span>
                  <span className="ml-2 text-slate-400">@{user.username}</span>
                </span>
                <input type="checkbox" checked={selectedRecipients.includes(user.userId || user.id)}
                  onChange={() => toggleRecipient(user.userId || user.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
