import React from 'react'
import { useGetUrlInfo } from '~components/hooks'
import Actions from '~components/Actions'
import DataList, { type DataListProps } from '~components/DataList'
import { type Cookie, MessageActionEnum, getDomainList } from '~utils'
import '~/style.less'

export interface PopupProps {

}


const Popup: React.FC<PopupProps> = props => {

  const urlInfo = useGetUrlInfo()

  if (urlInfo === undefined) {
    return (
      <div className="w-40 center p-2">
        <span className="loading loading-spinner text-primary"></span>
        <span className="loading loading-spinner text-secondary"></span>
        <span className="loading loading-spinner text-accent"></span>
      </div>
    )
  }

  if (urlInfo === null) {
    return (
      <div className="p-2">
        <div role="alert" className="alert alert-warning flex text-nowrap">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span>Warning: this site does not support Cookie !</span>
        </div>
      </div>
    )
  }

  return (
    <Main urlInfo={urlInfo} />
  )
}

const Main = props => {
  const { urlInfo } = props
  const { domain, subdomain } = urlInfo
  const [cookies, setCookies] = React.useState<Cookie[]>([])
  const [conditions, setConditions] = React.useState<DataListProps["conditions"]>(() => {
    return {
      name: "",
      value: "",
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
      .sort((a, b) => a.name.localeCompare(b.name))

    setCookies(domainCookies)
  }

  React.useEffect(() => {
    init()
  }, [])

  const filteredCookies = React.useMemo(() => {
    const { name, value, domainList } = conditions
    if (domainList.length) {
      return cookies.filter(item => {
        if (item.create) return true
        if (name && item.name) return item.name.toLowerCase().includes(name.toLowerCase())
        if (value && item.value) return item.value.toLowerCase().includes(value.toLowerCase())
        return domainList.includes(item.domain)
      })
    }
    return cookies.filter(item => {
      if (item.create) return true
      if (name && item.name) return item.name.toLowerCase().includes(name.toLowerCase())
      if (value && item.value) return item.value.toLowerCase().includes(value.toLowerCase())
      return true
    })
  }, [cookies, conditions])

  return (
    <div className="flex flex-col w-[700px] max-h-[568px] min-h-[256px]">
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
        init={init}
        cookies={filteredCookies}
      />
    </div>
  )
}


export default Popup
