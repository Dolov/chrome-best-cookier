import type { PlasmoCSConfig } from "plasmo"
import { Storage } from '@plasmohq/storage'
import { StorageKeyEnum } from '~utils'
import { initMonitor } from '~lib/js-cookie-monitor-debugger-hook.js.js'

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN",
  all_frames: true,
  run_at: "document_start"
}

const init = () => {
  const storage = new Storage()
  // initMonitor()
}

init()