import dot from 'dot-object'
import { intlToMongo } from 'intl-to-mongo-collation'

export const getIntlCollationOpts = () => ({
  usage: 'sort',
  sensitivity: 'case',
  ignorePunctuation: true,
  numeric: true,
  caseFirst: 'upper'
})

export const getMongoCollationOpts = (locale = 'en') => intlToMongo(getIntlCollationOpts(), locale)

export const collationSort = (sortObj, locale = 'en') => {
  if (!sortObj) return sortObj
  const collator = new window.Intl.Collator(locale, getIntlCollationOpts())
  const prop = Object.keys(sortObj)[0]
  const dir = sortObj[prop]
  return (a, b) => {
    const valA = dot.pick(prop, a)
    const valB = dot.pick(prop, b)
    return collator.compare(valA, valB) * dir
  }
}

export default collationSort
