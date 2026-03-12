import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tool } from '@/types';
import {
  ChevronDown,
  ChevronRight,
  Play,
  Loader,
  Edit,
  Check,
  Copy,
} from '@/components/icons/LucideIcons';
import { callTool, ToolCallResult, updateToolDescription } from '@/services/toolService';
import { useSettingsData } from '@/hooks/useSettingsData';
import { useToast } from '@/contexts/ToastContext';
import { Switch } from './ToggleGroup';
import DynamicForm from './DynamicForm';
import ToolResult from './ToolResult';

interface ToolCardProps {
  server: string;
  tool: Tool;
  onToggle?: (toolName: string, enabled: boolean) => void;
  onDescriptionUpdate?: (toolName: string, description: string) => void;
}

// Helper to check for "empty" values
function isEmptyValue(value: any): boolean {
  if (value == null) return true; // null or undefined
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

const ToolCard = ({ tool, server, onToggle, onDescriptionUpdate }: ToolCardProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { nameSeparator } = useSettingsData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRunForm, setShowRunForm] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ToolCallResult | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [customDescription, setCustomDescription] = useState(tool.description || '');
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [copiedToolName, setCopiedToolName] = useState(false);

  // Focus the input when editing mode is activated
  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      // Set input width to match text width
      if (textWidth > 0) {
        descriptionInputRef.current.style.width = `${textWidth + 20}px`; // Add some padding
      }
    }
  }, [isEditingDescription, textWidth]);

  // Measure text width when not editing
  useEffect(() => {
    if (!isEditingDescription && descriptionTextRef.current) {
      setTextWidth(descriptionTextRef.current.offsetWidth);
    }
  }, [isEditingDescription, customDescription]);

  // Generate a unique key for localStorage based on tool name and server
  const getStorageKey = useCallback(() => {
    return `mcphub_tool_form_${server ? `${server}_` : ''}${tool.name}`;
  }, [tool.name, server]);

  // Clear form data from localStorage
  const clearStoredFormData = useCallback(() => {
    localStorage.removeItem(getStorageKey());
  }, [getStorageKey]);

  const handleToggle = (enabled: boolean) => {
    if (onToggle) {
      onToggle(tool.name, enabled);
    }
  };

  const handleDescriptionEdit = () => {
    setIsEditingDescription(true);
  };

  const handleDescriptionSave = async () => {
    try {
      const result = await updateToolDescription(server, tool.name, customDescription);
      if (result.success) {
        setIsEditingDescription(false);
        if (onDescriptionUpdate) {
          onDescriptionUpdate(tool.name, customDescription);
        }
      } else {
        // Revert on error
        setCustomDescription(tool.description || '');
        console.error('Failed to update tool description:', result.error);
      }
    } catch (error) {
      console.error('Error updating tool description:', error);
      setCustomDescription(tool.description || '');
      setIsEditingDescription(false);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDescription(e.target.value);
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setCustomDescription(tool.description || '');
      setIsEditingDescription(false);
    }
  };

  const handleCopyToolName = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(tool.name);
        setCopiedToolName(true);
        showToast(t('common.copySuccess'), 'success');
        setTimeout(() => setCopiedToolName(false), 2000);
      } else {
        // Fallback for HTTP or unsupported clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = tool.name;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedToolName(true);
          showToast(t('common.copySuccess'), 'success');
          setTimeout(() => setCopiedToolName(false), 2000);
        } catch (err) {
          showToast(t('common.copyFailed'), 'error');
          console.error('Copy to clipboard failed:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      showToast(t('common.copyFailed'), 'error');
      console.error('Copy to clipboard failed:', error);
    }
  };

  const handleRunTool = async (arguments_: Record<string, any>) => {
    setIsRunning(true);
    try {
      // filter empty values
      arguments_ = Object.fromEntries(
        Object.entries(arguments_).filter(([_, v]) => !isEmptyValue(v)),
      );
      const result = await callTool(
        {
          toolName: tool.name,
          arguments: arguments_,
        },
        server,
      );

      setResult(result);
      // Clear form data on successful submission
      // clearStoredFormData()
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCancelRun = () => {
    setShowRunForm(false);
    // Clear form data when cancelled
    clearStoredFormData();
    setResult(null);
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  return (
    <div className="page-card mb-4">
      <div
        className="flex justify-between items-center cursor-pointer p-2"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex-1">
          <h3 className="inline-flex items-center text-lg font-medium text-warm-ink">
            {tool.name.replace(server + nameSeparator, '')}
            <button
              className="ml-2 cursor-pointer p-1 text-warm-warmGray transition-colors hover:text-warm-caramel"
              onClick={handleCopyToolName}
              title={t('common.copy')}
            >
              {copiedToolName ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <span className="ml-2 inline-flex items-center text-sm font-normal text-warm-warmGray">
              {isEditingDescription ? (
                <>
                  <input
                    ref={descriptionInputRef}
                    type="text"
                    className="form-input px-2 py-1 text-sm focus:outline-none"
                    value={customDescription}
                    onChange={handleDescriptionChange}
                    onKeyDown={handleDescriptionKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      minWidth: '100px',
                      width: textWidth > 0 ? `${textWidth + 20}px` : 'auto',
                    }}
                  />
                  <button
                    className="ml-2 cursor-pointer p-1 text-green-600 transition-colors hover:text-green-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDescriptionSave();
                    }}
                  >
                    <Check size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span ref={descriptionTextRef}>
                    {customDescription || t('tool.noDescription')}
                  </span>
                  <button
                    className="ml-2 cursor-pointer p-1 text-warm-warmGray transition-colors hover:text-warm-caramel"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDescriptionEdit();
                    }}
                  >
                    <Edit size={14} />
                  </button>
                </>
              )}
            </span>
          </h3>
        </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={tool.enabled ?? true}
              onCheckedChange={handleToggle}
              disabled={isRunning}
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true); // Ensure card is expanded when showing run form
              setShowRunForm(true);
            }}
            className="btn-primary flex items-center space-x-1 px-3 py-1 text-sm"
            disabled={isRunning || !tool.enabled}
          >
            {isRunning ? <Loader size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{isRunning ? t('tool.running') : t('tool.run')}</span>
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 p-4 pt-0">
          {/* Schema Display */}
          {!showRunForm && (
            <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream/70 p-3">
              <h4 className="mb-2 text-sm font-medium text-warm-ink">{t('tool.inputSchema')}</h4>
              <pre className="overflow-auto text-xs text-warm-warmGray">
                {JSON.stringify(tool.inputSchema, null, 2)}
              </pre>
            </div>
          )}

          {/* Run Form */}
          {showRunForm && (
            <div className="rounded-warm-card border border-warm-camel/40 bg-warm-cream/60 p-4 dark:bg-warm-ink/10 dark:border-warm-camel/20">
              <DynamicForm
                schema={tool.inputSchema || { type: 'object' }}
                onSubmit={handleRunTool}
                onCancel={handleCancelRun}
                loading={isRunning}
                storageKey={getStorageKey()}
                title={t('tool.runToolWithName', {
                  name: tool.name.replace(server + nameSeparator, ''),
                })}
              />
              {/* Tool Result */}
              {result && (
                <div className="mt-4">
                  <ToolResult result={result} onClose={handleCloseResult} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCard;
