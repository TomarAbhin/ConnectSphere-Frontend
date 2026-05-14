import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { mediaApi } from '../api/mediaApi';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/user/UserAvatar';
import { Camera, Save } from 'lucide-react';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ username: '', fullName: '', bio: '', profilePicUrl: '' });

  const profileQuery = useQuery({ queryKey: ['my-profile'], queryFn: authApi.profile });

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        username: profileQuery.data.username || '',
        fullName: profileQuery.data.fullName || '',
        bio: profileQuery.data.bio || '',
        profilePicUrl: profileQuery.data.profilePicUrl || '',
      });
    }
  }, [profileQuery.data]);

  const mutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: async (data) => {
      const updatedProfile = data?.user || data?.profile || data;
      const refreshedProfile = await authApi.profile().catch(() => null);
      updateUser({
        ...(user || {}),
        ...(refreshedProfile || {}),
        ...(updatedProfile || {}),
      });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.userId] });
      toast.success('Profile updated');
      navigate(`/profile/${user?.userId}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Unable to update profile');
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const res = await mediaApi.uploadMedia(file, { purpose: 'profile' });
      const url = res?.mediaUrl || res?.url || res?.path || res?.data || null;
      if (url) setForm((current) => ({ ...current, profilePicUrl: url }));
    } catch (err) {
      toast.error('Profile image upload failed');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="auth-surface mx-auto max-w-xl animate-fade-in">
      <div className="glass-card-static overflow-hidden">
        {/* Cover + Avatar */}
        <div className="auth-hero-card h-20" />
        <div className="flex justify-center -mt-10">
          <div className="relative">
            <div className="rounded-full ring-4 ring-[#111319]">
              <UserAvatar name={form.fullName || form.username} src={form.profilePicUrl} size="xl" />
            </div>
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-500">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6 pt-4">
          <h1 className="text-center text-xl font-extrabold tracking-tight text-white">Edit profile</h1>
          <p className="mt-1 text-center text-sm text-slate-400">Update your public information.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Username</label>
              <input name="username" value={form.username} onChange={handleChange} className="cs-input" placeholder="Username" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Full name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} className="cs-input" placeholder="Full name" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="cs-input resize-none" placeholder="Tell others about yourself…" />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Profile picture URL</label>
              <input name="profilePicUrl" value={form.profilePicUrl} onChange={handleChange} className="cs-input" placeholder="https://…" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={mutation.isPending} className="cs-btn cs-btn-primary">
                <Save className="h-4 w-4" />
                {mutation.isPending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
