import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Server } from '@/types';
import ServerCard from '@/components/ServerCard';
import AddServerForm from '@/components/AddServerForm';
import EditServerForm from '@/components/EditServerForm';
import { useServerData } from '@/hooks/useServerData';
import McpbUploadForm from '@/components/McpbUploadForm';
import JSONImportForm from '@/components/JSONImportForm';
import Pagination from '@/components/ui/Pagination';

const warmTransition = 'warm-transition';

function PublicServerCard({ server }: { server: Server }) {
  const { t } = useTranslation();
  const initial = server.name.charAt(0).toUpperCase();
  const toolsCount = server.tools?.length ?? 0;
  const promptsCount = server.prompts?.length ?? 0;
  const isConnected = server.status === 'connected';
  const isConnecting = server.status === 'connecting';

  return (
    <Link
      to={`/servers/${encodeURIComponent(server.name)}`}
      className={`${warmTransition} warm-card-hover group rounded-warm-card border bg-warm-cream p-5 shadow-warm-sm block ${
        isConnected
          ? 'border-warm-camel/50'
          : 'border-warm-camel/30 opacity-80'
      }`}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-serif text-lg font-semibold ${
            isConnected
              ? 'bg-warm-terracotta/15 text-warm-caramel ring-1 ring-warm-camel/30'
              : 'bg-warm-beige text-warm-warmGray ring-1 ring-warm-camel/20'
          }`}
        >
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          {/* Name + status dot */}
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-warm-ink">{server.name}</h3>
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                isConnected
                  ? 'bg-green-500'
                  : isConnecting
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-warm-warmGray/40'
              }`}
            />
          </div>

          {/* Description */}
          {server.config?.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-warm-warmGray">
              {server.config.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-warm-warmGray/50 italic">—</p>
          )}

          {/* Footer: type badge + tool count */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {server.config?.type && (
              <span className="inline-flex items-center rounded-warm-pill bg-warm-beige px-2.5 py-0.5 text-xs font-medium text-warm-warmGray ring-1 ring-warm-camel/25">
                {server.config.type.toUpperCase()}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-warm-gold">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              {t('home.toolsCount', { count: toolsCount })}
            </span>
            {promptsCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-warm-gold/80">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                </svg>
                {promptsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

const ServersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const readOnly = !isAdmin;
  const {
    servers,
    error,
    setError,
    isLoading,
    pagination,
    currentPage,
    serversPerPage,
    setCurrentPage,
    setServersPerPage,
    handleServerAdd,
    handleServerEdit,
    handleServerRemove,
    handleServerToggle,
    handleServerReload,
    triggerRefresh,
  } = useServerData({ refreshOnMount: true });
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMcpbUpload, setShowMcpbUpload] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online'>('all');

  const handleEditClick = async (server: Server) => {
    const fullServerData = await handleServerEdit(server);
    if (fullServerData) {
      setEditingServer(fullServerData);
    }
  };

  const handleEditComplete = () => {
    setEditingServer(null);
    triggerRefresh();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      triggerRefresh();
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMcpbUploadSuccess = (_serverConfig: any) => {
    setShowMcpbUpload(false);
    triggerRefresh();
  };

  const handleJsonImportSuccess = () => {
    setShowJsonImport(false);
    triggerRefresh();
  };

  if (readOnly) {
    const connectedCount = servers.filter((s) => s.status === 'connected').length;
    const filteredServers = servers
      .filter((s) => statusFilter === 'all' || s.status === 'connected')
      .filter(
        (s) =>
          !searchTerm ||
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.config?.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      );

    return (
      <div className="flex flex-col">
        {/* Page header */}
        <section className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-warm-ink">
                {t('nav.servers')}
              </h1>
              {!isLoading && servers.length > 0 && (
                <p className="mt-2 text-sm text-warm-warmGray">
                  <span className="font-medium text-green-600">{connectedCount}</span>
                  {' / '}
                  {pagination ? pagination.total : servers.length}
                  {' '}
                  {t('home.onlineServersTitle')}
                </p>
              )}
            </div>
            <Link
              to="/market"
              className="warm-transition mt-1 shrink-0 text-sm font-medium text-warm-caramel hover:text-warm-terracotta"
            >
              {t('nav.market')} →
            </Link>
          </div>
          <div className="mt-4 h-px bg-warm-camel/20" />
        </section>

        {/* Search and filter bar */}
        {!isLoading && servers.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('home.searchServers')}
              className="flex-1 rounded-warm-input border border-warm-camel/40 bg-warm-cream px-4 py-2 text-sm text-warm-ink placeholder:text-warm-warmGray/60 outline-none focus:border-warm-caramel/60 focus:ring-1 focus:ring-warm-caramel/30 warm-transition"
            />
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-warm-pill px-4 py-2 text-sm font-medium warm-transition ${
                  statusFilter === 'all'
                    ? 'bg-warm-caramel text-warm-cream shadow-warm-sm'
                    : 'border border-warm-camel/40 text-warm-warmGray hover:bg-warm-beige'
                }`}
              >
                {t('home.filterAll')}
              </button>
              <button
                onClick={() => setStatusFilter('online')}
                className={`rounded-warm-pill px-4 py-2 text-sm font-medium warm-transition ${
                  statusFilter === 'online'
                    ? 'bg-warm-caramel text-warm-cream shadow-warm-sm'
                    : 'border border-warm-camel/40 text-warm-warmGray hover:bg-warm-beige'
                }`}
              >
                {t('home.filterOnline')}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-warm-card border border-red-400/40 bg-red-50/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-warm-warmGray">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-4 text-warm-warmGray hover:text-warm-ink warm-transition"
                aria-label={t('app.closeButton')}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 rounded-full warm-loading" />
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream py-14 text-center text-warm-warmGray shadow-warm-sm">
            {servers.length === 0 ? t('app.noServers') : t('common.search')}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServers.map((server, index) => (
                <PublicServerCard key={index} server={server} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && !searchTerm && statusFilter === 'all' && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-warm-ink dark:text-gray-100">
          {t('pages.servers.title')}
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(isAdmin ? '/admin/market' : '/market')}
            className="btn-secondary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
            {t('nav.market')}
          </button>
          <AddServerForm onAdd={handleServerAdd} />
          <button
            onClick={() => setShowJsonImport(true)}
            className="btn-secondary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {t('jsonImport.button')}
          </button>
          <button
            onClick={() => setShowMcpbUpload(true)}
            className="btn-secondary flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z" />
            </svg>
            {t('mcpb.upload')}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`btn-secondary flex items-center ${isRefreshing ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {isRefreshing ? (
              <svg
                className="animate-spin h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-box mb-6 rounded-warm-card border border-red-500/30 bg-red-50/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-1 text-warm-warmGray">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-gray-500 hover:text-gray-700 transition-colors duration-200 btn-secondary"
              aria-label={t('app.closeButton')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-container page-card flex items-center justify-center p-6">
          <div className="flex flex-col items-center">
            <svg
              className="mb-4 h-10 w-10 animate-spin text-warm-caramel"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-warm-warmGray">{t('app.loading')}</p>
          </div>
        </div>
      ) : servers.length === 0 ? (
        <div className="empty-state rounded-warm-card border border-warm-camel/40 bg-warm-cream p-6 shadow-warm-sm">
          <p className="text-warm-warmGray">{t('app.noServers')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {servers.map((server, index) => (
              <ServerCard
                key={index}
                server={server}
                onRemove={handleServerRemove}
                onEdit={handleEditClick}
                onToggle={handleServerToggle}
                onRefresh={triggerRefresh}
                onReload={handleServerReload}
                readOnly={readOnly}
              />
            ))}
          </div>

          <div className="flex items-center mb-4">
            <div className="flex-[2] text-sm text-warm-warmGray">
              {pagination
                ? t('common.showing', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total,
                  })
                : t('common.showing', {
                    start: 1,
                    end: servers.length,
                    total: servers.length,
                  })}
            </div>
            <div className="flex-[4] flex justify-center">
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                  disabled={isLoading}
                />
              )}
            </div>
            <div className="flex-[2] flex items-center justify-end space-x-2">
              <label htmlFor="perPage" className="text-sm text-warm-warmGray">
                {t('common.itemsPerPage')}:
              </label>
              <select
                id="perPage"
                value={serversPerPage}
                onChange={(e) => setServersPerPage(Number(e.target.value))}
                disabled={isLoading}
                className="border rounded p-1 text-sm btn-secondary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}

      {editingServer && (
        <EditServerForm
          server={editingServer}
          onEdit={handleEditComplete}
          onCancel={() => setEditingServer(null)}
        />
      )}

      {showMcpbUpload && (
        <McpbUploadForm
          onSuccess={handleMcpbUploadSuccess}
          onCancel={() => setShowMcpbUpload(false)}
        />
      )}

      {showJsonImport && (
        <JSONImportForm
          onSuccess={handleJsonImportSuccess}
          onCancel={() => setShowJsonImport(false)}
        />
      )}
    </div>
  );
};

export default ServersPage;
