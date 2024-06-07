import React from 'react'
import { useStorage } from '@plasmohq/storage/hook'
import classnames from 'classnames'
import QProgress from 'qier-progress'
import {
  MaterialSymbolsExportNotes, MaterialSymbolsDelete, MingcuteRefresh2Fill,
  MaterialSymbolsSettings, StreamlineEmojisBug, IonEllipsisVertical,
  SiGlyphFullscreen, IonCopy, CarbonCloudMonitoring,
} from '~components/Icons'
import { useGetUrlInfo } from '~components/hooks'
import Modal from '~components/Modal'
import Upload from '~components/Upload'
import message from '~components/message'
import { type Cookie, copyTextToClipboard, MessageActionEnum,
  StorageKeyEnum, getFileJson, dayjs, getId, sendMessage,
} from '~utils'

const qprogress = new QProgress({
  height: 5,
})


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
  const [monitorConfig, setMonitorConfig] = React.useState()
  const monitoring = !!monitorConfig

  const filteredCookies = React.useMemo(() => {
    const checkeds = cookies.filter(item => item.checked)
    if (checkeds.length) return checkeds
    return cookies.filter(item => !item.create)
  }, [cookies])

  React.useEffect(() => {
    queryMonitorConfig()
  }, [])

  const queryMonitorConfig = () => {
    sendMessage({
      action: MessageActionEnum.GET_MONITOR,
    }).then(res => {
      setMonitorConfig(res)
    })
  }

  const handleExport = () => {
    const data = filteredCookies.map(item => {
      const { checked, create, ...rest } = item
      return rest
    })
    const name = `BestCookier${dayjs().format("YYYYMMDD-HHmmss")}-${urlInfo.domain}.json`
    const fileContent = encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', 'data:text/html;charset=utf-8,' + fileContent);
    downloadLink.setAttribute('download', name);
    downloadLink.click();
  }

  const handleCopy = () => {
    const data = filteredCookies.map(item => {
      const { checked, create, ...rest } = item
      return rest
    })
    copyTextToClipboard(JSON.stringify(data, null, 2))
    message.success(chrome.i18n.getMessage("copySuccess"))
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
    message.success(chrome.i18n.getMessage("importSuccess"))
  }

  const handleDelete = async () => {
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        cookies: filteredCookies
      }
    })
    init()
    message.success(chrome.i18n.getMessage("deleteSuccess"))
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

  const handleImportFile = async (file: File) => {
    const data = await getFileJson(file)
    setImportData(JSON.stringify(data, null, 2))
  }

  const handleMonitor = async () => {
    const action = monitoring ? MessageActionEnum.END_MONITOR : MessageActionEnum.START_MONITOR
    const res = await sendMessage({
      action,
      payload: {
        names: filteredCookies.map(item => item.name),
      }
    })
    queryMonitorConfig()
    const messageText = monitoring ?
      chrome.i18n.getMessage("monitorEnd") :
      chrome.i18n.getMessage("monitorStart")
    message.success(messageText)
  }

  const len = filteredCookies.length
  const noData = len == 0

  return (
    <div className="pt-2 flex justify-between">
      <Modal
        title={chrome.i18n.getMessage("actions_import")}
        visible={visible}
        onOk={handleImport}
        onClose={() => setVisible(false)}
      >
        <div className="center">
          <textarea
            value={importData}
            onChange={e => setImportData(e.target.value)}
            className={classnames("textarea textarea-primary w-[98%] m-auto", {
              "h-48": full
            })}
            placeholder={chrome.i18n.getMessage("pasteJsonData")}
          />
        </div>
        <Upload
          text={chrome.i18n.getMessage("importJsonFile")}
          accept=".json"
          onChange={handleImportFile}
          className="ml-2 mt-2 inline-block font-bold"
        />
      </Modal>
      <div className='flex items-center'>
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_refresh")}>
          <RefreshButton action={init} />
        </div>
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_import")}>
          <button onClick={() => setVisible(true)} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_export", [`${len}`])}>
          <button onClick={handleExport} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsExportNotes className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_copy", [`${len}`])}>
          <button onClick={handleCopy} className="btn btn-sm btn-circle mx-2 group">
            <IonCopy className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        {!full && (<div className="tooltip" data-tip={chrome.i18n.getMessage("actions_monitor")}>
          <button onClick={handleMonitor} className={classnames("btn btn-sm btn-circle mx-2 group")}>
            <CarbonCloudMonitoring className={classnames("text-xl group-hover:text-primary", {
              "!text-secondary": monitoring
            })} />
          </button>
        </div>)}
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_delete", [`${len}`])}>
          <button onClick={handleDelete} className={classnames("btn btn-sm btn-circle mx-2 group", {
            "btn-disabled": noData
          })}>
            <MaterialSymbolsDelete className="text-xl group-hover:text-error" />
          </button>
        </div>
      </div>
      <div>
        {!full && (<div className="tooltip" data-tip={chrome.i18n.getMessage("actions_fullScreen")}>
          <button onClick={handleFull} className="btn btn-sm btn-circle mx-2 group">
            <SiGlyphFullscreen className="text-xl group-hover:text-primary" />
          </button>
        </div>)}
        <div className="tooltip" data-tip={chrome.i18n.getMessage("actions_setting")}>
          <button  onClick={handleSetting} className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsSettings className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div className="tooltip tooltip-left" data-tip={chrome.i18n.getMessage("actions_issues")}>
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
  const id = getId(data)
  const follow = follows.includes(id)
  const text = follow ? chrome.i18n.getMessage("unFollow") : chrome.i18n.getMessage("follow")

  const handleDelete = async () => {
    const res = await chrome.runtime.sendMessage({
      action: MessageActionEnum.DELETE_COOKIES,
      payload: {
        cookies: [data]
      }
    })
    init()
    message.success(chrome.i18n.getMessage("deleteSuccess"))
  }

  const handleFollow = () => {
    const index = follows.indexOf(id)
    if (index > -1) {
      setFollows(follows.filter(item => item !== id))
      return
    }
    setFollows([...follows, id])
  }

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-sm btn-circle">
        <IonEllipsisVertical className="text-lg" />
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-36">
        <li onClick={handleFollow}><a>{text}</a></li>
        <li onClick={handleDelete} className="text-error font-bold">
          <a>{chrome.i18n.getMessage("delete")}</a>
        </li>
      </ul>
    </div>
  )
}

const RefreshButton = props => {
  const { action } = props
  const [loading, setLoading] = React.useState(false)

  const onClick = () => {
    action()
    qprogress.start()
    setLoading(true)
    setTimeout(() => {
      qprogress.finish()
      setLoading(false)
    }, 300)
  }

  return (
    <button onClick={onClick} className="btn btn-sm btn-circle mx-2 group">
      <MingcuteRefresh2Fill className={classnames("text-xl group-hover:text-primary", {
        "animate-spin": loading,
      })} />
    </button>
  )
}

export default Actions
