import { imageFormatter } from './default'

export const withJsonLd = (metadata, types, mapper) => {
  if (!metadata || !metadata.jsonLd) {
    return undefined
  }

  const jsonLd = Array.isArray(metadata.jsonLd) ? metadata.jsonLd : [metadata.jsonLd]

  types = Array.isArray(types) ? types : [types]

  return jsonLd
    .filter(entry => types.includes(entry['@type']))
    .map(mapper)
    .filter(value => !!value)
    .pop()
}

export const articleTypes = ['Article', 'NewsArticle', 'ReportageNewsArticle']

export const jsonLdUrlFinder = (metadata) => {
  return withJsonLd(metadata, articleTypes, entry => entry.url)
}

export const jsonLdTitleFinder = (metadata) => {
  return withJsonLd(metadata, articleTypes, entry => entry.headline)
}

export const jsonLdImageFinder = (metadata) => {
  return withJsonLd(metadata, articleTypes, entry => imageFormatter(entry.image, metadata))
}

export const jsonLdPublishedDateFinder = (metadata) => {
  const pickDate = (entry) => (entry && (entry.datePublished || entry.dateCreated))
  return withJsonLd(metadata, articleTypes, pickDate)
}

export const jsonLdOutletFinder = (metadata) => {
  const pickPublisher = (entry) => (entry && entry.publisher) || {}
  return [
    withJsonLd(metadata, 'Organization', entry => entry.name),
    withJsonLd(metadata, articleTypes, entry => pickPublisher(entry).name)
  ].find(res => !!res)
}
