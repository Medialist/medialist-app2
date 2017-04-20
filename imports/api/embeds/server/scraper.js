import { scrapeResponse } from 'scrappy/dist/scrape'
import { extract } from 'scrappy/dist/extract'
import { request, createTransport, jar } from 'popsicle'
import { Meteor } from 'meteor/meteor'

export const scrapeAndExtract = (url, plugin, helpers) => {
  return makeRequest(url)
    .then(result => scrapeResponse(result, plugin))
    .then(result => extract(result, helpers))
}

const makeRequest = (url) => {
  const req = request({
    url,
    headers: {
      'User-Agent': Meteor.settings.embeds.userAgent
    },
    use: [],
    transport: createTransport({ type: 'stream', jar: jar() }),
    timeout: Meteor.settings.embeds.timeout
  })

  return req.then((res) => {
    // Abort wrapper to ignore streaming errors from aborting (e.g. unzipping).
    function abort () {
      res.body.on('error', () => undefined)
      req.abort()
    }

    return {
      stream: res.body,
      headers: res.headers,
      status: res.status,
      abort: abort,
      url: res.url
    }
  })
}
