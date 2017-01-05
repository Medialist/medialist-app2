import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import uploadcare from 'uploadcare-widget'
import Progress from 'rebass/dist/Progress'

const UploadcareLauncher = React.createClass({
  propTypes: {
    onSuccess: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    uploadcareConfig: PropTypes.object
  },

  getInitialState () {
    return { uploading: false, progress: 0 }
  },

  getDefaultProps () {
    return {
      uploadcareConfig: {
        publicKey: Meteor.settings.public.uploadcare.publicKey,
        imagesOnly: true,
        crop: '1:1',
        imageShrink: '1024x1024'
      }
    }
  },

  componentDidMount () {
    const { uploadcareConfig, onSuccess, onError, onDismiss } = this.props

    uploadcare.openDialog(null, uploadcareConfig)
      .done((file) => {
        this.setState({ uploading: true, progress: 0 })

        file
          .progress((uploadInfo) => {
            this.setState({ progress: uploadInfo.uploadProgress })
          })
          .done((fileInfo) => {
            this.setState({ uploading: false, progress: 0 })
            onSuccess({ url: fileInfo.originalUrl, type: 'uploadcare', fileInfo })
          })
          .fail((err) => {
            this.setState({ uploading: false, progress: 0 })
            onError(err)
          })
      })
      .fail(onDismiss)
  },

  render () {
    const { uploading, progress } = this.state
    if (!uploading) return null

    return (
      <div className='px2 py1'>
        <p className='f-xs normal gray20'>Uploading image...</p>
        <Progress color='primary' value={progress} />
      </div>
    )
  }
})

export default UploadcareLauncher
