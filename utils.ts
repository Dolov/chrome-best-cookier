import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export {
  dayjs
}

export type Cookie = {
  create?: boolean,
  checked?: boolean,
} & chrome.cookies.Cookie

export enum MessageActionEnum {
  GET_COOKIES = "GET_COOKIES",
  SET_COOKIES = "SET_COOKIES",
  UPDATE_COOKIE = "UPDATE_COOKIE",
  DELETE_COOKIES = "DELETE_COOKIES",
}

export enum StorageKeyEnum {
  FOLLOW = "FOLLOW",
}

const getLanguage = () => {
  const lang = chrome.i18n.getUILanguage();
  if (!lang) return 'en'
  if (
    lang.toLowerCase().includes('zh') ||
    lang.toLowerCase().includes('cn')
  ) return 'zh'
  return 'en'
}

/** 国际化词条 */
const i18nTextMap = {
  en: {
    title: "Manager",
    existsMessage: "Already exists",
    placeholder: 'Enter a new cookie name and press Enter',
    disabled: "The current page cannot set",
    init: "Plugin initialization in progress",
    showAll: "Show All",
  },
  zh: {
    title: "管理器",
    existsMessage: "已存在",
    placeholder: '输入新的 cookie 名称，然后回车',
    disabled: "当前页面无法设置",
    init: "插件初始化中",
    showAll: "显示全部",
  }
}

/** 当前语言环境下的词条 */
const lang = getLanguage()
export const i18n = i18nTextMap[lang]

/** 插件异步通信 */
export const sendMessage = (message: Record<string, any>): Promise<any> => {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, message, response => {
        resolve(response)
      });
    });
  })
}

/**
 * Returns a formatted string representing the expiration date relative to the current time.
 *
 * @param {number | undefined} expirationDate - The expiration date in milliseconds since the Unix Epoch.
 * @return {string | undefined} The formatted expiration date as "YYYY-MM-DD HH:mm:ss" if expirationDate is a valid number,
 *                              otherwise undefined.
 */
export const getDate = (expirationDate?: number) => {
  if (!expirationDate) return
  if (typeof expirationDate === "string") return expirationDate
  const floorDate = Math.floor(expirationDate)
  const timeToDisplay = dayjs(Number(`${floorDate}000`));
  return timeToDisplay.format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Returns a list of domain names based on the provided domain and subdomain.
 *
 * @param {string} domain - The main domain name.
 * @param {string} subdomain - The subdomain name (optional).
 * @return {string[]} An array of domain names.
 */
export const getDomainList = (domain, subdomain) => {
  const list = [domain, `.${domain}`]
  if (!subdomain) return list

  const subdomains: string[] = subdomain.split('.')
  subdomains.reverse()

  const length = subdomains.length
  for (let i = 0; i < length; i++) {
    const prefix = subdomains.slice(0, i + 1).reverse().join('.')
    list.push(`${prefix}.${domain}`)
    list.push(`.${prefix}.${domain}`)
  }
  return list
}

export const getUrlFromCookie = (cookie: chrome.cookies.Cookie) => {
  const { domain, path = "/" } = cookie
  if (!domain) return ""
  if (domain.startsWith(".")) {
    return `https://${domain.slice(1)}${path}`
  }
  return `https://${domain}${path}`
}


/**
 * Copies the given text to the clipboard.
 *
 * @param {string} text - The text to be copied.
 * @return {void} This function does not return anything.
 */
export const copyTextToClipboard = (text: string) => {
	const textArea = document.createElement("textarea");
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.select();

	try {
		const successful = document.execCommand('copy');
	} catch (err) {
		console.log('err: ', err);
	}
	document.body.removeChild(textArea);
}