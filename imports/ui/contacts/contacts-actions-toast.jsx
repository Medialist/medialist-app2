import React, { PropTypes } from 'react'
import Toast from '../navigation/toast'
import Tooltip from '../navigation/tooltip'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  SectorIcon,
  TagIcon,
  DeleteIcon
} from '../images/icons'

const ContactsActionsToast = React.createClass({
  propTypes: {
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
      contacts,
      onCampaignClick,
      onSectorClick,
      onFavouriteClick,
      onTagClick,
      onDeleteClick,
      onDeselectAllClick
    } = this.props

    return (
      <Toast>
        { contacts.length && (
          <div className='bg-white shadow-1 p4 flex items-center' key='ContactsActionsToast'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{contacts.length}</span>
              <span className='gray20'>contact{contacts.length === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <Tooltip title='Add to Campaigns'>
                <FeedCampaignIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onCampaignClick(contacts)} />
              </Tooltip>
              <Tooltip title='Add to Master list'>
                <SectorIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onSectorClick(contacts)} />
              </Tooltip>
              <Tooltip title='Add to My Contacts'>
                <FavouritesIcon className='svg-icon-lg px3 pointer gray60 hover-gold' onClick={() => onFavouriteClick(contacts)} />
              </Tooltip>
              <Tooltip title='Add Tags'>
                <TagIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onTagClick(contacts)} />
              </Tooltip>
              <Tooltip title='Delete Contacts'>
                <DeleteIcon className='svg-icon-lg px3 pointer gray60 hover-red' onClick={() => onDeleteClick(contacts)} />
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
