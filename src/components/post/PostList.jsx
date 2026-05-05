import PostCard from './PostCard';
import EmptyState from '../common/EmptyState';
import { usePrefetchUsers } from '../../hooks/usePrefetchUsers';

export default function PostList({ posts = [], postCardProps = {} }) {
  usePrefetchUsers(posts);

  if (!posts.length) {
    return <EmptyState title="No posts yet" description="Check back later for new activity." />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post?.postId || post?.id} post={post} {...postCardProps} />
      ))}
    </div>
  );
}
