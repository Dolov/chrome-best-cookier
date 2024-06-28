import classnames from "classnames"
import QProgress from "qier-progress"
import React from "react"

import { useStorage } from "@plasmohq/storage/hook"

import Bubble from "~components/Bubble"
import { useGetUrlInfo } from "~components/hooks"
import {
  BxBxsFileJson,
  CarbonCloudMonitoring,
  CbiStreamz,
  IonCopy,
  IonEllipsisVertical,
  MaterialSymbolsDelete,
  MaterialSymbolsExportNotes,
  MaterialSymbolsSettings,
  MaterialSymbolsShieldLock,
  MingcuteRefresh2Fill,
  SiGlyphFullscreen,
  StreamlineEmojisBug
} from "~components/Icons"
import message from "~components/message"
import Modal from "~components/Modal"
import Upload from "~components/Upload"
import {
  copyTextToClipboard,
  dayjs,
  ga,
  getFileJson,
  getId,
  MessageActionEnum,
  sendMessage,
  StorageKeyEnum,
  type Cookie
} from "~utils"

const qprogress = new QProgress({
  height: 5
})

export interface ActionsProps {
  init: () => void
  cookies: Cookie[]
  urlInfo: ReturnType<typeof useGetUrlInfo>
  full?: boolean
}

const Actions: React.FC<ActionsProps> = (props) => {
  const { init, full, cookies, urlInfo } = props
  const { url, domain, hostname } = urlInfo
  const [visible, setVisible] = React.useState(false)
  const [importData, setImportData] = React.useState("")
  const [monitorConfig, setMonitorConfig] = React.useState()
  const monitoring = !!monitorConfig

  const filteredCookies = React.useMemo(() => {
    const checkeds = cookies.filter((item) => item.checked)
    if (checkeds.length) return checkeds
    return cookies.filter((item) => !item.create)
  }, [cookies])

  React.useEffect(() => {
    queryMonitorConfig()
  }, [])

  const queryMonitorConfig = () => {
    sendMessage({
      action: MessageActionEnum.GET_MONITOR
    }).then((res) => {
      setMonitorConfig(res)
    })
  }

  const handleExport = () => {
    ga("action_export")
    const data = filteredCookies.map((item) => {
      const { checked, create, ...rest } = item
      return rest
    })
    const name = `BestCookier${dayjs().format("YYYYMMDD-HHmmss")}-${domain}.json`
    const fileContent = encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadLink = document.createElement("a")
    downloadLink.setAttribute(
      "href",
      "data:text/html;charset=utf-8," + fileContent
    )
    downloadLink.setAttribute("download", name)
    downloadLink.click()
  }

  const handleImport = async () => {
    ga("action_import")
    try {
      const data = JSON.parse(importData).map((item) => {
        return {
          ...item,
          // 无痕模式和普通模式的 storeId 不同，需要清洗，否则会导入失败
          storeId: ""
        }
      })
      const res = await chrome.runtime.sendMessage({
        action: MessageActionEnum.SET_COOKIES,
        payload: {
          cookies: data
        }
      })
      init()
      setVisible(false)
      setImportData("")
      message.success(chrome.i18n.getMessage("importSuccess"))
    } catch (error) {
      message.error(chrome.i18n.getMessage("importFail"))
    }
  }

  const handleDelete = async () => {
    ga("action_delete")
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
    ga("action_setting")
    chrome.tabs.create({
      url: `./tabs/setting.html?hostname=${encodeURIComponent(hostname)}`
    })
  }

  const handleFull = () => {
    ga("action_full")
    chrome.tabs.create({
      url: `./tabs/full.html?url=${encodeURIComponent(url)}`
    })
  }

  const handleIssue = () => {
    ga("action_issue")
    chrome.tabs.create({
      url: "https://github.com/Dolov/chrome-best-cookier/issues"
    })
  }

  const handleImportFile = async (file: File) => {
    ga("action_import_file")
    const data = await getFileJson(file)
    setImportData(JSON.stringify(data, null, 2))
  }

  const handleMonitor = async () => {
    ga("action_monitor")
    const action = monitoring
      ? MessageActionEnum.END_MONITOR
      : MessageActionEnum.START_MONITOR
    const res = await sendMessage({
      action,
      payload: {
        names: filteredCookies.map((item) => item.name)
      }
    })
    queryMonitorConfig()
    const messageText = monitoring
      ? chrome.i18n.getMessage("monitorEnd")
      : chrome.i18n.getMessage("monitorStart")
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
        onClose={() => setVisible(false)}>
        <div className="center">
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
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
      <div className="flex items-center">
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_refresh")}>
          <RefreshButton action={init} />
        </div>
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_import")}>
          <button
            onClick={() => setVisible(true)}
            className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsExportNotes className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </div>
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_export", [`${len}`])}>
          <button
            onClick={handleExport}
            className={classnames("btn btn-sm btn-circle mx-2 group", {
              "btn-disabled": noData
            })}>
            <MaterialSymbolsExportNotes className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <Copy data={filteredCookies}>
          <button className="btn btn-sm btn-circle mx-2 group">
            <IonCopy className="text-xl rotate-180 group-hover:text-primary" />
          </button>
        </Copy>
        {!full && (
          <div
            className="tooltip"
            data-tip={chrome.i18n.getMessage("actions_monitor")}>
            <button
              onClick={handleMonitor}
              className={classnames("btn btn-sm btn-circle mx-2 group")}>
              <CarbonCloudMonitoring
                className={classnames("text-xl group-hover:text-primary", {
                  "!text-secondary": monitoring
                })}
              />
            </button>
          </div>
        )}
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_delete", [`${len}`])}>
          <button
            onClick={handleDelete}
            className={classnames("btn btn-sm btn-circle mx-2 group", {
              "btn-disabled": noData
            })}>
            <MaterialSymbolsDelete className="text-xl group-hover:text-error" />
          </button>
        </div>
      </div>
      <div className="h-center">
        {!full && (
          <div
            className="tooltip"
            data-tip={chrome.i18n.getMessage("actions_fullScreen")}>
            <button
              onClick={handleFull}
              className="btn btn-sm btn-circle mx-2 group">
              <SiGlyphFullscreen className="text-xl group-hover:text-primary" />
            </button>
          </div>
        )}
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_guard")}>
          <CookieGuard hostname={hostname} />
        </div>
        <div
          className="tooltip"
          data-tip={chrome.i18n.getMessage("actions_setting")}>
          <button
            onClick={handleSetting}
            className="btn btn-sm btn-circle mx-2 group">
            <MaterialSymbolsSettings className="text-xl group-hover:text-primary" />
          </button>
        </div>
        <div
          className="tooltip tooltip-left"
          data-tip={chrome.i18n.getMessage("actions_issues")}>
          <button onClick={handleIssue} className="btn btn-sm btn-circle mx-2">
            <StreamlineEmojisBug className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const RowActions = (props) => {
  const { data, init } = props
  const [follows, setFollows] = useStorage(StorageKeyEnum.FOLLOWS, [])
  const id = getId(data)
  const follow = follows.includes(id)
  const text = follow
    ? chrome.i18n.getMessage("unFollow")
    : chrome.i18n.getMessage("follow")

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
      setFollows(follows.filter((item) => item !== id))
      return
    }
    setFollows([...follows, id])
  }

  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-sm btn-circle">
        <IonEllipsisVertical className="text-lg" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-36">
        <li onClick={handleFollow}>
          <a>{text}</a>
        </li>
        <li onClick={handleDelete} className="text-error font-bold">
          <a>{chrome.i18n.getMessage("delete")}</a>
        </li>
      </ul>
    </div>
  )
}

const RefreshButton = (props) => {
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
      <MingcuteRefresh2Fill
        className={classnames("text-xl group-hover:text-primary", {
          "animate-spin": loading
        })}
      />
    </button>
  )
}

const CookieGuard = (props) => {
  const { hostname } = props
  const [enable] = useStorage(StorageKeyEnum.GUARD_ENABLE, {})
  const [guardSettings] = useStorage(StorageKeyEnum.GUARD_SETTINGS, {})
  const settings = guardSettings[hostname] || []

  const active = settings.length > 0 && enable

  const handleClick = () => {
    chrome.tabs.create({
      url: `./tabs/setting.html?hostname=${encodeURIComponent(hostname)}&anchor=cookieGuard`
    })
  }

  return (
    <button onClick={handleClick} className="btn btn-sm btn-circle mx-2 group">
      <MaterialSymbolsShieldLock
        className={classnames("text-2xl group-hover:text-primary", {
          "!text-warning": active
        })}
      />
    </button>
  )
}

const Copy = (props) => {
  const { data: filteredCookies, children } = props

  const handleCopyJson = () => {
    ga("action_copy_json")
    const data = filteredCookies.map((item) => {
      const { checked, create, ...rest } = item
      return rest
    })
    copyTextToClipboard(JSON.stringify(data, null, 2))
    message.success(chrome.i18n.getMessage("copySuccess"))
  }

  const handleCopyHeaderStr = () => {
    ga("action_copy_headerstr")
    const data = filteredCookies
      .map((item) => {
        const { checked, create, ...rest } = item
        return rest
      })
      .map((item) => `${item.name}=${item.value}`)
    copyTextToClipboard(data.join("; "))
    message.success(chrome.i18n.getMessage("copySuccess"))
  }

  return (
    <Bubble
      // trigger="hover"
      subSize={27}
      subRadius={40}
      subBubbles={[
        {
          shadowColor: "oklch(var(--s))",
          render(angle) {
            return (
              <div
                style={{ transform: `rotateZ(${-angle}deg)` }}
                className="tooltip center p-2"
                data-tip={chrome.i18n.getMessage("actions_copy_json")}>
                <button
                  style={{ transform: `rotateZ(${angle}deg)` }}
                  onClick={handleCopyJson}
                  className="btn btn-xs btn-secondary btn-circle mx-2">
                  <BxBxsFileJson className="text-xl rotate-180" />
                </button>
              </div>
            )
          }
        },
        {
          shadowColor: "oklch(var(--a))",
          render(angle) {
            return (
              <div
                style={{ transform: `rotateZ(${-angle}deg)` }}
                className="tooltip center p-2"
                data-tip={chrome.i18n.getMessage("actions_copy_headerstr")}>
                <button
                  style={{ transform: `rotateZ(${angle}deg)` }}
                  onClick={handleCopyHeaderStr}
                  className="btn btn-xs btn-accent btn-circle mx-2">
                  <CbiStreamz className="text-xl rotate-180" />
                </button>
              </div>
            )
          }
        }
      ]}>
      {children}
    </Bubble>
  )
}

export default Actions
