import React from 'react'
// import { Meteor } from 'meteor/meteor'
// import CsvToContacts from './csv-to-contacts'
import Topbar from '../navigation/topbar'
import Tag from '../navigation/tag'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  SectorIcon,
  TagIcon
} from '../images/icons'

export default React.createClass({
  getInitialState () {
    const { state } = this.props.location
    console.log('state', state)
    return Object.assign({
      rows: [],
      cols: [],
      contacts: [],
      results: null,
      tag: `Contact Import - ${(new Date()).toISOString()}`
    }, state)
  },

  componentDidMount () {
    // const { cols, rows } = this.state
    // if (!rows || !rows.length) return
    // const contacts = CsvToContacts.createContacts({cols, rows})
    // this.setState({contacts})
    // Meteor.call('contacts/import', contacts, (err, results) => {
    //   if (err) return console.error(err) // TODO: snackbar / alert user.
    //   this.setState({results})
    // })
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
    const { rows, tag, results, contacts } = this.state
    return (
      <div>
        <Topbar>
          { results && <button className='btn bg-blue white mx4' onClick={this.onFinish}>Finish</button> }
        </Topbar>
        <div className='mx-auto center py2' style={{maxWidth: 554}}>
          <img src='/import.svg' width={101} height={67} />
          { results ? (
            <section className='center p6'>
              <h1 className='blue semibold f-xxxl'>Contacts imported</h1>
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
            <ProcessingPanel rows={rows} tag={tag} />
          )}
        </div>
      </div>
    )
  }
})

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
