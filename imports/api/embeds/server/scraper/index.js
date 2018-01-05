import scrape from 'html-metadata'
import { defaultUrlFinder, defaultIconsFinder, defaultAppleTouchIconsFinder, defaultTitleFinder, defaultImageFinder, defaultPublishedDateFinder, defaultOutletFinder } from '/imports/api/embeds/server/scraper/default'
import { jsonLdUrlFinder, jsonLdTitleFinder, jsonLdImageFinder, jsonLdPublishedDateFinder, jsonLdOutletFinder } from '/imports/api/embeds/server/scraper/json-ld'
import { openGraphUrlFinder, openGraphTitleFinder, openGraphImageFinder, openGraphPublishedDateFinder, openGraphOutletFinder } from '/imports/api/embeds/server/scraper/open-graph'

const findOne = (metadata, finders) => {
  const flatten = arr => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [])

  return flatten(
    finders
      .map(finder => finder(metadata))
      .filter(value => !!value)
  ).pop()
}

const findOneDate = (metadata, finders) => {
  const value = findOne(metadata, finders)

  if (value) {
    return new Date(value)
  }
}

export const scrapeUrl = (url, opts, cb) => {
  // finalUrl is updated as scraper follows redirects
  let finalUrl = url

  const options = Object.assign({}, {
    url: url,
    jar: true,
    timeout: 10000,
    followRedirect: (response) => {
      if (response && response.headers && response.headers.location) {
        finalUrl = response.headers.location
      }
      return true
    }
  }, opts)

  scrape(options, (err, metadata) => {
    if (err) return cb(err)
    cb(undefined, metadata, finalUrl)
  })
}

export const extractEmbedData = (metadata, url) => {
  return {
    url: url,
    canonicalUrl: findOne(metadata, [defaultUrlFinder, jsonLdUrlFinder, openGraphUrlFinder]),
    icons: findOne(metadata, [defaultIconsFinder, defaultAppleTouchIconsFinder]),
    image: findOne(metadata, [defaultImageFinder, jsonLdImageFinder, openGraphImageFinder]),
    outlet: findOne(metadata, [defaultOutletFinder, jsonLdOutletFinder, openGraphOutletFinder]),
    headline: findOne(metadata, [defaultTitleFinder, jsonLdTitleFinder, openGraphTitleFinder]),
    datePublished: findOneDate(metadata, [defaultPublishedDateFinder, jsonLdPublishedDateFinder, openGraphPublishedDateFinder]),
    agent: {
      name: 'html-metata',
      version: scrape.version
    }
  }
}

export const scrapeAndExtract = (url, opts, cb) => {
  scrapeUrl(url, opts, (err, metadata, finalUrl) => {
    if (err) return cb(err)
    const embed = extractEmbedData(metadata, finalUrl)
    cb(undefined, embed)
  })
}

export default scrapeAndExtract
