import React, { PropTypes } from 'react'
import UploadcareLauncher from './uploadcare-launcher'
import TwitterScraper from './twitter-scraper'

const EditableAvatarMenu = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  },

  getInitialState () {
    return { uploader: null }
  },

  onUploadcareClick () {
    this.setState({ uploader: 'uploadcare' })
  },

  onTwitterClick () {
    this.setState({ uploader: 'twitter' })
  },

  onRemoveClick () {
    this.props.onChange(null)
  },

  onSuccess (url) {
    this.setState({ uploader: null })
    this.props.onChange(url)
  },

  onError (err) {
    this.setState({ uploader: null })
    this.props.onError(err)
  },

  onDismiss () {
    this.setState({ uploader: null })
  },

  render () {
    const { avatar } = this.props
    const { uploader } = this.state
    const { onUploadcareClick, onTwitterClick, onRemoveClick, onSuccess, onError, onDismiss } = this

    switch (uploader) {
      case 'uploadcare':
        return <UploadcareLauncher onSuccess={onSuccess} onError={onError} onDismiss={onDismiss} />
      case 'twitter':
        return <TwitterScraper onSuccess={onSuccess} onError={onError} onDismiss={onDismiss} />
      default:
        return (
          <div className='py1'>
            <a href='#' className='block px3 py2 f-md normal gray20 hover-bg-blue hover-white' onClick={onUploadcareClick}>Upload image</a>
            <a href='#' className='block px3 py2 f-md normal gray20 hover-bg-blue hover-white' onClick={onTwitterClick}>Import from Twitter</a>
            {avatar && <a href='#' className='block px3 py2 f-md normal gray20 hover-bg-blue hover-white' onClick={onRemoveClick}>Remove image</a>}
          </div>
        )
    }
  }
})

export default EditableAvatarMenu
