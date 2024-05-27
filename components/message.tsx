
import React from 'react'
import { createPortal } from "react-dom"

const Message = props => {
  const { text } = props
  return (
    <div className="toast z-10">
      <div className="alert alert-success py-1">
        <span>{text}</span>
      </div>
    </div>
  )
}

const message = {
  success(text: string, duration = 2000) {
    const portal = createPortal(<Message />, document.body)
    console.log('portal: ', portal);
  }
}

export default message
