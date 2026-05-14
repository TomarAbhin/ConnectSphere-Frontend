import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CommentItem from './CommentItem';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ data: [] })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector) => selector({ user: { userId: 1, role: 'USER' } }),
}));

vi.mock('../user/UserAvatar', () => ({
  default: ({ name }) => <div data-testid="avatar">{name}</div>,
}));

vi.mock('../../utils/formatDate', () => ({
  formatDate: () => 'just now',
}));

vi.mock('../../api/reportApi', () => ({
  reportApi: { createReport: vi.fn() },
}));

vi.mock('../../utils/reportPrompt', () => ({
  promptForReportReason: vi.fn(),
}));

const comment = {
  commentId: 7,
  authorId: 3,
  authorUsername: 'jdoe',
  authorFullName: 'Jane Doe',
  content: 'Looks good',
  likesCount: 4,
  createdAt: '2026-05-05T00:00:00Z',
};

describe('CommentItem', () => {
  it('renders the like count and forwards like clicks', () => {
    const onLike = vi.fn();

    render(<CommentItem comment={comment} onLike={onLike} />);

    expect(screen.getByTestId('avatar')).toHaveTextContent('Jane Doe');
    expect(screen.getByText('Looks good')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '4' }));

    expect(onLike).toHaveBeenCalledWith(comment);
  });
});