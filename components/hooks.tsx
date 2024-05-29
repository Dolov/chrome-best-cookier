import React from "react"
import psl from 'psl'
import { useStorage } from '@plasmohq/storage/hook'
import { StorageKeyEnum, backgrounds } from '~utils'

export const useBoolean = (defaultValue = false) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef<boolean>()
  valueRef.current = value
  const toggle = (value?: boolean) => {
    const isBoolean = typeof value === "boolean"
    valueRef.current = isBoolean ? value: !valueRef.current
    setValue(valueRef.current)
  }
  return [value, toggle, valueRef] as const
}

export const useRefState = <T,>(defaultValue?: T) => {
  const [value, setValue] = React.useState(defaultValue)
  const valueRef = React.useRef(value)
  valueRef.current = value

  const setChangeValue = (nextValue: T) => {
    setValue(nextValue)
  }

  return [
    valueRef.current,
    setChangeValue,
    valueRef,
  ] as const
}

export const useUpdateEffect = (effect: React.EffectCallback, deps?: React.DependencyList) => {
  const isMounted = React.useRef(false)

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    return effect()
  }, deps)
}


export interface Options<T> {
  trigger?: string;
  defaultValue?: T;
  valuePropName?: string;
  defaultValuePropName?: string;
}

export interface Props {
  [key: string]: any;
}

/**
 * 在某些组件开发时，我们需要组件的状态即可以自己管理，也可以被外部控制，`useControllableValue` 就是帮你管理这种状态的 Hook
 * @param {any} props 
 * @param {Options} options 
 * @returns [state, setState]
 * @example
 * const [controllableValue, setControllableValue] = useControllableValue({
 *    focus: true,
 *    onFocusChange: () => {...},
 * }, {
 *    trigger: 'onFocusChange',
 *    valuePropName: 'focus'
 * })
 * 
 * const [controllableValue, setControllableValue] = useControllableValue({
 *    value: 123,
 *    onChange: () => {...},
 * })
 */
export function useControllableValue<T>(props: Props = {}, options: Options<T> = {}) {
  const {
    defaultValue: innerDefaultValue,
    trigger = 'onChange',
    valuePropName = 'value',
    defaultValuePropName = 'defaultValue',
  } = options;

  /** 目标状态值 */
  const value = props[valuePropName] as T

  /** 目标状态默认值 */
  const defaultValue = props[defaultValuePropName] as T ?? innerDefaultValue

  /** 初始化内部状态 */
  const [innerValue, setInnerValue] = React.useState<T | undefined>(() => {
    /** 优先取 props 中的目标状态值 */
    if (value !== undefined) {
      return value;
    }
    /** 其次取 defaultValue */
    if (defaultValue !== undefined) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
    return undefined
  })

  /** 优先使用外部状态值，其实使用内部状态值 */
  const mergedValue = value !== undefined ? value : innerValue;

  const triggerChange = (newValue: T, ...args: any[]) => {
    setInnerValue(newValue)
    if (
      mergedValue !== newValue &&
      /** 目标状态回调函数，props[trigger] 可以避免 this 丢失 */
      typeof props[trigger] === 'function' 
    ) {
      props[trigger](newValue, ...args)
    }
  }

  /**
   * 同步非第一次的外部 undefined 状态至内部
   */
  const firstRenderRef = React.useRef(true)
  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return
    }

    if (value === undefined) {
      setInnerValue(value)
    }
  }, [value])


  return [mergedValue, triggerChange] as const
}

export const useGetUrlInfo = (url?: string) => {

  const [urlInfo, setUrlInfo] = React.useState<{
    domain: string, subdomain: string,
    hostname: string, protocol: string,
    url: string,
  }>()

  const queryUrl = (): Promise<string> => {
    return new Promise(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentUrl = tabs[0].url
        resolve(currentUrl)
      });
    })
  }

  const handleUrlInfo = (url: string) => {
    const { hostname, protocol } = new URL(url)
    if (hostname === "localhost") {
      setUrlInfo({
        domain: hostname, protocol,
        hostname, subdomain: "", url
      })
      return
    }
    if (
      !url ||
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://")
    ) {
      setUrlInfo(null)
      return
    }
    const pslInfo = psl.parse(hostname);
    if (!pslInfo) {
      setUrlInfo(null)
      return
    }
    const { domain, subdomain } = pslInfo
    setUrlInfo({
      domain, subdomain, protocol, hostname, url,
    })
  }

  React.useEffect(() => {
    if (url) {
      const realUrl = new URLSearchParams(url.split("?")[1]).get('url')
      if (!realUrl) return
      handleUrlInfo(realUrl)
      return
    }
    queryUrl().then(url => {
      handleUrlInfo(url)
    })
  }, [])
  
  return urlInfo
}

export const useThemeChange = () => {
  const [settings, setSettings] = useStorage<{
    theme?: string
  }>(StorageKeyEnum.SETTINGS, {})

  const { theme } = settings

  const setTheme = (theme: string) => {
    setSettings({
      ...settings,
      theme,
    })
  }

  React.useEffect(() => {
    if (!theme) return
    const html = document.querySelector("html")
    html.setAttribute("data-theme", theme)
  }, [theme])

  return [theme, setTheme]
}

export const useBackgroundChange = () => {
  const [settings, setSettings] = useStorage<{
    theme?: string
    background?: string
  }>(StorageKeyEnum.SETTINGS, {
    background: "000"
  })

  const { background } = settings

  const setBackground = (background: string) => {
    setSettings({
      ...settings,
      background,
    })
  }

  React.useEffect(() => {
    if (!background) return
    const root: HTMLDivElement = document.querySelector("#__plasmo")
    if (!root) return
    const item = backgrounds.find(item => item.id === background)
    root.style.backgroundSize = item.backgroundSize || "auto 100%"
    root.style.backgroundImage = item.backgroundImage
  }, [background])

  return [background, setBackground]
}

export const useRibbon = () => {
  const [settings, setSettings] = useStorage<{
    theme?: string
    ribbon?: string
    background?: string
  }>(StorageKeyEnum.SETTINGS, {
    ribbon: ""
  })

  const { ribbon } = settings

  const setRibbon = (ribbon: string) => {
    setSettings({
      ...settings,
      ribbon,
    })
  }


  return [ribbon, setRibbon]
}