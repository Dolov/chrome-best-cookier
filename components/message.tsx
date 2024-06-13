
import React from 'react'
import classnames from 'classnames'
import ReactDOM from "react-dom"
import { MaterialSymbolsCheckCircleOutlineRounded, TablerFaceIdError } from '~components/Icons'

const messageContainer = document.createElement("div")
messageContainer.id = "message-container"
document.body.appendChild(messageContainer)


const Message = props => {
  const { text, className, icon } = props
  return (
    <div className="toast z-10 text-cyan-50">
      <div className={classnames("alert py-1 gap-2 text-white", className)}>
        {icon}
        <span>{text}</span>
      </div>
    </div>
  )
}

let timer
const message = {
  render(type, text, duration = 2000) {
    clearTimeout(timer)

    const iconMap = {
      success: <MaterialSymbolsCheckCircleOutlineRounded className="text-lg" />,
      error: <TablerFaceIdError className="text-lg" />
    }

    const classMap = {
      success: "alert-success",
      error: "alert-error"
    }

    const icon = iconMap[type]
    const className = classMap[type]

    ReactDOM.render(
      <Message text={text} icon={icon} className={className} />,
      document.querySelector("#message-container")
    )

    timer = setTimeout(() => {
      ReactDOM.unmountComponentAtNode(messageContainer)
    }, duration)
  },
  success(text: string, duration = 2000) {
    this.render("success", text, duration)
  },
  error(text: string, duration = 2000) {
    this.render("error", text, duration)
  }
}

export default message
