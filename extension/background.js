/* global chrome */

chrome.webRequest.onHeadersReceived.addListener(({responseHeaders}) => {
  const corsHeader = responseHeaders.findIndex(({name}) => name.toLowerCase() === 'access-control-allow-origin')
  if (corsHeader > -1) {
    responseHeaders[corsHeader].value = '*'
  }

  return {responseHeaders}
}, {urls: ['https://*.vrv.co/*', 'https://*.dlvr1.net/*']}, ['blocking', 'responseHeaders'])
