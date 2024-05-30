import React from 'react'
import classnames from 'classnames'
import { useStorage } from '@plasmohq/storage/hook'
import { RowActions } from '~components/Actions'
import { useGetUrlInfo, useRibbon } from "~components/hooks"
import { dayjs, MessageActionEnum, getDate, type Cookie, StorageKeyEnum, getCreateItemDefaultDomain } from '~utils'
import { Input, InputFilter, BooleanDisplay, BooleanToggle, HeaderDomain, SameSite, DatePicker } from '~components/DataListCell'

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
  conditions: { name?: string, value?: string, path?: string, domainList?: string[] }
  setConditions: (conditions: DataListProps['conditions']) => void
}
const DataList: React.FC<DataListProps> = props => {
  const { urlInfo, value = [], allCookies = [],
    init, onChange: onCookiesChange, conditions, setConditions,
  } = props

  const { name, value: filterValue, path, domainList } = conditions
  const { domain, subdomain } = urlInfo

  const [ribbon] = useRibbon()
  const [follows] = useStorage(StorageKeyEnum.FOLLOW, [])
  const [highlightId, setHighlightId] = React.useState("")

  defaultCookie.domain = getCreateItemDefaultDomain(domain, subdomain)
  const createDataRef = React.useRef<Cookie>(defaultCookie)

  const cookies = React.useMemo(() => {
    const data = value.filter(item => !item.create)
    // 将关注的数据置顶
    const sortedData = data.map((item, index) => ({
      index,
      item,
      key: `${item.name}-${item.value}-${item.domain}`
    })).sort((a, b) => {
      const aFollow = follows.includes(a.key);
      const bFollow = follows.includes(b.key);

      if (aFollow && !bFollow) {
        return -1;
      }
      if (!aFollow && bFollow) {
        return 1;
      }
      return a.index - b.index;
    }).map(({ item }) => item);

    return [...sortedData, defaultCookie]
  }, [value, follows])

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
    if (changedValues.expirationDate) {
      changedValues.expirationDate = dayjs(changedValues.expirationDate).valueOf() / 1000
    }
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

  const onPathChange = async (path, cookie) => {
    if (!path) return
    if (cookie.create) {
      onCreateItemChange({ path }, cookie)
      return
    }
    deleteAndUpdate(cookie, { path })
  }

  const checked = cookies.filter(item => !item.create).length &&
    cookies.filter(item => !item.create).every(item => item.checked)

  return (
    <table className="table table-sm table-pin-rows table-pin-cols">
      <thead>
        <tr className="bg-base-300 rounded-box">
          <td className="text-center align-middle">
            <input
              id="check-all"
              type="checkbox"
              checked={checked}
              onChange={onCheckAll}
              className="checkbox checkbox-primary checkbox-sm mt-[5px]"
            />
          </td>
          <td>NO.</td>
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
            <div className="center">
              <span>domain</span>
              <HeaderDomain
                cookies={allCookies}
                domainList={domainList}
                setDomainList={domainList => setConditions({ ...conditions, domainList })}
              />
            </div>
          </td>
          <td className="text-center">
            expirationDate
          </td>
          <td className="text-center">
            <div className="center">
              <span>path</span>
              <InputFilter
                value={path}
                onChange={path => setConditions({ ...conditions, path })}
                placeholder="Filter by path"
              />
            </div>
          </td>
          <td className="text-center">httpOnly</td>
          <td className="text-center">hostOnly</td>
          <td className="text-center">secure</td>
          <td className="text-center">sameSite</td>
          <td className="text-center">session</td>
          <td className="text-center">actions</td>
        </tr>
      </thead>
      <tbody>
        {cookies.map((cookie, index) => {
          const { name, path, expirationDate, httpOnly, hostOnly, secure, sameSite, session, value, domain, create, checked } = cookie
          const id = `${name}-${value}-${domain}`
          const follow = follows.includes(id)
          const order = index + 1
          const highlight = id === highlightId
          return (
            <tr key={`${id}-${index}`} className={classnames("group hover:bg-base-200", {
              "!bg-secondary": highlight
            })}>
              <td className="text-center align-middle">
                {!create && (<input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onCheckItem(e, cookie)}
                  className="checkbox checkbox-primary checkbox-sm mt-[5px]"
                />)}
              </td>
              <td>
                <div className="w-6 center">
                  <div className="stat-value text-sm">{order}</div>
                </div>
              </td>
              <th className={classnames('group-hover:bg-base-200', {
                '!bg-secondary': highlight
              })}>
                <div className="relative">
                  {follow && (
                    <div className="absolute -left-3 -top-2 scale-50">
                      <div className={classnames(ribbon)} />
                    </div>
                  )}
                  <Input
                    value={name}
                    create={create}
                    onChange={value => onNameChange(value, cookie)}
                    placeholder="Add New Cookie"
                  />
                </div>
              </th>
              <td>
                <Input
                  value={value}
                  create={create}
                  onChange={value => onValueChange(value, cookie)}
                  placeholder="Input Value"
                />
              </td>
              <td>
                <Input
                  value={domain}
                  create={create}
                  onChange={value => onDomainChange(value, cookie)}
                />
              </td>
              <td className="ellipsis w-[150px]">
                <DatePicker
                  value={getDate(expirationDate)}
                  onChange={expirationDate => onChange({ expirationDate }, cookie)}
                />
              </td>
              <td>
                <Input
                  className="w-[100px]"
                  value={path}
                  create={create}
                  onChange={path => onPathChange(path, cookie)}
                />
              </td>
              <td>
                <BooleanToggle
                  value={httpOnly}
                  className="toggle-secondary mt-[5px]"
                  onChange={httpOnly => onChange({ httpOnly }, cookie)}
                />
              </td>
              <td>
                <BooleanDisplay className="badge-primary" value={hostOnly} />
              </td>
              <td>
                <BooleanToggle
                  value={secure}
                  className="toggle-accent mt-[5px]"
                  onChange={secure => onChange({ secure }, cookie)}
                />
              </td>
              <td>
                <SameSite value={sameSite} onChange={sameSite => onChange({ sameSite }, cookie)} />
              </td>
              <td>
                <BooleanDisplay className="badge-primary" value={session} />
              </td>
              <td>
                {!create && (<RowActions
                  init={init}
                  data={cookie}
                />)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default DataList
