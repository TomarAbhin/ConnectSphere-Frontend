import { Link, useNavigate } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import UserAvatar from '../user/UserAvatar';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [query, setQuery] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?query=${encodeURIComponent(value)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link to="/feed" className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
            <span className="text-xs font-bold text-white">CS</span>
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800">ConnectSphere</span>
            <span className="text-[0.65rem] text-slate-400">Social workspace</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-sm lg:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            name="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts, people, hashtags…"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </form>

        <div className="ml-auto flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to={user?.userId ? `/profile/${user.userId}` : '/profile'} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <UserAvatar name={user?.fullName || user?.username} src={user?.profilePicUrl} size="sm" />
                <span className="hidden sm:block">{user?.fullName || user?.username || 'Profile'}</span>
              </Link>
              <button onClick={logout} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-red-50 hover:text-red-500 hover:border-red-200" title="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Login
              </Link>
              <Link to="/register" className="cs-btn cs-btn-primary text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
