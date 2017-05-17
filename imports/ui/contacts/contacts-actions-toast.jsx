import React from 'react'
import PropTypes from 'prop-types'
import Toast from '/imports/ui/navigation/toast'
import Tooltip from '/imports/ui/navigation/tooltip'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  ListIcon,
  TagIcon,
  DeleteIcon
} from '/imports/ui/images/icons'

const ContactsActionsToast = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contacts: PropTypes.array.isRequired,
    onCampaignClick: PropTypes.func.isRequired,
    onSectorClick: PropTypes.func.isRequired,
    onFavouriteClick: PropTypes.func.isRequired,
    onTagClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onDeselectAllClick: PropTypes.func.isRequired
  },

  render () {
    const {
      campaign,
      contacts,
      onCampaignClick,
      onSectorClick,
      onFavouriteClick,
      onTagClick,
      onDeleteClick,
      onDeselectAllClick
    } = this.props

    return (
      <Toast data-id='contact-actions-toast'>
        { contacts.length && (
          <div className='bg-white shadow-1 p4 flex items-center' key='ContactsActionsToast'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{contacts.length}</span>
              <span className='gray20'>contact{contacts.length === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <Tooltip title='Add to Campaigns'>
                <FeedCampaignIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onCampaignClick(contacts)}
                  data-id='contact-actions-add-to-campaign'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add to Contact List'>
                <ListIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onSectorClick(contacts)}
                  data-id='contact-actions-add-to-contact-list'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add to My Contacts'>
                <FavouritesIcon
                  className='mx3 pointer gray60 hover-gold'
                  onClick={() => onFavouriteClick(contacts)}
                  data-id='contact-actions-add-to-my-contacts'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Add Tags'>
                <TagIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onTagClick(contacts)}
                  data-id='contact-actions-add-tags'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title={`${campaign ? 'Remove' : 'Delete'} Contacts`}>
                <DeleteIcon
                  className='mx3 pointer gray60 hover-red'
                  onClick={() => onDeleteClick(contacts)}
                  data-id={`contact-actions-${campaign ? 'remove' : 'delete'}`}
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
            </div>
            <div className='flex-none'>
              <button className='btn bg-transparent grey40' onClick={() => onDeselectAllClick(contacts)}>Deselect all</button>
            </div>
          </div>
        ) }
      </Toast>
    )
  }
})

export default ContactsActionsToast
