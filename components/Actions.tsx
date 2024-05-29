import React from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import classnames from 'classnames'
import {
  MaterialSymbolsExportNotes, MaterialSymbolsDelete, MingcuteRefresh2Fill,
  MaterialSymbolsSettings, StreamlineEmojisBug, IonEllipsisVertical,
  SiGlyphFullscreen, 
} from '~components/Icons'
import { useGetUrlInfo } from '~components/hooks'
import Modal from '~components/Modal'
import message from '~components/message'
import { type Cookie, copyTextToClipboard, MessageActionEnum, StorageKeyEnum } from '~utils'

export interface ActionsProps {
  init: () => void
  cookies: Cookie[]
  urlInfo: ReturnType<typeof useGetUrlInfo>
  full?: boolean
}

const Actions: React.FC<ActionsProps> = props => {
  const { init, full, cookies, urlInfo } = props
  const [visible, setVisible] = React.useState(false)
  const [importData, setImportData] = React.useState("")

  const filteredCookies = React.useMemo(() => {
    const checkeds = cookies.filter(item => item.checked)
    if (checkeds.length) return checkeds
    return cookies.filter(item => !item.create)
  }, [cookies])

  const handleExport = () => {
    const data = filteredCookies.map(item => {
      const { checked, create, ...rest } = item
      return rest
    })
    copyTextToClipboard(JSON.stringify(data, null, 2))
    message.success("复制成功。")
  }

  const handleImport = async () => {
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.SET_COOKIES,
      payload: {
        cookies: JSON.parse(importData)
      }
    })
    init()
    setVisible(false)
    setImportData("")
    message.success("导入成功。")
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
      url: `./tabs/full.html?url=${encodeURIComponent(urlInfo.url)}`
    })
  }

  const handleIssue = () => {
    chrome.tabs.create({
      url: "https://github.com/Dolov/chrome-best-cookier/issues"
    })
  }

  const len = filteredCookies.length
  const noData = len == 0
  const title = `${len} 条数据`

  return (
    <div className="pt-2 flex justify-between">
      <Modal
        title="导入"
        visible={visible}
        onOk={handleImport}
        onClose={() => setVisible(false)}
      >
        <div className="center">
          <textarea
            value={importData}
            onChange={e => setImportData(e.target.value)}
            className="textarea textarea-primary w-[98%] m-auto"
            placeholder="粘贴"
          />
        </div>
      </Modal>
      <div className='flex items-center'>
        <div className="tooltip" data-tip="刷新">
          <button onClick={init} className="btn btn-sm btn-circle mx-2 group">
            <MingcuteRefresh2Fill className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip="导入">
          <button onClick={() => setVisible(true)} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip={`导出 ${title}`}>
          <button onClick={handleExport} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsExportNotes className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip={`删除 ${title}`}>
          <button onClick={handleDelete} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsDelete className="text-xl group-hover:text-error" />
          </button>
        </div>
      </div>
      <div>
        {!full && (<div className="tooltip" data-tip="全屏">
          <button onClick={handleFull} className="btn btn-sm btn-circle mx-2 group">
            <SiGlyphFullscreen className="text-xl group-hover:text-primary" />
          </button>
        </div>)}
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

export const RowActions = props => {
  const { data, init } = props
  const [follows, setFollows] = useStorage(StorageKeyEnum.FOLLOW, [])
  const { name, value, domain } = data
  const key = `${name}-${value}-${domain}`
  const follow = follows.includes(key)
  const text = follow ? "取消关注" : "关注"

  const handleDelete = async () => {
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        cookies: [data]
      }
    })
    init()
    message.success("删除成功。")
  }

  const handleFollow = () => {
    const index = follows.indexOf(key)
    if (index > -1) {
      setFollows(follows.filter(item => item !== key))
      return
    }
    setFollows([...follows, key])
  }

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-sm btn-circle">
        <IonEllipsisVertical className="text-lg" />
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-36">
        <li onClick={handleFollow}><a>{text}</a></li>
        <li onClick={handleDelete} className="text-error font-bold"><a>删除</a></li>
      </ul>
    </div>
  )
}

export default Actions
