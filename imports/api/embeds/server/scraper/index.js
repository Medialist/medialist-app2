import { Meteor } from 'meteor/meteor'
import scrape from 'html-metadata'
import { defaultUrlFinder, defaultTitleFinder, defaultImageFinder, defaultPublishedDateFinder, defaultOutletFinder } from './default'
import { jsonLdUrlFinder, jsonLdTitleFinder, jsonLdImageFinder, jsonLdPublishedDateFinder, jsonLdOutletFinder } from './json-ld'
import { openGraphUrlFinder, openGraphTitleFinder, openGraphImageFinder, openGraphPublishedDateFinder, openGraphOutletFinder } from './open-graph'

const findOne = (metadata, finders) => {
  return finders
    .map(finder => finder(metadata))
    .filter(value => !!value)
    .pop()
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
