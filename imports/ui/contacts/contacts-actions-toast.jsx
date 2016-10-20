import React, { PropTypes } from 'react'
import Fixed from 'rebass/dist/Fixed'
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

    if (!contacts.length) return null

    return (
      <Fixed right bottom left>
        <div className='bg-white shadow-1 p4 flex'>
          <div className='flex-none'>
            {contacts.length} contact{contacts.length === 1 ? '' : 's'} selected
          </div>
          <div className='flex-auto center'>
            <a href='#' onClick={() => onCampaignClick(contacts)}>
              <FeedCampaignIcon />
            </a>
            <a href='#' onClick={() => onSectorClick(contacts)}>
              <SectorIcon />
            </a>
            <a href='#' onClick={() => onFavouriteClick(contacts)}>
              <FavouritesIcon />
            </a>
            <a href='#' onClick={() => onTagClick(contacts)}>
              <TagIcon />
            </a>
            <a href='#' onClick={() => onDeleteClick(contacts)}>
              <DeleteIcon />
            </a>
          </div>
          <div className='flex-none'>
            <button type='button' onClick={() => onDeselectAllClick(contacts)}>Deselect all</button>
          </div>
        </div>
      </Fixed>
    )
  }
})

export default ContactsActionsToast
