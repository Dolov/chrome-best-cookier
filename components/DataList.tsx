import React from 'react'
import classnames from 'classnames'
import { useRefState, useGetUrlInfo } from "~components/hooks"
import { dayjs, getDomainList, MessageActionEnum, getDate, type Cookie } from '~utils'
import { Input, BooleanDisplay, BooleanToggle, HeaderDomain, SameSite } from '~components/DataListCell'

const defaultCookie: Cookie = {
  name: '',
  value: '',
  domain: "",
  sameSite: "unspecified",
  path: "/",
  httpOnly: false,
  secure: false,
  expirationDate: dayjs().add(1, 'year').valueOf() / 1000,
  session: false,
  storeId: "",
  hostOnly: false,
  create: true,
}


export interface DataListProps {
  urlInfo: ReturnType<typeof useGetUrlInfo>
}
const DataList: React.FC<DataListProps> = props => {
  const { urlInfo } = props
  const { domain, subdomain, protocol, hostname } = urlInfo

  const [cookies, setCookies, cookiesRef] = useRefState<Cookie[]>([])
  const [filterDomains, setFilterDomains] = React.useState(() => {
    return getDomainList(domain, subdomain)
  })
  const [highlightId, setHighlightId] = React.useState("")

  const url = `${protocol}//${hostname}`
  const createDefaultDomain = subdomain ? `${subdomain}.${domain}` : domain
  defaultCookie.domain = createDefaultDomain
  const createDataRef = React.useRef<Cookie>(defaultCookie)

  React.useEffect(() => {
    init()
  }, [domain, subdomain])

  React.useEffect(() => {
    if (!highlightId) return
    setTimeout(() => {
      setHighlightId("")
    }, 2000);
  }, [highlightId])

  React.useEffect(() => {
    const indeterminate = cookies.some(item => !item.checked) && cookies.some(item => item.checked)
    // @ts-ignore
    document.querySelector("#check-all").indeterminate = indeterminate
  }, [cookies])

  const init = async () => {
    const cookies = await chrome.runtime.sendMessage({
      action: MessageActionEnum.GET_COOKIES,
      payload: {
        domain
      }
    })

    const domainCookies: Cookie[] = cookies
      .sort((a, b) => a.name.localeCompare(b.name))

    domainCookies.push(defaultCookie)
    setCookies(domainCookies)
  }

  const filteredCookies = React.useMemo(() => {
    if (!filterDomains.length) {
      const list = getDomainList(domain, subdomain)
      return cookies.filter(item => list.includes(item.domain))
    }
    return cookies.filter(item => filterDomains.includes(item.domain))
  }, [cookies, filterDomains])

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
    setCookies(cookies.map(item => {
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
    setCookies(nextCookies)
  }

  const deleteAndUpdate = async (cookie, updateFields) => {
    await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        url,
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

  const checked = cookies.every(item => item.checked)

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
          <th className="text-center bg-base-300">name</th>
          <td className="text-center">value</td>
          <td className="text-center">
            <HeaderDomain
              cookies={cookies}
              filterDomains={filterDomains}
              setFilterDomains={setFilterDomains}
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
        {filteredCookies.map((cookie, index) => {
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
                <Input create={create} value={value} onChange={value => onValueChange(value, cookie)} />
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
