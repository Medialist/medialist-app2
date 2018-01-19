import { resolve } from 'url'

export const imageFormatter = (img, metadata) => {
  if (!img) return undefined
  const imgUrl = img.url || img.href
  if (!imgUrl) return undefined
  const absoluteUrl = resolve(metadata.url, imgUrl)
  return {
    url: absoluteUrl,
    width: img.width ? Number(img.width) : undefined,
    height: img.height ? Number(img.height) : undefined
  }
}

const withGeneral = (metadata) => {
  if (metadata && metadata.general) {
    return metadata.general
  }
  return {}
}

export const defaultUrlFinder = (metadata) => {
  return withGeneral(metadata).canonical
}

export const defaultIconsFinder = (metadata) => {
  const icons = withGeneral(metadata).icons || []
  return icons
    .map(icon => imageFormatter(icon, metadata))
    .filter(icon => !!icon)
}

export const defaultAppleTouchIconsFinder = (metadata) => {
  const icons = withGeneral(metadata).appleTouchIcons || []
  return icons
    .map(icon => imageFormatter(icon, metadata))
    .filter(icon => !!icon)
}

export const defaultTitleFinder = (metadata) => {
  return withGeneral(metadata).title
}

export const defaultImageFinder = (metadata) => {
  return null
}

export const defaultPublishedDateFinder = (metadata) => {
  return null
}

export const defaultOutletFinder = (metadata) => {
  return null
}
