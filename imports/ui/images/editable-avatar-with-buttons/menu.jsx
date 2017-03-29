import React, { PropTypes } from 'react'
import UploadcareLauncher from '../editable-avatar/uploadcare-launcher'
import TwitterScraper from '../editable-avatar/twitter-scraper'
import { TwitterIconGrey, UploadIcon, RemoveIcon } from '../icons'
import { Dropdown, DropdownMenu } from '../../navigation/dropdown'

const EditableAvatarMenu = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    menuLeft: PropTypes.number,
    menuTop: PropTypes.number
  },

  getDefaultProps () {
    return {
      menuLeft: 0,
      menuTop: -10
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
    this.props.onChange({ url: null })
  },

  onSuccess (url) {
    this.reset()
    this.props.onChange(url)
  },

  onError (err) {
    this.reset()
    this.props.onError(err)
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
