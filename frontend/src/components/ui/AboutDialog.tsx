import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, RefreshCw } from 'lucide-react';
import { checkLatestVersion, compareVersions } from '@/utils/version';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose, version }) => {
  const { t } = useTranslation();
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const latest = await checkLatestVersion();
      if (latest) {
        setLatestVersion(latest);
        setHasNewVersion(compareVersions(version, latest) > 0);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkForUpdates();
    }
  }, [isOpen, version]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-30 p-4">
      <div className="page-card max-w-md dark:bg-gray-800">
        <div className="relative p-6">
          {/* Close button (X) in the top-right corner */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-warm-warmGray hover:text-warm-ink dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="mb-4 font-serif text-lg font-semibold text-warm-ink dark:text-gray-100">
            {t('about.title')}
          </h3>

            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-warm-warmGray dark:text-gray-300">
                {t('about.currentVersion')}:
              </span>
              <span className="font-medium text-warm-ink dark:text-gray-100">
                {version}
              </span>
            </div>

            {hasNewVersion && latestVersion && (
              <div className="rounded-warm-card bg-warm-beige/80 p-3 dark:bg-gray-900/40">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-warm-caramel dark:text-warm-caramel"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 text-sm text-warm-ink dark:text-gray-200">
                    <p>{t('about.newVersionAvailable', { version: latestVersion })}</p>
                    <p className="mt-1">
                      <a
                        href="https://github.com/agentn613/mcpcloud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-warm-caramel hover:underline dark:text-warm-caramel"
                      >
                        {t('about.viewOnGitHub')}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={checkForUpdates}
              disabled={isChecking}
              className="btn-secondary mt-4 inline-flex items-center px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-caramel"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? t('about.checking') : t('about.checkForUpdates')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutDialog;
