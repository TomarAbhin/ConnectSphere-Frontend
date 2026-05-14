import { Link } from 'react-router-dom';
import { Search, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [query, setQuery] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?query=${encodeURIComponent(value)}` : '/search');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111319]/92 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/feed"
          className="inline-flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-3 py-2 text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-white/10"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/10">
            <span className="h-3.5 w-3.5 rounded-[4px] border border-white/80" />
          </span>
          <span className="hidden sm:flex flex-col leading-tight text-left">
            <span className="text-sm font-semibold tracking-tight">ConnectSphere</span>
            <span className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Social workspace</span>
          </span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="hidden min-w-0 flex-1 items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition focus-within:border-brand-400/40 focus-within:bg-white/10 lg:flex"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            name="query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts, people, hashtags.."
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <Link to="/search" className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 sm:inline-flex">
              <ArrowUpRight className="h-4 w-4" />
              Search
            </Link>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)] transition hover:from-brand-500 hover:to-cyan-500">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
