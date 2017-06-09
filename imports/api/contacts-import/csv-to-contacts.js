/*
# csv-to-contacts.js

`importCsvFile` converts the csv to {cols, rows}
`createContacts` converts {cols, rows} data into Contact objects.
*/

import Csv from 'papaparse'
import startsWith from 'underscore.string/startsWith'
import include from 'underscore.string/include'
import twitterScreenName from 'twitter-screen-name'

/*
Takes a file and a `cb(err, data)`

`data` is an object with `{cols, rows}` extracted from the csv.

`cols` is an array of `{key: '', label: ''}` column header data objects that
define the column the header label, and the contact property to map it to.
Column info is guessed based in the values in each cell in the first row

`rows` is array, each item is an array of cells that made up a single row in the
csv e.g. [['Dave', 'dave@exmaple.org'], ['Bob', 'bob@example.org']]

See: http://papaparse.com/docs for options.
*/
export function importCsvFile (file, cb) {
  Csv.parse(file, {
    skipEmptyLines: true,
    complete: ({data, errors, meta}, file) => {
      const err = errors.length ? errors : null
      cb(err, processCsvData(data))
    }
  })
}

// Exported for testing purposes
export function processCsvData (data) {
  const rows = data
  const firstRow = rows[0] || []
  const cols = firstRow.map((cell) => guessColumnHeader(cell))
  return {cols, rows}
}

/*
Use heuristics to pick a sensible column name from the value.

A value may be a column header or a value, depending on whether the csv
provided a header row.
*/
function guessColumnHeader (value) {
  if (!value) return null
  value = `${value}`.trim().toLowerCase()
  var detector = schemaDetectors.find(d => d.test(value))
  return detector ? detector.field : null
}

const schemaDetectors = [
  {
    field: {key: 'ignore', label: 'Ignore'},
    test: value => value === 'ignore'
  },
  {
    field: {key: 'name', label: 'Name'},
    test: value => value === 'name'
  },
  {
    field: {key: 'forename', label: 'First Name'},
    test: value => value === 'forename' || value === 'first name'
  },
  {
    field: {key: 'surname', label: 'Last Name'},
    test: value => value === 'surname' || value === 'last name'
  },
  {
    field: {key: 'jobTitle', label: 'Job Title'},
    test: value => startsWithAny(['job', 'title', 'position', 'role'], value)
  },
  {
    field: {key: 'outlet', label: 'Outlet'},
    test: value => startsWithAny(['primary outlet', 'outlet', 'organisation', 'organization'], value)
  },
  {
    field: {key: 'email', label: 'Email'},
    test: value => {
      if (startsWithAny(['email', 'e-mail'], value)) return true
      if (value.indexOf('@') > 0) return true
      return false
    }
  },
  {
    field: {key: 'phone', label: 'Phone'},
    test: (value) => {
      if (startsWithAny(['phone', 'telephone', 'landline', 'mobile', 'cell'], value)) return true
      return /^[0-9 -+()]+$/.test(value)
    }
  },
  {
    field: {key: 'twitter', label: 'Twitter'},
    test: value => {
      if (startsWith(value, 'twitter')) return true
      if (include(value, 'twitter.com')) return true
      return startsWith(value, '@')
    }
  },
  {
    field: {key: 'linkedin', label: 'LinkedIn'},
    test: (value) => {
      if (include(value, 'linkedin')) return true
      return false
    }
  },
  {
    field: {key: 'street', label: 'Street'},
    test: value => startsWithAny(['street'], value)
  },
  {
    field: {key: 'city', label: 'City'},
    test: value => startsWithAny(['city', 'town'], value)
  },
  {
    field: {key: 'postcode', label: 'Postcode'},
    test: value => startsWithAny(['postcode', 'post code', 'zipcode', 'zip code'], value)
  },
  {
    field: {key: 'country', label: 'Country'},
    test: value => startsWithAny(['country'], value)
  },
  {
    field: {key: 'addressline1', label: 'Address line 1'},
    test: value => startsWithAny(['address line 1', 'address1', 'address 1'], value)
  },
  {
    field: {key: 'addressline2', label: 'Address line 2'},
    test: value => startsWithAny(['address line 2', 'address2', 'address 2'], value)
  },
  {
    field: {key: 'addressline3', label: 'Address line 3'},
    test: value => startsWithAny(['address line 3', 'address3', 'address 3'], value)
  }
]

function startsWithAny (arr, val) {
  return arr.some((option) => startsWith(val, option))
}

export const allColumns = schemaDetectors.map((obj) => obj.field)

/*
Create contacts from column definitions and rows of data.

cols is
[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}]

rows is
[
  ['Dave', 'dave@exmaple.org'], ['Bob', 'bob@example.org']
]

So cols[0] is the type of data that is in rows[n][0]
*/
export function createContacts ({cols, rows}) {
  const items = objectify(cols, rows)
  return items.map((item) => ({
    name: findName(item),
    outlets: findOutlets(item),
    emails: findEmails(item),
    phones: findPhones(item),
    socials: findSocials(item),
    addresses: findAddresses(item)
  }))
}

/**
 * Convert cols and rows into an array of objects.
 * All col and row values must be be strings.
 * Will return array of objects mapping col value to row value.
 *
 * Values for repeated keys are joined with commas...
 * We have to check values for commas anyway as the data maybe from an odd csv,
 * where a single value could be a quoted comma seperated string, so we use the
 * same mechanism here, rather than upgrading to an array as you might expect.
 *
 * @param {Array} cols The keys
 * @param {Array} rows the array of arrays of values
 * @return {Array} The rows as objects
 * @example
 *   objectify(
 *     ['name', 'email', 'email'],
 *     [
 *       ['Derp', '1@yes.no', '2@butt.systems']
 *     ]
 *   )
 *   // => [{ name: 'Derp', email: '1@yes.no, 2@butt.systems' }]
 */
function objectify (cols, rows) {
  return rows.map((row) => {
    return cols.reduce((item, col, i) => {
      if (!col) return item // Empty cols are ignored
      var key = col.key
      var value = (row[i] ? `${row[i]}` : '').trim()
      if (!value) return item
      item[key] = item[key] ? `${item[key]}, ${value}` : value
      return item
    }, {})
  })
}

function findName (item) {
  return [
    item.name,
    item.forename,
    item.surname
  ].filter(v => !!v).join(' ')
}

function findOutlets ({jobTitle = '', outlet}) {
  if (!outlet) return []
  const title = jobTitle.split(/,\s*/)[0]
  const outlets = outlet.split(/,\s*/)
    .filter((outlet) => !/freelance/i.test(outlet))
    .map((outlet, i) => ({label: outlet, value: title}))
  return outlets
}

function findEmails ({email}) {
  if (!email) return []
  return email
    .split(/,\s*/)
    .map((value) => ({label: 'Email', value}))
}

function findPhones ({phone}) {
  if (!phone) return []
  return phone
    .split(/,\s*/)
    .map((value) => ({label: 'Mobile', value}))
}

function findSocials ({twitter, linkedin}) {
  const socials = []
  if (twitter) {
    // TODO: might be better to ignore bad twitter handles at this point
    socials.push({label: 'Twitter', value: twitterScreenName(twitter) || twitter})
  }
  if (linkedin) {
    socials.push({label: 'LinkedIn', value: linkedin})
  }
  return socials
}

// Assemble addresses array from the import data.
function findAddresses (item) {
  const keys = ['street', 'city', 'postcode', 'country', 'addressline1', 'addressline2', 'addressline3']

  // if none of them are set, we don't have an address.
  if (!keys.some((k) => !!item[k])) return []

  const address = {
    street: item.street || joinAddressLines(item) || '',
    city: item.city || '',
    postcode: item.postcode || '',
    country: item.country || ''
  }
  return [address]
}

function joinAddressLines (item) {
  const lines = [item.addressline1, item.addressline2, item.addressline3]
    .filter(str => !!str)
    .join(', ')
  return lines
}
