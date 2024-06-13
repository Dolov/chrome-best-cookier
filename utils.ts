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

export const LOCAL_STORAGE_KEY = "__BestCookier_Monitor_Config__"


export enum MessageActionEnum {
  GET_COOKIES = "GET_COOKIES",
  SET_COOKIES = "SET_COOKIES",
  UPDATE_COOKIE = "UPDATE_COOKIE",
  DELETE_COOKIES = "DELETE_COOKIES",

  GET_MONITOR = "GET_MONITOR",
  END_MONITOR = "END_MONITOR",
  START_MONITOR = "START_MONITOR",
}

export enum StorageKeyEnum {
  FOLLOWS = "FOLLOWS",
  SETTINGS = "SETTINGS",
  GUARD_SETTINGS = "GUARD_SETTINGS",
}


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

export const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
]

export const backgrounds = [
  {
    id: "000",
    backgroundImage: "repeating-linear-gradient(45deg, var(--fallback-b1, oklch(var(--b1))), var(--fallback-b1, oklch(var(--b1))) 13px, var(--fallback-b2, oklch(var(--b2))) 13px, var(--fallback-b2, oklch(var(--b2))) 14px)"
  },
  {
    id: "001",
    backgroundImage: "repeating-linear-gradient(135deg, rgba(189,189,189,0.1) 0px, rgba(189,189,189,0.1) 2px,transparent 2px, transparent 4px),linear-gradient(90deg, rgb(255,255,255),rgb(255,255,255))"
  },
  {
    id: "002",
    backgroundImage: "repeating-radial-gradient(circle at center center, transparent 0px, transparent 2px,rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 3px,transparent 3px, transparent 5px,rgba(0,0,0,0.03) 5px, rgba(0,0,0,0.03) 7px),repeating-radial-gradient(circle at center center, rgb(255,255,255) 0px, rgb(255,255,255) 9px,rgb(255,255,255) 9px, rgb(255,255,255) 21px,rgb(255,255,255) 21px, rgb(255,255,255) 31px,rgb(255,255,255) 31px, rgb(255,255,255) 40px)",
    backgroundSize: "20px 20px",
  },
  {
    id: "003",
    backgroundImage: "radial-gradient(circle at center center, rgba(217, 217, 217,0.05) 0%, rgba(217, 217, 217,0.05) 15%,rgba(197, 197, 197,0.05) 15%, rgba(197, 197, 197,0.05) 34%,rgba(178, 178, 178,0.05) 34%, rgba(178, 178, 178,0.05) 51%,rgba(237, 237, 237,0.05) 51%, rgba(237, 237, 237,0.05) 75%,rgba(138, 138, 138,0.05) 75%, rgba(138, 138, 138,0.05) 89%,rgba(158, 158, 158,0.05) 89%, rgba(158, 158, 158,0.05) 100%),radial-gradient(circle at center center, rgb(255,255,255) 0%, rgb(255,255,255) 6%,rgb(255,255,255) 6%, rgb(255,255,255) 12%,rgb(255,255,255) 12%, rgb(255,255,255) 31%,rgb(255,255,255) 31%, rgb(255,255,255) 92%,rgb(255,255,255) 92%, rgb(255,255,255) 97%,rgb(255,255,255) 97%, rgb(255,255,255) 100%)",
    backgroundSize: "42px 42px",
  },
  {
    id: "004",
    backgroundImage: "repeating-linear-gradient(0deg, rgb(250, 250, 250) 0px, rgb(250, 250, 250) 1px,transparent 1px, transparent 21px),repeating-linear-gradient(90deg, rgb(250, 250, 250) 0px, rgb(250, 250, 250) 1px,transparent 1px, transparent 21px),linear-gradient(90deg, hsl(229,0%,100%),hsl(229,0%,100%))"
  },
  {
    id: "005",
    backgroundImage: "linear-gradient(22.5deg, rgba(67, 67, 67, 0.02) 0%, rgba(67, 67, 67, 0.02) 29%,rgba(47, 47, 47, 0.02) 29%, rgba(47, 47, 47, 0.02) 37%,rgba(23, 23, 23, 0.02) 37%, rgba(23, 23, 23, 0.02) 55%,rgba(182, 182, 182, 0.02) 55%, rgba(182, 182, 182, 0.02) 69%,rgba(27, 27, 27, 0.02) 69%, rgba(27, 27, 27, 0.02) 71%,rgba(250, 250, 250, 0.02) 71%, rgba(250, 250, 250, 0.02) 100%),linear-gradient(67.5deg, rgba(117, 117, 117, 0.02) 0%, rgba(117, 117, 117, 0.02) 14%,rgba(199, 199, 199, 0.02) 14%, rgba(199, 199, 199, 0.02) 40%,rgba(33, 33, 33, 0.02) 40%, rgba(33, 33, 33, 0.02) 48%,rgba(135, 135, 135, 0.02) 48%, rgba(135, 135, 135, 0.02) 60%,rgba(148, 148, 148, 0.02) 60%, rgba(148, 148, 148, 0.02) 95%,rgba(53, 53, 53, 0.02) 95%, rgba(53, 53, 53, 0.02) 100%),linear-gradient(135deg, rgba(190, 190, 190, 0.02) 0%, rgba(190, 190, 190, 0.02) 6%,rgba(251, 251, 251, 0.02) 6%, rgba(251, 251, 251, 0.02) 18%,rgba(2, 2, 2, 0.02) 18%, rgba(2, 2, 2, 0.02) 27%,rgba(253, 253, 253, 0.02) 27%, rgba(253, 253, 253, 0.02) 49%,rgba(128, 128, 128, 0.02) 49%, rgba(128, 128, 128, 0.02) 76%,rgba(150, 150, 150, 0.02) 76%, rgba(150, 150, 150, 0.02) 100%),linear-gradient(90deg, #ffffff,#ffffff)"
  },
]

export const ribbons = [
  "ribbon-a-1",
  "ribbon-a-2",
  "ribbon-a-3",
  "ribbon-a-4",
  "ribbon-a-5",
  "ribbon-a-6",
  "ribbon-a-7",
  "ribbon-a-8",
  "ribbon-b-1",
  "ribbon-b-2",
  "ribbon-b-3",
  "ribbon-b-4",
  "ribbon-b-5",
  "ribbon-b-6",
  "ribbon-b-7",
  "ribbon-b-8",
  "ribbon-c-1",
  "ribbon-c-2",
  "ribbon-c-3",
  "ribbon-c-4",
  "ribbon-c-5",
  "ribbon-c-6",
  "ribbon-c-7",
  "ribbon-c-8",
  "ribbon-d-1",
  "ribbon-d-2",
  "ribbon-d-3",
  "ribbon-d-4",
  "ribbon-d-5",
  "ribbon-d-6",
  "ribbon-d-7",
  "ribbon-d-8",
]

export const getFileJson = (file: File): Promise<Record<string, any>> => {
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const data = JSON.parse(content);
        resolve(data);
      }
    };
    reader.readAsText(file);
  })
};

export const getCreateItemDefaultDomain = (domain, subdomain) => {
  if (isIPAddress(domain)) return domain
  if (subdomain === "www") return `.${domain}`
  if (subdomain) {
    return `.${subdomain}.${domain}`
  }
  return `.${domain}`
}

export const getId = (cookie: Cookie) => {
  const { name, value, domain, path } = cookie
  return `${name}-${value}-${domain}-${path}`
}

export const filterCookie = (cookie, value, key) => {
  try {
    if (!value) return false
    const keyValue = cookie[key]
    if (!keyValue) return false
    const includes = keyValue.toLowerCase().includes(value.toLowerCase())
    if (includes) return true
    const valueRegex = new RegExp(value, 'i')
    return valueRegex.test(keyValue)
  } catch (error) {
    return false
  }
}

export const isIPAddress = (str: string) => {
  // 仅由数字和点组成的正则表达式
  const ipPattern = /^[0-9.]+$/;
  return ipPattern.test(str);
}