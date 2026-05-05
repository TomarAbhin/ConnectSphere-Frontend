import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Sparkles, Zap, Shield, Github } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(form);
      login({ user: null, accessToken: data.accessToken, refreshToken: data.refreshToken });
      try {
        const profile = await authApi.profile();
        useAuthStore.getState().updateUser(profile);
      } catch (profileError) {
        console.warn('Unable to load profile after login', profileError);
      }
      toast.success('Logged in successfully');
      navigate('/feed');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left hero */}
      <div className="hidden hero-card p-10 text-white lg:block animate-fade-in">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-sm border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            ConnectSphere
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight">
            A calmer, cleaner way to return to your network.
          </h1>
          <p className="mt-5 max-w-lg text-[0.935rem] leading-relaxed text-indigo-100/80">
            Sign in to access your feed, explore trends, stories, notifications, and admin controls — all from one place.
          </p>
          <div className="mt-10 grid gap-3">
            {[
              { icon: Sparkles, text: 'Unified search across posts, users, and hashtags' },
              { icon: Zap, text: 'Instant reactions, comments, and profile actions' },
              { icon: Shield, text: 'Admin tools for moderation and user management' },
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Log in</h1>
        <p className="mt-2 text-sm text-slate-400">Access your ConnectSphere account.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input name="email" type="text" required value={form.email} onChange={handleChange} placeholder="Email or username" className="cs-input" />
          <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Password" className="cs-input" />
          <button type="submit" disabled={loading} className="cs-btn cs-btn-primary w-full py-3.5">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div className="mt-5 space-y-2.5">
          <a className="cs-btn cs-btn-secondary w-full justify-center" href="http://localhost:8080/api/v1/oauth2/authorization/github">
            <Github className="h-4 w-4" /> Login with GitHub
          </a>
          <a className="cs-btn cs-btn-secondary w-full justify-center" href="http://localhost:8080/api/v1/oauth2/authorization/google">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Login with Google
          </a>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          No account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}
