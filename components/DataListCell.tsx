import classnames from "classnames"
import React from "react"

import {
  MaterialSymbolsCheckCircleOutlineRounded,
  MaterialSymbolsFilterAlt
} from "~components/Icons"
import { ga } from "~utils"

export const BooleanDisplay = (props) => {
  const { value, className } = props
  const booleanValue = Boolean(value)
  if (booleanValue) {
    return (
      <div
        className={classnames(
          "badge badge-sm",
          className
        )}>{`${booleanValue}`}</div>
    )
  }
  return <div className="badge badge-ghost badge-sm">{`${booleanValue}`}</div>
}

export const Input = (props) => {
  const { value, create, onChange, placeholder, className } = props
  const [innerValue, setInnerValue] = React.useState(value)

  // fix: 修复某些场景下内部值与外部不一致的问题 eg .domain.com => domain.com
  const fixValueNoChange = (updatedValue) => {
    if (updatedValue === innerValue) return
    setInnerValue(updatedValue)
  }

  const onValueChange = (e) => {
    if (e.target.value === value) return
    onChange(e.target.value, fixValueNoChange)
  }

  const onKeyDown = (e) => {
    if (e.key !== "Enter") return
    const target = e.target as HTMLInputElement
    target.blur()
  }

  const handleClick = (e) => {
    const target = e.target as HTMLInputElement
    target.select()
  }

  return (
    <input
      type="text"
      value={innerValue}
      onBlur={onValueChange}
      onChange={(e) => setInnerValue(e.target.value)}
      onKeyDown={onKeyDown}
      onClick={handleClick}
      placeholder={placeholder}
      className={classnames(
        "input-sm input-bordered input-primary w-[180px]",
        className,
        {
          input: create
        }
      )}
    />
  )
}

export const BooleanToggle = (props) => {
  const { value, onChange, className } = props
  return (
    <input
      type="checkbox"
      className={classnames("toggle", className)}
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  )
}

export const SameSite = (props) => {
  const { value, onChange } = props
  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="btn btn-sm m-1">
        {value}
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
        <li onClick={() => onChange("lax")}>
          <a>lax</a>
        </li>
        <li onClick={() => onChange("strict")}>
          <a>strict</a>
        </li>
        <li onClick={() => onChange("no_restriction")}>
          <a>none</a>
        </li>
        <li onClick={() => onChange("unspecified")}>
          <a>unspecified</a>
        </li>
      </ul>
    </div>
  )
}

export const HeaderDomain = (props) => {
  const { cookies, domainList: filterDomainList, setDomainList } = props
  const detailsRef = React.useRef<HTMLDetailsElement>()

  const domains: string[] = React.useMemo(() => {
    const list: string[] = Array.from(
      new Set(cookies.map((item) => item.domain))
    )
    list.sort((a, b) => a?.length - b?.length)
    return list
  }, [cookies])

  React.useEffect(() => {
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement
      if (detailsRef.current.contains(target)) return
      detailsRef.current.open = false
    })
  }, [])

  const onChange = (item) => {
    const checked = filterDomainList.includes(item)
    if (checked) {
      setDomainList(filterDomainList.filter((type) => type !== item))
      return
    }
    setDomainList([...filterDomainList, item])
  }

  const handleOpenChange: React.MouseEventHandler<HTMLElement> = (e) => {
    e.preventDefault()
    const open = !detailsRef.current.open
    detailsRef.current.open = open
    if (open) {
      ga(`filter_domain`)
    }
  }

  const hasData = domains.length > 0
  const checked = domains.some((item) => filterDomainList.includes(item))

  return (
    <details ref={detailsRef} className="dropdown dropdown-end dropdown-bottom">
      <summary className="btn btn-circle btn-sm m-1" onClick={handleOpenChange}>
        <MaterialSymbolsFilterAlt
          className={classnames("text-lg", {
            "text-primary": checked
          })}
        />
      </summary>
      {hasData && (
        <ul
          tabIndex={0}
          className="menu dropdown-content z-[1] flex max-h-48 w-56 flex-col flex-nowrap overflow-auto rounded-box bg-base-100 p-2 shadow-2xl">
          {domains.map((item) => {
            const checked = filterDomainList.includes(item)
            return (
              <li
                key={item}
                onClick={() => onChange(item)}
                className={classnames("ellipsis w-full")}>
                <a className="flex w-full pl-0">
                  <div className="mr-2 w-4 pl-2">
                    {checked && (
                      <MaterialSymbolsCheckCircleOutlineRounded className="text-lg text-primary" />
                    )}
                  </div>
                  <div className="ellipsis">{item}</div>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </details>
  )
}

export const InputFilter = (props) => {
  const { value, onChange, placeholder, type } = props
  const inputRef = React.useRef<HTMLInputElement>()
  const detailsRef = React.useRef<HTMLDetailsElement>()

  const close = () => {
    if (!detailsRef.current) return
    detailsRef.current.open = false
  }

  const onKeyDown = (e) => {
    if (e.key !== "Enter") return
    close()
  }

  const handleOpenChange: React.MouseEventHandler<HTMLElement> = (e) => {
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
      <summary className="btn btn-circle btn-sm m-1" onClick={handleOpenChange}>
        <MaterialSymbolsFilterAlt
          className={classnames("text-lg", {
            "text-primary": !!value
          })}
        />
      </summary>
      <div
        tabIndex={0}
        className="menu dropdown-content z-[1] flex max-h-48 w-56 flex-col flex-nowrap overflow-auto rounded-box bg-base-100 p-2 shadow-2xl">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onBlur={close}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange(e.target.value)}
          className="input input-sm input-bordered input-primary w-full"
          placeholder={placeholder}
        />
      </div>
    </details>
  )
}

export const DatePicker = (props) => {
  const { value, onChange } = props
  const [innerValue, setInnerValue] = React.useState(value)
  const inputRef = React.useRef<HTMLInputElement>()

  const handleChange = () => {
    if (value === innerValue) return
    onChange(innerValue)
  }

  const onKeyDown = (e) => {
    if (e.key !== "Enter") return
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
      onChange={(e) => setInnerValue(e.target.value)}
      className="input-sm input-bordered input-primary"
    />
  )
}
