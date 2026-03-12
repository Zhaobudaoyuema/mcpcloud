// filepath: /Users/sunmeng/code/github/mcphub/frontend/src/pages/LogsPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import LogViewer from '../components/LogViewer';
import { useLogs } from '../services/logService';

const LogsPage: React.FC = () => {
  const { t } = useTranslation();
  const { logs, loading, error, clearLogs } = useLogs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-warm-ink">
          {t('pages.logs.title')}
        </h1>
      </div>
      <div className="page-card">
        <LogViewer logs={logs} isLoading={loading} error={error} onClear={clearLogs} />
      </div>
    </div>
  );
};

export default LogsPage;