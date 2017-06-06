import { Meteor } from 'meteor/meteor'
import React from 'react'
import { withRouter } from 'react-router'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import Topbar from '/imports/ui/navigation/topbar'
import ImportTable from '/imports/ui/contacts-import/contacts-import-table'
import CsvToContacts from '/imports/api/contacts-import/csv-to-contacts'
import { ContactCreateSchema } from '/imports/api/contacts/schema'

const PREVIEW_ROW_COUNT = 26

class ContactsImportPreviewPage extends React.Component {
  constructor (props) {
    super(props)
    const {location} = props
    this.state = Object.assign(
      { cols: [], rows: [], contacts: [], fails: [] },
      location.state,
      this.createContacts(location.state)
    )
  }

  createContacts ({cols, rows}) {
    const res = CsvToContacts.createContacts({cols, rows: rows.slice(1)})
    const validator = ContactCreateSchema.newContext()
    return res.reduce((partition, item) => {
      const valid = validator.validate(item)
      if (valid) {
        partition.contacts.push(item)
      } else {
        partition.fails.push(item)
      }
      return partition
    }, {contacts: [], fails: []})
  }

  onColumnChange = (newCol, i) => {
    const {rows} = this.state
    const cols = Array.from(this.state.cols)
    cols[i] = newCol
    const res = this.createContacts({cols, rows})
    this.setState({cols, ...res})
  }

  onSave = () => {
    const { contacts } = this.state
    const { router } = this.props
    // TODO: inform the user where not all data can be imported
    Meteor.call('importContacts', { data: contacts }, (err, importId) => {
      if (err) return this.onError(err)
      router.push({
        pathname: '/contacts/import/processing',
        state: {importId, contacts}
      })
    })
  }

  onError = (err) => {
    const {snackbar} = this.props
    console.error(err)
    snackbar.error('An error occured importing your contacts', 'contact-import-failed')
  }

  render () {
    const { onColumnChange, onSave } = this
    const { cols, rows, contacts } = this.state
    const okCols = cols.filter((c) => !!c && c.key !== 'ignore')
    const hasName = okCols.some(c => c.key === 'name')
    const hasForname = okCols.some(c => c.key === 'forename')
    const hasSurname = okCols.some(c => c.key === 'surname')
    const hasOutlet = okCols.some(c => c.key === 'outlet')
    const hasEnoughInfo = hasOutlet && (hasName || (hasForname && hasSurname))
    return (
      <div>
        <Topbar backLinkText='Cancel'>
          <button disabled={!hasEnoughInfo} className='btn bg-completed white mx4' onClick={onSave} data-id='save-and-import-contacts-button'>
            Save and import contacts
          </button>
        </Topbar>
        <section className='block'>
          <div className='center pt4'>
            <h1 className='f-xxl gray10 my1 semibold'>Match your spreadsheet fields to Medialist fields</h1>
            <p className='f-lg gray20 my3'>Below is a preview of your spreadsheet. Match the columns to Medialist fields.</p>
            <div className='inline-block bg-white mt3 px1 py2 border border-gray80'>
              <div className='inline-block border-right border-gray80 semibold f-sm py1 px3'>
                <span className='blue mr1'>{contacts.length}</span>Contacts found
              </div>
              <div className='inline-block border-right border-gray80 py1 px3 semibold f-sm'>
                <span className='blue mr1'>{okCols.length}</span>Columns matched
              </div>
            </div>
            <div className='py2' style={{height: 15}}>
              {!hasEnoughInfo && (
                <p className='red m0'>Please match the <strong>name</strong> and <strong>outlet</strong> fields to columns before we can start importing contacts.</p>
              )}
            </div>
          </div>
          <div className='mt6 px3'>
            <ImportTable cols={cols} rows={rows.slice(0, PREVIEW_ROW_COUNT)} onColumnChange={onColumnChange} />
          </div>
        </section>
      </div>
    )
  }
}

export default withSnackbar(withRouter(ContactsImportPreviewPage))
