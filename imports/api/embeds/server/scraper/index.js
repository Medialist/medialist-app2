import uniq from 'lodash.uniq'
import scrape from 'html-metadata'
import { defaultUrlFinder, defaultIconsFinder, defaultAppleTouchIconsFinder, defaultTitleFinder, defaultImageFinder, defaultPublishedDateFinder, defaultOutletFinder } from '/imports/api/embeds/server/scraper/default'
import { jsonLdUrlFinder, jsonLdTitleFinder, jsonLdImageFinder, jsonLdPublishedDateFinder, jsonLdOutletFinder } from '/imports/api/embeds/server/scraper/json-ld'
import { openGraphUrlFinder, openGraphTitleFinder, openGraphImageFinder, openGraphPublishedDateFinder, openGraphOutletFinder } from '/imports/api/embeds/server/scraper/open-graph'

const findAll = (metadata, finders) => {
  const flatten = arr => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [])

  return flatten(
    finders
      .map(finder => finder(metadata))
      .filter(value => !!value)
  )
}

const findLast = (metadata, finders) => findAll(metadata, finders).pop()

const findFirst = (metadata, finders) => findAll(metadata, finders).shift()

const findLastDate = (metadata, finders) => {
  const value = findLast(metadata, finders)

  if (value) {
    return new Date(value)
  }
}

export const scrapeUrl = (userRequestedUrl, opts, cb) => {
  // url is updated as scraper follows redirects
  let url = userRequestedUrl

  const options = Object.assign({}, {
    url: userRequestedUrl,
    jar: true,
    timeout: 10000,
    followRedirect: (response) => {
      if (response && response.headers && response.headers.location) {
        url = response.headers.location
      }
      return true
    }
  }, opts)

  scrape(options, (err, metadata) => {
    if (err) return cb(err)
    // add the url we were given, and the final url after redirects
    metadata.userRequestedUrl = userRequestedUrl
    metadata.url = url
    cb(undefined, metadata)
  })
}

export const extractEmbedData = (metadata) => {
  const canonicalUrl = findLast(metadata, [defaultUrlFinder, jsonLdUrlFinder, openGraphUrlFinder])
  const icon = findFirst(metadata, [defaultAppleTouchIconsFinder, defaultIconsFinder])
  const image = findLast(metadata, [defaultImageFinder, jsonLdImageFinder, openGraphImageFinder])
  const outlet = findLast(metadata, [defaultOutletFinder, jsonLdOutletFinder, openGraphOutletFinder])
  const headline = findLast(metadata, [defaultTitleFinder, jsonLdTitleFinder, openGraphTitleFinder])
  const datePublished = findLastDate(metadata, [defaultPublishedDateFinder, jsonLdPublishedDateFinder, openGraphPublishedDateFinder])

  const {url, userRequestedUrl} = metadata

  // embed.urls contains each unique form of this url
  const urls = uniq([url, canonicalUrl, userRequestedUrl].filter(u => !!u))

  const embed = {
    url,              // the url of the page, after redirects, that we scraped.
    urls,             // all the urls to simplify searching `Embeds.find({urls: 'foobar'})`
    canonicalUrl,     // the page metadata defined canonicalUrl
    outlet,
    headline,
    icon,
    image,
    datePublished,
    scrapedBy: {
      name: 'html-metata',
      version: scrape.version
    }
  }
  return embed
}

export const scrapeAndExtract = (url, opts, cb) => {
  scrapeUrl(url, opts, (err, metadata) => {
    if (err) return cb(err)
    const embed = extractEmbedData(metadata)
    cb(undefined, embed)
  })
}

export default scrapeAndExtract
