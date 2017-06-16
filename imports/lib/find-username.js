import url from 'url'

const usernameExtractors = {
  twitter: /([^/]+)/,
  linkedin: /\/in\/([^/]+)/,
  facebook: /([^/]+)/,
  youtube: /\/(channel|user)\/([^/]+)/,
  instagram: /([^/]+)/,
  medium: /([^/]+)/,
  pinterest: /([^/]+)/
}

const findUsername = (type, value) => {
  if (!value || !usernameExtractors[type]) {
    return value
  }

  const pathname = url.parse(value).pathname

  if (!pathname) {
    return value
  }

  const matches = pathname.match(usernameExtractors[type])

  return matches ? matches.pop() : value
}

export default findUsername
