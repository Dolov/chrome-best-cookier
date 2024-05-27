import React from "react"
import psl from 'psl'


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

export const useGetUrlInfo = () => {
  const [urlInfo, setUrlInfo] = React.useState<{
    domain: string, subdomain: string,
    hostname: string, protocol: string
  }>()
  
  React.useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const currentUrl = tabs[0].url
      const { hostname, protocol } = new URL(currentUrl)
      if (hostname === "localhost") {
        setUrlInfo({
          domain: hostname, protocol, hostname, subdomain: ""
        })
        return
      }
      if (
        !currentUrl ||
        currentUrl.startsWith("chrome://") ||
        currentUrl.startsWith("chrome-extension://")
      ) {
        setUrlInfo(null)
        return
      }
      const url = psl.parse(hostname);
      if (!url) {
        setUrlInfo(null)
        return
      }
      const { domain, subdomain } = url
      setUrlInfo({
        domain, subdomain, protocol, hostname
      })
    });
  }, [])

  return urlInfo
}