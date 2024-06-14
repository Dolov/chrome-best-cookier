import React from 'react'
import classnames from 'classnames'
import { themes, backgrounds, ribbons, StorageKeyEnum } from '~utils'
import { useThemeChange, useRibbon, useBackgroundChange } from '~components/hooks'
import '~/style.less'
import './style.less'
import { useStorage } from '@plasmohq/storage/hook'

document.title = `${chrome.i18n.getMessage("extensionName")}`

const selfIds = [
  "eijnnomioacbbnkffmhnbpbocoajcage",
  "mjpahlmelncmphfhdkijpeoengmlidnh"
]

const ThemeList = props => {
  const { value, onChange } = props

  return (
    <div className="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {themes.map(item => {
        const checked = value === item
        return (
          <div
            onClick={() => onChange(item)}
            key={item}
            className={classnames("overflow-hidden rounded-lg item-border", {
              "item-border-active": checked
            })}>
            <div data-theme={item} className="bg-base-100 text-base-content w-full cursor-pointer font-sans">
              <div className="grid grid-cols-5 grid-rows-3">
                <div className="bg-base-200 col-start-1 row-span-2 row-start-1">
                </div> <div className="bg-base-300 col-start-1 row-start-3"></div>
                <div className="bg-base-100 col-span-4 col-start-2 row-span-3 row-start-1 flex flex-col gap-1 p-2">
                  <div className="font-bold">{item}</div>
                  <div className="flex flex-wrap gap-1" data-svelte-h="svelte-1kw79c2">
                    <div className="bg-primary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                      <div className="text-primary-content text-sm font-bold">A</div></div>
                    <div className="bg-secondary flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                      <div className="text-secondary-content text-sm font-bold">A</div></div>
                    <div className="bg-accent flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                      <div className="text-accent-content text-sm font-bold">A</div></div>
                    <div className="bg-neutral flex aspect-square w-5 items-center justify-center rounded lg:w-6">
                      <div className="text-neutral-content text-sm font-bold">A</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const BackgroundList = props => {
  const { value, onChange } = props
  return (
    <div className="rounded-box grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {backgrounds.map(item => {
        const { id, ...rest } = item
        const checked = id === value
        return (
          <div
            key={id}
            style={rest}
            onClick={() => onChange(id)}
            className={classnames("h-16 cursor-pointer overflow-hidden rounded-lg item-border", {
              "item-border-active": checked
            })}>
          </div>
        )
      })}
    </div>
  )
}

const RibbonList = props => {
  const { value, onChange } = props

  return (
    <div className="rounded-box grid grid-cols-8 gap-4">
      {ribbons.map(item => {
        const checked = item === value
        return (
          <div
            key={item}
            onClick={() => onChange(item)}
            className={classnames("py-6 center cursor-pointer overflow-hidden rounded-lg item-border", {
              "item-border-active": checked
            })}>
            <div className={classnames(item, "mb-2")} />
          </div>
        )
      })}
    </div>
  )
}

const CookieGuard = props => {
  const { enable, hostname } = props
  const [type, setType] = React.useState("COOKIES")
  const [extensions, setExtensions] = React.useState<chrome.management.ExtensionInfo[]>([])
  const [guardSettings, setGuardSettings] = useStorage(StorageKeyEnum.GUARD_SETTINGS, {
    
  })

  const disableIds = guardSettings[hostname] || []

  React.useEffect(() => {
    chrome.management.getAll(extensions => {
      extensions = extensions.filter(item => !selfIds.includes(item.id))
      setExtensions(extensions)
    });
  }, [])

  const onToggle = (e: React.ChangeEvent<HTMLInputElement>, item: chrome.management.ExtensionInfo) => {
    const { id } = item
    let ids = [...disableIds]
    if (e.target.checked) {
      ids = ids.filter(item => item !== id)
    } else {
      ids.push(id)
    }

    setGuardSettings({ ...guardSettings, [hostname]: ids })
  }


  const all = type === "ALL"
  const cookies = type === "COOKIES"
  const cExtensions = extensions.filter(item => item.permissions.includes("cookies"))
  const list = cookies ? cExtensions : extensions

  return (
    <div className="rounded-box">
      <ul className="menu md:menu-horizontal">
        <li onClick={() => setType("ALL")}>
          <a className={classnames({ active: all })}>
            全部扩展（{extensions.length}）
            <span className="badge badge-xs badge-info pt-0"></span>
          </a>
        </li>
        <li onClick={() => setType("COOKIES")} className="ml-2">
          <a className={classnames({ active: cookies })}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            拥有 Cookie 授权的扩展（{cExtensions.length}）
            <span className="badge badge-sm badge-warning" />
          </a>
        </li>
      </ul>
      <div className='grid grid-cols-4 gap-4'>
        {list.map(item => {
          const { id, name, description, icons = [], permissions, version } = item
          const iconUrl = icons?.[icons.length - 1]?.url
          const cookiePermissions = permissions.includes("cookies")
          const disable = disableIds.includes(id)
          return (
            <div key={id} className={classnames("card mb-4 p-6", "", {
              "bg-base-300": !enable,
              "hover:shadow-xl item-border bg-base-100": enable,
            })}>
              <div className='flex'>
                <img className="h-12 w-12 min-h-12 min-w-12" src={iconUrl} />
                <div className="pl-4">
                  <h2 className="card-title ellipsis-clamp-1" title={name}>
                    {name} v{version}
                  </h2>
                  <p className='ellipsis-clamp-2' title={description}>
                    {description}
                  </p>
                </div>
              </div>
              <div className="card-actions mt-2 flex-1 items-end">
                <div className="flex-1">
                  {cookiePermissions && (
                    <div className="badge badge-warning">cookies</div>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={!disable}
                  disabled={!enable}
                  onChange={e => onToggle(e, item)}
                  className="toggle toggle-primary"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface SettingProps {

}

const Setting: React.FC<SettingProps> = props => {
  const { } = props


  const [theme, setTheme] = useThemeChange()
  const [ribbon, setRibbon] = useRibbon()
  const [background, setBackground] = useBackgroundChange()
  const [guardEnable, setGuardEnable] = useStorage(StorageKeyEnum.GUARD_ENABLE, false)

  const checked = React.useMemo(() => {
    if (location.href.includes("anchor")) {
      const anchor = new URLSearchParams(location.search).get("anchor")
      return anchor
    }
    return "theme"
  }, [])

  const hostname = React.useMemo(() => {
    if (location.href.includes("hostname")) {
      const hostname = new URLSearchParams(location.search).get("hostname")
      return hostname
    }
    return ""
  }, [])

  const onCookieGuardEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuardEnable(e.target.checked)
  }

  return (
    <div className="overflow-auto h-full">
      <div className="collapse bg-base-200">
        <input type="radio" name="my-accordion-1" defaultChecked={checked === "theme"} />
        <div className="collapse-title text-xl font-medium">
          {chrome.i18n.getMessage("settings_theme")}
        </div>
        <div className="collapse-content">
          <ThemeList value={theme} onChange={setTheme} />
        </div>
      </div>
      <div className="collapse bg-base-200 mt-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          {chrome.i18n.getMessage("settings_background")}
        </div>
        <div className="collapse-content">
          <BackgroundList value={background} onChange={setBackground} />
        </div>
      </div>
      <div className="collapse bg-base-200 mt-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          {chrome.i18n.getMessage("settings_followIcon")}
        </div>
        <div className="collapse-content">
          <RibbonList value={ribbon} onChange={setRibbon} />
        </div>
      </div>
      <div className="collapse bg-base-200 mt-4">
        <input type="radio" name="my-accordion-1" defaultChecked={checked === "cookieGuard"} />
        <div className="collapse-title text-xl font-medium">
          {chrome.i18n.getMessage("settings_cookieGuard")}
        </div>
        <div className="collapse-content">
          <div role="alert" className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <p>进入 {hostname} 站点时，可禁用某些插件，离开时再激活。</p>
              <p>
                <span>这是一项正在测试中的实验特性，点击右侧按钮激活使用。我们正在努力优化它，以提供更好的体验。</span>
                <a href="https://github.com/Dolov/chrome-best-cookier/issues" target='_blank' className="link link-info">
                  您的反馈对我们非常重要，欢迎随时与我们分享您的意见和建议！
                </a>
              </p>
            </div>
            <div>
              <label className="cursor-pointer label">
                <input onChange={onCookieGuardEnableChange} type="checkbox" className="toggle toggle-error" checked={guardEnable} />
              </label>
            </div>
          </div>
          <CookieGuard hostname={hostname} enable={guardEnable} />
        </div>
      </div>
    </div>
  )
}


export default Setting
