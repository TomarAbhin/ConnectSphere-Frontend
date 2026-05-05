import CommentItem from './CommentItem';
import EmptyState from '../common/EmptyState';

export default function CommentList({ comments = [], onReply, onLike }) {
  if (!comments.length) {
    return <EmptyState title="No comments yet" description="Be the first to comment." />;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment?.commentId || comment?.id} comment={comment} onReply={onReply} onLike={onLike} />
      ))}
    </div>
  );
}
