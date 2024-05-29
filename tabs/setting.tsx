import React from 'react'
import classnames from 'classnames'
import { themes, backgrounds, ribbons } from '~utils'
import { useThemeChange, useRibbon, useBackgroundChange } from '~components/hooks'
import '~/style.less'
import './style.less'

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
            className={classnames("border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline outline-2 outline-offset-2 outline-transparent", {
              "!outline-base-content": checked
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
            className={classnames("h-16 cursor-pointer border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline outline-2 outline-offset-2 outline-transparent", {
              "!outline-base-content": checked
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
            className={classnames("py-6 center cursor-pointer border-base-content/20 hover:border-base-content/40 overflow-hidden rounded-lg border outline outline-2 outline-offset-2 outline-transparent", {
              "!outline-base-content": checked
            })}>
            <div className={classnames(item, "mb-2")} />
          </div>
        )
      })}
    </div>
  )
}

export interface SettingProps {

}

const Setting: React.FC<SettingProps> = props => {
  const { } = props


  const [ribbon, setRibbon] = useRibbon()
  const [theme, setTheme] = useThemeChange()
  const [background, setBackground] = useBackgroundChange()

  return (
    <div className="overflow-auto h-full">
      <div className="collapse bg-base-200">
        <input type="radio" name="my-accordion-1" defaultChecked />
        <div className="collapse-title text-xl font-medium">
          主题配置
        </div>
        <div className="collapse-content">
          <ThemeList value={theme} onChange={setTheme} />
        </div>
      </div>
      <div className="collapse bg-base-200 mt-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          背景配置
        </div>
        <div className="collapse-content">
          <BackgroundList value={background} onChange={setBackground} />
        </div>
      </div>
      <div className="collapse bg-base-200 mt-4">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title text-xl font-medium">
          关注徽章配置
        </div>
        <div className="collapse-content">
          <RibbonList value={ribbon} onChange={setRibbon} />
        </div>
      </div>
    </div>
  )
}

export default Setting
