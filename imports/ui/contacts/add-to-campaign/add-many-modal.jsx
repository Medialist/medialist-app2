import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { addContactsToCampaign } from '/imports/api/campaign-contacts/methods'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import CampaignSearch from '/imports/ui/contacts/add-to-campaign/campaign-search'

class AddContactsToCampaign extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    contacts: PropTypes.array.isRequired,
    onCampaignSelected: PropTypes.func.isRequired
  }

  render () {
    const {
      title,
      contacts,
      onCampaignSelected
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>{title}</div>
        <div className='mb6'>
          <AbbreviatedAvatarList items={contacts} maxTooltip={12} />
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
    onContactPage: PropTypes.bool
  }

  onCampaignSelected = (item) => {
    const {contacts, onDismiss} = this.props
    const campaignSlug = item.slug
    const contactSlugs = contacts.map((c) => c.slug)
    addContactsToCampaign.call({contactSlugs, campaignSlug}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('batch-add-contacts-to-campaign-success')
      }

      onDismiss()

      let label

      if (contacts.length === 1) {
        const contact = contacts[0]
        label = (
          <Link to={`/contact/${contact.slug}`} className='underline semibold'>
            {contact.name}
          </Link>
        )
      } else {
        label = `${contacts.length} contacts`
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
