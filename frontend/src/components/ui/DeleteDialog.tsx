import { useTranslation } from 'react-i18next'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  serverName: string
  isGroup?: boolean
  isUser?: boolean
}

const DeleteDialog = ({ isOpen, onClose, onConfirm, serverName, isGroup = false, isUser = false }: DeleteDialogProps) => {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-30 p-4">
      <div className="page-card max-w-md">
        <div className="p-6">
          <h3 className="mb-3 font-serif text-lg font-semibold text-warm-ink">
            {isUser
              ? t('users.confirmDelete')
              : isGroup
                ? t('groups.confirmDelete')
                : t('server.confirmDelete')}
          </h3>
          <p className="mb-6 text-warm-warmGray">
            {isUser
              ? t('users.deleteWarning', { username: serverName })
              : isGroup
                ? t('groups.deleteWarning', { name: serverName })
                : t('server.deleteWarning', { name: serverName })}
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="btn-danger px-4 py-2 text-sm"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteDialog