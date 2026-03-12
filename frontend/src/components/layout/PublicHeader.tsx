import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import { LayoutDashboard } from 'lucide-react';

const PublicHeader: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const linkClass = (path: string) =>
    `text-sm font-medium warm-transition rounded-warm-pill px-3 py-1.5 ${
      location.pathname === path
        ? 'bg-warm-terracotta text-warm-cream'
        : 'text-warm-warmGray hover:bg-warm-beige hover:text-warm-ink'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-warm-camel/30 bg-warm-cream">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="font-serif text-lg font-semibold tracking-tight text-warm-ink"
        >
          {t('app.name')}
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/servers" className={linkClass('/servers')}>
            {t('nav.servers')}
          </Link>
          <Link to="/market" className={linkClass('/market')}>
            {t('nav.market')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Link
            to="/admin"
            className="warm-transition warm-btn-hover inline-flex items-center gap-1.5 rounded-warm-pill bg-warm-terracotta px-4 py-2 text-sm font-medium text-warm-cream shadow-warm-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('nav.adminPanel')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
