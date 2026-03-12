import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface WeChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WeChatDialog: React.FC<WeChatDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();

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
            {t('wechat.title')}
          </h3>

          <div className="flex flex-col items-center justify-center py-4">
            <img
              src="./assets/wexin.png"
              alt={t('wechat.qrCodeAlt')}
              className="max-w-full h-auto"
              style={{ maxHeight: '400px' }}
            />
            <p className="mt-4 text-center text-warm-warmGray dark:text-gray-300">
              {t('wechat.scanMessage')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeChatDialog;
