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

/*
TODO:
jobTitles => jobTitle
outlets => outlet
*/
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
    test: value => startsWithAny(['street', 'address line 1', 'address1', 'address 1'], value)
  },
  {
    field: {key: 'city', label: 'City'},
    test: value => startsWithAny(['city', 'town', 'address line 2', 'address2', 'address 2'], value)
  },
  {
    field: {key: 'postcode', label: 'Postcode'},
    test: value => startsWithAny(['postcode', 'post code', 'zipcode', 'zip code', 'address line 3', 'address3', 'address 3'], value)
  },
  {
    field: {key: 'country', label: 'Country'},
    test: value => startsWithAny(['country'], value)
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
[['Dave', 'dave@exmaple.org'], ['Bob', 'bob@example.org']]

So cols[0] is the type of data that is in rows[n][0]
*/
export function createContacts ({cols, rows}) {
  const KeyHandlers = {
    email (contact, value) {
      contact.emails = contact.emails || []
      contact.emails.push({label: 'Email', value: value})
    },
    twitter (contact, value) {
      contact.socials = contact.socials || []
      contact.socials.push({label: 'Twitter', value: twitterScreenName(value) || value})
    },
    linkedin (contact, value) {
      contact.socials = contact.socials || []
      contact.socials.push({label: 'LinkedIn', value: value})
    },
    mobile (contact, value) {
      contact.phones = contact.phones || []
      contact.phones.push({label: 'Mobile', value: value})
    },
    landline (contact, value) {
      contact.phones = contact.phones || []
      contact.phones.push({label: 'Landline', value: value})
    }
  }

  var contacts = rows.map(row => {
    var contact = cols.reduce((contact, col, i) => {
      if (!col) return contact // Empty cols are ignored

      var key = col.key
      var value = (row[i] ? `${row[i]}` : '').trim()
      if (!value) return contact

      if (KeyHandlers[key]) {
        KeyHandlers[key](contact, value)
      } else {
        // Pick the value from the row data or concat if already exists
        contact[key] = contact[key] ? `${contact[key]}, ${value}` : value
      }

      return contact
    }, {})

    contact.name = [
      contact.name,
      contact.forename,
      contact.surname
    ].filter(v => !!v).join(' ')
    delete contact.forename
    delete contact.surname

    const { street, city, postcode, country } = contact
    contact.addresses = [{street, city, postcode, country}]
    delete contact.city
    delete contact.state
    delete contact.postcode
    delete contact.country

    const jobTitle = (contact.jobTitle || '').split(/,\s*/)[0]
    delete contact.jobTitle

    contact.outlets = (contact.outlet || '').split(/,\s*/)
      .filter((outlet) => !/freelance/i.test(outlet))
      .map((outlet, i) => ({
        label: outlet,
        value: jobTitle
      }))

    return contact
  })

  return contacts
}
