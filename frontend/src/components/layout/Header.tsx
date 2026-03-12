import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import GitHubIcon from '@/components/icons/GitHubIcon';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();

  return (
    <header className="z-10 border-b border-warm-camel/30 bg-warm-cream">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="rounded-warm-btn p-2 text-warm-warmGray hover:bg-warm-beige hover:text-warm-ink focus:outline-none warm-transition"
            aria-label={t('app.toggleSidebar')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="ml-4 font-serif text-xl font-semibold text-warm-ink">
            {t('app.title')}
          </h1>
        </div>

        <div className="flex items-center space-x-1">
          <span className="mr-2 text-sm text-warm-warmGray">
            {import.meta.env.PACKAGE_VERSION === 'dev'
              ? import.meta.env.PACKAGE_VERSION
              : `v${import.meta.env.PACKAGE_VERSION}`}
          </span>

          <a
            href="https://github.com/samanhappy/mcphub"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-warm-btn p-2 text-warm-warmGray hover:bg-warm-beige hover:text-warm-ink warm-transition"
            aria-label="GitHub Repository"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>

          <a
            href="https://docs.mcphubx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-warm-btn p-2 text-warm-warmGray hover:bg-warm-beige hover:text-warm-ink warm-transition"
            aria-label="Documentation"
          >
            <BookOpen className="h-5 w-5" />
          </a>

          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header;
