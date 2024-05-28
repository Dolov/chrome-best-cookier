import React from 'react'
import classnames from 'classnames'
import { useGetUrlInfo } from "~components/hooks"
import { dayjs, MessageActionEnum, getDate, type Cookie } from '~utils'
import { Input, InputFilter, BooleanDisplay, BooleanToggle, HeaderDomain, SameSite } from '~components/DataListCell'

const defaultCookie: Cookie = {
  name: '',
  value: '',
  domain: "",
  path: "/",
  expirationDate: dayjs().add(1, 'year').valueOf() / 1000,
  httpOnly: false,
  secure: false,
  session: false,
  sameSite: "unspecified",
  storeId: "",
  hostOnly: false,
  create: true,
}


export interface DataListProps {
  init: () => void
  value: Cookie[]
  onChange: (value: Cookie[]) => void
  allCookies: Cookie[]
  urlInfo: ReturnType<typeof useGetUrlInfo>
  conditions: { name?: string, value?: string, domainList?: string[] }
  setConditions: (conditions: DataListProps['conditions']) => void
}
const DataList: React.FC<DataListProps> = props => {
  const { urlInfo, value = [], allCookies = [],
    init, onChange: onCookiesChange, conditions, setConditions,
  } = props
  const { name, value: filterValue, domainList } = conditions
  const { domain, subdomain } = urlInfo

  const [highlightId, setHighlightId] = React.useState("")

  defaultCookie.domain = subdomain ? `${subdomain}.${domain}` : domain
  const createDataRef = React.useRef<Cookie>(defaultCookie)

  const cookies = React.useMemo(() => {
    const hasCreate = value.find(item => item.create)
    if (hasCreate) return value
    return [...value, defaultCookie]
  }, [value])

  React.useEffect(() => {
    if (!highlightId) return
    setTimeout(() => {
      setHighlightId("")
    }, 2000);
  }, [highlightId])

  React.useEffect(() => {
    const data = cookies.filter(item => !item.create)
    const indeterminate = data.some(item => !item.checked) && data.some(item => item.checked)
    const checkbox: HTMLInputElement = document.querySelector("#check-all")
    checkbox.indeterminate = indeterminate
  }, [cookies])

  const updateCookie = async newCookie => {
    const { hostOnly, session, create, checked, ...rest } = newCookie
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.UPDATE_COOKIE,
      payload: {
        cookie: rest,
      }
    })
    return res
  }

  const onChange = async (changedValues, cookie) => {
    if (cookie.create) {
      onCreateItemChange(changedValues, cookie)
      return
    }
    await updateCookie({
      ...cookie,
      ...changedValues,
    })
    init()
  }

  const onCheckAll = e => {
    onCookiesChange(cookies.map(item => {
      if (item.create) return item
      return {
        ...item,
        checked: e.target.checked
      }
    }))
  }

  const onCheckItem = (e, cookie) => {
    const nextCookies = cookies.map(item => {
      if (item === cookie) {
        return {
          ...item,
          checked: e.target.checked
        }
      }
      return item
    })
    onCookiesChange(nextCookies)
  }

  const deleteAndUpdate = async (cookie, updateFields) => {
    await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        cookies: [cookie],
      }
    })
    const res = await updateCookie({
      ...cookie,
      ...updateFields,
    })
    init()
    setHighlightId(`${res.name}-${res.value}-${res.domain}`)
  }

  const onCreateItemChange = async (changedValues, cookie) => {
    createDataRef.current = {
      ...createDataRef.current,
      ...changedValues,
    }
    const { name, value, domain } = createDataRef.current
    if (!name || !value || !domain) return
    const res = await updateCookie(createDataRef.current)
    init()
    setHighlightId(`${res.name}-${res.value}-${res.domain}`)
    createDataRef.current = defaultCookie
  }

  const onNameChange = async (name, cookie) => {
    if (!name) return
    if (cookie.create) {
      onCreateItemChange({ name }, cookie)
      return
    }
    deleteAndUpdate(cookie, { name })
  }

  const onValueChange = async (value, cookie) => {
    if (!value) return
    if (cookie.create) {
      onCreateItemChange({ value }, cookie)
      return
    }
    deleteAndUpdate(cookie, { value })
  }

  const onDomainChange = async (domain, cookie) => {
    if (!domain) return
    if (cookie.create) {
      onCreateItemChange({ domain }, cookie)
      return
    }
    deleteAndUpdate(cookie, { domain })
  }

  const checked = cookies.filter(item => !item.create).every(item => item.checked)

  return (
    <table className="table table-sm table-pin-rows table-pin-cols">
      <thead>
        <tr className="bg-base-300 rounded-box">
          <td></td>
          <td className="text-center align-middle">
            <input
              id="check-all"
              type="checkbox"
              checked={checked}
              onChange={onCheckAll}
              className="checkbox checkbox-primary checkbox-sm"
            />
          </td>
          <th className="text-center bg-base-300 z-10">
            <div className="center">
              <span>name</span>
              <InputFilter
                value={name}
                onChange={name => setConditions({ ...conditions, name })}
                placeholder="Filter by name"
              />
            </div>
          </th>
          <td className="text-center">
            <div className="center">
              <span>value</span>
              <InputFilter
                value={filterValue}
                onChange={value => setConditions({ ...conditions, value })}
                placeholder="Filter by value"
              />
            </div>
          </td>
          <td className="text-center">
            <HeaderDomain
              cookies={allCookies}
              domainList={domainList}
              setDomainList={domainList => setConditions({ ...conditions, domainList })}
            />
          </td>
          <td className="text-center">expirationDate</td>
          <td className="text-center">path</td>
          <td className="text-center">httpOnly</td>
          <td className="text-center">hostOnly</td>
          <td className="text-center">secure</td>
          <td className="text-center">sameSite</td>
          <td className="text-center">session</td>
          {/* <td className="text-center">storeId</td> */}
        </tr>
      </thead>
      <tbody>
        {cookies.map((cookie, index) => {
          const { name, path, expirationDate, storeId, httpOnly, hostOnly, secure, sameSite, session, value, domain, create, checked } = cookie
          const id = `${name}-${value}-${domain}`
          const highlight = id === highlightId
          return (
            <tr key={`${id}-${index}`} className={classnames("group hover:bg-base-200", {
              "!bg-secondary": highlight
            })}>
              <td>
                <div className="stat-value text-sm">{index + 1}</div>
              </td>
              <td className="text-center align-middle">
                {!create && (<input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onCheckItem(e, cookie)}
                  className="checkbox checkbox-primary checkbox-sm"
                />)}
              </td>
              <th className={classnames('group-hover:bg-base-200', {
                '!bg-secondary': highlight
              })}>
                <Input placeholder="Add New Cookie" create={create} value={name} onChange={value => onNameChange(value, cookie)} />
              </th>
              <td>
                <Input placeholder="Input Value" create={create} value={value} onChange={value => onValueChange(value, cookie)} />
              </td>
              <td>
                <Input create={create} value={domain} onChange={value => onDomainChange(value, cookie)} />
              </td>
              <td className="ellipsis w-[150px]">{getDate(expirationDate)}</td>
              <td>{path}</td>
              <td>
                <BooleanToggle className="toggle-secondary" value={httpOnly} onChange={httpOnly => onChange({ httpOnly }, cookie)} />
              </td>
              <td>
                <BooleanDisplay className="badge-primary" value={hostOnly} />
              </td>
              <td>
                <BooleanToggle className="toggle-accent" value={secure} onChange={secure => onChange({ secure }, cookie)} />
              </td>
              <td>
                <SameSite value={sameSite} onChange={sameSite => onChange({ sameSite }, cookie)} />
              </td>
              <td>
                <BooleanDisplay className="badge-primary" value={session} />
              </td>
              {/* <td>{storeId}</td> */}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default DataList
