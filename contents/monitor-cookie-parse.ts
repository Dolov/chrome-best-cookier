const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

const splitKeyValue = (s: string) => {
  let key = ""
  let value = ""
  const keyValueArray = (s || "").split("=")

  if (keyValueArray.length) {
    key = safeDecodeURIComponent(keyValueArray[0].trim())
  }

  if (keyValueArray.length > 1) {
    value = safeDecodeURIComponent(keyValueArray.slice(1).join("=").trim())
  }

  return {
    key,
    value
  }
}

export const parseSetCookie = (cookieString: string) => {
  const cookieStringSplit = cookieString.split(";")
  const { key, value } = splitKeyValue(
    cookieStringSplit.length ? cookieStringSplit[0] : ""
  )
  const cookie: Record<string, any> = {
    value,
    name: key
  }

  for (let i = 1; i < cookieStringSplit.length; i++) {
    const { key: attrKey, value: attrValue } = splitKeyValue(
      cookieStringSplit[i]
    )
    cookie[attrKey] = attrValue
  }

  return cookie
}

export const getCurrentCookies = (cookieString: string) => {
  const cookieMap = {}
  if (!cookieString) {
    return cookieMap
  }

  cookieString.split(";").forEach((item) => {
    const { key, value } = splitKeyValue(item)
    cookieMap[key] = value
  })

  return cookieMap
}
