import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MarketServer, MarketServerInstallation } from '@/types';
import ServerForm from './ServerForm';
import { detectVariables } from '../utils/variableDetection';

import { ServerConfig } from '@/types';

interface MarketServerDetailProps {
  server: MarketServer;
  onBack: () => void;
  onInstall: (server: MarketServer, config: ServerConfig) => void;
  installing?: boolean;
  isInstalled?: boolean;
}

const MarketServerDetail: React.FC<MarketServerDetailProps> = ({
  server,
  onBack,
  onInstall,
  installing = false,
  isInstalled = false,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  // Helper function to determine button state
  const getButtonProps = () => {
    if (isInstalled) {
      return {
        className: 'btn-secondary cursor-default px-4 py-2 text-sm font-medium text-green-700',
        disabled: true,
        text: t('market.installed'),
      };
    } else if (installing) {
      return {
        className:
          'btn-secondary cursor-not-allowed px-4 py-2 text-sm font-medium text-warm-warmGray/70',
        disabled: true,
        text: t('market.installing'),
      };
    } else {
      return {
        className: 'btn-primary px-4 py-2 text-sm font-medium',
        disabled: false,
        text: t('market.install'),
      };
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
    setError(null); // Clear any previous errors when toggling modal
    setConfirmationVisible(false);
    setPendingPayload(null);
  };

  const handleConfirmInstall = async () => {
    if (pendingPayload) {
      await proceedWithInstall(pendingPayload);
      setConfirmationVisible(false);
      setPendingPayload(null);
    }
  };

  const proceedWithInstall = async (payload: any) => {
    try {
      setError(null);
      onInstall(server, payload.config);
      setModalVisible(false);
    } catch (err) {
      console.error('Error installing server:', err);
      setError(t('errors.serverInstall'));
    }
  };

  const handleInstall = () => {
    if (!isInstalled) {
      toggleModal();
    }
  };

  // Get the preferred installation configuration based on priority:
  // npm > uvx > default
  const getPreferredInstallation = (): MarketServerInstallation | undefined => {
    if (!server.installations) {
      return undefined;
    }

    if (server.installations.npm) {
      return server.installations.npm;
    } else if (server.installations.uvx) {
      return server.installations.uvx;
    } else if (server.installations.default) {
      return server.installations.default;
    }

    // If none of the preferred types are available, get the first available installation type
    const installTypes = Object.keys(server.installations);
    if (installTypes.length > 0) {
      return server.installations[installTypes[0]];
    }

    return undefined;
  };

  const handleSubmit = async (payload: any) => {
    try {
      // Check for variables in the payload
      const variables = detectVariables(payload);

      if (variables.length > 0) {
        // Show confirmation dialog
        setDetectedVariables(variables);
        setPendingPayload(payload);
        setConfirmationVisible(true);
      } else {
        // Install directly if no variables found
        await proceedWithInstall(payload);
      }
    } catch (err) {
      console.error('Error processing server installation:', err);
      setError(t('errors.serverInstall'));
    }
  };

  const buttonProps = getButtonProps();
  const preferredInstallation = getPreferredInstallation();

  return (
    <div className="page-card p-6">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-warm-warmGray hover:text-warm-ink"
        >
          <svg
            className="h-5 w-5 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {t('market.backToList')}
        </button>
      </div>

      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="flex flex-wrap items-center text-2xl font-semibold text-warm-ink">
            {server.display_name}
            <span className="ml-2 text-sm font-normal text-warm-warmGray">
              ({server.name})
            </span>
            <span className="ml-4 text-sm font-normal text-warm-warmGray">
              {t('market.author')}: {server.author?.name || t('market.unknown')} •{' '}
              {t('market.license')}: {server.license} •
              <a
                href={server.repository.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-warm-caramel hover:underline"
              >
                {t('market.repository')}
              </a>
            </span>
          </h2>
        </div>

        <div className="flex items-center">
          {server.is_official && (
            <span className="mr-2 flex items-center rounded-full bg-warm-beige px-4 py-2 text-sm font-normal text-warm-caramel">
              {t('market.official')}
            </span>
          )}
          <button
            onClick={handleInstall}
            disabled={buttonProps.disabled}
            className={buttonProps.className}
          >
            {buttonProps.text}
          </button>
        </div>
      </div>

      <p className="mb-6 text-warm-warmGray">{server.description}</p>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-warm-ink">
          {t('market.categories')} & {t('market.tags')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {server.categories?.map((category, index) => (
            <span
              key={`cat-${index}`}
              className="rounded-full bg-warm-beige px-3 py-1 text-sm text-warm-warmGray"
            >
              {category}
            </span>
          ))}
          {server.tags &&
            server.tags.map((tag, index) => (
              <span
                key={`tag-${index}`}
                className="rounded-full bg-emerald-50 px-2 py-1 text-sm text-emerald-700"
              >
                #{tag}
              </span>
            ))}
        </div>
      </div>

      {server.arguments && Object.keys(server.arguments).length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-warm-ink">
            {t('market.arguments')}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="border-b border-warm-camel/40 bg-warm-cream">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('market.argumentName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('market.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('market.required')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('market.example')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-warm-cream">
                {Object.entries(server.arguments).map(([name, arg], index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{arg.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {arg.required ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-600">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded">{arg.example}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{t('market.tools')}</h3>
        <div className="space-y-4">
          {server.tools?.map((tool, index) => (
            <div key={index} className="border border-gray-200 rounded p-4">
              <h4 className="font-medium mb-2">
                {tool.name}
                <button
                  type="button"
                  onClick={() => {
                    // Toggle visibility of schema (simplified for this implementation)
                    const element = document.getElementById(`schema-${index}`);
                    if (element) {
                      element.classList.toggle('hidden');
                    }
                  }}
                  className="text-sm text-blue-500 font-normal hover:underline focus:outline-none ml-2"
                >
                  {t('market.viewSchema')}
                </button>
              </h4>
              <p className="text-gray-600 mb-2">{tool.description}</p>
              <div className="mt-2">
                <pre
                  id={`schema-${index}`}
                  className="hidden bg-gray-50 p-3 rounded text-sm overflow-auto mt-2"
                >
                  {JSON.stringify(tool.inputSchema, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {server.examples && server.examples.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{t('market.examples')}</h3>
          <div className="space-y-4">
            {server.examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded p-4">
                <h4 className="font-medium mb-2">{example.title}</h4>
                <p className="text-gray-600 mb-2">{example.description}</p>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">{example.prompt}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleInstall}
          disabled={buttonProps.disabled}
          className={buttonProps.className}
        >
          {buttonProps.text}
        </button>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <ServerForm
            onSubmit={handleSubmit}
            onCancel={toggleModal}
            modalTitle={t('market.installServer', { name: server.display_name })}
            formError={error}
            initialData={{
              name: server.name,
              status: 'disconnected',
              config: preferredInstallation
                ? {
                    command: preferredInstallation.command || '',
                    args: preferredInstallation.args || [],
                    env: preferredInstallation.env || {},
                  }
                : undefined,
            }}
          />
        </div>
      )}

      {confirmationVisible && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('server.confirmVariables')}
            </h3>
            <p className="text-gray-600 mb-4">{t('server.variablesDetected')}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    {t('server.detectedVariables')}:
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700">
                    {detectedVariables.map((variable, index) => (
                      <li key={index} className="font-mono">
                        ${`{${variable}}`}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">{t('market.confirmVariablesMessage')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setConfirmationVisible(false);
                  setPendingPayload(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleConfirmInstall}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 btn-primary"
              >
                {t('market.confirmAndInstall')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketServerDetail;
