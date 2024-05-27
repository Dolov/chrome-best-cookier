import React from 'react'
import {
  MaterialSymbolsExportNotes, MaterialSymbolsDelete, MingcuteRefresh2Fill,
  MaterialSymbolsSettings, StreamlineEmojisBug,
  SiGlyphFullscreen,
} from '~components/Icons'
import { type Cookie, copyTextToClipboard } from '~utils'
import message from './message'

export interface ActionsProps {
  init: () => void
  cookies: Cookie[]
}

const Actions: React.FC<ActionsProps> = props => {
  const { cookies, init } = props

  const filteredCookies = React.useMemo(() => {
    const checkeds = cookies.filter(item => item.checked)
    if (checkeds.length) return checkeds
    return cookies
  }, [cookies])

  const handleExport = () => {
    copyTextToClipboard(JSON.stringify(filteredCookies, null, 2))
    message.success("复制成功")
  }

  const handleImport = () => {

  }

  const issues = () => {
    chrome.tabs.create({
      url: "https://github.com/Dolov/chrome-best-cookier/issues"
    })
  }

  return (
    <div className="mt-2 flex justify-between">
      
      <div>
        <div className="tooltip" data-tip="刷新">
          <button onClick={init} className="btn btn-sm btn-circle mx-2 group">
            <MingcuteRefresh2Fill className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="导出">
          <button onClick={handleExport} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="导入">
          <button onClick={handleImport} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="全屏">
          <button className="btn btn-sm btn-circle mx-2 group">
            <SiGlyphFullscreen className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="删除">
          <button className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsDelete className="text-xl group-hover:text-error" />
          </button>
        </div>
      </div>
      <div>
        <div className="tooltip" data-tip="设置">
          <button className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsSettings className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip tooltip-left" data-tip="功能申请 & 问题报告">
          <button onClick={issues} className="btn btn-sm btn-circle mx-2">
            <StreamlineEmojisBug className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Actions
