
const withOpenGraph = (metadata) => {
  if (metadata && metadata.openGraph) {
    return metadata.openGraph
  }

  return {}
}

export const openGraphUrlFinder = (metadata) => {
  return withOpenGraph(metadata).url
}

export const openGraphTitleFinder = (metadata) => {
  return withOpenGraph(metadata).title
}

export const openGraphImageFinder = (metadata) => {
  const image = withOpenGraph(metadata).image

  if (image) {
    if (!image.url.startsWith('http')) {
      return undefined
    }

    return {
      url: image.url,
      width: image.width ? Number(image.width) : undefined,
      height: image.height ? Number(image.height) : undefined
    }
  }
}

export const openGraphPublishedDateFinder = (metadata) => {
  const graph = withOpenGraph(metadata)

  return graph.published || graph.published_time
}

export const openGraphOutletFinder = (metadata) => {
  return withOpenGraph(metadata).site_name
}
