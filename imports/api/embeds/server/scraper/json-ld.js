
const withJsonLd = (metadata, type, mapper) => {
  if (!metadata || !metadata.jsonLd) {
    return undefined
  }

  const jsonLd = Array.isArray(metadata.jsonLd) ? metadata.jsonLd : [metadata.jsonLd]

  return jsonLd
    .filter(entry => entry['@type'] === type)
    .map(mapper)
    .filter(value => !!value)
    .pop()
}

export const jsonLdUrlFinder = (metadata) => {
  return withJsonLd(metadata, 'NewsArticle', entry => entry.url)
}

export const jsonLdTitleFinder = (metadata) => {
  return withJsonLd(metadata, 'NewsArticle', entry => entry.headline)
}

export const jsonLdImageFinder = (metadata) => {
  return withJsonLd(metadata, 'NewsArticle', entry => {
    if (entry.image && entry.image.url) {
      if (!entry.image.url.startsWith('http')) {
        return undefined
      }

      return {
        url: entry.image.url,
        width: entry.image.width ? Number(entry.image.width) : undefined,
        height: entry.image.height ? Number(entry.image.height) : undefined
      }
    }
  })
}

export const jsonLdPublishedDateFinder = (metadata) => {
  const newsArticleDate = withJsonLd(metadata, 'NewsArticle', entry => entry.datePublished || entry.dateCreated)
  const articleDate = withJsonLd(metadata, 'Article', entry => entry.datePublished || entry.dateCreated)

  return newsArticleDate || articleDate
}

export const jsonLdOutletFinder = (metadata) => {
  const organisationName = withJsonLd(metadata, 'Organization', entry => entry.name)
  const publisherName = withJsonLd(metadata, 'Article', entry => {
    if (entry.publisher) {
      return entry.publisher.name
    }
  })

  return organisationName || publisherName
}
