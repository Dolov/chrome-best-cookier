import type { PlasmoCSConfig } from "plasmo"
import { LOCAL_STORAGE_KEY } from '~utils'
import { initMonitor } from '~lib/js-cookie-monitor-debugger-hook.js.js'


export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
  world: "MAIN",
  run_at: "document_start"
}

const init = async () => {
  const monitorConfig = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!monitorConfig) return
  console.log('%c⌛ Best Cookier - 监听 Cookie 变化中...', 'background: #007bff; color: #ffffff; padding: 4px;');

  const { names } = JSON.parse(monitorConfig)
  initMonitor()
}

init()