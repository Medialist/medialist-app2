import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import CsvToContacts from '/imports/ui/contacts-import/csv-to-contacts'
import Topbar from '/imports/ui/navigation/topbar'
import Tag from '/imports/ui/tags/tag'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  SectorIcon,
  TagIcon
} from '/imports/ui/images/icons'

class ContactsImportProcessingPage extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    snackbar: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = Object.assign({
      rows: [],
      cols: [],
      contacts: [],
      results: null,
      tag: `Contact Import - ${(new Date()).toISOString()}`
    }, props.location.state)

    console.log('ContactsImportProcessingPage', this.state)
  }

  componentDidMount () {
    const { cols, rows } = this.state
    if (!rows || !rows.length) return
    console.log({ cols, rows })
    // TODO: automagic header detection.
    const contacts = CsvToContacts.createContacts({cols, rows: rows.slice(1)})
    this.setState({contacts})
    Meteor.call('importContacts', { contacts }, (err, results) => {
      if (err) {
        console.error(err)
        const {snackbar, router} = this.props
        snackbar.error('An error occured importing your contacts', 'contact-import-failed')
        return router.goBack()
      }
      this.setState({results})
    })
  }

  onCampaignClick = () => console.log('onCampaignClick')

  onSectorClick = () => console.log('onSectorClick')

  onFavouriteClick = () => console.log('onFavouriteClick')

  onTagClick = () => console.log('onTagClick')

  render () {
    const { rows, tag, results, contacts } = this.state
    return (
      <div>
        <Topbar>
          { results && <Link className='btn bg-blue white mx4' to='/contacts'>Finish</Link> }
        </Topbar>
        <div className='mx-auto center py2' style={{maxWidth: 554}}>
          <img src='/import.svg' width={101} height={67} />
          { results ? (
            <CompletePanel
              results={results}
              tag={tag}
              contacts={contacts}
              onCampaignClick={this.onCampaignClick}
              onSectorClick={this.oncSectorClick}
              onFavouriteClick={this.onFavouriteClick}
              onTagClick={this.onTagClick} />
          ) : (
            <ProcessingPanel rows={rows} tag={tag} />
          )}
        </div>
      </div>
    )
  }
}

export default withSnackbar(withRouter(ContactsImportProcessingPage))

const ProcessingPanel = ({rows, tag}) => (
  <section className='center p4'>
    <h1 className='blue f-xxl m0 py2 semibold'>Contacts currently being processed</h1>
    <p className='f-lg'>Importing <span className='semibold'>{rows && rows.length || 0}</span> contacts.
    Created and updated contacts will be available for browsing shortly, tagged with:</p>
    <div className='py6'>
      <Tag name={tag} count={rows && rows.length || 0} />
    </div>
  </section>
)

const CompletePanel = ({results, tag, contacts, onCampaignClick, onSectorClick, onFavouriteClick, onTagClick}) => (
  <section className='center p6' data-id='contacts-import-complete'>
    <h1 className='blue semibold f-xxxl'>Contacts imported</h1>
    <p data-id='contacts-import-complete-status'>Created {results.created} contacts and updated {results.updated} contacts. Contacts are tagged with:</p>
    <div className='py6'>
      <Tag name={tag} count={results.created + results.updated} />
    </div>
    <div>
      <hr />
      <p className='m0 pt3 pb2'>Assign your contacts to campaigns, sectors, and tags to stay organised</p>
      <div className='py4'>
        <div className='shadow-1 inline-block bg-white px2'>
          <FeedCampaignIcon className='svg-icon-lg p3 pointer' onClick={() => onCampaignClick(contacts)} />
          <SectorIcon className='svg-icon-lg p3 pointer' onClick={() => onSectorClick(contacts)} />
          <FavouritesIcon className='svg-icon-lg p3 pointer' onClick={() => onFavouriteClick(contacts)} />
          <TagIcon className='svg-icon-lg p3 pointer' onClick={() => onTagClick(contacts)} />
        </div>
      </div>
    </div>
  </section>
)
