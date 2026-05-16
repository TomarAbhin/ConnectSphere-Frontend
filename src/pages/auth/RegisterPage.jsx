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

  const handleChange = (e) => { setForm((c) => ({ ...c, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) { toast.error('Enter a valid email'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (form.role === 'ADMIN' && !form.adminSecretKey.trim()) { toast.error('Admin key required'); return; }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      login({ user: null, accessToken: data.accessToken, refreshToken: data.refreshToken });
      try { const p = await authApi.profile(); useAuthStore.getState().updateUser(p); } catch {}
      toast.success('Account created');
      navigate('/feed');
    } catch (err) { toast.error(err?.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: Globe, text: 'Public accounts for participation' },
    { icon: Users, text: 'Guest access for read-first usage' },
    { icon: ShieldCheck, text: 'Admin key gate for trusted accounts' },
  ];

  return (
    <div className="auth-surface mx-auto grid min-h-screen max-w-5xl items-center gap-8 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="auth-hero-card p-10 text-white animate-fade-in">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse-soft" /> Create your space
          </div>
          <h1 className="mt-8 max-w-xl text-3xl font-extrabold leading-tight">Join ConnectSphere with the right access level.</h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-indigo-100/80">Users, guests, and admins follow the same flow. Admins enter a private key.</p>
          <div className="mt-8 grid gap-2.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"><Icon className="h-4 w-4" /></div>
                <span className="text-sm text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card-static p-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
            <span className="text-xs font-bold text-white">CS</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Create account</h1>
            <p className="text-sm text-slate-400">Start connecting in under a minute.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Username</label><input name="username" autoComplete="off" required value={form.username} onChange={handleChange} placeholder="johndoe" className="cs-input" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Full name</label><input name="fullName" autoComplete="off" value={form.fullName} onChange={handleChange} placeholder="John Doe" className="cs-input" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label><input name="email" autoComplete="off" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="cs-input" /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label><input name="password" autoComplete="new-password" type="password" required value={form.password} onChange={handleChange} placeholder="Min 8 characters" className="cs-input" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="cs-input py-2.5"><option value="USER">User</option><option value="GUEST">Guest</option><option value="ADMIN">Admin</option></select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Note</label>
              <div className="flex h-[calc(100%-1.375rem)] items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 text-xs text-slate-400">Admin accounts need a private key.</div>
            </div>
          </div>
          {form.role === 'ADMIN' ? (
            <div className="animate-slide-down"><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Admin invite key</label><input name="adminSecretKey" autoComplete="new-password" value={form.adminSecretKey} onChange={handleChange} placeholder="Enter private key" className="cs-input" /></div>
          ) : null}
          <button type="submit" disabled={loading} className="cs-btn cs-btn-primary w-full py-3">{loading ? 'Creating…' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account?{' '}<Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-600 transition">Login</Link></p>
      </div>
    </div>
  );
}
