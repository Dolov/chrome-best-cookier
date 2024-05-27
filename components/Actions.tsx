import React from 'react'
import classnames from 'classnames'
import {
  MaterialSymbolsExportNotes, MaterialSymbolsDelete, MingcuteRefresh2Fill,
  MaterialSymbolsSettings, StreamlineEmojisBug,
  SiGlyphFullscreen,
} from '~components/Icons'
import Modal from '~components/Modal'
import { type Cookie, copyTextToClipboard, MessageActionEnum } from '~utils'
import message from './message'

export interface ActionsProps {
  init: () => void
  cookies: Cookie[]
}

const Actions: React.FC<ActionsProps> = props => {
  const { cookies, init } = props
  const [visible, setVisible] = React.useState(false)

  const filteredCookies = React.useMemo(() => {
    const checkeds = cookies.filter(item => item.checked)
    if (checkeds.length) return checkeds
    return cookies
  }, [cookies])

  const handleExport = () => {
    copyTextToClipboard(JSON.stringify(filteredCookies, null, 2))
    message.success("复制成功。")
  }

  const handleImport = () => {
    setVisible(true)
  }

  const handleDelete = async () => {
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        cookies: filteredCookies
      }
    })
    init()
    message.success("删除成功。")
  }
    
  const handleSetting = () => {
    chrome.tabs.create({
      url: "./tabs/setting.html"
    })
  }

  const handleFull = () => {
    chrome.tabs.create({
      url: "./tabs/full.html"
    })
  }

  const handleIssue = () => {
    chrome.tabs.create({
      url: "https://github.com/Dolov/chrome-best-cookier/issues"
    })
  }

  const noData = filteredCookies.length == 0

  return (
    <div className="mt-2 flex justify-between">
      <Modal
        title="导入"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <div className="center">
          <textarea className="textarea textarea-primary w-[98%] m-auto" placeholder="粘贴"></textarea>
        </div>
      </Modal>
      <div>
        <div className="tooltip" data-tip="刷新">
          <button onClick={init} className="btn btn-sm btn-circle mx-2 group">
            <MingcuteRefresh2Fill className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="导入">
          <button onClick={handleImport} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="导出">
          <button onClick={handleExport} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsExportNotes className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="删除">
          <button onClick={handleDelete} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsDelete className="text-xl group-hover:text-error" />
          </button>
        </div>
      </div>
      <div>
        <div className="tooltip" data-tip="全屏">
          <button onClick={handleFull} className="btn btn-sm btn-circle mx-2 group">
            <SiGlyphFullscreen className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="设置">
          <button  onClick={handleSetting} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsSettings className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip tooltip-left" data-tip="功能申请 & 问题报告">
          <button onClick={handleIssue} className="btn btn-sm btn-circle mx-2">
            <StreamlineEmojisBug className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Actions
