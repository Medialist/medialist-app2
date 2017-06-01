const fs = require('fs')
import test from 'ava'
import papaparse from 'papaparse'
import { processCsvData } from '../../../imports/api/contacts/csv-to-contacts'

test('should convert csv data into rows and cols', (t) => {
  const expectedCols = [
    {key: 'forename', label: 'First Name'},
    {key: 'surname', label: 'Last Name'},
    {key: 'jobTitles', label: 'Job Title(s)'}
  ]
  const expectedRows = [
    ['First Name', 'Last Name', 'Job Title', 'Outlet', 'Phone', 'Email Address', 'Twitter handle', 'Feedback'],
    ['Lizzy', 'Anderson', 'Business Editor', 'The Independent', '+44 (0)20 7931 2753', 'elizabeth.anderson@inews.co.uk', '', 'Spoke to Lizzy on the phone, she isn\'t interested in this one but wants an interveiw with Jeff Bezos for a feature piece on the UK\'s position as the global leader in ecommerce']
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
