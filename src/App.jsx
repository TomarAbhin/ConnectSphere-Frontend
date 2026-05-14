import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SearchPage from './pages/SearchPage';
import HashtagPage from './pages/HashtagPage';
import NotificationsPage from './pages/NotificationsPage';
import StoriesPage from './pages/StoriesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminPosts from './pages/admin/AdminPosts';

function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8 animate-fade-in">{children}</main>
    </div>
  );
}

function ProfileRouteRedirect() {
  const { isLoggedIn } = useAuth();
  return <Navigate to={isLoggedIn ? '/feed' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/feed" replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/explore"
        element={
          <AppShell>
            <ExplorePage />
          </AppShell>
        }
      />
      <Route
        path="/feed"
        element={
          <AppShell>
            <FeedPage />
          </AppShell>
        }
      />
      <Route
        path="/post/:id"
        element={
          <AppShell>
            <PostDetailPage />
          </AppShell>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <AppShell>
            <ProfilePage />
          </AppShell>
        }
      />
      <Route
        path="/profile"
        element={<ProfileRouteRedirect />}
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <AppShell>
              <EditProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <AppShell>
            <SearchPage />
          </AppShell>
        }
      />
      <Route
        path="/hashtag/:tag"
        element={
          <AppShell>
            <HashtagPage />
          </AppShell>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppShell>
              <NotificationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/stories"
        element={
          <ProtectedRoute>
            <AppShell>
              <StoriesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AppShell>
              <AdminDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="ADMIN">
            <AppShell>
              <AdminUsers />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="ADMIN">
            <AppShell>
              <AdminReports />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <ProtectedRoute role="ADMIN">
            <AppShell>
              <AdminPosts />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
