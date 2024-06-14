import { MessageActionEnum, getUrlFromCookie, StorageKeyEnum, getId } from '~utils'
import { debounce } from 'lodash'
import { Storage } from '@plasmohq/storage'


const storage = new Storage()

const Utils = {
  setCookie(cookie: chrome.cookies.Cookie) {
    const url = getUrlFromCookie(cookie)
    const { hostOnly, session, ...restCookie } = cookie
    return chrome.cookies.set({
      url,
      ...restCookie,
    })
  },
  getExtensions(): Promise<chrome.management.ExtensionInfo[]> {
    return new Promise(resolve => {
      chrome.management.getAll(extensions => {
        resolve(extensions)
      })
    })
  }
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
    Utils.setCookie(cookie).then(cookie => {
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
      return Utils.setCookie(cookie)
    });

    Promise.all(setPromises)
      .then(results => {
        sendResponse(results);
      })

    return true;
  }
})





class CookieGuard {

  onoff = false

  // 关闭标签时无法获取 url，需要手动记录
  urlIdMap = {}
  extensionStatus = {}
  debounceExtensionStatusChange = debounce(this.onExtensionStatusChange.bind(this), 1000)

  constructor() {
    this.isEnable().then(enable => {
      if (!enable) return
      this.onEnabled()
    })
    const that = this
    storage.watch({
      [StorageKeyEnum.GUARD_ENABLE](changeInfo) {
        const { newValue, oldValue } = changeInfo
        if (newValue === oldValue) return
        that.onEnableChange(newValue)
      }
    })
  }


  toggleExtensionStatus = async (url: string, type: string) => {
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
        this.onoff = true
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
        if (!this.extensionStatus[id]) return
        chrome.management.setEnabled(id, true)
      })
    })
  }

  async isEnable() {
    return await storage.get(StorageKeyEnum.GUARD_ENABLE)
  }

  onTabsCreated = (tab: chrome.tabs.Tab) => {
    if (tab.url) {
      this.urlIdMap[tab.id] = tab.url
    }
    this.toggleExtensionStatus(tab.url, "onCreated");
  }

  onTabsUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (tab.url && tab.status === "complete") {
      this.urlIdMap[tabId] = tab.url
      this.toggleExtensionStatus(tab.url, "onUpdated");
    }
  }

  onTabsActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url) {
        this.urlIdMap[activeInfo.tabId] = tab.url
      }
      this.toggleExtensionStatus(tab.url, "onActivated");
    });
  }

  onTabsRemoved = (tabId, removeInfo) => {
    const url = this.urlIdMap[tabId]
    if (!url) return
    delete this.urlIdMap[tabId]
    this.toggleExtensionStatus(url, "onRemoved");
  }

  async onEnabled() {
    chrome.management.onEnabled.addListener(this.debounceExtensionStatusChange)
    chrome.management.onDisabled.addListener(this.debounceExtensionStatusChange)
    chrome.management.onInstalled.addListener(this.debounceExtensionStatusChange)
    chrome.management.onUninstalled.addListener(this.debounceExtensionStatusChange)

    storage.get(StorageKeyEnum.EXTENSION_STATUS).then(async status => {
      let extensionStatus = status || {}

      if (!status) {
        const extensions = await Utils.getExtensions()
        extensions.forEach(extension => {
          const { id, enabled } = extension
          extensionStatus[id] = enabled
        })
        storage.set(StorageKeyEnum.EXTENSION_STATUS, extensionStatus)
      }
      this.extensionStatus = extensionStatus
      // 监听标签页创建事件
      chrome.tabs.onCreated.addListener(this.onTabsCreated);
      // 监听标签页更新事件
      chrome.tabs.onUpdated.addListener(this.onTabsUpdated);
      // 监听标签页切换事件
      chrome.tabs.onActivated.addListener(this.onTabsActivated);
      // 监听标签页关闭事件
      chrome.tabs.onRemoved.addListener(this.onTabsRemoved);
    })
  }

  /** 禁用时去除各种监听 */
  onDisabled() {
    storage.set(StorageKeyEnum.EXTENSION_STATUS, null)
    chrome.management.onEnabled.removeListener(this.debounceExtensionStatusChange)
    chrome.management.onDisabled.removeListener(this.debounceExtensionStatusChange)
    chrome.management.onInstalled.removeListener(this.debounceExtensionStatusChange)
    chrome.management.onUninstalled.removeListener(this.debounceExtensionStatusChange)
    chrome.tabs.onCreated.removeListener(this.onTabsCreated);
    chrome.tabs.onUpdated.removeListener(this.onTabsUpdated);
    chrome.tabs.onActivated.removeListener(this.onTabsActivated);
    chrome.tabs.onRemoved.removeListener(this.onTabsRemoved);
  }

  /** 响应用户配置，启用或禁用守卫 */
  onEnableChange(enable: boolean) {
    if (enable) {
      this.onEnabled()
      return
    }
    this.onDisabled()
  }

  /** 当外部操作导致的扩展状态变化时，更新存储的扩展状态 */
  async onExtensionStatusChange() {
    if (this.onoff) return this.onoff = false
    const extensionStatus = {}
    const extensions = await Utils.getExtensions()
    extensions.forEach(extension => {
      const { id, enabled } = extension
      extensionStatus[id] = enabled
    })
    this.extensionStatus = extensionStatus
    storage.set(StorageKeyEnum.EXTENSION_STATUS, extensionStatus)
  }
}


const cookieGuard = new CookieGuard()