import React from 'react'
import classnames from 'classnames'
import {
  MaterialSymbolsFilterAlt, MaterialSymbolsCheckCircleOutlineRounded
} from '~components/Icons'

export const BooleanDisplay = props => {
  const { value, className } = props
  const booleanValue = Boolean(value)
  if (booleanValue) {
    return (
      <div className={classnames("badge badge-sm", className)}>{`${booleanValue}`}</div>
    )
  }
  return (
    <div className="badge badge-sm badge-ghost">{`${booleanValue}`}</div>
  )
}

export const Input = props => {
  const { value, create, onChange, placeholder } = props
  const [innerValue, setInnerValue] = React.useState(value)

  const onValueChange = e => {
    if (e.target.value === value) return
    onChange(e.target.value)
  }

  const onKeyDown = e => {
    const target = e.target as HTMLInputElement
    if (e.key === 'Enter') {
      target.blur()
      onValueChange(e)
    }
  }

  return (
    <input
      type="text"
      value={innerValue}
      onBlur={onValueChange}
      onChange={e => setInnerValue(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={classnames("w-[180px] input-primary input-sm input-bordered", {
        "input": create
      })}
    />
  )
}

export const BooleanToggle = props => {
  const { value, onChange, className } = props
  return (
    <input
      type="checkbox"
      className={classnames("toggle", className)}
      checked={value}
      onChange={e => onChange(e.target.checked)}
    />
  )
}

export const SameSite = props => {
  const { value, onChange } = props
  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-sm m-1">{value}</div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li onClick={() => onChange('lax')}><a>lax</a></li>
        <li onClick={() => onChange('strict')}><a>strict</a></li>
        <li onClick={() => onChange('no_restriction')}><a>none</a></li>
        <li onClick={() => onChange('unspecified')}><a>unspecified</a></li>
      </ul>
    </div>
  )
}

export const HeaderDomain = props => {
  const { cookies, domainList, setDomainList } = props

  const domains: string[] = React.useMemo(() => {
    const list: string[] = Array.from(new Set(cookies.map(item => item.domain)))
    list.sort((a, b) => a?.length - b?.length)
    return list
  }, [cookies])

  const onChange = item => {
    const checked = domainList.includes(item)
    if (checked) {
      setDomainList(domainList.filter(type => type !== item))
      return
    }
    setDomainList([...domainList, item])
  }

  const len = domains.length
  const hasData = len > 0

  return (
    <div className="center">
      <span>domain</span>
      <div className="dropdown dropdown-bottom dropdown-end dropdown-hover">
        <button className="btn btn-sm btn-circle ml-2">
          <MaterialSymbolsFilterAlt className={classnames("text-lg", {
            "text-primary": !!domainList.length
          })} />
        </button>
        {hasData && (<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-56 shadow-2xl max-h-48 overflow-auto flex flex-col flex-nowrap">
          {domains.map(item => {
            const checked = domainList.includes(item)
            return (
              <li
                key={item}
                onClick={() => onChange(item)}
                className={classnames("w-full ellipsis")}
              >
                <a className="w-full flex pl-0">
                  <div className="w-4 pl-2 mr-2">
                    {checked && <MaterialSymbolsCheckCircleOutlineRounded className="text-lg text-primary" />}
                  </div>
                  <div className="ellipsis">{item}</div>
                </a>
              </li>
            )
          })}
        </ul>)}
      </div>
    </div>
  )
}

export const InputFilter = props => {
  const { value, onChange, placeholder } = props
  const inputRef = React.useRef<HTMLInputElement>()
  const detailsRef = React.useRef<HTMLDetailsElement>()

  const close = () => {
    if (!detailsRef.current) return
    detailsRef.current.open = false
  }

  const handleOpen: React.MouseEventHandler<HTMLElement> = e => {
    e.preventDefault()
    detailsRef.current.open = true
    inputRef.current.focus()
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') return
    close()
  }

  return (
    <details ref={detailsRef} className="dropdown">
      <summary className="m-1 btn btn-sm btn-circle" onClick={handleOpen}>
        <MaterialSymbolsFilterAlt className={classnames("text-lg", {
          "text-primary": !!value
        })} />
      </summary>
      <div tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-56 shadow-2xl max-h-48 overflow-auto flex flex-col flex-nowrap">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onBlur={close}
          onKeyDown={onKeyDown}
          onChange={e => onChange(e.target.value)}
          className="input input-sm input-bordered input-primary w-full"
          placeholder={placeholder}
        />
      </div>
    </details>
  )
}