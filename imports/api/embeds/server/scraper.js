import { scrapeResponse } from 'scrappy/dist/scrape'
import { extract } from 'scrappy/dist/extract'
import { request, createTransport, jar } from 'popsicle'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'

const scrapeAndExtract = (url, plugin, helpers) => {
  return scrapeUrl(url, plugin).then(result => extract(result, helpers))
}

export default scrapeAndExtract

async function scrapeUrl (url, plugin) {
  const res = await makeRequest(url)

  return scrapeResponse(res, plugin)
}

async function makeRequest (url) {
  const req = request({
    url,
    headers: {
      'User-Agent': USER_AGENT
    },
    use: [],
    transport: createTransport({ type: 'stream', jar: jar() })
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
