export const hookDocumentCookie = (
  documentCtor: Pick<typeof Document, "prototype">,
  onSetCookie: (newValue: string) => void
) => {
  const cookieDescriptor = Object.getOwnPropertyDescriptor(
    documentCtor.prototype,
    "cookie"
  )

  if (!cookieDescriptor?.set) {
    return false
  }

  Object.defineProperty(documentCtor.prototype, "cookie", {
    configurable: cookieDescriptor.configurable,
    enumerable: cookieDescriptor.enumerable,
    get() {
      return cookieDescriptor.get?.call(this)
    },
    set(newValue: string) {
      onSetCookie(newValue)
      return cookieDescriptor.set?.call(this, newValue)
    }
  })

  return true
}
