import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/postApi';

export function useFeed() {
  return useQuery({ queryKey: ['feed'], queryFn: postApi.getFeed });
}

export function usePost(postId) {
  return useQuery({ queryKey: ['post', postId], queryFn: () => postApi.getPost(postId), enabled: Boolean(postId) });
}

export function useUserPosts(userId) {
  return useQuery({ queryKey: ['posts', 'user', userId], queryFn: () => postApi.getPostsByUser(userId), enabled: Boolean(userId) });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
