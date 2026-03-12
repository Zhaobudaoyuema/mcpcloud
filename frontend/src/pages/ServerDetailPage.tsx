import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServerData } from '@/hooks/useServerData';
import ToolCard from '@/components/ui/ToolCard';
import { toggleTool } from '@/services/toolService';

const ServerDetailPage: React.FC = () => {
  const { serverName } = useParams<{ serverName: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allServers, isLoading, refreshIfNeeded } = useServerData({ refreshOnMount: true });

  useEffect(() => {
    refreshIfNeeded();
  }, [refreshIfNeeded]);

  const decodedName = serverName ? decodeURIComponent(serverName) : '';
  const server = allServers.find((s) => s.name === decodedName);

  const isConnected = server?.status === 'connected';
  const isConnecting = server?.status === 'connecting';
  const tools = server?.tools ?? [];
  const prompts = server?.prompts ?? [];

  const handleToolToggle = async (toolName: string, enabled: boolean) => {
    if (!server) return;
    await toggleTool(server.name, toolName, enabled);
    refreshIfNeeded();
  };

  if (isLoading && !server) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 rounded-full warm-loading" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-semibold text-warm-ink">
          {t('serverDetail.notFound', { name: decodedName })}
        </p>
        <button
          onClick={() => navigate('/servers')}
          className="mt-6 warm-transition text-sm font-medium text-warm-caramel hover:text-warm-terracotta"
        >
          ← {t('serverDetail.backToServers')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-warm-warmGray">
        <Link to="/servers" className="warm-transition hover:text-warm-caramel">
          {t('nav.servers')}
        </Link>
        <span>/</span>
        <span className="font-medium text-warm-ink">{server.name}</span>
      </nav>

      {/* Server header */}
      <section className="rounded-warm-card border border-warm-camel/40 bg-warm-cream p-6 shadow-warm-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warm-terracotta/15 font-serif text-2xl font-semibold text-warm-caramel ring-1 ring-warm-camel/30">
            {server.name.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl font-semibold text-warm-ink">{server.name}</h1>
              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-warm-pill px-2.5 py-0.5 text-xs font-medium ring-1 ${
                  isConnected
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : isConnecting
                      ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                      : 'bg-warm-beige text-warm-warmGray ring-warm-camel/20'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected
                      ? 'bg-green-500'
                      : isConnecting
                        ? 'bg-yellow-400 animate-pulse'
                        : 'bg-warm-warmGray/40'
                  }`}
                />
                {isConnected
                  ? t('status.online')
                  : isConnecting
                    ? t('status.connecting')
                    : t('status.offline')}
              </span>
              {/* Type badge */}
              {server.config?.type && (
                <span className="inline-flex items-center rounded-warm-pill bg-warm-beige px-2.5 py-0.5 text-xs font-medium text-warm-warmGray ring-1 ring-warm-camel/25">
                  {server.config.type.toUpperCase()}
                </span>
              )}
            </div>

            {server.config?.description && (
              <p className="mt-2 text-sm leading-relaxed text-warm-warmGray">
                {server.config.description}
              </p>
            )}

            {/* Stats */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-warm-warmGray">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-warm-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-warm-gold">
                  {t('home.toolsCount', { count: tools.length })}
                </span>
              </span>
              {prompts.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5 text-warm-caramel"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  </svg>
                  <span className="font-medium text-warm-caramel">
                    {prompts.length} {t('serverDetail.prompts')}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tools section */}
      {tools.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-lg font-semibold text-warm-ink">
            {t('serverDetail.tools')}
          </h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <ToolCard
                key={tool.name}
                server={server.name}
                tool={tool}
                onToggle={handleToolToggle}
              />
            ))}
          </div>
        </section>
      )}

      {tools.length === 0 && !isLoading && (
        <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream py-14 text-center text-warm-warmGray shadow-warm-sm">
          {t('serverDetail.noTools')}
        </div>
      )}
    </div>
  );
};

export default ServerDetailPage;
