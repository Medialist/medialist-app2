// https://mathiasbynens.be/demo/url-regex
export const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/ig

export function urlToHostname (url) {
  try {
    const {hostname} = new window.URL(url)
    return hostname
  } catch (err) {
    return url
  }
}

// replace all urls with the hostname
// https://blog.tableflip.io/tableflip-io-now-on-dat/ => blog.tableflip.io
export default function replaceUrl (str) {
  return str.replace(urlRegex, urlToHostname)
}
