import React from 'react'
import classnames from 'classnames'

export interface UploadProps {
  onChange: (file: File) => void
  text?: string
  children?: React.ReactNode
  className?: string
  accept?: HTMLInputElement['accept']
}

const Upload: React.FC<UploadProps> = props => {
  const { children, text, className, accept, onChange } = props

  const [fileName, setFileName] = React.useState("")

  const id = React.useMemo(() => {
    return `upload-${Date.now()}`
  }, [])

  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files[0]
    if (!file) return
    onChange(file)
    setFileName(file.name)
  }

  return (
    <span>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="hidden"
      />
      <label htmlFor={id}>
        {children}
        {text && (
          <a className={classnames("link link-neutral", className)}>
            {fileName || text}
          </a>
        )}
      </label>
    </span>
  )
}

export default Upload
