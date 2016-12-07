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
    field: {key: 'email', label: 'Email'},
    test: value => {
      if (startsWith(value, 'email')) return true
      if (startsWith(value, 'e-mail')) return true
      return value.indexOf('@') > 0
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
    field: {key: 'facebook', label: 'Facebook'},
    test: (value) => {
      if (startsWith(value, 'facebook')) return true
      if (include(value, 'facebook.com')) return true
      return false
    }
  },
  {
    field: {key: 'mobile', label: 'Mobile'},
    test: (value) => {
      if (startsWith(value, 'mobile')) return true
      if (startsWith(value, 'cell')) return true

      if (/^[0-9 -+()]+$/.test(value)) {
        // Is mobile if remove all non numerics and it starts with 07 || 447
        var numbers = value.replace(/[^0-9]/g, '')
        return startsWith(numbers, '07') || startsWith(numbers, '447')
      }

      return false
    }
  },
  {
    field: {key: 'landline', label: 'Telephone'},
    test: (value) => {
      if (startsWith(value, 'telephone')) return true
      if (startsWith(value, 'phone')) return true
      if (startsWith(value, '+44')) return true
      return /^[0-9 -+()]+$/.test(value)
    }
  },
  {
    field: {key: 'memberType', label: 'Member Type'},
    test: value => value === 'member type'
  },
  {
    field: {key: 'notes', label: 'Notes'},
    test: value => value === 'list notes' || value === 'notes' || value === 'gorkana short note'
  },
  {
    field: {key: 'salutation', label: 'Salutation'},
    test: value => value === 'salutation'
  },
  {
    field: {key: 'primaryOutlets', label: 'Primary Outlet(s)'},
    test: value => value === 'primary outlet'
  },
  {
    field: {key: 'otherOutlets', label: 'Other Outlets'},
    test: value => value === 'all media outlets'
  },
  {
    field: {key: 'sectors', label: 'Sector(s)'},
    test: value => value === 'sectors'
  },
  {
    field: {key: 'jobTitles', label: 'Job Title(s)'},
    test: value => value === 'job title'
  },
  {
    field: {key: 'languages', label: 'Language(s)'},
    test: value => value === 'language'
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
    field: {key: 'address', label: 'Address'},
    test: value => value === 'address'
  },
  {
    field: {key: 'address1', label: 'Address Line 1'},
    test: value => value === 'address line 1' || value === 'address 1'
  },
  {
    field: {key: 'address2', label: 'Address Line 2'},
    test: value => value === 'address line 2' || value === 'address 2'
  },
  {
    field: {key: 'address3', label: 'Address Line 3'},
    test: value => value === 'address line 3' || value === 'address 3'
  },
  {
    field: {key: 'city', label: 'City'},
    test: value => value === 'city' || value === 'town'
  },
  {
    field: {key: 'state', label: 'State'},
    test: value => value === 'state'
  },
  {
    field: {key: 'postcode', label: 'Postcode'},
    test: value => value === 'postcode' || startsWith(value, 'post code') || value === 'zipcode' || value === 'zip code'
  },
  {
    field: {key: 'country', label: 'Country'},
    test: value => value === 'country'
  }
]

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
    facebook (contact, value) {
      contact.socials = contact.socials || []
      contact.socials.push({label: 'Facebook', value: value})
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
      var key = col.key
      if (!key) return contact // Empty keys are ignore

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

    contact.address = [
      contact.address,
      contact.address1,
      contact.address2,
      contact.address3,
      contact.city,
      contact.state,
      contact.postcode,
      contact.country
    ].filter(v => !!v).join(', ')

    delete contact.address1
    delete contact.address2
    delete contact.address3
    delete contact.city
    delete contact.state
    delete contact.postcode
    delete contact.country

    // We don't use these
    delete contact.memberType
    delete contact.notes
    delete contact.salutation

    return contact
  })

  return contacts
}
