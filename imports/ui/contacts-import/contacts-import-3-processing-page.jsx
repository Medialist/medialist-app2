import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import CsvToContacts from '/imports/api/contacts/csv-to-contacts'
import Topbar from '/imports/ui/navigation/topbar'
import { LinkedTag } from '/imports/ui/tags/tag'
import ProgressBar from '/imports/ui/navigation/progress-bar'
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
      progress: 0,
      tag: `Contact Import - ${(new Date()).toISOString()}`
    }, props.location.state)
  }

  componentDidMount () {
    const {snackbar, router} = this.props
    const { cols, rows, tag } = this.state
    if (!rows || !rows.length) return
    // TODO: automagic header detection.
    const contacts = CsvToContacts.createContacts({cols, rows: rows.slice(1)})
    this.setState({contacts})

    Meteor.call('importContacts', { contacts, tag }, (err, results) => {
      if (err) {
        console.error(err)
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
    const { rows, tag, results, contacts, progress } = this.state
    return (
      <div>
        <Topbar
          center={<ProgressBar percent={progress} style={{margin: '0 auto', maxWidth: 800}} />}>
          { !results && <Link className='btn bg-red white mx4' to='/contacts'>Cancel</Link> }
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
            <ProcessingPanel results={results} rows={rows} tag={tag} />
          )}
        </div>
      </div>
    )
  }
}

export default withSnackbar(withRouter(ContactsImportProcessingPage))

const ProcessingPanel = ({rows, tag, results}) => (
  <section className='center p4'>
    <h1 className='blue f-xxxl m0 py2 semibold'>Importing <span className='bold'>{rows && rows.length || 0}</span> contacts...</h1>
    <p class='lh-copy'>This may take a few minutes. If you want to do something else in the meantime, you can <strong>open Medialist in a new tab</strong> while we continue importing your contacts in the background.</p>
    { /*
    <p>Your new contacts will be available for browsing shortly, tagged with:</p>
    <div className='py6'>
      <LinkedTag name={tag} count={rows && rows.length || 0} to={`/contacts?tag=${tag}`} />
    </div>
    */ }
  </section>
)

const CompletePanel = ({results, tag, contacts, onCampaignClick, onSectorClick, onFavouriteClick, onTagClick}) => (
  <section className='center p6' data-id='contacts-import-complete'>
    <h1 className='blue f-xxxl m0 py2 semibold'>Contacts imported</h1>
    <p data-id='contacts-import-complete-status'>{results.created} new contacts added, {results.updated} updated</p>
    <div className='py6'>
      <LinkedTag name={tag} count={results.total} to={`/contacts?tag=${tag}`} />
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
