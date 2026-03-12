import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicHeader from '@/components/layout/PublicHeader';

const PublicLayout: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col bg-warm-beige">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-warm-camel/30 bg-warm-caramel py-10 text-warm-cream">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <span className="font-serif text-base font-semibold">{t('app.name')}</span>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-warm-cream/70">
                {t('home.heroSubtitle')}
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/servers" className="warm-transition hover:text-warm-terracotta">
                {t('nav.servers')}
              </Link>
              <Link to="/market" className="warm-transition hover:text-warm-terracotta">
                {t('nav.market')}
              </Link>
              <Link to="/admin" className="warm-transition hover:text-warm-terracotta">
                {t('nav.adminPanel')}
              </Link>
              <a
                href="https://github.com/samanhappy/mcphub"
                target="_blank"
                rel="noopener noreferrer"
                className="warm-transition hover:text-warm-terracotta"
              >
                GitHub
              </a>
            </nav>
          </div>
          <div className="mt-8 border-t border-warm-cream/20 pt-4 text-center text-xs text-warm-cream/50">
            © {new Date().getFullYear()} MCPHub · Open source under MIT License
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
