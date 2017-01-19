import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import debounce from 'lodash.debounce'
import twitterScreenName from 'twitter-screen-name'
import uploadcare from 'uploadcare-widget'
import Progress from './progress'

const TwitterScraper = React.createClass({
  propTypes: {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    uploadcareConfig: PropTypes.object
  },

  getDefaultProps () {
    return {
      uploadcareConfig: {
        publicKey: Meteor.settings.public.uploadcare.publicKey
      }
    }
  },

  getInitialState () {
    return {
      inputValue: '',
      screenName: null,
      imageLoadStates: {},
      uploading: false,
      progress: 0
    }
  },

  componentWillMount () {
    this.setScreenName = debounce(this.setScreenName, 300)
  },

  onInputChange (e) {
    const inputValue = e.target.value
    this.setScreenName(twitterScreenName(inputValue))
    this.setState({ inputValue })
  },

  onImageLoad (e) {
    const screenName = e.target.getAttribute('data-screen-name')
    this.setImageLoadState(screenName, 'loaded')
  },

  onImageError (e) {
    const screenName = e.target.getAttribute('data-screen-name')

    if (screenName === this.state.screenName) {
      this.setState({ screenName: null })
    }

    this.setImageLoadState(screenName, 'error')
  },

  onCancelClick () {
    this.props.onDismiss()
  },

  onSubmit (e) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()

    const { uploadcareConfig, onSuccess, onError } = this.props
    const { screenName } = this.state
    if (!screenName) return

    this.setState({ uploading: true, progress: 0 })

    uploadcare.fileFrom('url', this.getProfileImageUrl(screenName), uploadcareConfig)
      .progress((uploadInfo) => {
        this.setState({ progress: uploadInfo.uploadProgress })
      })
      .done((fileInfo) => {
        this.setState({ uploading: false, progress: 0 })
        onSuccess({ url: fileInfo.cdnUrl, fileInfo })
      })
      .fail((err) => {
        this.setState({ uploading: false, progress: 0 })
        onError(err)
      })
  },

  setScreenName (screenName) {
    this.setState({ screenName })
  },

  setImageLoadState (screenName, state) {
    let { imageLoadStates } = this.state
    imageLoadStates = { ...imageLoadStates, [screenName]: state }
    this.setState({ imageLoadStates })
  },

  getProfileImageUrl (screenName) {
    screenName = encodeURIComponent(screenName)
    return `https://twitter.com/${screenName}/profile_image?size=original`
  },

  isImageLoaded (screenName) {
    if (!screenName) return false
    const { imageLoadStates } = this.state
    return imageLoadStates[screenName] === 'loaded'
  },

  render () {
    const { onCancelClick, onSubmit, onImageLoad, onImageError, onInputChange } = this
    const { inputValue, screenName, uploading, progress } = this.state

    if (uploading) {
      return <Progress value={progress} />
    }

    const imageLoaded = this.isImageLoaded(screenName)
    const imageSrc = screenName ? this.getProfileImageUrl(screenName) : null
    const imageClassName = imageLoaded ? '' : 'display-none'

    return (
      <form onSubmit={onSubmit} className='px2 py1'>
        <p className='center'>Enter a Twitter username or URL</p>
        <div className='mb2 center'>
          {screenName &&
            <img
              src={imageSrc}
              alt={screenName}
              className={imageClassName}
              style={{ width: 40, height: 40 }}
              onLoad={onImageLoad}
              onError={onImageError}
              data-screen-name={screenName} />}
        </div>
        <div className='mb2'>
          <input
            className='input'
            value={inputValue}
            onChange={onInputChange}
            placeholder='Twitter username or URL' />
        </div>
        <div className='center mb2'>
          <button type='button' className='btn gray40 bg-white mx2' onClick={onCancelClick}>Cancel</button>
          <button type='submit' className='btn white bg-blue mx2' disabled={!(screenName && imageLoaded)}>Use Avatar</button>
        </div>
      </form>
    )
  }
})

export default TwitterScraper
