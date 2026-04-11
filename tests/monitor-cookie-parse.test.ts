import assert from "assert"

import {
  getCurrentCookies,
  parseSetCookie
} from "../contents/monitor-cookie-parse"

assert.deepEqual(parseSetCookie("session=hello%20world"), {
  name: "session",
  value: "hello world"
})

assert.doesNotThrow(() => {
  parseSetCookie("session=100%")
})

assert.doesNotThrow(() => {
  getCurrentCookies("session=100%")
})
