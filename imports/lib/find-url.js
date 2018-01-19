import trim from 'underscore.string/trim'

const urlRe = /(https?:\/\/[^\s]+)/
const oneUrlRe = new RegExp(urlRe, 'i')
const allUrlRe = new RegExp(urlRe, 'ig')

const trimUrl = (url) => {
  return trim(trim(url, '!"#$%&\'()*+,-.@:;<=>[\\]^_`{|}~'))
}

const findUrl = (text) => {
  const res = oneUrlRe.exec(text)
  if (!res) {
    return null
  }
  return trimUrl(res[0])
}

export const findAllUrls = (text) => {
  const res = text.match(allUrlRe)
  if (!res) {
    return []
  }
  return res.map(trimUrl)
}

export default findUrl
