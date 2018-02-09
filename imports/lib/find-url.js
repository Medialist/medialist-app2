// TODO: this module has to use commonJS as it's called from nightwatch too.
const trim = require('underscore.string/trim')

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

const findAllUrls = (text) => {
  if (Object.prototype.toString.call(text) !== '[object String]') {
    return []
  }
  const res = text.match(allUrlRe)
  if (!res) {
    return []
  }
  return res.map(trimUrl)
}

module.exports = findUrl
module.exports.findAllUrls = findAllUrls
