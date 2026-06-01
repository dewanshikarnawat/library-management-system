import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { FiAlertTriangle } from 'react-icons/fi'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle size={26} className="text-red-500" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2 text-surface-900 dark:text-surface-50">{title}</h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}