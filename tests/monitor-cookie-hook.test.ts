import assert from "assert"

import { hookDocumentCookie } from "../contents/monitor-cookie-hook"

class FakeDocument {
  private _cookie = "session=before"

  get cookie() {
    return this._cookie
  }

  set cookie(value: string) {
    this._cookie = value
  }
}

const documentInstance = new FakeDocument()
const capturedValues: string[] = []

hookDocumentCookie(
  FakeDocument as unknown as Pick<typeof Document, "prototype">,
  (newValue) => {
    capturedValues.push(newValue)
  }
)

assert.equal(documentInstance.cookie, "session=before")

documentInstance.cookie = "session=after"

assert.deepEqual(capturedValues, ["session=after"])
assert.equal(documentInstance.cookie, "session=after")
