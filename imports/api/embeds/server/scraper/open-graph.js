import { imageFormatter } from './default'

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
  return imageFormatter(image, metadata)
}

export const openGraphPublishedDateFinder = (metadata) => {
  const graph = withOpenGraph(metadata)
  return graph.published || graph.published_time
}

export const openGraphOutletFinder = (metadata) => {
  return withOpenGraph(metadata).site_name
}
