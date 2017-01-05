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
    return { inputValue: '', screenName: null, uploading: false, progress: 0 }
  },

  componentWillMount () {
    this.setScreenName = debounce(this.setScreenName, 300)
  },

  onInputChange (e) {
    const inputValue = e.target.value
    this.setScreenName(twitterScreenName(inputValue))
    this.setState({ inputValue })
  },

  setScreenName (screenName) {
    this.setState({ screenName })
  },

  onImageError (e) {
    if (e.target.getAttribute('data-screen-name') === this.state.screenName) {
      this.setState({ screenName: null })
    }
  },

  onCancelClick (e) {
    this.props.onDismiss()
  },

  onSubmitClick (e) {
    const { uploadcareConfig, onSuccess, onError } = this.props
    const { screenName } = this.state
    if (!screenName) this.props.onError(new Error('Invalid Twitter screen name'))

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

  getProfileImageUrl (screenName) {
    screenName = encodeURIComponent(screenName)
    return `https://twitter.com/${screenName}/profile_image?size=original`
  },

  render () {
    const { onCancelClick, onSubmitClick, onImageError, onInputChange } = this
    const { inputValue, screenName, uploading, progress } = this.state
    const src = screenName ? this.getProfileImageUrl(screenName) : null

    if (uploading) {
      return <Progress value={progress} />
    }

    return (
      <div className='px2 py1'>
        <p className='center'>Enter a Twitter username or URL</p>
        <div className='mb2 center'>
          {screenName &&
            <img src={src} alt={screenName} style={{ width: 40, height: 40 }} onError={onImageError} data-screen-name={screenName} />}
        </div>
        <div className='mb2'>
          <input className='input' value={inputValue} onChange={onInputChange} placeholder='Twitter username or URL' />
        </div>
        <div className='center mb2'>
          <button type='button' className='btn gray40 bg-white mx2' onClick={onCancelClick}>Cancel</button>
          <button type='button' className='btn white bg-blue mx2' onClick={onSubmitClick} disabled={!screenName}>Use Avatar</button>
        </div>
      </div>
    )
  }
})

export default TwitterScraper
