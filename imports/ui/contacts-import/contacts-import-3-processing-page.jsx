import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import Topbar from '/imports/ui/navigation/topbar'
import ProgressBar from '/imports/ui/navigation/progress-bar'
import ContactsImport from '/imports/api/contacts-import/contacts-import'

class ContactsImportProcessingPage extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    percent: PropTypes.number,
    contacts: PropTypes.array,
    contactsImport: PropTypes.object,
    finished: PropTypes.bool,
    location: PropTypes.object,
    snackbar: PropTypes.object
  }

  onCancel = () => {
    // TODO: inform the server.
    this.props.router.goBack()
  }

  render () {
    const { percent, contacts, contactsImport, finished } = this.props
    return (
      <div>
        <Topbar
          center={
            <div style={{paddingLeft: 45}}>
              <ProgressBar percent={percent} style={{margin: '0 auto', maxWidth: 800}} />
            </div>
          }>
          <div style={{width: 115}}>
            {!finished && <button className='btn bg-red white mx4' onClick={this.onCancel}>Cancel</button>}
          </div>
        </Topbar>
        <div className='mx-auto center py2' style={{maxWidth: 554}}>
          <img src='/import.svg' width={101} height={67} />
          { finished ? (
            <CompletePanel contactsImport={contactsImport} />
          ) : (
            <ProcessingPanel total={contacts.length} />
          )}
        </div>
      </div>
    )
  }
}

export default createContainer(({location}) => {
  const {importId, contacts} = location.state
  const sub = Meteor.subscribe('contacts-import', {importId})
  const loading = !sub.ready()
  const contactsImport = ContactsImport.findOne({_id: importId})
  let percent = 0
  if (contactsImport) {
    const {created, updated, failed} = contactsImport.results
    const total = created.length + updated.length + failed.length
    percent = Math.floor((total / contactsImport.data.length) * 100)
  }
  return {loading, contacts, contactsImport, percent, finished: percent === 100}
}, withSnackbar(withRouter(ContactsImportProcessingPage)))

const ProcessingPanel = ({total}) => (
  <section className='center p4'>
    <h1 className='blue f-xxxl m0 py2 semibold'>Importing <span className='bold'>{total}</span> contacts...</h1>
    <p className='lh-copy'>
      This may take a few minutes. If you want to do something else in the meantime, you can
      <a href='/' target='_blank' className='semibold'> open Medialist in a new tab</a> while we continue importing your contacts in the background.
    </p>
  </section>
)

const CompletePanel = ({contactsImport}) => {
  const {created, updated} = contactsImport.results
  // Show search results in same order as csv
  const sortString = encodeURIComponent(JSON.stringify({updatedAt: 1}))
  const viewUrl = `/contacts?importId=${contactsImport._id}&sort=${sortString}`
  return (
    <section className='center p6' data-id='contacts-import-complete'>
      <h1 className='blue f-xxxl m0 py2 semibold'>Contacts imported</h1>
      <p data-id='contacts-import-complete-status'>
        <strong>{created.length}</strong> new contacts added, <strong>{updated.length}</strong> updated.
      </p>
      <div className='py6'>
        <Link className='btn mx4 bg-blue white' to={viewUrl}>
          View contacts
        </Link>
      </div>
    </section>
  )
}
