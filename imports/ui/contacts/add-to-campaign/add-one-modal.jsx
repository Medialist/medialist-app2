import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import { CanJoinCampaignResult, CanNotJoinCampaignResult } from '/imports/ui/contacts/add-to-campaign/campaign-result'
import CampaignSearch from '/imports/ui/contacts/add-to-campaign/campaign-search'

class AddContactToCampaign extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    contact: PropTypes.object.isRequired,
    onCampaignSelected: PropTypes.func.isRequired
  }

  renderCampaigns = (campaigns, onCampaignSelected) => {
    const {contact} = this.props
    campaigns.sort((a, b) => {
      const inA = contact.campaigns.indexOf(a.slug) > -1
      const inB = contact.campaigns.indexOf(b.slug) > -1
      if (inA && !inB) {
        return 1
      }
      if (!inA && inB) {
        return -1
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })
    return campaigns.map((campaign) => {
      const alreadyInCampaign = contact.campaigns.indexOf(campaign.slug) > -1
      const ResultListItem = alreadyInCampaign ? CanNotJoinCampaignResult : CanJoinCampaignResult
      return <ResultListItem {...campaign} onSelect={onCampaignSelected} key={campaign._id} />
    })
  }

  render () {
    const {
      title,
      onCampaignSelected
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center my6'>{title}</div>
        <CampaignSearch onCampaignSelected={onCampaignSelected} renderCampaigns={this.renderCampaigns} />
      </div>
    )
  }
}

class AddContactToCampaignContainer extends React.Component {

  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    contact: PropTypes.object.isRequired,
    snackbar: PropTypes.object.isRequired,
    onContactPage: PropTypes.bool
  }

  onCampaignSelected = (item) => {
    const {contact, onDismiss} = this.props
    const campaignSlug = item.slug
    const contactSlugs = [contact.slug]
    addContactsToCampaign.call({contactSlugs, campaignSlug}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('batch-add-contacts-to-campaign-success')
      }

      onDismiss()

      const name = contact.name.split(' ')[0]

      return this.props.snackbar.show((
        <div>
          <span>Added {name} to </span>
          <Link to={`/campaign/${item.slug}`} className='underline semibold'>
            {item.name}
          </Link>
        </div>
      ), 'batch-add-contacts-to-campaign-success')
    })
  }

  render () {
    return (
      <AddContactToCampaign {...this.props} onCampaignSelected={this.onCampaignSelected} />
    )
  }
}

export default withSnackbar(Modal(AddContactToCampaignContainer, {
  'data-id': 'campaign-selector-modal'
}))
