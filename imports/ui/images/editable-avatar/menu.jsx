import React, { PropTypes } from 'react'
import UploadcareLauncher from './uploadcare-launcher'
import TwitterScraper from './twitter-scraper'

const EditableAvatarMenu = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    onChange: PropTypes.func.isRequired
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

  render () {
    const { avatar, onChange } = this.props
    const { uploader } = this.state
    const { onUploadcareClick, onTwitterClick, onRemoveClick } = this

    switch (uploader) {
      case 'uploadcare':
        return <UploadcareLauncher onImage={onChange} />
      case 'twitter':
        return <TwitterScraper onImage={onChange} />
      default:
        return (
          <div>
            <button onClick={onUploadcareClick}>Upload image</button>
            <button onClick={onTwitterClick}>Import from Twitter</button>
            {avatar && <button onClick={onRemoveClick}>Remove image</button>}
          </div>
        )
    }
  }
})

export default EditableAvatarMenu
