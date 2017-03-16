export const atLeastOne = (arr, defaultItem) => {
  if (arr && arr.length) return arr
  return [defaultItem]
}

export const hasErrors = ({errors}) => Object.keys(errors).length > 0
