import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface DefaultPasswordWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DefaultPasswordWarningModal: React.FC<DefaultPasswordWarningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    onClose();
    navigate('/settings');
    // Auto-scroll to password section after a small delay to ensure page is loaded
    setTimeout(() => {
      const passwordSection = document.querySelector('[data-section="password"]');
      if (passwordSection) {
        passwordSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // If the section is collapsed, expand it
        const clickTarget = passwordSection.querySelector('[role="button"]');
        if (clickTarget && !passwordSection.querySelector('.mt-4')) {
          (clickTarget as HTMLElement).click();
        }
      }
    }, 100);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="page-card max-w-md w-full transform transition-all duration-200 ease-out dark:bg-gray-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-warning-title"
        aria-describedby="password-warning-message"
      >
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3
                id="password-warning-title"
                className="mb-2 text-lg font-medium text-warm-ink dark:text-white"
              >
                {t('auth.defaultPasswordWarning')}
              </h3>
              <p
                id="password-warning-message"
                className="leading-relaxed text-warm-warmGray dark:text-gray-300"
              >
                {t('auth.defaultPasswordMessage')}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm dark:text-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleGoToSettings}
              className="btn-warning px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-caramel"
              autoFocus
            >
              {t('auth.goToSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultPasswordWarningModal;
