import dot from 'dot-object'

const collationSort = (sortObj) => {
  if (!sortObj) return sortObj
  const collator = new window.Intl.Collator('en', {
    usage: 'sort',
    sensitivity: 'base',
    ignorePunctuation: true,
    numeric: true
  })
  const prop = Object.keys(sortObj)[0]
  const dir = sortObj[prop]
  return (a, b) => {
    const valA = dot.pick(prop, a)
    const valB = dot.pick(prop, b)
    return collator.compare(valA, valB) * dir
  }
}

export default collationSort
