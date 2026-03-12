import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}) => {
  const { t } = useTranslation();
  // Generate page buttons
  const getPageButtons = () => {
    const buttons = [];
    const maxDisplayedPages = 5; // Maximum number of page buttons to display

    // Always display first page
    buttons.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        className={`mx-1 rounded-warm-btn px-3 py-1 ${
          currentPage === 1 ? 'btn-primary' : 'btn-secondary'
        }`}
      >
        1
      </button>
    );

    // Start range
    const startPage = Math.max(2, currentPage - Math.floor(maxDisplayedPages / 2));

    // If we're showing ellipsis after first page
    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis1" className="px-3 py-1">
          ...
        </span>
      );
    }

    // Middle pages
    for (
      let i = startPage;
      i <= Math.min(totalPages - 1, startPage + maxDisplayedPages - 3);
      i++
    ) {
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`mx-1 rounded-warm-btn px-3 py-1 ${
            currentPage === i ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          {i}
        </button>,
      );
    }

    // If we're showing ellipsis before last page
    if (startPage + maxDisplayedPages - 3 < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-3 py-1">
          ...
        </span>
      );
    }

    // Always display last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className={`mx-1 rounded-warm-btn px-3 py-1 ${
            currentPage === totalPages ? 'btn-primary' : 'btn-secondary'
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  // If there's only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="my-6 flex items-center justify-center">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={disabled || currentPage === 1}
        className={`mr-2 rounded-warm-btn px-3 py-1 ${
          disabled || currentPage === 1
            ? 'cursor-not-allowed bg-warm-cream text-warm-warmGray/60'
            : 'btn-secondary'
        }`}
      >
        &laquo; {t('common.previous')}
      </button>

      <div className="flex">{getPageButtons()}</div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={disabled || currentPage === totalPages}
        className={`ml-2 rounded-warm-btn px-3 py-1 ${
          disabled || currentPage === totalPages
            ? 'cursor-not-allowed bg-warm-cream text-warm-warmGray/60'
            : 'btn-secondary'
        }`}
      >
        {t('common.next')} &raquo;
      </button>
    </div>
  );
};

export default Pagination;