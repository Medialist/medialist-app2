const trim = require('underscore.string/trim')
const urlRegex = /(https?:\/\/[^\s]+)/i

const findUrl = (text) => {
  const res = urlRegex.exec(text)

  if (!res) {
    return null
  }

  return trim(trim(res[0], '!"#$%&\'()*+,-.@:;<=>[\\]^_`{|}~'))
}

module.exports = findUrl
