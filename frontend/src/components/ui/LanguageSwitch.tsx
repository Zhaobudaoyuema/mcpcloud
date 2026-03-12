import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@/components/icons/LanguageIcon';

const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Available languages
  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'fr', label: 'Français' },
    { code: 'tr', label: 'Türkçe' }
  ];

  // Update current language when it changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown')) {
        setLanguageDropdownOpen(false);
      }
    };

    if (languageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [languageDropdownOpen]);

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem('i18nextLng', lang);
    setLanguageDropdownOpen(false);
    window.location.reload();
  };

  // Always show dropdown for language selection
  const handleLanguageToggle = () => {
    setLanguageDropdownOpen(!languageDropdownOpen);
  };

  return (
    <div className="relative language-dropdown">
      <button
        onClick={handleLanguageToggle}
        className="rounded-warm-btn p-2 text-warm-warmGray hover:bg-warm-beige hover:text-warm-ink dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none"
        aria-label="Language Switcher"
      >
        <LanguageIcon className="h-5 w-5" />
      </button>

      {/* Show dropdown when opened */}
      {languageDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-24 rounded-warm-card border border-warm-camel/40 bg-warm-cream shadow-warm-sm dark:border-gray-700 dark:bg-gray-800">
          <div>
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                  currentLanguage.startsWith(lang.code)
                    ? 'bg-warm-beige text-warm-ink font-medium'
                    : 'text-warm-warmGray hover:bg-warm-beige dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitch;
