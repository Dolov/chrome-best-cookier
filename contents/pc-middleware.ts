import type { PlasmoCSConfig } from "plasmo"
import { LOCAL_STORAGE_KEY, MessageActionEnum } from '~utils'

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  run_at: "document_start"
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, payload } = message
  if (action === MessageActionEnum.GET_MONITOR) {
    const monitorConfig = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (monitorConfig) {
      sendResponse(JSON.parse(monitorConfig))
    } else {
      sendResponse()
    }
    return
  }
  if (action === MessageActionEnum.START_MONITOR) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
    location.reload()
    return
  }
  if (action === MessageActionEnum.END_MONITOR) {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    location.reload()
    return
  }
})