import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { AppStateProvider } from './components/state/AppStateContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { Landing } from './pages/Landing';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { Activity } from './pages/Activity';
import { Contributions } from './pages/Contributions';
import { Notifications } from './pages/Notifications';
import { Repositories } from './pages/Repositories';
import { PullRequests } from './pages/PullRequests';
import { Stars } from './pages/Stars';
import { Repository } from './pages/Repository';
import { RepositoryCommits } from './pages/RepositoryCommits';
import { RepositoryBranches } from './pages/RepositoryBranches';
import { RepositoryPullRequests } from './pages/RepositoryPullRequests';
import { RepositoryIssues } from './pages/RepositoryIssues';
import { RepositoryInsights } from './pages/RepositoryInsights';
import { RepositorySettings } from './pages/RepositorySettings';
import { RepositoryFile } from './pages/RepositoryFile';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

function RootRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return user ? <Home /> : <Landing />;
}

function withProtectedRoute(element: ReactElement) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

function withPublicOnlyRoute(element: ReactElement) {
  return <PublicOnlyRoute>{element}</PublicOnlyRoute>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRoute />} />
              <Route path="/signin" element={withPublicOnlyRoute(<SignIn />)} />
              <Route path="/signup" element={withPublicOnlyRoute(<SignUp />)} />
              <Route path="/forgot-password" element={withPublicOnlyRoute(<ForgotPassword />)} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/activity" element={withProtectedRoute(<Activity />)} />
              <Route path="/notifications" element={withProtectedRoute(<Notifications />)} />
              <Route path="/contributions" element={withProtectedRoute(<Contributions />)} />
              <Route path="/pull-requests" element={withProtectedRoute(<PullRequests />)} />
              <Route path="/repositories" element={withProtectedRoute(<Repositories />)} />
              <Route path="/stars" element={withProtectedRoute(<Stars />)} />
              <Route path="/repository/:owner/:repo" element={withProtectedRoute(<Repository />)} />
              <Route path="/repository/:owner/:repo/commits" element={withProtectedRoute(<RepositoryCommits />)} />
              <Route path="/repository/:owner/:repo/branches" element={withProtectedRoute(<RepositoryBranches />)} />
              <Route path="/repository/:owner/:repo/pulls" element={withProtectedRoute(<RepositoryPullRequests />)} />
              <Route path="/repository/:owner/:repo/issues" element={withProtectedRoute(<RepositoryIssues />)} />
              <Route path="/repository/:owner/:repo/insights" element={withProtectedRoute(<RepositoryInsights />)} />
              <Route path="/repository/:owner/:repo/settings" element={withProtectedRoute(<RepositorySettings />)} />
              <Route path="/repository/:owner/:repo/blob/:branch/*" element={withProtectedRoute(<RepositoryFile />)} />
              <Route path="/repository/:owner/:repo/tree/*" element={withProtectedRoute(<RepositoryFile />)} />
              <Route path="/profile" element={withProtectedRoute(<Profile />)} />
              <Route path="/settings" element={withProtectedRoute(<Settings />)} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
