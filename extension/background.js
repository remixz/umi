/* global chrome */

const urls = ['https://*.vrv.co/*', 'https://*.dlvr1.net/*', 'https://pl.crunchyroll.com/*']
const origin = 'https://static.crunchyroll.com'
const referer = 'https://static.crunchyroll.com/vilos-v2/web/vilos/no-referrer'

function replaceHeader (headers, name, value) {
  let index = headers.findIndex((header) => header.name.toLowerCase() === name)
  if (index > -1) {
    headers[index].value = value
  } else {
    headers.push({'name': name, 'value': value})
  }
  return headers
}

chrome.webRequest.onBeforeSendHeaders.addListener(({requestHeaders}) => {
  replaceHeader(requestHeaders, 'origin', origin)
  replaceHeader(requestHeaders, 'referer', referer)
  return {requestHeaders}
}, {'urls': urls}, ['blocking', 'requestHeaders'])

chrome.webRequest.onHeadersReceived.addListener(({responseHeaders}) => {
  replaceHeader(responseHeaders, 'access-control-allow-origin', '*')
  return {responseHeaders}
}, {'urls': urls}, ['blocking', 'responseHeaders'])
