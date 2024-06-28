import classnames from "classnames"
import React from "react"

import { useControllableValue } from "~components/hooks"

export interface BubbleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  trigger?: "click" | "hover"
  onClick?: React.MouseEventHandler<HTMLDivElement>
  /** 子气泡大小 */
  subSize?: number
  /** 子气泡展开半径 */
  subRadius?: number
  /** 子气泡是否可见 */
  subVisible?: boolean
  /** 子气泡默认是否可见 */
  defaultSubVisible?: boolean
  /** 子气泡是否可见的切换 */
  onSubVisibleChange?: (visible: boolean) => void
  subBubbles?: Array<{
    render(angle): React.ReactNode
    color?: string
    shadowColor?: string
  }>
}

const Bubble: React.FC<BubbleProps> = (props) => {
  const {
    children,
    subBubbles,
    style,
    trigger = "click",
    subRadius = 80,
    subSize = 50,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    ...otherProps
  } = props
  const [subVisible, setSubVisible] = useControllableValue(props, {
    trigger: "onSubVisibleChange",
    defaultValue: false,
    valuePropName: "subVisible",
    defaultValuePropName: "defaultSubVisible"
  })
  /** 记录 subVisible 是否变化过，主要是为了隐藏第一次动画 */
  const [subVisibleChanged, setSubVisibleChanged] = React.useState(subVisible)

  React.useEffect(() => {
    if (subVisibleChanged) return
    if (subVisible) {
      setSubVisibleChanged(true)
    }
  }, [subVisible, subVisibleChanged])

  const mergeStyle = React.useMemo(() => {
    return {
      "--offset-size": `-${subSize / 4}px`,
      ...style
    }
  }, [subSize])

  /** 鼠标移入时，如果是吸附状态则展开 */
  const onMouseEnter: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (trigger === "click") return
    if (sub) {
      setSubVisible(!subVisible)
    }
    onMouseEnterProp && onMouseEnterProp(event)
  }

  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (trigger === "click") return
    if (sub) {
      setSubVisible(!subVisible)
    }
    onMouseLeaveProp && onMouseLeaveProp(event)
  }

  const sub = Array.isArray(subBubbles) && subBubbles.length

  const clickHandler: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (trigger === "hover") return
    if (sub) {
      setSubVisible(!subVisible)
    }
    props?.onClick?.(e)
  }

  const bubble = (
    <div
      {...otherProps}
      style={mergeStyle}
      onClick={clickHandler}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classnames("bubble")}>
      {sub && (
        <div
          className={classnames(`bubble-surround`, {
            hidden: !subVisible,
            visible: subVisible,
            animate: subVisibleChanged
          })}>
          {subBubbles.map((item, index) => {
            const { render, color, shadowColor } = item
            /** 加上 180deg 是为了让第一个显示在上面 */
            // const angle = (index * 360) / subBubbles.length + 180
            const angle = 145 + 70 * index
            return (
              <div
                style={{
                  // @ts-ignore
                  "--color": color,
                  "--shadow-color": shadowColor || color,
                  width: subSize,
                  height: subSize,
                  transform: `rotateZ(${angle}deg) translateY(${subRadius}px)`,
                  background: color
                }}
                className={classnames("bubble-sub")}
                onClick={(e) => e.stopPropagation()}>
                {/* 内容部旋转 */}
                <div
                  className="center"
                  style={
                    {
                      // transform: `rotateZ(${-angle}deg)`
                    }
                  }>
                  {render(angle)}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {children}
    </div>
  )

  return bubble
}

export default Bubble
