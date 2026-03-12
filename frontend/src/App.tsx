import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ServerProvider } from './contexts/ServerContext';
import { SettingsProvider } from './contexts/SettingsContext';
import PublicLayout from './layouts/PublicLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/Dashboard';
import ServersPage from './pages/ServersPage';
import GroupsPage from './pages/GroupsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import MarketPage from './pages/MarketPage';
import ServerDetailPage from './pages/ServerDetailPage';
import LogsPage from './pages/LogsPage';
import ActivityPage from './pages/ActivityPage';
import { getBasePath } from './utils/runtime';

// Helper component to redirect cloud server routes to market
const CloudRedirect: React.FC = () => {
  const { serverName } = useParams<{ serverName: string }>();
  return <Navigate to={`/market/${serverName}?tab=cloud`} replace />;
};

function App() {
  const basename = getBasePath();
  return (
    <ThemeProvider>
      <AuthProvider>
        <ServerProvider>
          <ToastProvider>
            <SettingsProvider>
              <Router basename={basename}>
                <Routes>
                  {/* Public routes: homepage, servers, market - no login required */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/servers" element={<ServersPage />} />
                    <Route path="/servers/:serverName" element={<ServerDetailPage />} />
                    <Route path="/market" element={<MarketPage />} />
                    <Route path="/market/:serverName" element={<MarketPage />} />
                  </Route>

                  {/* Login */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Legacy cloud routes redirect to market with cloud tab */}
                  <Route path="/cloud" element={<Navigate to="/market?tab=cloud" replace />} />
                  <Route path="/cloud/:serverName" element={<CloudRedirect />} />

                  {/* Admin routes: require login, use MainLayout with sidebar */}
                  <Route path="/admin" element={<ProtectedRoute redirectPath="/login" />}>
                    <Route element={<MainLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="servers" element={<ServersPage />} />
                      <Route path="groups" element={<GroupsPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="market" element={<MarketPage />} />
                      <Route path="market/:serverName" element={<MarketPage />} />
                      <Route path="logs" element={<LogsPage />} />
                      <Route path="activity" element={<ActivityPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                  </Route>

                  {/* Unmatched: redirect to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </SettingsProvider>
          </ToastProvider>
        </ServerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
