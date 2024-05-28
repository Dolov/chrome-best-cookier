import { MessageActionEnum, getUrlFromCookieDomain } from '~utils'

const setCookie = (cookie: chrome.cookies.Cookie) => {
  const url = getUrlFromCookieDomain(cookie)
  const { hostOnly, session, ...restCookie } = cookie
  return chrome.cookies.set({
    url,
    ...restCookie,
  })
}

chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
  const { action } = params
  if (action === MessageActionEnum.GET_COOKIES) {
    const { payload } = params
    const { domain } = payload
    chrome.cookies.getAll({
      domain
    }, cookies => {
      sendResponse(cookies)
    })
    return true
  }
  if (action === MessageActionEnum.UPDATE_COOKIE) {
    const { payload } = params
    const { cookie } = payload
    setCookie(cookie).then(cookie => {
      sendResponse(cookie)
    })
    return true
  }

  if (action === MessageActionEnum.DELETE_COOKIES) {
    const { payload } = params;
    const { cookies } = payload;
    const deletePromises = cookies.map(cookie => {
      const url = getUrlFromCookieDomain(cookie)
      return chrome.cookies.remove({
        url,
        name: cookie.name,
      });
    });
  
    Promise.all(deletePromises)
      .then(results => {
        sendResponse(results);
      })
  
    return true;
  }

  if (action === MessageActionEnum.SET_COOKIES) {
    const { payload } = params;
    const { cookies } = payload;
    const setPromises = cookies.map(cookie => {
      return setCookie(cookie)
    });
  
    Promise.all(setPromises)
      .then(results => {
        sendResponse(results);
      })
  
    return true;
  }
})