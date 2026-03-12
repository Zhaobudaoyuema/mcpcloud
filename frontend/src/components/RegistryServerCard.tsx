import React from 'react';
import { useTranslation } from 'react-i18next';
import { RegistryServerEntry } from '@/types';

interface RegistryServerCardProps {
  serverEntry: RegistryServerEntry;
  onClick: (serverEntry: RegistryServerEntry) => void;
}

const RegistryServerCard: React.FC<RegistryServerCardProps> = ({ serverEntry, onClick }) => {
  const { t } = useTranslation();
  const { server, _meta } = serverEntry;

  const handleClick = () => {
    onClick(serverEntry);
  };

  // Get display description
  const getDisplayDescription = () => {
    if (server.description && server.description.length <= 150) {
      return server.description;
    }
    return server.description
      ? server.description.slice(0, 150) + '...'
      : t('registry.noDescription');
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch {
      return '';
    }
  };

  // Get icon to display
  const getIcon = () => {
    if (server.icons && server.icons.length > 0) {
      // Prefer light theme icon
      const lightIcon = server.icons.find((icon) => !icon.theme || icon.theme === 'light');
      return lightIcon || server.icons[0];
    }
    return null;
  };

  const icon = getIcon();
  const officialMeta = _meta?.['io.modelcontextprotocol.registry/official'];
  const isLatest = officialMeta?.isLatest;
  const publishedAt = officialMeta?.publishedAt;
  const updatedAt = officialMeta?.updatedAt;

  // Count packages and remotes
  const packageCount = server.packages?.length || 0;
  const remoteCount = server.remotes?.length || 0;
  const totalOptions = packageCount + remoteCount;

  return (
    <div
      className="warm-card-hover relative flex h-full cursor-pointer flex-col overflow-hidden rounded-warm-card border border-warm-camel/40 bg-warm-cream p-4 shadow-warm-sm transition-all duration-300"
      onClick={handleClick}
    >

      {/* Server Header */}
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            {/* Icon */}
            {icon ? (
              <img
                src={icon.src}
                alt={server.title}
                className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-warm-terracotta text-xl font-semibold text-warm-cream">
                M
              </div>
            )}

            {/* Title and badges */}
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-warm-ink transition-colors duration-200 group-hover:text-warm-caramel">
                {server.name}
              </h3>
              <div className="mb-1 flex flex-wrap gap-1">
                {isLatest && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    {t('registry.latest')}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-warm-beige px-2 py-0.5 text-xs font-medium text-warm-caramel">
                  v{server.version}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Server Name */}
        {/* <div className="mb-2">
          <p className="text-xs text-gray-500 font-mono">{server.name}</p>
        </div> */}

        {/* Description */}
        <div className="mb-3 flex-1">
          <p className="text-sm leading-relaxed text-warm-warmGray line-clamp-3">
            {getDisplayDescription()}
          </p>
        </div>

        {/* Installation Options Info */}
        {totalOptions > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-4">
              {packageCount > 0 && (
                <div className="flex items-center space-x-1">
                  <svg
                    className="h-4 w-4 text-warm-warmGray"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span className="text-sm text-warm-warmGray">
                    {packageCount}{' '}
                    {packageCount === 1 ? t('registry.package') : t('registry.packages')}
                  </span>
                </div>
              )}
              {remoteCount > 0 && (
                <div className="flex items-center space-x-1">
                  <svg
                    className="h-4 w-4 text-warm-warmGray"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <span className="text-sm text-warm-warmGray">
                    {remoteCount} {remoteCount === 1 ? t('registry.remote') : t('registry.remotes')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - fixed at bottom */}
        <div className="mt-auto flex items-center justify-between border-t border-warm-camel/30 pt-3">
          <div className="flex items-center space-x-2 text-xs text-warm-warmGray">
            {(publishedAt || updatedAt) && (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatDate(updatedAt || publishedAt)}</span>
              </>
            )}
          </div>

          <div className="flex items-center text-sm font-medium text-warm-caramel transition-colors group-hover:text-warm-rust">
            <span>{t('registry.viewDetails')}</span>
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistryServerCard;
