import { MessageActionEnum, getUrlFromCookie, StorageKeyEnum, getId } from '~utils'
import { debounce } from 'lodash'
import { Storage } from '@plasmohq/storage'

const storage = new Storage()

const globalStatus = {
  onoff: false,
  extensionStatus: {}
}


const setCookie = (cookie: chrome.cookies.Cookie) => {
  const url = getUrlFromCookie(cookie)
  const { hostOnly, session, ...restCookie } = cookie
  return chrome.cookies.set({
    url,
    ...restCookie,
  })
}

chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
  const { action } = params
  if (action === MessageActionEnum.GET_COOKIES) {
    const { payload } = params
    const { domain } = payload
    chrome.cookies.getAll({
      domain
    }, cookies => {
      sendResponse(cookies)
    })
    return true
  }
  if (action === MessageActionEnum.UPDATE_COOKIE) {
    const { payload } = params
    const { cookie } = payload
    setCookie(cookie).then(cookie => {
      sendResponse(cookie)
    })
    return true
  }

  if (action === MessageActionEnum.DELETE_COOKIES) {
    const { payload } = params;
    const { cookies, deleteFollow = true } = payload;

    const deletePromises = cookies.map(cookie => {
      const url = getUrlFromCookie(cookie)
      return chrome.cookies.remove({
        url,
        name: cookie.name,
      });
    });

    // 删除关注
    if (deleteFollow) {
      storage.get(StorageKeyEnum.FOLLOWS).then(follows => {
        if (!follows) return
        const deleteIds = cookies.map(getId)
        const newFollows = (follows as unknown as string[]).filter(id => !deleteIds.includes(id))
        storage.set(StorageKeyEnum.FOLLOWS, newFollows)
      })
    }

    Promise.all(deletePromises)
      .then(results => {
        sendResponse(results);
      })

    return true;
  }

  if (action === MessageActionEnum.SET_COOKIES) {
    const { payload } = params;
    const { cookies } = payload;
    const setPromises = cookies.map(cookie => {
      return setCookie(cookie)
    });

    Promise.all(setPromises)
      .then(results => {
        sendResponse(results);
      })

    return true;
  }
})





const cookieGuardInit = () => {
  // 关闭标签时无法获取 url，需要手动记录
  const urlIdMap = {}
  // 处理禁用与激活
  const toggleExtensionIfTargetSite = async (url: string, type: string) => {

    let hostname
    let settings = []

    if (url) {
      try {
        const guardSettings = await storage.get(StorageKeyEnum.GUARD_SETTINGS) || {}
        hostname = new URL(url).hostname
        settings = guardSettings[hostname] || []
      } catch (error) {
      }
    }

    chrome.management.getAll(extensions => {
      if (
        ["onCreated", "onUpdated"].includes(type) &&
        settings.length
      ) {
        const names = settings.map(item => {
          const target = extensions.find(extension => extension.id === item)
          return target.shortName || target.name
        }).join("、");

        chrome.notifications.create({
          type: "basic",
          iconUrl: "https://github.com/Dolov/chrome-best-cookier/blob/main/assets/icon.png?raw=true",
          title: "Best Cookier 安全卫士",
          message: `将禁用 ${names}，以防止 Cookie 被窃取。`,
        });
      }
      extensions.forEach(extension => {
        globalStatus.onoff = true
        const { id, enabled } = extension
        // 如果在禁用列表就禁用
        if (settings.includes(id)) {
          if (enabled) {
            chrome.management.setEnabled(id, false)
          }
          return
        }
        if (enabled) return
        // 已经被用户禁用，则不处理
        if (!globalStatus.extensionStatus[id]) return
        chrome.management.setEnabled(id, true)
      })
    })
  }

  // 监听标签页创建事件
  chrome.tabs.onCreated.addListener((tab) => {
    if (tab.url) {
      urlIdMap[tab.id] = tab.url
    }
    toggleExtensionIfTargetSite(tab.url, "onCreated");
  });

  // 监听标签页更新事件
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.status === "complete") {
      urlIdMap[tabId] = tab.url
      toggleExtensionIfTargetSite(tab.url, "onUpdated");
    }
  });

  // 监听标签页切换事件
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url) {
        urlIdMap[activeInfo.tabId] = tab.url
      }
      toggleExtensionIfTargetSite(tab.url, "onActivated");
    });
  });

  // 监听标签页关闭事件
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const url = urlIdMap[tabId]
    if (!url) return
    delete urlIdMap[tabId]
    toggleExtensionIfTargetSite(url, "onRemoved");
  });
}


// 初始化时获取插件状态
storage.get(StorageKeyEnum.EXTENSION_STATUS).then(extensionStatus => {
  if (extensionStatus) {
    globalStatus.extensionStatus = extensionStatus
    cookieGuardInit()
    return
  }
  chrome.management.getAll(extensions => {
    const extensionStatus = {}
    extensions.forEach(extension => {
      const { id, enabled } = extension
      extensionStatus[id] = enabled
    })
    storage.set(StorageKeyEnum.EXTENSION_STATUS, extensionStatus)
    globalStatus.extensionStatus = extensionStatus
    cookieGuardInit()
  })
})


// 手动更改权限或者被其他插件更改权限时记录其状态
const handleExtensionStatusChange = () => {
  if (globalStatus.onoff) return globalStatus.onoff = false
  const extensionStatus = {}
  chrome.management.getAll(extensions => {
    extensions.forEach(extension => {
      const { id, enabled } = extension
      extensionStatus[id] = enabled
    })
    globalStatus.extensionStatus = extensionStatus
    storage.set(StorageKeyEnum.EXTENSION_STATUS, extensionStatus)
  })
}

const debounceHandleExtensionStatusChange = debounce(handleExtensionStatusChange, 1000)

chrome.management.onDisabled.addListener(() => {
  debounceHandleExtensionStatusChange()
})

chrome.management.onEnabled.addListener(() => {
  debounceHandleExtensionStatusChange()
})

chrome.management.onInstalled.addListener(() => {
  debounceHandleExtensionStatusChange()
})

chrome.management.onUninstalled.addListener(() => {
  debounceHandleExtensionStatusChange()
})