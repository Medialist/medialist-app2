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
      tag: `Contact Import - ${(new Date()).toISOString()}`
    }
  },

  onFinish () {
    const { cols, rows } = this.state
    const contacts = CsvToContacts.createContacts({cols, rows})
    Meteor.call('contacts/import', contacts)
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
    const { tag } = this.state
    return (
      <div>
        <Topbar>
          <button className='btn bg-blue white mx4' onClick={onFinish}>Finish</button>
        </Topbar>
        <section className='center p6'>
          <h1 className='blue f-xxl'>Contacts currently being processed</h1>
          <p>Importing {rows.length} contacts. Created and updated contacts will be available for browsing shortly, tagged with:</p>
          <div className='py6'>
            <Tag name={tag} count={rows.length} />
          </div>
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
        </section>
      </div>
    )
  }
})
