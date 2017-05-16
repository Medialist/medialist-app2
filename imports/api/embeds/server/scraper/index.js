import { Meteor } from 'meteor/meteor'
import scrape from 'html-metadata'
import { defaultUrlFinder, defaultTitleFinder, defaultImageFinder, defaultPublishedDateFinder, defaultOutletFinder } from '/imports/api/embeds/server/scraper/default'
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

const scrapeAndExtract = (url, callback) => {
  scrape({
    url: url,
    jar: true,
    timeout: Meteor.settings.embeds ? Meteor.settings.embeds.timeout : 10000,
    headers: {
      'User-Agent': Meteor.settings.embeds ? Meteor.settings.embeds.userAgent : undefined
    },
    followRedirect: (response) => {
      if (response && response.headers && response.headers.location) {
        url = response.headers.location
      }

      return true
    }
  }, (error, metadata) => {
    if (error) {
      return callback(error)
    }

    const output = {
      url: url,
      canonicalUrl: findOne(metadata, [defaultUrlFinder, jsonLdUrlFinder, openGraphUrlFinder]),
      image: findOne(metadata, [defaultImageFinder, jsonLdImageFinder, openGraphImageFinder]),
      outlet: findOne(metadata, [defaultOutletFinder, jsonLdOutletFinder, openGraphOutletFinder]),
      headline: findOne(metadata, [defaultTitleFinder, jsonLdTitleFinder, openGraphTitleFinder]),
      datePublished: findOneDate(metadata, [defaultPublishedDateFinder, jsonLdPublishedDateFinder, openGraphPublishedDateFinder]),
      agent: {
        name: 'html-metata',
        version: scrape.version
      }
    }

    callback(undefined, output)
  })
}

export default Meteor.wrapAsync(scrapeAndExtract)
