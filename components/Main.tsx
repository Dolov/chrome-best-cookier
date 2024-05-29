import React from 'react'
import classnames from 'classnames'
import Actions from '~components/Actions'
import DataList, { type DataListProps } from '~components/DataList'
import { type Cookie, getDomainList, MessageActionEnum } from '~utils'

export interface MainProps {
}

const Main = props => {
  const { full, urlInfo, className } = props
  const { domain, subdomain } = urlInfo
  const [cookies, setCookies] = React.useState<Cookie[]>([])
  const [conditions, setConditions] = React.useState<DataListProps["conditions"]>(() => {
    return {
      name: "",
      value: "",
      path: "",
      domainList: getDomainList(domain, subdomain),
    }
  })


  const init = async () => {
    const cookies = await chrome.runtime.sendMessage({
      action: MessageActionEnum.GET_COOKIES,
      payload: {
        domain
      }
    })

    const domainCookies: Cookie[] = cookies
      .sort((a, b) => {
        return a.name.localeCompare(b.name)
      })

    setCookies(domainCookies)
  }

  React.useEffect(() => {
    init()
  }, [])

  const filteredCookies = React.useMemo(() => {
    const { path, name, value, domainList } = conditions
    if (domainList.length) {
      return cookies.filter(item => {
        if (item.create) return true
        if (path && item.path) return item.path.toLowerCase().includes(path.toLowerCase())
        if (name && item.name) return item.name.toLowerCase().includes(name.toLowerCase())
        if (value && item.value) return item.value.toLowerCase().includes(value.toLowerCase())
        return domainList.includes(item.domain)
      })
    }
    return cookies.filter(item => {
      if (item.create) return true
      if (path && item.path) return item.path.toLowerCase().includes(path.toLowerCase())
      if (name && item.name) return item.name.toLowerCase().includes(name.toLowerCase())
      if (value && item.value) return item.value.toLowerCase().includes(value.toLowerCase())
      return true
    })
  }, [cookies, conditions])

  return (
    <div className={classnames("flex flex-col", className)}>
      <div className="flex-1 overflow-x-auto">
        <DataList
          init={init}
          allCookies={cookies}
          value={filteredCookies}
          onChange={setCookies}
          urlInfo={urlInfo}
          conditions={conditions}
          setConditions={setConditions}
        />
      </div>
      <Actions
        full={full}
        init={init}
        urlInfo={urlInfo}
        cookies={filteredCookies}
      />
    </div>
  )
}

export default Main
