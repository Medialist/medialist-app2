import React, { PropTypes } from 'react'
import Fixed from 'rebass/dist/Fixed'
import {
  FavouritesIcon,
  SectorIcon,
  TagIcon,
  DeleteIcon
} from '../images/icons'

const CampaignsActionsToast = React.createClass({
  propTypes: {
    campaigns: PropTypes.array.isRequired,
    onViewClick: PropTypes.func.isRequired,
    onSectorClick: PropTypes.func.isRequired,
    onFavouriteClick: PropTypes.func.isRequired,
    onTagClick: PropTypes.func.isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onDeselectAllClick: PropTypes.func.isRequired
  },

  render () {
    const {
      campaigns,
      onViewClick,
      onSectorClick,
      onFavouriteClick,
      onTagClick,
      onDeleteClick,
      onDeselectAllClick
    } = this.props

    if (!campaigns.length) return null

    return (
      <Fixed right bottom left>
        <div className='bg-white shadow-1 p4 flex'>
          <div className='flex-none'>
            {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'} selected
          </div>
          <div className='flex-auto center'>
            <a href='#' onClick={() => onViewClick(campaigns)}>
              👀
            </a>
            <a href='#' onClick={() => onSectorClick(campaigns)}>
              <SectorIcon />
            </a>
            <a href='#' onClick={() => onFavouriteClick(campaigns)}>
              <FavouritesIcon />
            </a>
            <a href='#' onClick={() => onTagClick(campaigns)}>
              <TagIcon />
            </a>
            <a href='#' onClick={() => onDeleteClick(campaigns)}>
              <DeleteIcon />
            </a>
          </div>
          <div className='flex-none'>
            <button type='button' onClick={() => onDeselectAllClick(campaigns)}>Deselect all</button>
          </div>
        </div>
      </Fixed>
    )
  }
})

export default CampaignsActionsToast
