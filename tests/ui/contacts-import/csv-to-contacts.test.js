const fs = require('fs')
import test from 'ava'
import papaparse from 'papaparse'
import { processCsvData, createContacts } from '../../../imports/api/contacts-import/csv-to-contacts'

test('should convert csv data into rows and cols', (t) => {
  const expectedCols = [
    {key: 'forename', label: 'First Name'},
    {key: 'surname', label: 'Last Name'},
    {key: 'jobTitle', label: 'Job Title'}
  ]
  const expectedRows = [
    ['First Name', 'Last Name', 'Job Title', 'Outlet', 'Phone', 'Email Address', 'Twitter handle', 'Feedback'],
    ['Übergine', 'Andersôn', 'Business Editor', 'The Independent', '+44 (0)20 7931 2753', 'elizabeth.anderson@inews.co.uk', '', 'Spoke to Lizzy on the phone, she isn\'t interested in this one but wants an interveiw with Jeff Bezos for a feature piece on the UK\'s position as the global leader in ecommerce']
  ]
  const csv = fs.readFileSync('./small-business-journalists.csv', 'utf8')
  const res = papaparse.parse(csv, {skipEmptyLines: true})

  // fn being tested.
  const {cols, rows} = processCsvData(res.data)

  t.is(cols.length, 8, 'Found 8 columns')
  t.is(rows.length, 22, 'Found 22 rows')
  expectedCols.forEach((item, i) => t.deepEqual(item, cols[i]))
  expectedRows.forEach((item, i) => t.deepEqual(item, rows[i]))
})

test('should convert rows and cols into contacts', (t) => {
  const rows = require('./fixtures/uk-edu.rows.json')
  const cols = require('./fixtures/uk-edu.cols.json')
  const expect = require('./fixtures/uk-edu.contacts.json')
  const actual = createContacts({cols, rows})
  t.is(expect.length, actual.length, 'Created correct number of contacts')
  actual.forEach((contact, i) => {
    const expected = expect[i]
    // Make errors easier to figure out.
    Object.keys(contact).forEach((key) => {
      t.deepEqual(expected[key], contact[key])
    })
    t.deepEqual(expected, contact)
  })
})
