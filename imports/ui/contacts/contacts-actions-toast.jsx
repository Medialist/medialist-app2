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
        <div className='bg-white shadow-1 p4 flex items-center'>
          <div className='flex-none'>
            <span className='badge f-sm bg-blue mr2'>{contacts.length}</span>
            <span className='gray20'>contact{contacts.length === 1 ? '' : 's'} selected</span>
          </div>
          <div className='flex-auto center'>
            <FeedCampaignIcon className='p3 pointer' onClick={() => onCampaignClick(contacts)} />
            <SectorIcon className='p3 pointer' onClick={() => onSectorClick(contacts)} />
            <FavouritesIcon className='p3 pointer' onClick={() => onFavouriteClick(contacts)} />
            <TagIcon className='p3 pointer' onClick={() => onTagClick(contacts)} />
            <DeleteIcon className='p3 pointer' onClick={() => onDeleteClick(contacts)} />
          </div>
          <div className='flex-none'>
            <button className='btn bg-transparent grey40' onClick={() => onDeselectAllClick(contacts)}>Deselect all</button>
          </div>
        </div>
      </Fixed>
    )
  }
})

export default ContactsActionsToast
