import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudServer, CloudServerTool, ServerConfig } from '@/types';
import { apiGet } from '@/utils/fetchInterceptor';
import { useSettingsData } from '@/hooks/useSettingsData';
import MCPRouterApiKeyError from './MCPRouterApiKeyError';
import ServerForm from './ServerForm';

interface CloudServerDetailProps {
  serverName: string;
  onBack: () => void;
  onCallTool?: (serverName: string, toolName: string, args: Record<string, any>) => Promise<any>;
  fetchServerTools?: (serverName: string) => Promise<CloudServerTool[]>;
  onInstall?: (server: CloudServer, config: ServerConfig) => void;
  installing?: boolean;
  isInstalled?: boolean;
}

const CloudServerDetail: React.FC<CloudServerDetailProps> = ({
  serverName,
  onBack,
  onCallTool,
  fetchServerTools,
  onInstall,
  installing = false,
  isInstalled = false
}) => {
  const { t } = useTranslation();
  const { mcpRouterConfig } = useSettingsData();
  const [server, setServer] = useState<CloudServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<CloudServerTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [toolsApiKeyError, setToolsApiKeyError] = useState(false);
  const [toolCallLoading, setToolCallLoading] = useState<string | null>(null);
  const [toolCallResults, setToolCallResults] = useState<Record<string, any>>({});
  const [toolArgs, setToolArgs] = useState<Record<string, Record<string, any>>>({});
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  // Helper function to check if error is MCPRouter API key not configured
  const isMCPRouterApiKeyError = (errorMessage: string) => {
    console.error('Checking for MCPRouter API key error:', errorMessage);
    return errorMessage === 'MCPROUTER_API_KEY_NOT_CONFIGURED' ||
      errorMessage.toLowerCase().includes('mcprouter api key not configured');
  };

  // Helper function to determine button state for install
  const getInstallButtonProps = () => {
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

  // Handle install button click
  const handleInstall = () => {
    if (!isInstalled && onInstall) {
      setModalVisible(true);
      setInstallError(null);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setInstallError(null);
  };

  // Handle install form submission
  const handleInstallSubmit = async (payload: any) => {
    try {
      if (!server || !onInstall) return;

      setInstallError(null);
      onInstall(server, payload.config);
      setModalVisible(false);
    } catch (err) {
      console.error('Error installing server:', err);
      setInstallError(t('errors.serverInstall'));
    }
  };

  // Load server details
  useEffect(() => {
    const loadServerDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet(`/cloud/servers/${serverName}`);

        if (response && response.success && response.data) {
          setServer(response.data);
          setTools(response.data.tools || []);
        } else {
          setError(t('cloud.serverNotFound'));
        }
      } catch (err) {
        console.error('Failed to load server details:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    loadServerDetails();
  }, [serverName, t]);

  // Load tools if not already loaded
  useEffect(() => {
    const loadTools = async () => {
      if (server && (!server.tools || server.tools.length === 0) && fetchServerTools) {
        setLoadingTools(true);
        setToolsApiKeyError(false);
        try {
          const fetchedTools = await fetchServerTools(server.name);
          setTools(fetchedTools);
        } catch (error) {
          console.error('Failed to load tools:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (isMCPRouterApiKeyError(errorMessage)) {
            setToolsApiKeyError(true);
          }
        } finally {
          setLoadingTools(false);
        }
      }
    };

    loadTools();
  }, [server?.name, server?.tools, fetchServerTools]);

  // Format creation date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateStr;
    }
  };

  // Handle tool argument changes
  const handleArgChange = (toolName: string, argName: string, value: any) => {
    setToolArgs(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        [argName]: value
      }
    }));
  };

  // Handle tool call
  const handleCallTool = async (toolName: string) => {
    if (!onCallTool || !server) return;

    setToolCallLoading(toolName);
    try {
      const args = toolArgs[toolName] || {};
      const result = await onCallTool(server.server_key, toolName, args);
      setToolCallResults(prev => ({
        ...prev,
        [toolName]: result
      }));
    } catch (error) {
      console.error('Tool call failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setToolCallResults(prev => ({
        ...prev,
        [toolName]: { error: errorMessage }
      }));
    } finally {
      setToolCallLoading(null);
    }
  };

  // Toggle schema visibility
  const toggleSchema = (toolName: string) => {
    setExpandedSchemas(prev => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  // Render tool input field based on schema
  const renderToolInput = (tool: CloudServerTool, propName: string, propSchema: any) => {
    const currentValue = toolArgs[tool.name]?.[propName] || '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: any = e.target.value;

      // Convert value based on schema type
      if (propSchema.type === 'number' || propSchema.type === 'integer') {
        value = value === '' ? undefined : Number(value);
      } else if (propSchema.type === 'boolean') {
        value = e.target.value === 'true';
      }

      handleArgChange(tool.name, propName, value);
    };

    if (propSchema.type === 'boolean') {
      return (
        <select
          value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
        >
          <option value=""></option>
          <option value="true">{t('common.true')}</option>
          <option value="false">{t('common.false')}</option>
        </select>
      );
    } else if (propSchema.type === 'number' || propSchema.type === 'integer') {
      return (
        <input
          type="number"
          step={propSchema.type === 'integer' ? '1' : 'any'}
          value={currentValue || ''}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={currentValue || ''}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
        />
      );
    }
  };

  return (
    <div className="page-card p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="group inline-flex items-center text-warm-warmGray transition-colors hover:text-warm-ink"
        >
          <svg className="mr-2 h-5 w-5 transform transition-transform group-hover:-translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t('cloud.backToList')}
        </button>
      </div>

      {loading ? (
        <div className="page-card p-12">
          <div className="flex flex-col items-center">
            <svg className="mb-4 h-12 w-12 animate-spin text-warm-caramel" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg text-warm-warmGray">{t('app.loading')}</p>
          </div>
        </div>
      ) : error && !isMCPRouterApiKeyError(error) ? (
        <div className="page-card p-6">
          <div className="rounded-warm-card border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : !server ? (
        <div className="page-card p-12">
          <div className="text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-warm-warmGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-lg text-warm-warmGray">{t('cloud.serverNotFound')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Server Header Card */}
          <div className="overflow-hidden rounded-warm-card border border-warm-camel/40 bg-warm-cream shadow-warm-sm">
            <div className="bg-gradient-to-r from-warm-beige to-warm-cream px-6 py-4">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <h1 className="mb-2 text-2xl font-semibold text-warm-ink">
                    {server.title || server.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-warm-warmGray">
                    <span className="rounded-full bg-warm-cream/80 px-3 py-1 text-sm text-warm-ink">
                      {server.name}
                    </span>
                    <div className="flex items-center">
                      <svg className="mr-1 h-4 w-4 text-warm-warmGray" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {t('cloud.by')} {server.author_name}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                  <div className="text-xs text-warm-warmGray">
                    {t('cloud.updated')}: {formatDate(server.updated_at)}
                  </div>
                  {onInstall && !isMCPRouterApiKeyError(error || '') && !toolsApiKeyError && (
                    <button
                      onClick={handleInstall}
                      disabled={getInstallButtonProps().disabled}
                      className={getInstallButtonProps().className}
                    >
                      {getInstallButtonProps().text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="page-card p-6">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-warm-ink">
              <svg className="mr-2 h-5 w-5 text-warm-warmGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('cloud.description')}
            </h2>
            <p className="leading-relaxed text-warm-warmGray">{server.description}</p>
          </div>

          {/* Content Card */}
          {server.content && (
            <div className="page-card p-6">
              <h2 className="mb-4 flex items-center text-xl font-semibold text-warm-ink">
                <svg className="mr-2 h-5 w-5 text-warm-warmGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('cloud.details')}
              </h2>
              <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream/70 p-4 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm text-warm-ink">{server.content}</pre>
              </div>
            </div>
          )}

          {/* Tools Card */}
          <div className="page-card p-6">
            <h2 className="mb-4 flex items-center text-xl font-semibold text-warm-ink">
              <svg className="mr-2 h-5 w-5 text-warm-warmGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('cloud.tools')}
              {tools.length > 0 && (
                <span className="ml-2 rounded-full bg-warm-beige px-2.5 py-0.5 text-sm font-medium text-warm-caramel">
                  {tools.length}
                </span>
              )}
            </h2>

            {/* Check for API key error */}
            {toolsApiKeyError && (
              <MCPRouterApiKeyError />
            )}

            {loadingTools ? (
              <div className="flex items-center justify-center py-12">
                <svg className="mr-3 h-8 w-8 animate-spin text-warm-caramel" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-warm-warmGray">{t('cloud.loadingTools')}</span>
              </div>
            ) : tools.length === 0 && !toolsApiKeyError ? (
              <div className="py-12 text-center">
                <svg className="mx-auto mb-4 h-12 w-12 text-warm-warmGray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-warm-warmGray">{t('cloud.noTools')}</p>
              </div>
            ) : tools.length > 0 ? (
              <div className="space-y-4">
                {tools.map((tool, index) => (
                  <div
                    key={index}
                    className="rounded-warm-card border border-warm-camel/40 p-6 transition-colors hover:border-warm-camel/60"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 flex items-center text-lg font-medium text-warm-ink">
                          <span className="mr-3 rounded-full bg-warm-beige px-2 py-1 text-xs font-medium text-warm-caramel">
                            TOOL
                          </span>
                          {tool.name}
                        </h3>
                        <p className="whitespace-pre-wrap leading-relaxed text-warm-warmGray">
                          {tool.description}
                        </p>
                      </div>
                      {onCallTool && (
                        <button
                          onClick={() => handleCallTool(tool.name)}
                          disabled={toolCallLoading === tool.name}
                          className="ml-4 flex min-w-[100px] items-center justify-center rounded-warm-btn bg-warm-caramel px-4 py-2 text-sm font-medium text-warm-cream shadow-warm-sm transition-colors hover:bg-warm-terracotta disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {toolCallLoading === tool.name ? (
                            <>
                              <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t('cloud.calling')}
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6m2 8l4-4H7l4 4z" />
                              </svg>
                              {t('cloud.callTool')}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Tool inputs */}
                    {tool.inputSchema && tool.inputSchema.properties && Object.keys(tool.inputSchema.properties).length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <div className="mb-4 flex items-center gap-3">
                          <h4 className="text-sm font-medium text-warm-ink">
                            {t('cloud.parameters')}
                          </h4>
                          <button
                            onClick={() => toggleSchema(tool.name)}
                            className="flex items-center gap-1 text-sm text-warm-caramel transition-colors hover:text-warm-rust focus:outline-none"
                          >
                            {t('cloud.viewSchema')}
                            <svg
                              className={`h-3 w-3 transition-transform duration-200 ${expandedSchemas[tool.name] ? 'rotate-90' : 'rotate-0'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>

                        {/* Schema content */}
                        {expandedSchemas[tool.name] && (
                          <div className="mb-4">
                            <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream/70 p-3 overflow-auto">
                              <pre className="text-sm text-warm-ink">
                                {JSON.stringify(tool.inputSchema, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          {Object.entries(tool.inputSchema.properties).map(([propName, propSchema]: [string, any]) => (
                            <div key={propName} className="space-y-2">
                              <label className="block text-sm font-medium text-warm-ink">
                                {propName}
                                {tool.inputSchema.required?.includes(propName) && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              {propSchema.description && (
                                <p className="text-xs text-warm-warmGray">{propSchema.description}</p>
                              )}
                              {renderToolInput(tool, propName, propSchema)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tool call result */}
                    {toolCallResults[tool.name] && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        {toolCallResults[tool.name].error ? (
                          <>
                            {isMCPRouterApiKeyError(toolCallResults[tool.name].error) ? (
                              <MCPRouterApiKeyError />
                            ) : (
                              <>
                                <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
                                  <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  {t('cloud.error')}
                                </h4>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <pre className="text-sm text-red-800 whitespace-pre-wrap overflow-auto">
                                    {toolCallResults[tool.name].error}
                                  </pre>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                              <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {t('cloud.result')}
                            </h4>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto">
                                {JSON.stringify(toolCallResults[tool.name], null, 2)}
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Install Modal */}
      {modalVisible && server && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <ServerForm
            onSubmit={handleInstallSubmit}
            onCancel={handleModalClose}
            modalTitle={t('cloud.installServer', { name: server.title || server.name })}
            formError={installError}
            initialData={{
              name: server.name,
              status: 'disconnected',
              config: {
                type: 'streamable-http',
                url: server.server_url,
                headers: {
                  'Authorization': `Bearer ${mcpRouterConfig.apiKey || '<MCPROUTER_API_KEY>'}`,
                  'HTTP-Referer': mcpRouterConfig.referer || '<YOUR_APP_URL>',
                  'X-Title': mcpRouterConfig.title || '<YOUR_APP_NAME>'
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CloudServerDetail;
