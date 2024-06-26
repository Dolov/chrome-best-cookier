import React from 'react'
import classnames from 'classnames'
import {
  MaterialSymbolsFilterAlt, MaterialSymbolsCheckCircleOutlineRounded
} from '~components/Icons'
import { ga } from '~utils'

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
  const { value, create, onChange, placeholder, className } = props
  const [innerValue, setInnerValue] = React.useState(value)

  // fix: 修复某些场景下内部值与外部不一致的问题 eg .domain.com => domain.com
  const fixValueNoChange = updatedValue => {
    if (updatedValue === innerValue) return
    setInnerValue(updatedValue)
  }

  const onValueChange = e => {
    if (e.target.value === value) return
    onChange(e.target.value, fixValueNoChange)
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') return
    const target = e.target as HTMLInputElement
    target.blur()
  }

  return (
    <input
      type="text"
      value={innerValue}
      onBlur={onValueChange}
      onChange={e => setInnerValue(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={classnames("w-[180px] input-primary input-sm input-bordered", className, {
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
  const { cookies, domainList: filterDomainList, setDomainList } = props
  const detailsRef = React.useRef<HTMLDetailsElement>()

  const domains: string[] = React.useMemo(() => {
    const list: string[] = Array.from(new Set(cookies.map(item => item.domain)))
    list.sort((a, b) => a?.length - b?.length)
    return list
  }, [cookies])

  React.useEffect(() => {
    document.addEventListener('click', e => {
      const target = e.target as HTMLElement
      if (detailsRef.current.contains(target)) return
      detailsRef.current.open = false
    })
  }, [])

  const onChange = item => {
    const checked = filterDomainList.includes(item)
    if (checked) {
      setDomainList(filterDomainList.filter(type => type !== item))
      return
    }
    setDomainList([...filterDomainList, item])
  }

  const handleOpenChange: React.MouseEventHandler<HTMLElement> = e => {
    e.preventDefault()
    const open = !detailsRef.current.open
    detailsRef.current.open = open
    if (open) {
      ga(`filter_domain`)
    }
  }

  const hasData = domains.length > 0
  const checked = domains.some(item => filterDomainList.includes(item))

  return (
    <details ref={detailsRef} className="dropdown dropdown-bottom dropdown-end">
      <summary
        className="m-1 btn btn-sm btn-circle"
        onClick={handleOpenChange}
      >
        <MaterialSymbolsFilterAlt className={classnames("text-lg", {
          "text-primary": checked
        })} />
      </summary>
      {hasData && (<ul tabIndex={0} className="dropdown-content z-[1] menu p-2 bg-base-100 rounded-box w-56 shadow-2xl max-h-48 overflow-auto flex flex-col flex-nowrap">
        {domains.map(item => {
          const checked = filterDomainList.includes(item)
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
    </details>
  )
}

export const InputFilter = props => {
  const { value, onChange, placeholder, type } = props
  const inputRef = React.useRef<HTMLInputElement>()
  const detailsRef = React.useRef<HTMLDetailsElement>()

  const close = () => {
    if (!detailsRef.current) return
    detailsRef.current.open = false
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') return
    close()
  }

  const handleOpenChange: React.MouseEventHandler<HTMLElement> = e => {
    e.preventDefault()
    const open = !detailsRef.current.open
    detailsRef.current.open = open
    if (open) {
      ga(`filter_${type}`)
      inputRef.current.focus()
    }
  }

  return (
    <details ref={detailsRef} className="dropdown">
      <summary
        className="m-1 btn btn-sm btn-circle"
        onClick={handleOpenChange}
      >
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

export const DatePicker = props => {
  const { value, onChange } = props
  const [innerValue, setInnerValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>()

  const handleChange = () => {
    if (value === innerValue) return
    onChange(innerValue)
  }

  const onKeyDown = e => {
    if (e.key !== 'Enter') return
    handleChange()
    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  return (
    <input
      ref={inputRef}
      type="datetime-local"
      value={innerValue}
      onBlur={handleChange}
      onKeyDown={onKeyDown}
      onChange={e => setInnerValue(e.target.value)}
      className="input-sm input-primary input-bordered"
    />
  )
}