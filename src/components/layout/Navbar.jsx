import { Bell, Compass, Home, LogOut, Search, Shield, User, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotificationStore } from '../../store/notificationStore';
import { useUnreadNotifications } from '../../hooks/useNotifications';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const profileName = user?.fullName || user?.username || 'Account';
  const isAdmin = user?.role === 'ADMIN';
  const [mobileOpen, setMobileOpen] = useState(false);
  useUnreadNotifications();

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('query') || '').trim();
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : '/search');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'bg-brand-50 text-brand-700 shadow-sm'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-2 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition hover:shadow-lg hover:shadow-brand-500/30"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse-soft" />
          ConnectSphere
        </Link>

        {/* Desktop Nav */}
        {isLoggedIn ? (
          <nav className="hidden items-center gap-1 lg:flex">
            {navLink('/explore', 'Explore', Compass)}
            {navLink('/feed', 'Feed', Home)}
            {navLink('/stories', 'Stories', BookOpen)}
            {navLink('/search', 'Search', Search)}
            {isAdmin ? navLink('/admin', 'Admin', Shield) : null}
          </nav>
        ) : null}

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-3.5 py-2 shadow-sm backdrop-blur-sm transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-glow-sm sm:flex">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            name="query"
            type="search"
            placeholder="Search posts, users, hashtags…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>

        {/* Right side */}
        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative rounded-xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:shadow-md hover:text-brand-600"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="notification-dot">{unreadCount}</span>
              ) : null}
            </Link>

            {/* Profile */}
            <Link
              to={user?.userId ? `/profile/${user.userId}` : '/login'}
              className="rounded-xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:shadow-md hover:text-brand-600"
              title={profileName}
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="cs-btn cs-btn-primary text-xs py-2 px-3"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl border border-slate-200/60 bg-white/80 p-2 text-slate-600 lg:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="cs-btn cs-btn-secondary text-xs">Login</Link>
            <Link to="/register" className="cs-btn cs-btn-primary text-xs">Register</Link>
          </div>
        )}
      </div>

      {/* Mobile nav */}
      {mobileOpen && isLoggedIn ? (
        <div className="border-t border-slate-100 bg-white/95 px-4 pb-3 pt-2 backdrop-blur-xl lg:hidden animate-slide-down">
          <div className="flex flex-wrap gap-2">
            {navLink('/explore', 'Explore', Compass)}
            {navLink('/feed', 'Feed', Home)}
            {navLink('/stories', 'Stories', BookOpen)}
            {navLink('/search', 'Search', Search)}
            {isAdmin ? navLink('/admin', 'Admin', Shield) : null}
          </div>
          <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input name="query" type="search" placeholder="Search…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </form>
        </div>
      ) : null}
    </header>
  );
}
