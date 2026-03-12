import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useServerData } from '@/hooks/useServerData';
import { useMarketData } from '@/hooks/useMarketData';
import { Layers, Zap, ShoppingBag } from 'lucide-react';

const HOME_MARKET_PREVIEW_SIZE = 6;

const warmTransition = 'warm-transition';

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 rounded-warm-card border border-warm-camel/30 bg-warm-cream px-4 py-5 text-center shadow-warm-sm">
      <span className="font-serif text-3xl font-bold text-warm-caramel">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wider text-warm-warmGray">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-warm-card border border-warm-camel/30 bg-warm-cream p-6 shadow-warm-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-warm-terracotta/15 text-warm-caramel">
        {icon}
      </div>
      <h3 className="mb-1.5 font-semibold text-warm-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-warm-warmGray">{description}</p>
    </div>
  );
}

function ServerCard({
  name,
  description,
  to,
  toolsLabel,
}: {
  name: string;
  description?: string;
  toolsCount: number;
  to: string;
  toolsLabel: string;
}) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <Link
      to={to}
      className={`${warmTransition} warm-card-hover block rounded-warm-card border border-warm-camel/50 bg-warm-cream p-5 shadow-warm-sm`}
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm-terracotta/20 font-serif text-base font-semibold text-warm-caramel">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-warm-ink">{name}</h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-warm-warmGray">
              {description}
            </p>
          )}
          <p className="mt-2 text-xs text-warm-gold">{toolsLabel}</p>
        </div>
      </div>
    </Link>
  );
}

function MarketCard({
  name,
  displayName,
  description,
  toolsLabel,
  to,
}: {
  name: string;
  displayName: string;
  description?: string;
  toolsLabel: string;
  to: string;
}) {
  const initial = (displayName || name).charAt(0).toUpperCase();
  return (
    <Link
      to={to}
      className={`${warmTransition} warm-card-hover block rounded-warm-card border border-warm-camel/50 bg-warm-cream p-5 shadow-warm-sm`}
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warm-terracotta/20 font-serif text-base font-semibold text-warm-caramel">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-warm-ink">
            {displayName || name}
          </h3>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-warm-warmGray">
              {description}
            </p>
          )}
          <p className="mt-2 text-xs text-warm-gold">{toolsLabel}</p>
        </div>
      </div>
    </Link>
  );
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { allServers, isLoading: serversLoading, refreshIfNeeded } = useServerData({
    refreshOnMount: true,
  });
  const {
    allServers: marketServers,
    loading: marketLoading,
    fetchMarketServers,
  } = useMarketData();

  useEffect(() => {
    fetchMarketServers();
  }, [fetchMarketServers]);

  useEffect(() => {
    refreshIfNeeded();
  }, [refreshIfNeeded]);

  const onlineServers = allServers.filter((s) => s.status === 'connected');
  const marketPreview = marketServers.slice(0, HOME_MARKET_PREVIEW_SIZE);

  const totalTools = useMemo(
    () => onlineServers.reduce((acc, s) => acc + (s.tools?.length ?? 0), 0),
    [onlineServers],
  );

  return (
    <div className="flex flex-col">
      {/* Hero - warm serif title + CTA buttons */}
      <section className="py-14 text-center sm:py-20">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-warm-ink sm:text-4xl">
          {t('home.heroTitle')}
        </h1>
        <p className="mx-auto mt-4 max-w-[32ch] text-base leading-relaxed text-warm-warmGray sm:max-w-xl">
          {t('home.heroSubtitle')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/servers"
            className="warm-transition warm-btn-hover inline-flex items-center gap-2 rounded-warm-pill bg-warm-caramel px-6 py-2.5 text-sm font-medium text-warm-cream shadow-warm-sm"
          >
            {t('home.viewServers')}
          </Link>
          <Link
            to="/market"
            className="warm-transition inline-flex items-center gap-2 rounded-warm-pill border border-warm-camel/50 bg-warm-cream px-6 py-2.5 text-sm font-medium text-warm-caramel shadow-warm-sm hover:bg-warm-beige"
          >
            {t('home.viewMarket')}
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      {!serversLoading && (
        <section className="mb-14">
          <div className="flex flex-col gap-4 sm:flex-row">
            <StatCard value={onlineServers.length} label={t('home.stats.connected')} />
            <StatCard value={totalTools} label={t('home.stats.tools')} />
            <StatCard value={marketServers.length} label={t('home.stats.market')} />
          </div>
        </section>
      )}

      {/* Feature highlights */}
      <section className="mb-16">
        <h2 className="mb-6 font-serif text-lg font-semibold text-warm-ink">
          {t('home.features.title')}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<Layers className="h-5 w-5" />}
            title={t('home.features.hub')}
            description={t('home.features.hubDesc')}
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title={t('home.features.routing')}
            description={t('home.features.routingDesc')}
          />
          <FeatureCard
            icon={<ShoppingBag className="h-5 w-5" />}
            title={t('home.features.marketplace')}
            description={t('home.features.marketplaceDesc')}
          />
        </div>
      </section>

      {/* Online MCP Servers */}
      <section className="mt-4">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-warm-ink">
            {t('home.onlineServersTitle')}
          </h2>
          <Link
            to="/servers"
            className="warm-transition text-sm font-medium text-warm-caramel hover:text-warm-terracotta"
          >
            {t('home.viewAllServers')}
          </Link>
        </div>

        {serversLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 rounded-full warm-loading" />
          </div>
        ) : onlineServers.length === 0 ? (
          <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream py-14 text-center text-warm-warmGray shadow-warm-sm">
            {t('home.noOnlineServers')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {onlineServers.map((s) => (
              <ServerCard
                key={s.name}
                name={s.name}
                description={s.config?.description}
                toolsCount={s.tools?.length ?? 0}
                toolsLabel={t('home.toolsCount', { count: s.tools?.length ?? 0 })}
                to={`/servers/${encodeURIComponent(s.name)}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Market */}
      <section className="mt-16">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-warm-ink">
            {t('home.featuredMarket')}
          </h2>
          <Link
            to="/market"
            className="warm-transition text-sm font-medium text-warm-caramel hover:text-warm-terracotta"
          >
            {t('home.viewAllMarket')}
          </Link>
        </div>

        {marketLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 rounded-full warm-loading" />
          </div>
        ) : marketPreview.length === 0 ? (
          <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream py-14 text-center text-warm-warmGray shadow-warm-sm">
            {t('market.fetchError')}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketPreview.map((m) => (
              <MarketCard
                key={m.name}
                name={m.name}
                displayName={m.display_name || m.name}
                description={m.description}
                toolsLabel={t('home.toolsCount', { count: m.tools?.length ?? 0 })}
                to={`/market/${encodeURIComponent(m.name)}?tab=local`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
