import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import CampaignSearch from '/imports/ui/contacts/add-to-campaign/campaign-search'

class AddContactsToCampaign extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    contacts: PropTypes.array.isRequired,
    contactsCount: PropTypes.number.isRequired,
    onCampaignSelected: PropTypes.func.isRequired
  }

  render () {
    const {
      title,
      contacts,
      contactsCount,
      onCampaignSelected
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>{title}</div>
        <div className='mb6'>
          <AbbreviatedAvatarList items={contacts} maxTooltip={12} total={contactsCount} />
        </div>
        <CampaignSearch onCampaignSelected={onCampaignSelected} />
      </div>
    )
  }
}

class AddManyContactsToCampaignContainer extends React.Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    snackbar: PropTypes.object.isRequired,
    selectionMode: PropTypes.string.isRequired,
    contactSearch: PropTypes.object,
    contactsCount: PropTypes.number
  }

  onCampaignSelected = (item) => {
    const {contacts, selectionMode, contactSearch, onDismiss} = this.props
    const contactsCount = this.props.contactsCount || contacts.length
    const campaignSlug = item.slug

    onDismiss()

    if (contactsCount > 20) {
      this.props.snackbar.show('Adding contacts to campaign...')
    }

    setTimeout(() => {
      const opts = {campaignSlug}

      if (selectionMode === 'include') {
        opts.contactSlugs = contacts.map((c) => c.slug)
      } else {
        opts.contactSearch = contactSearch
      }

      addContactsToCampaign.call(opts, (error, res) => {
        if (error) {
          console.log(error)
          return this.props.snackbar.error('batch-add-contacts-to-campaign-failure')
        }

        let label

        if (contacts.length === 1) {
          const contact = contacts[0]
          label = (
            <Link to={`/contact/${contact.slug}`} className='underline semibold'>
              {contact.name}
            </Link>
          )
        } else {
          label = `${res.numContactsAdded} new contacts`
        }

        return this.props.snackbar.show((
          <div>
            <span>Added {label} to </span>
            <Link to={`/campaign/${item.slug}`} className='underline semibold'>
              {item.name}
            </Link>
          </div>
        ), 'batch-add-contacts-to-campaign-success')
      })
    }, 1)
  }

  render () {
    return (
      <AddContactsToCampaign {...this.props} onCampaignSelected={this.onCampaignSelected} />
    )
  }
}

export default withSnackbar(Modal(AddManyContactsToCampaignContainer, {
  'data-id': 'campaign-selector-modal'
}))
