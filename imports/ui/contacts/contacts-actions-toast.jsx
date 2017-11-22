import React from 'react'
import PropTypes from 'prop-types'
import Toast from '/imports/ui/navigation/toast'
import Tooltip from '/imports/ui/navigation/tooltip'
import dasherise from 'dasherize'
import { Dropdown, DropdownMenu, DropdownMenuItem } from '/imports/ui/navigation/dropdown'
import { StatusValues } from '/imports/api/contacts/status'
import StatusLabel from '/imports/ui/feedback/status-label'
import FancyMergeIcon from './merge/fancy-merge-icon'
import {
  FeedCampaignIcon,
  FavouritesIcon,
  ListIcon,
  TagIcon,
  StatusUpdateIcon,
  DeleteIcon,
  DownloadIcon
} from '/imports/ui/images/icons'

class ContactsActionsToast extends React.Component {
  static propTypes = {
    campaign: PropTypes.object,
    contacts: PropTypes.array.isRequired,
    contactsCount: PropTypes.number.isRequired,
    onCampaignClick: PropTypes.func.isRequired,
    onSectorClick: PropTypes.func.isRequired,
    onFavouriteClick: PropTypes.func.isRequired,
    onTagClick: PropTypes.func.isRequired,
    onStatusClick: PropTypes.func,
    onDeleteClick: PropTypes.func,
    onDeselectAllClick: PropTypes.func.isRequired,
    onExportToCsvClick: PropTypes.func.isRequired,
    onMergeClick: PropTypes.func.isRequired
  }

  state = {
    openStatusMenu: false
  }

  openStatusMenu = () => {
    this.setState({openStatusMenu: true})
  }

  closeStatusMenu = () => {
    this.setState({openStatusMenu: false})
  }

  onStatusClick = (contacts, status) => {
    this.props.onStatusClick(contacts, status)
    this.closeStatusMenu()
  }

  render () {
    const {
      campaign,
      contacts,
      contactsCount,
      onCampaignClick,
      onSectorClick,
      onFavouriteClick,
      onTagClick,
      onDeleteClick,
      onDeselectAllClick,
      onExportToCsvClick,
      onMergeClick
    } = this.props

    return (
      <Toast data-id='contact-actions-toast'>
        { contacts.length && (
          <div className='bg-white shadow-1 p4 flex items-center' key='ContactsActionsToast'>
            <div className='flex-none'>
              <span className='badge f-sm bg-blue mr2'>{contactsCount}</span>
              <span className='gray20'>contact{contactsCount === 1 ? '' : 's'} selected</span>
            </div>
            <div className='flex-auto center'>
              <Tooltip title='Add to Campaign'>
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
              {this.props.onStatusClick ? <Dropdown>
                <Tooltip title='Update status'>
                  <StatusUpdateIcon
                    className='mx3 pointer gray60 hover-blue'
                    onClick={this.openStatusMenu}
                    data-id='contact-actions-update-status'
                    style={{width: '21px', height: '21px'}} />
                </Tooltip>
                <DropdownMenu
                  width={193}
                  arrowPosition='bottom'
                  top={-244}
                  open={this.state.openStatusMenu}
                  onDismiss={this.closeStatusMenu}>
                  {StatusValues.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      selected={false}
                      onClick={(event) => this.onStatusClick(contacts, status)}
                      data-id={`contact-status-${dasherise(status).replace(/\s/g, '')}`}>
                      <StatusLabel name={status} className='gray20' />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
              </Dropdown> : null}
              <Tooltip title='Add Tags'>
                <TagIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={() => onTagClick(contacts)}
                  data-id='contact-actions-add-tags'
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              <Tooltip title='Download as CSV'>
                <DownloadIcon
                  className='mx3 pointer gray60 hover-blue'
                  onClick={onExportToCsvClick}
                  data-id={`contact-actions-export-csv`}
                  style={{width: '21px', height: '21px'}} />
              </Tooltip>
              { !onDeleteClick ? null : (
                <Tooltip title={`${campaign ? 'Remove' : 'Delete'} Contact${contacts.length > 1 ? 's' : ''}`}>
                  <DeleteIcon
                    className='mx3 pointer gray60 hover-red'
                    onClick={() => onDeleteClick(contacts)}
                    data-id={`contact-actions-${campaign ? 'remove' : 'delete'}`}
                    style={{width: '21px', height: '21px'}} />
                </Tooltip>
              )}
              {(onMergeClick && contactsCount > 1 && contactsCount < 4) ? (
                <Tooltip title='Merge contacts'>
                  <FancyMergeIcon
                    count={contactsCount}
                    className='mx3 pointer gray60 hover-blue'
                    onClick={onMergeClick}
                    data-id='contact-actions-merge-contacts'
                    style={{width: '21px', height: '21px'}} />
                </Tooltip>
              ) : null}
            </div>
            <div className='flex-none'>
              <button className='btn btn-no-border bg-transparent grey40' onClick={() => onDeselectAllClick(contacts)}>Deselect all</button>
            </div>
          </div>
        ) }
      </Toast>
    )
  }
}

export default ContactsActionsToast
