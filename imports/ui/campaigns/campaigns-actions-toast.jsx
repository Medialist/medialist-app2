import React from 'react'
import PropTypes from 'prop-types'
import Toast from '../navigation/toast'
import Tooltip from '../navigation/tooltip'
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
          <div className='bg-white shadow-1 p4 flex items-center' key='CampaignsActionsToast' data-id='campaign-actions-toast'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{campaigns.length}</span>
              <span className='gray20'>campaign{campaigns.length === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <Tooltip title='View Contacts'>
                <ViewIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onViewClick(campaigns)} data-id='campaign-actions-view-contacts' />
              </Tooltip>
              <Tooltip title='Add to Campaign List'>
                <SectorIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onSectorClick(campaigns)} data-id='campaign-actions-add-to-campaign-list' />
              </Tooltip>
              <Tooltip title='Add to My Campaigns'>
                <FavouritesIcon className='svg-icon-lg px3 pointer gray60 hover-gold' onClick={() => onFavouriteClick(campaigns)} data-id='campaign-actions-add-to-my-campaigns' />
              </Tooltip>
              <Tooltip title='Add Tags'>
                <TagIcon className='svg-icon-lg px3 pointer gray60 hover-blue' onClick={() => onTagClick(campaigns)} data-id='campaign-actions-add-tags' />
              </Tooltip>
              <Tooltip title='Delete Campaigns'>
                <DeleteIcon className='svg-icon-lg px3 pointer gray60 hover-red' onClick={() => onDeleteClick(campaigns)} data-id='campaign-actions-delete' />
              </Tooltip>
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
