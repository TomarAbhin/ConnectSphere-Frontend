import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Users, ShieldCheck, Globe } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'USER', adminSecretKey: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Enter a valid email address');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (form.role === 'ADMIN' && !form.adminSecretKey.trim()) {
      toast.error('Admin secret key is required for admin accounts');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register(form);
      login({ user: null, accessToken: data.accessToken, refreshToken: data.refreshToken });
      try {
        const profile = await authApi.profile();
        useAuthStore.getState().updateUser(profile);
      } catch (profileError) {
        console.warn('Unable to load profile after register', profileError);
      }
      toast.success('Account created');
      navigate('/feed');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      {/* Left hero */}
      <div className="hero-card p-10 text-white animate-fade-in">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            Create your space
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight">
            Join ConnectSphere with the right access level.
          </h1>
          <p className="mt-5 max-w-lg text-[0.935rem] leading-relaxed text-indigo-100/80">
            Users, guests, and admin accounts follow the same registration flow. Admins must enter the private invite key.
          </p>
          <div className="mt-10 grid gap-3">
            {[
              { icon: Globe, text: 'Public accounts for everyday participation' },
              { icon: Users, text: 'Guest access for lighter, read-first usage' },
              { icon: ShieldCheck, text: 'Private admin key gate for trusted accounts' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3.5 backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-4 w-4 text-indigo-200" />
                </div>
                <span className="text-sm text-indigo-50/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="glass-card-static p-8 animate-fade-in-up">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Start connecting in under a minute.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="username" required value={form.username} onChange={handleChange} placeholder="Username" className="cs-input" />
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full name" className="cs-input" />
          </div>
          <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="Email" className="cs-input" />
          <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Password (min 8 characters)" className="cs-input" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Role</span>
              <select name="role" value={form.role} onChange={handleChange} className="cs-input py-2.5">
                <option value="USER">User</option>
                <option value="GUEST">Guest</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <div>
              <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400">Account note</span>
              <div className="flex h-[calc(100%-1.375rem)] items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-500">
                Admin accounts require a private invite key.
              </div>
            </div>
          </div>
          {form.role === 'ADMIN' ? (
            <div className="animate-slide-down">
              <input name="adminSecretKey" value={form.adminSecretKey} onChange={handleChange} placeholder="Admin invite key" className="cs-input" />
              <p className="mt-2 text-xs text-slate-400">Ask the platform owner for the private admin registration key.</p>
            </div>
          ) : null}
          <button type="submit" disabled={loading} className="cs-btn cs-btn-primary w-full py-3.5">
            {loading ? 'Creating…' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
}
