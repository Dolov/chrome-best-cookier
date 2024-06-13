import { MessageActionEnum, getUrlFromCookie, StorageKeyEnum, getId } from '~utils'
import { Storage } from '@plasmohq/storage'

const storage = new Storage()


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




const cookieGuardInit = (rawExtensionStatus) => {
  // 关闭标签时无法获取 url，需要手动记录
  const urlIdMap = {}
  // 处理禁用与激活
  const toggleExtensionIfTargetSite = async (url: string, type: string) => {
    if (!url) return

    const { hostname } = new URL(url)
    const guardSettings = await storage.get(StorageKeyEnum.GUARD_SETTINGS) || {}
    const settings = guardSettings[hostname] || []

    chrome.management.getAll(extensions => {
      if (["onCreated", "onUpdated", "onActivated"].includes(type) && settings.length) {
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
        const { id, enabled } = extension
        if (settings.includes(id)) {
          chrome.management.setEnabled(id, false)
          return
        }
        // 已经被用户禁用，则不处理
        if (!rawExtensionStatus[id]) return
        if (enabled) return
        chrome.management.setEnabled(id, true)
      })
    })
  }

  // 监听标签页创建事件
  chrome.tabs.onCreated.addListener((tab) => {
    if (!tab.url) return
    urlIdMap[tab.id] = tab.url
    toggleExtensionIfTargetSite(tab.url, "onCreated");
  });

  // 监听标签页更新事件
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && changeInfo.status === "complete") {
      urlIdMap[tabId] = changeInfo.url
      toggleExtensionIfTargetSite(changeInfo.url, "onUpdated");
    }
  });

  // 监听标签页切换事件
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (!tab.url) return
      urlIdMap[activeInfo.tabId] = tab.url
      toggleExtensionIfTargetSite(tab.url, "onActivated");
    });
  });

  // 监听标签页关闭事件
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const url = urlIdMap[tabId]
    delete urlIdMap[tabId]
    if (!url) return
    toggleExtensionIfTargetSite(url, "onRemoved");
  });
}



chrome.management.getAll(extensions => {
  // 记录插件的初始状态
  const rawExtensionStatus = {}
  extensions.forEach(extension => {
    const { id, enabled } = extension
    rawExtensionStatus[id] = enabled
  })
  cookieGuardInit(rawExtensionStatus)
})