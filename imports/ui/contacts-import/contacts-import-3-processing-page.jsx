import React from 'react'
import { Meteor } from 'meteor/meteor'
import Topbar from '../navigation/topbar'
import CsvToContacts from './csv-to-contacts'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  SectorIcon,
  TagIcon
} from '../images/icons'

export default React.createClass({
  getInitialState () {
    return {
      results: null,
      tag: `Contact Import - ${(new Date()).toISOString()}`
    }
  },

  componentDidMount () {
    const { cols, rows } = this.props
    if (!cols || !rows) return
    const contacts = CsvToContacts.createContacts({cols, rows})
    Meteor.call('contacts/import', contacts, (err, results) => {
      if (err) return console.error(err) // TODO: snackbar / alert user.
      this.setState({results})
    })
  },

  onFinish () {
    // go to contacts... or activity feed with a post about the import.
  },

  onCampaignClick () {
    console.log('onCampaignClick')
  },

  onSectorClick () {
    console.log('onSectorClick')
  },

  onFavouriteClick () {
    console.log('onFavouriteClick')
  },

  onTagClick () {
    console.log('onTagClick')
  },

  render () {
    const { cols, rows } = this.props
    const { tag, results } = this.state
    return (
      <div>
        <Topbar>
          <button className='btn bg-blue white mx4' onClick={onFinish}>Finish</button>
        </Topbar>
        { results ? (
          <section className='center p6'>
            <h1 className='blue f-xxl'>Contacts imported</h1>
            <p>Created {results.created} contacts and updated {results.updated} contacts. Contacts are tagged with:</p>
            <div className='py6'>
              <Tag name={tag} count={results.created + results.updated} />
            </div>
            <div>
              <hr />
              <p>Assign your contacts to campaigns, sectors, and tags to stay organised</p>
              <div className='py6'>
                <div className='shadow-1'>
                  <FeedCampaignIcon className='svg-icon-lg p3 pointer' onClick={() => this.onCampaignClick(contacts)} />
                  <SectorIcon className='svg-icon-lg p3 pointer' onClick={() => this.onSectorClick(contacts)} />
                  <FavouritesIcon className='svg-icon-lg p3 pointer' onClick={() => this.onFavouriteClick(contacts)} />
                  <TagIcon className='svg-icon-lg p3 pointer' onClick={() => this.onTagClick(contacts)} />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <ProcessingPanel rows={rows} tag={cols} />
        )}
      </div>
    )
  }
})

const ProcessingPanel = ({rows, tag}) => (
  <section className='center p6'>
    <h1 className='blue f-xxl'>Contacts currently being processed</h1>
    <p>Importing {rows.length} contacts. Created and updated contacts will be available for browsing shortly, tagged with:</p>
    <div className='py6'>
      <Tag name={tag} count={rows.length} />
    </div>
  </section>
)
