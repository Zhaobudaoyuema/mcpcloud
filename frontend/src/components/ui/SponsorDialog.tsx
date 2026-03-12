import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface SponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SponsorDialog: React.FC<SponsorDialogProps> = ({ open, onOpenChange }) => {
  const { i18n, t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="page-card max-w-md dark:bg-gray-800">
        <div className="relative p-6">
          {/* Close button (X) in the top-right corner */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 text-warm-warmGray hover:text-warm-ink dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="mb-4 font-serif text-lg font-semibold text-warm-ink dark:text-gray-100">
            {t('sponsor.title')}
          </h3>

          <div className="flex flex-col items-center justify-center py-4">
            {i18n.language === 'zh' ? (
              <img
                src="./assets/reward.png"
                alt={t('sponsor.rewardAlt')}
                className="max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="text-center">
                <p className="mb-4 text-warm-warmGray dark:text-gray-300">
                  {t('sponsor.supportMessage')}
                </p>
                <a
                  href="https://ko-fi.com/agentn613"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-warm-btn bg-warm-caramel px-4 py-2 text-sm font-medium text-warm-cream shadow-warm-sm transition-colors hover:bg-warm-terracotta"
                >
                  {t('sponsor.supportButton')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDialog;
