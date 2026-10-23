import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./contexts/AuthContext";
import { SiteLayout } from "./components/SiteLayout";
import { Alert, Loading } from "./components/Primitives";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LandingPage } from "./pages/LandingPage";
import { EditProfilePage, ProfilePage } from "./pages/ProfilePages";
import { CreateProjectPage, ProjectDetailPage, ProjectsPage } from "./pages/ProjectsPages";
import { MyTeamsPage } from "./features/teams/MyTeamsPage";

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="Restoring your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

function NotFoundPage() {
  return <div className="page-narrow"><Alert>The page you’re looking for doesn’t exist.</Alert></div>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="teams" element={<Protected><MyTeamsPage /></Protected>} />
        <Route path="profile" element={<Protected><ProfilePage own /></Protected>} />
        <Route path="profile/edit" element={<Protected><EditProfilePage /></Protected>} />
        <Route path="students/:id" element={<ProfilePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<Protected><CreateProjectPage /></Protected>} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
