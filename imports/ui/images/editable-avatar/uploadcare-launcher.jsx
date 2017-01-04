import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'

const UploadcareLauncher = React.createClass({
  propTypes: {
    onImage: PropTypes.func.isRequired,
    uploadcareConfig: PropTypes.object
  },

  getDefaultProps () {
    return {
      uploadcareConfig: {
        publicKey: Meteor.settings.uploadcare.publicKey,
        imagesOnly: true,
        crop: '1:1',
        imageShrink: '320x320'
      }
    }
  },

  componentDidMount () {
    window.uploadcare.openDialog(null, this.props.uploadcareConfig)
  },

  render () {
    return this.props.chlidren || null
  }
})

export default UploadcareLauncher
