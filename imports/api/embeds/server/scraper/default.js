
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
  return withGeneral(metadata).icons
}

export const defaultAppleTouchIconsFinder = (metadata) => {
  return withGeneral(metadata).appleTouchIcons
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
