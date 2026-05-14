import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, ThumbsUp, Send, Flag, Pencil, Trash2 } from 'lucide-react';
import UserAvatar from '../user/UserAvatar';
import { formatDate } from '../../utils/formatDate';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { reportApi } from '../../api/reportApi';
import { promptForReportReason } from '../../utils/reportPrompt';
import { commentApi } from '../../api/commentApi';

export default function CommentItem({ comment, onReply, onLike, depth = 0 }) {
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const canInteract = Boolean(currentUserRole && currentUserRole !== 'GUEST');
  const rawAuthor = comment?.author || comment?.user || {};
  const authorId = rawAuthor?.userId || rawAuthor?.id || comment?.authorId || comment?.userId;
  const author = rawAuthor || {};
  const authorLabel = author.fullName || author.username || author.name || comment?.authorFullName || comment?.authorUsername || (authorId ? `User #${authorId}` : 'User');
  const commentId = comment?.commentId || comment?.id;
  const isOwnComment = Boolean(currentUserId && authorId && String(currentUserId) === String(authorId));
  const canModerate = Boolean(canInteract && (currentUserRole === 'ADMIN' || isOwnComment));
  const canReply = canInteract && depth === 0;

  const repliesQuery = useQuery({
    queryKey: ['comment-replies', commentId],
    queryFn: () => commentApi.getReplies(commentId),
    enabled: Boolean(commentId && depth === 0),
  });
  const replies = Array.isArray(repliesQuery.data) ? repliesQuery.data : repliesQuery.data?.content || [];
  const likeCount = comment?.likesCount ?? comment?.likeCount ?? 0;

  const reportMutation = useMutation({
    mutationFn: (payload) => reportApi.createReport(payload),
    onSuccess: () => toast.success('Report submitted'),
  });

  const updateMutation = useMutation({
    mutationFn: (content) => commentApi.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Comment updated');
      setShowEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Comment removed');
    },
  });

  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(comment?.content || '');

  const handleReportComment = () => {
    if (!canInteract || !commentId || isOwnComment) return;
    const reason = promptForReportReason('comment');
    if (!reason) return;

    reportMutation.mutate({
      targetType: 'COMMENT',
      targetId: commentId,
      targetUserId: authorId || null,
      reason,
    });
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    updateMutation.mutate(editContent.trim());
  };

  const handleDelete = () => {
    if (window.confirm('Delete this comment?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="glass-card p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <UserAvatar name={author.fullName || author.username || comment?.authorFullName || comment?.authorUsername} src={author.profilePicUrl || author.profilePicture || author.avatar || comment?.authorProfilePicUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">{authorLabel}</p>
              <p className="text-[0.7rem] text-slate-400">{formatDate(comment?.createdAt)}</p>
            </div>
            {canInteract ? (
              <button type="button" onClick={() => onLike?.(comment)}
                className="reaction-btn inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-600">
                <ThumbsUp className="h-3.5 w-3.5" />
                {likeCount}
              </button>
            ) : (
              <span className="rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs text-slate-400">{likeCount} likes</span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{comment?.content}</p>
          <div className="mt-3 flex items-center gap-2">
            {canReply ? (
              <button type="button" onClick={() => setShowReply((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
            ) : null}
            {canInteract && !isOwnComment ? (
              <button type="button" onClick={handleReportComment}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                <Flag className="h-3.5 w-3.5" />
                Report
              </button>
            ) : null}
            {canModerate ? (
              <>
                <button type="button" onClick={() => setShowEdit((value) => !value)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button type="button" onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            ) : null}
          </div>
          {showEdit ? (
            <div className="mt-3 animate-slide-down">
              <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} rows={3}
                className="cs-input resize-none text-sm" />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={handleSaveEdit} className="cs-btn cs-btn-primary text-xs py-1.5 px-3" disabled={updateMutation.isPending}>
                  Save
                </button>
                <button type="button" onClick={() => { setShowEdit(false); setEditContent(comment?.content || ''); }}
                  className="cs-btn cs-btn-secondary text-xs py-1.5 px-3">
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          {showReply && canReply ? (
            <div className="mt-3 animate-slide-down">
              <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} rows={2}
                placeholder="Write a reply…" className="cs-input resize-none text-sm" />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={async () => {
                  if (!replyContent.trim()) return;
                  await onReply?.(comment, replyContent);
                  setReplyContent('');
                  setShowReply(false);
                }} className="cs-btn cs-btn-primary text-xs py-1.5 px-3">
                  <Send className="h-3 w-3" /> Reply
                </button>
                <button type="button" onClick={() => { setShowReply(false); setReplyContent(''); }}
                  className="cs-btn cs-btn-secondary text-xs py-1.5 px-3">
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          {depth === 0 && replies.length > 0 ? (
            <div className="mt-4 space-y-3 border-l border-slate-100 pl-4 sm:pl-6">
              {replies.map((reply) => (
                <CommentItem key={reply?.commentId || reply?.id} comment={reply} onReply={onReply} onLike={onLike} depth={depth + 1} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
