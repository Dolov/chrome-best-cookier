import React from 'react'
import { useGetUrlInfo } from '~components/hooks'
import Main from '~components/Main'
import '~/style.less'
import './style.less'


export interface AppProps {
  
}

const App: React.FC<AppProps> = props => {
  const {  } = props

  const urlInfo = useGetUrlInfo(location.href)

  if (!urlInfo) return null
  
  return (
    <Main
      full
      urlInfo={urlInfo}
      className="h-full"
    />
  )
}

export default App
