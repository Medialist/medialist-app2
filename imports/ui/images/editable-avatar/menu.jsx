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

  onUploadcareClick (e) {
    e.stopPropagation()
    this.setState({ uploader: 'uploadcare' })
  },

  onTwitterClick (e) {
    e.stopPropagation()
    this.setState({ uploader: 'twitter' })
  },

  onRemoveClick (e) {
    e.stopPropagation()
    this.props.onChange({ url: null })
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
          <div className='py1 left-align'>
            <a href='#' className='block px3 py2 f-md normal border-top border-bottom border-transparent gray20 hover-bg-gray90 hover-border-gray80' onClick={onUploadcareClick}>Upload image</a>
            <a href='#' className='block px3 py2 f-md normal border-top border-bottom border-transparent gray20 hover-bg-gray90 hover-border-gray80' onClick={onTwitterClick}>Import from Twitter</a>
            {avatar && <a href='#' className='block px3 py2 f-md normal border-top border-bottom border-transparent gray20 hover-bg-gray90 hover-border-gray80' onClick={onRemoveClick}>Remove image</a>}
          </div>
        )
    }
  }
})

export default EditableAvatarMenu
