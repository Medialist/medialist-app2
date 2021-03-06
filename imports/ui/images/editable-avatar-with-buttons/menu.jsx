import React from 'react'
import PropTypes from 'prop-types'
import UploadcareLauncher from '/imports/ui/images/editable-avatar/uploadcare-launcher'
import TwitterScraper from '/imports/ui/images/editable-avatar/twitter-scraper'
import { TwitterIconGrey, UploadIcon, RemoveIcon } from '/imports/ui/images/icons'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'

const EditableAvatarMenu = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    menuLeft: PropTypes.number,
    menuTop: PropTypes.number,
    name: PropTypes.string
  },

  getDefaultProps () {
    return {
      menuLeft: 0,
      menuTop: -10,
      name: 'avatar'
    }
  },

  getInitialState () {
    return {
      uploader: null,
      isDropdownOpen: false
    }
  },

  onUploadcareClick (e) {
    e.stopPropagation()
    this.setState({ uploader: 'uploadcare' })
  },

  onTwitterClick (e) {
    e.stopPropagation()
    this.setState({
      uploader: 'twitter',
      isDropdownOpen: true
    })
  },

  onDropdownDismiss () {
    this.setState({
      isDropdownOpen: false
    })
  },

  onRemoveClick (e) {
    e.stopPropagation()

    this.props.onChange({
      target: {
        name: this.props.name,
        value: null
      }
    })
  },

  onSuccess (avatar) {
    this.reset()
    this.props.onChange({
      target: {
        name: this.props.name,
        value: avatar.url
      }
    })
  },

  onError (error) {
    this.reset()
    this.props.onError(error)
  },

  reset () {
    this.setState({
      uploader: null,
      isDropdownOpen: false
    })
  },

  render () {
    switch (this.state.uploader) {
      case 'uploadcare':
        return <UploadcareLauncher onSuccess={this.onSuccess} onError={this.onError} onDismiss={this.reset} />
      default:
        return (
          <div className='left-align' style={{display: 'inline-block'}}>
            <p className='block gray40 semibold f-sm mb2 mt0 ml3'>Your avatar</p>
            <a href='#' className='block px3 mb2 f-md normal gray20' onClick={this.onUploadcareClick}><UploadIcon className='flex-none' /> Upload image</a>
            <Dropdown>
              <a href='#' className='block px3 mb2 f-md normal gray20' onClick={this.onTwitterClick}><TwitterIconGrey className='flex-none' /> Import from Twitter</a>
              <DropdownMenu
                width={300}
                left={this.props.menuLeft}
                top={this.props.menuTop}
                open={this.state.isDropdownOpen}
                onDismiss={this.onDropdownDismiss}>
                <TwitterScraper
                  onSuccess={this.onSuccess}
                  onError={this.onError}
                  onDismiss={this.onDropdownDismiss} />
              </DropdownMenu>
            </Dropdown>
            {this.props.avatar && <a href='#' className='block px3 f-md normal gray20' onClick={this.onRemoveClick}><RemoveIcon className='flex-none' /> Remove image</a>}
          </div>
        )
    }
  }
})

export default EditableAvatarMenu
