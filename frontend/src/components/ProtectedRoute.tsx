import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/login',
}) => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <div className="flex items-center justify-center h-screen">{t('app.loading')}</div>;
  }

  if (!auth.isAuthenticated) {
    const loginPath = redirectPath.includes('?')
      ? redirectPath
      : `${redirectPath}?returnUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={loginPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;