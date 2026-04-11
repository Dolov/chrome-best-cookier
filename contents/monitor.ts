import type { PlasmoCSConfig } from "plasmo"
// fix: 从 utils 中引入 LOCAL_STORAGE_KEY 会导致与腾讯视频冲突
import {
  getCurrentCookies,
  parseSetCookie
} from "./monitor-cookie-parse"
import { hookDocumentCookie } from "./monitor-cookie-hook"
import { LOCAL_STORAGE_KEY } from '~utils.tiny'

const consoleLogFontSize = 12;

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

  hookDocumentCookie(Document, (newValue) => {
    _1717655521868onSetCookie(newValue);
  })

}

init()

const _1717655521868onSetCookie = (newValue: string) => {
  const { name, value, expires } = parseSetCookie(newValue);
  const currentCookies = getCurrentCookies(document.cookie);

  const expiresTime = expires ? new Date(expires).getTime() : null;

  // 如果过期时间为当前时间之前，则为删除，有可能没设置？虽然目前为止没碰到这样的...
  if (expires && new Date().getTime() >= expiresTime) {
    _1717655521868onDeleteCookie(newValue, name, value || currentCookies[name]);
    return;
  }

  // 如果之前已经存在，则是修改
  if (currentCookies[name]) {
    _1717655521868onUpdateCookie(newValue, name, currentCookies[name], value);
    return;
  }

  // 否则则为添加
  _1717655521868onAddCookie(newValue, name, value);
}


function now() {
  // 东八区专属...
  return "[" + new Date(new Date().getTime() + 1000 * 60 * 60 * 8).toJSON().replace("T", " ").replace("Z", "") + "] ";
}

const genFormatArray = (messageAndStyleArray) => {
  const formatArray = [];
  for (let i = 0, end = messageAndStyleArray.length / 2; i < end; i++) {
      formatArray.push("%c%s");
  }
  return formatArray.join("");
}

const _1717655521868getLocation = () => {
  const callstack = new Error().stack.split("\n")
  if (callstack[0] === "Error") {
    callstack.shift()
  }
  while (callstack.length && callstack[0].includes("_1717655521868")) {
    callstack.shift()
  }

  while (callstack.length && callstack[0].includes("chrome-extension://")) {
    callstack.shift()
  }
  
  if (callstack[0].includes("HTMLDocument.set")) {
    callstack.shift()
  }
  return callstack.join("\n")
}

const _1717655521868onDeleteCookie = (cookieOriginalValue, cookieName, cookieValue) => {
  const valueStyle = `color: black; background: #E50000; font-size: ${consoleLogFontSize}px; font-weight: bold;`;
  const normalStyle = `color: black; background: #FF6766; font-size: ${consoleLogFontSize}px;`;

  const message = [

    normalStyle, now(),

    normalStyle, "JS Cookie Monitor: ",

    normalStyle, "delete cookie, cookieName = ",

    valueStyle, `${cookieName}`,

    ...(() => {
      if (!cookieValue) {
        return [];
      }
      return [normalStyle, ", value = ",

        valueStyle, `${cookieValue}`,
      ];
    })(),

    normalStyle, `\n${_1717655521868getLocation()}`
  ];
  console.log(genFormatArray(message), ...message);
}

const _1717655521868onUpdateCookie = (cookieOriginalValue, cookieName, oldCookieValue, newCookieValue) => {

  const cookieValueChanged = oldCookieValue !== newCookieValue;

  const valueStyle = `color: black; background: #FE9900; font-size: ${consoleLogFontSize}px; font-weight: bold;`;
  const normalStyle = `color: black; background: #FFCC00; font-size: ${consoleLogFontSize}px;`;

  const message = [

    normalStyle, now(),

    normalStyle, "JS Cookie Monitor: ",

    normalStyle, "update cookie, cookieName = ",

    valueStyle, `${cookieName}`,

    ...(() => {
      if (cookieValueChanged) {
        return [normalStyle, `, oldValue = `,

          valueStyle, `${oldCookieValue}`,

          normalStyle, `, newValue = `,

          valueStyle, `${newCookieValue}`
        ]
      } else {
        return [normalStyle, `, value = `,

          valueStyle, `${newCookieValue}`,
        ];
      }
    })(),

    normalStyle, `, valueChanged = `,

    valueStyle, `${cookieValueChanged}`,

    normalStyle, `\n${_1717655521868getLocation()}`
  ];
  console.log(genFormatArray(message), ...message);
}

const _1717655521868onAddCookie = (cookieOriginalValue, cookieName, cookieValue) => {
  const valueStyle = `color: black; background: #669934; font-size: ${consoleLogFontSize}px; font-weight: bold;`;
  const normalStyle = `color: black; background: #65CC66; font-size: ${consoleLogFontSize}px;`;

  const message = [

    normalStyle, now(),

    normalStyle, "JS Cookie Monitor: ",

    normalStyle, "add cookie, cookieName = ",

    valueStyle, `${cookieName}`,

    normalStyle, ", cookieValue = ",

    valueStyle, `${cookieValue}`,

    normalStyle, `\n${_1717655521868getLocation()}`
  ];
  console.log(genFormatArray(message), ...message);
}
