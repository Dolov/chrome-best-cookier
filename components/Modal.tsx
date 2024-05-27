import React from 'react'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  title?: React.ReactNode
  onOk?: () => void
}

const Modal: React.FC<ModalProps> = props => {
  const { children, visible, onClose, title, onOk } = props

  const id = React.useMemo(() => {
    return `modal-${Date.now()}`
  }, [])

  React.useEffect(() => {
    const dialog: HTMLDialogElement = document.querySelector(`#${id}`)
    if (visible) {
      dialog.showModal()
      return
    }
    dialog.close()
  }, [visible])

  const handleOk = () => {
    if (onOk) onOk()
  }

  return (
    <dialog id={id} className="modal">
      <div className="modal-box flex flex-col">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4 flex-1 overflow-auto no-scrollbar">{children}</div>
        <div className="modal-action">
          <button onClick={onClose} className="btn btn-sm">取消</button>
          <button onClick={handleOk} className="btn btn-sm btn-primary">导入</button>
        </div>
      </div>
    </dialog>
  )
}

export default Modal
