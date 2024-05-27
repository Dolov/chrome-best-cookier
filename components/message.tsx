
import React from 'react'
import ReactDOM from "react-dom"
import { MaterialSymbolsCheckCircleOutlineRounded } from '~components/Icons'

const messageContainer = document.createElement("div")
messageContainer.id = "message-container"
document.body.appendChild(messageContainer)


const Message = props => {
  const { text } = props
  return (
    <div className="toast z-10 text-cyan-50">
      <div className="alert alert-success py-1 gap-2 text-white">
        <MaterialSymbolsCheckCircleOutlineRounded className="text-lg" />
        <span>{text}</span>
      </div>
    </div>
  )
}

let timer
const message = {
  success(text: string, duration = 2000) {
    clearTimeout(timer)

    ReactDOM.render(
      <Message text={text} />,
      document.querySelector("#message-container")
    )

    timer = setTimeout(() => {
      ReactDOM.unmountComponentAtNode(messageContainer)
    }, duration)
  }
}

export default message
