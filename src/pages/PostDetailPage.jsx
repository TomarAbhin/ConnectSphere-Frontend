import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { postApi } from '../api/postApi';
import { commentApi } from '../api/commentApi';
import { likeApi } from '../api/likeApi';
import PostCard from '../components/post/PostCard';
import CommentList from '../components/comment/CommentList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function PostDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const { user } = useAuth();
  const canWrite = Boolean(user && user.role !== 'GUEST');

  const postQuery = useQuery({ queryKey: ['post', id], queryFn: () => postApi.getPost(id), enabled: Boolean(id) });
  const commentsQuery = useQuery({ queryKey: ['comments', id], queryFn: () => commentApi.getCommentsByPost(id), enabled: Boolean(id) });

  const addComment = useMutation({
    mutationFn: (payload) => commentApi.addComment(payload),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment added');
    },
  });

  const likeComment = useMutation({
    mutationFn: async (comment) => {
      const commentId = comment?.commentId || comment?.id;
      if (!commentId) {
        throw new Error('Comment id is required');
      }

      const likedState = await likeApi.hasLiked(commentId, 'COMMENT');
      if (likedState?.liked) {
        await likeApi.unlike(commentId, 'COMMENT');
        return { action: 'unliked' };
      }

      await likeApi.like({ targetType: 'COMMENT', targetId: commentId, reactionType: 'LIKE' });
      return { action: 'liked' };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['comment-replies'] });
      if (result?.action === 'unliked') {
        toast.success('Comment unliked');
      } else {
        toast.success('Comment liked');
      }
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    await addComment.mutateAsync({ postId: Number(id), content });
  };

  const handleReply = async (comment, replyText) => {
    if (!replyText?.trim()) return;
    const parentCommentId = comment?.commentId || comment?.id;
    // send both parentCommentId and parentId for backend compatibility
    await addComment.mutateAsync({ postId: Number(id), content: replyText, parentCommentId, parentId: parentCommentId });
  };

  if (postQuery.isLoading) return <LoadingSpinner />;
  if (postQuery.isError) return <EmptyState title="Post unavailable" description="The post could not be loaded right now." />;

  return (
    <div className="space-y-5 animate-fade-in">
      <PostCard post={postQuery.data} />

      <section className="glass-card-static p-5">
        <h2 className="text-base font-bold text-slate-800">Comments</h2>
        {canWrite ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3}
              placeholder="Add a comment…" className="cs-input resize-none" />
            <div className="flex justify-end">
              <button type="submit" disabled={addComment.isPending} className="cs-btn cs-btn-primary text-xs">
                <Send className="h-3.5 w-3.5" /> Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Guest accounts can read comments but cannot write them.
          </div>
        )}
        <div className="mt-5">
          <CommentList comments={Array.isArray(commentsQuery.data) ? commentsQuery.data : commentsQuery.data?.content || []} onReply={handleReply} onLike={(comment) => likeComment.mutate(comment)} />
        </div>
      </section>
    </div>
  );
}
