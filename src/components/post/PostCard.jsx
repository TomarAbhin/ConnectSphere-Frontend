import { useEffect, useMemo, useState } from 'react';
import { followApi } from '../../api/followApi';
import { postApi } from '../../api/postApi';
import { reportApi } from '../../api/reportApi';
import { searchApi } from '../../api/searchApi';
import { Link } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Pencil, Trash2, UserPlus, UserMinus, Copy, Share2, Flag } from 'lucide-react';
import { Heart } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import UserAvatar from '../user/UserAvatar';
import PostVisibilityBadge from './PostVisibilityBadge';
import { formatDate } from '../../utils/formatDate';
import ReactionPicker from '../common/ReactionPicker';
import { likeApi } from '../../api/likeApi';
import { useAuthStore } from '../../store/authStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { promptForReportReason } from '../../utils/reportPrompt';

function parseHashtags(value) {
  return Array.from(new Set(
    (value || '')
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^#/, '').toLowerCase())
      .filter(Boolean)
  ));
}

const REACTION_EMOJI = { LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮', SAD: '😢', ANGRY: '😡' };

export default function PostCard({ post, onEdit, onDelete, onReact, adminMode = false }) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const currentUserId = useAuthStore((state) => state.user?.userId);
  const currentUserRole = useAuthStore((state) => state.user?.role);
  const isGuest = !accessToken || currentUserRole === 'GUEST';
  const postId = post?.postId || post?.id;
  const rawAuthor = post?.author || post?.user || {};
  const authorId = rawAuthor?.userId || rawAuthor?.id || post?.authorId || post?.userId;
  // Prefer snapshot fields returned with the post (authorUsername/authorFullName/authorProfilePicUrl)
  const snapshotPresent = Boolean(post?.authorUsername || post?.authorFullName || post?.authorProfilePicUrl);
  const snapshotAuthor = snapshotPresent ? {
    userId: authorId,
    username: post?.authorUsername,
    fullName: post?.authorFullName,
    profilePicUrl: post?.authorProfilePicUrl
  } : null;
  // Avoid calling the auth service from the UI. Prefer snapshot fields embedded
  // in the post; fall back to any local author object available. This prevents
  // CORS/redirect noise when the auth service redirects unauthenticated calls.
  const author = snapshotAuthor || rawAuthor || {};
  const hasResolvedAuthor = Boolean(author?.username || author?.fullName || snapshotPresent || rawAuthor?.username || rawAuthor?.fullName);
  const isOwnPost = Boolean(currentUserId && authorId && String(currentUserId) === String(authorId));
  const hashtags = useMemo(() => {
    const values = Array.isArray(post?.hashtags) ? post.hashtags : [];
    return Array.from(new Set(values.map((tag) => (typeof tag === 'string' ? tag.replace(/^#/, '').trim().toLowerCase() : '')).filter(Boolean)));
  }, [post?.hashtags]);
  const [hashtagDraft, setHashtagDraft] = useState('');
  const [adminContentDraft, setAdminContentDraft] = useState(post?.content || post?.caption || '');
  const [showMore, setShowMore] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    if (!adminMode) return;
    setHashtagDraft(hashtags.join(', '));
    setAdminContentDraft(post?.content || post?.caption || '');
  }, [adminMode, hashtags, postId]);

  const mediaUrls = useMemo(() => {
    const sources = [];
    const pushMedia = (value) => {
      const resolved = resolveMediaUrl(value);
      if (resolved) sources.push(resolved);
    };
    pushMedia(post?.mediaUrl);
    pushMedia(post?.imageUrl);
    if (Array.isArray(post?.mediaUrls)) {
      post.mediaUrls.forEach((item) => {
        if (typeof item === 'string' && item.trim()) pushMedia(item);
        if (item && typeof item === 'object') pushMedia(item.url || item.mediaUrl || item.path);
      });
    }
    if (Array.isArray(post?.media)) {
      post.media.forEach((item) => {
        if (typeof item === 'string' && item.trim()) pushMedia(item);
        if (item && typeof item === 'object') pushMedia(item.url || item.mediaUrl || item.path);
      });
    }
    return [...new Set(sources)];
  }, [post]);

  const isVideoUrl = (url) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || '');

  const reactionSummaryQuery = useQuery({
    queryKey: ['post-reaction-summary', postId],
    queryFn: () => likeApi.summary(postId, 'POST'),
    enabled: Boolean(postId && accessToken),
  });
  const likesByUserQuery = useQuery({
    queryKey: ['post-likes-by-user', currentUserId],
    queryFn: () => likeApi.getLikesByUser(currentUserId),
    enabled: Boolean(accessToken && currentUserId),
  });
  const followingQuery = useQuery({
    queryKey: ['is-following', authorId],
    queryFn: () => followApi.isFollowing(authorId),
    enabled: Boolean(accessToken && currentUserId && authorId && !isOwnPost),
  });
  const reactionSummary = reactionSummaryQuery.data || post?.reactionSummary || post?.likesSummary || {};
  const commentsCount = post?.commentCount ?? post?.commentsCount ?? 0;
  const currentLike = useMemo(() => {
    const likes = Array.isArray(likesByUserQuery.data) ? likesByUserQuery.data : [];
    return likes.find((like) => String(like?.targetId) === String(postId) && like?.targetType === 'POST');
  }, [likesByUserQuery.data, postId]);
  const isFollowing = Boolean(followingQuery.data?.following ?? followingQuery.data?.isFollowing ?? followingQuery.data);

  const followMutation = useMutation({
    mutationFn: () => followApi.follow(authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', authorId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success('Followed user');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', authorId] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      toast.success('Unfollowed user');
    },
  });

  const adminIndexMutation = useMutation({
    mutationFn: async () => searchApi.adminIndexPost({
      postId, authorId,
      content: adminContentDraft.trim(),
      hashtags: parseHashtags(hashtagDraft),
      visibility: post?.visibility,
      deleted: Boolean(post?.deleted),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trending-tags'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-tags'] });
      queryClient.invalidateQueries({ queryKey: ['trending-hashtags'] });
      queryClient.invalidateQueries({ queryKey: ['hashtag-posts'] });
      toast.success('Hashtags updated');
    },
  });

  const adminDeleteMutation = useMutation({
    mutationFn: () => postApi.adminDeletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-post-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-post-count'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['hashtag-posts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Post removed');
    },
  });

  const adminUpdateMutation = useMutation({
    mutationFn: async () => {
      const updated = await postApi.adminUpdatePost(postId, {
        content: adminContentDraft.trim(),
        visibility: post?.visibility,
        mediaUrls: post?.mediaUrls || [],
        postType: post?.postType,
      });
      try {
        await searchApi.adminIndexPost({
          postId,
          authorId,
          content: adminContentDraft.trim(),
          hashtags: parseHashtags(hashtagDraft),
          visibility: updated?.visibility || post?.visibility,
          deleted: Boolean(updated?.deleted ?? post?.deleted),
        });
      } catch (error) {
        // Keep the post update successful even if the search index refresh fails.
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['explore'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      toast.success('Post updated');
    },
  });

  const reportMutation = useMutation({
    mutationFn: (payload) => reportApi.createReport(payload),
    onSuccess: () => {
      toast.success('Report submitted');
    },
  });

  const reactMutation = useMutation({
    mutationFn: async ({ reactionType, action }) => {
      if (action === 'unlike') return likeApi.unlike(postId, 'POST');
      if (action === 'toggleLike') {
        if (!currentLike) return likeApi.like({ targetType: 'POST', targetId: postId, reactionType: 'LIKE' });
        if (currentLike.reactionType === 'LIKE') return likeApi.unlike(postId, 'POST');
        return likeApi.changeReaction(currentLike.likeId, { reactionType: 'LIKE' });
      }
      if (action === 'setReaction') {
        if (currentLike?.likeId) return likeApi.changeReaction(currentLike.likeId, { reactionType });
        return likeApi.like({ targetType: 'POST', targetId: postId, reactionType });
      }
      throw new Error('Unknown reaction action');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-reaction-summary', postId] });
      queryClient.invalidateQueries({ queryKey: ['post-likes-by-user', currentUserId] });
    },
  });

  const handleHeartClick = (e) => {
    e?.preventDefault?.();
    reactMutation.mutate({ action: 'toggleLike' });
  };

  const handleSelectReaction = (reactionType) => {
    if (!reactionType) return;
    reactMutation.mutate({ action: 'setReaction', reactionType });
    setShowReactions(false);
  };

  const handleReportPost = () => {
    if (!postId || !currentUserId || isGuest || isOwnPost) return;
    const reason = promptForReportReason('post');
    if (!reason) return;

    reportMutation.mutate({
      targetType: 'POST',
      targetId: postId,
      targetUserId: authorId || null,
      reason,
    });
    setShowMore(false);
  };

  const reactionCounts = [
    ['LIKE', reactionSummary.likeCount],
    ['LOVE', reactionSummary.loveCount],
    ['HAHA', reactionSummary.hahaCount],
    ['WOW', reactionSummary.wowCount],
    ['SAD', reactionSummary.sadCount],
    ['ANGRY', reactionSummary.angryCount],
  ].filter(([, count]) => Number(count || 0) > 0);

  const totalReactions = reactionCounts.reduce((sum, [, c]) => sum + Number(c || 0), 0);

  return (
    <article className="glass-card overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        {authorId && hasResolvedAuthor ? (
          <Link to={`/profile/${authorId}`} className="group flex items-center gap-3 rounded-xl outline-none">
            <UserAvatar name={author.fullName || author.username} src={author.profilePicUrl} />
            <div>
              <p className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">{author.fullName || author.username}</p>
              <p className="text-xs text-slate-400">{formatDate(post?.createdAt)}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <UserAvatar name="Removed user" src={author.profilePicUrl} />
            <div>
              <p className="font-semibold text-slate-400">Removed user</p>
              <p className="text-xs text-slate-400">{formatDate(post?.createdAt)}</p>
            </div>
          </div>
        )}
        <PostVisibilityBadge visibility={post?.visibility} />
      </div>

      {/* Content */}
      <div className="px-5 pt-3">
        <p className="whitespace-pre-wrap text-[0.935rem] leading-relaxed text-slate-700">
          {post?.content || post?.caption || ''}
        </p>
      </div>

      {/* Hashtags */}
      {hashtags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 px-5">
          {hashtags.map((tag) => (
            <Link key={tag} to={`/hashtag/${encodeURIComponent(tag)}`}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-100">
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Media */}
      {mediaUrls.length > 0 ? (
        <div className={`mt-3 px-5 grid gap-2 ${mediaUrls.length > 1 ? 'sm:grid-cols-2' : ''}`}>
          {mediaUrls.map((url, index) => (
            isVideoUrl(url) ? (
              <video key={`${url}-${index}`} controls playsInline src={url}
                className="h-full w-full rounded-2xl border border-slate-100 object-cover shadow-sm" />
            ) : (
              <img key={`${url}-${index}`} src={url} alt={`Post media ${index + 1}`}
                className="h-full w-full rounded-2xl border border-slate-100 object-cover shadow-sm transition hover:shadow-md"
                loading="lazy" />
            )
          ))}
        </div>
      ) : null}

      {/* Reaction summary bar */}
      {reactionCounts.length > 0 ? (
        <div className="mt-3 flex items-center gap-2 px-5">
          <div className="flex -space-x-1">
            {reactionCounts.slice(0, 3).map(([reaction]) => (
              <span key={reaction} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-white text-sm">
                {REACTION_EMOJI[reaction]}
              </span>
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">{totalReactions} reaction{totalReactions !== 1 ? 's' : ''}</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-500">{commentsCount} comment{commentsCount !== 1 ? 's' : ''}</span>
        </div>
      ) : null}

      {/* Action bar */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-5 py-3">
        {!isGuest ? (
          <>
            <button type="button" onClick={handleHeartClick}
              className={`reaction-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                currentLike
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              aria-pressed={Boolean(currentLike)}
            >
              <Heart className={`h-4 w-4 ${currentLike ? 'fill-current' : ''}`} />
              {currentLike ? (currentLike.reactionType || 'Like') : 'Like'}
            </button>

            <button type="button" onClick={() => setShowReactions(!showReactions)}
              className="rounded-xl bg-slate-50 px-2.5 py-2 text-sm text-slate-500 transition hover:bg-slate-100">
              {showReactions ? '✕' : '☺'}
            </button>
          </>
        ) : (
          <span className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">Guest accounts are read-only</span>
        )}

        <Link to={`/post/${postId}`} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
          <MessageCircle className="h-4 w-4" />
          {commentsCount}
        </Link>

        {currentUserId && !isGuest && authorId && !isOwnPost ? (
          isFollowing ? (
            <button type="button" onClick={() => unfollowMutation.mutate()} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100" disabled={unfollowMutation.isPending}>
              <UserMinus className="h-4 w-4" /> Unfollow
            </button>
          ) : (
            <button type="button" onClick={() => followMutation.mutate()} className="cs-btn cs-btn-primary text-xs py-2 px-3" disabled={followMutation.isPending}>
              <UserPlus className="h-3.5 w-3.5" /> Follow
            </button>
          )
        ) : null}

        {onEdit ? (
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        ) : null}

        <div className="relative ml-auto">
          <button type="button" onClick={() => setShowMore((v) => !v)} className="rounded-xl bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMore ? (
            <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-glass-lg animate-scale-in">
              {onEdit ? (
                <button type="button" onClick={() => { setShowMore(false); onEdit(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                  <Pencil className="h-3.5 w-3.5" /> Edit post
                </button>
              ) : null}
              {onDelete ? (
                <button type="button" onClick={() => { setShowMore(false); onDelete(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete post
                </button>
              ) : null}
              {currentUserId && !isGuest && authorId && !isOwnPost ? (
                <button type="button" onClick={handleReportPost} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                  <Flag className="h-3.5 w-3.5" /> Report post
                </button>
              ) : null}
              <button type="button" onClick={() => { setShowMore(false); navigator.clipboard?.writeText(`${window.location.origin}/post/${postId}`); toast.success('Link copied'); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                <Copy className="h-3.5 w-3.5" /> Copy link
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Reaction picker */}
      {showReactions ? (
        <div className="border-t border-slate-100 px-5 py-3">
          <ReactionPicker currentReaction={currentLike?.reactionType} onSelect={handleSelectReaction} />
        </div>
      ) : null}

      {/* Admin mode */}
      {adminMode ? (
        <div className="border-t border-dashed border-brand-200 bg-brand-50/40 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">Admin Controls</p>
          <div className="grid gap-3">
            <textarea value={adminContentDraft} onChange={(event) => setAdminContentDraft(event.target.value)} rows={4}
              placeholder="Edit post content…" className="cs-input resize-none" />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input value={hashtagDraft} onChange={(event) => setHashtagDraft(event.target.value)}
                placeholder="Add hashtags, comma separated" className="cs-input" />
              <button type="button" onClick={() => adminIndexMutation.mutate()}
                disabled={adminIndexMutation.isPending || !postId} className="cs-btn cs-btn-primary text-xs">
                Save hashtags
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => adminUpdateMutation.mutate()}
                disabled={adminUpdateMutation.isPending || !postId || !adminContentDraft.trim()} className="cs-btn cs-btn-secondary text-xs">
                Save post
              </button>
              <button type="button" onClick={() => adminDeleteMutation.mutate()}
                disabled={adminDeleteMutation.isPending || !postId} className="cs-btn cs-btn-danger text-xs">
                Remove post
              </button>
              <span className="text-xs text-slate-400">Admins can edit content, update tags, or remove the post.</span>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
