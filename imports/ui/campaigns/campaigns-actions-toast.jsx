import React, { PropTypes } from 'react'
import Toast from '../navigation/toast'
import {
  FavouritesIcon,
  SectorIcon,
  TagIcon,
  DeleteIcon,
  ViewIcon
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

    return (
      <Toast>
        { campaigns.length && (
          <div className='bg-white shadow-1 p4 flex items-center'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{campaigns.length}</span>
              <span className='gray20'>campaign{campaigns.length === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <ViewIcon className='svg-icon-lg p3 pointer' onClick={() => onViewClick(campaigns)} />
              <SectorIcon className='svg-icon-lg p3 pointer' onClick={() => onSectorClick(campaigns)} />
              <FavouritesIcon className='svg-icon-lg p3 pointer' onClick={() => onFavouriteClick(campaigns)} />
              <TagIcon className='svg-icon-lg p3 pointer' onClick={() => onTagClick(campaigns)} />
              <DeleteIcon className='svg-icon-lg p3 pointer' onClick={() => onDeleteClick(campaigns)} />
            </div>
            <div className='flex-none'>
              <button className='btn bg-transparent grey40' onClick={() => onDeselectAllClick(campaigns)}>Deselect all</button>
            </div>
          </div>
        )}
      </Toast>
    )
  }
})

export default CampaignsActionsToast
